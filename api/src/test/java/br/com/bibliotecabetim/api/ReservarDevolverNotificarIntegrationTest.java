package br.com.bibliotecabetim.api;

import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.model.Papel;
import br.com.bibliotecabetim.api.model.Reserva;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.TipoNotificacao;
import br.com.bibliotecabetim.api.model.Notificacao;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.repository.ReservaRepository;
import br.com.bibliotecabetim.api.repository.NotificacaoRepository;
import br.com.bibliotecabetim.api.service.NotificacaoService;
import br.com.bibliotecabetim.api.service.ReservaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static java.util.concurrent.TimeUnit.SECONDS;

import static org.awaitility.Awaitility.await;

@Testcontainers
@SpringBootTest
class ReservarDevolverNotificarIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.flyway.baseline-on-migrate", () -> "true");
    }

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private ExemplarRepository exemplarRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private NotificacaoService notificacaoService;

    @Test
    void reservarDevolverNotificarFluxo() {
        // Dado: morador e bibliotecário
        Usuario morador = new Usuario();
        morador.setNome("Morador Teste");
        morador.setEmail("morador@teste.br");
        morador.setCpf("222.222.222-22");
        morador.setSenhaHash("hash");
        morador.setPapel(Papel.MORADOR);
        morador.setAtivo(true);
        final Usuario moradorSalvo = usuarioRepository.save(morador);

        Usuario biblio = new Usuario();
        biblio.setNome("Biblio Teste");
        biblio.setEmail("biblio@teste.br");
        biblio.setCpf("111.111.111-11");
        biblio.setSenhaHash("hash");
        biblio.setPapel(Papel.BIBLIOTECARIO);
        biblio.setAtivo(true);
        usuarioRepository.save(biblio);

        // Dado: livro sem exemplar disponível
        Livro livro = new Livro();
        livro.setTitulo("Livro Fila");
        livro.setAutor("Autor Teste");
        livro.setCategoria("Cat");
        livro.setResumo("Resumo limpo sem HTML");
        final Livro livroSalvo = livroRepository.save(livro);

        Exemplar exemplar = new Exemplar();
        exemplar.setLivro(livroSalvo);
        exemplar.setCodigoTombamento("TOM-INT-001");
        exemplar.setStatus(StatusExemplar.EMPRESTADO);
        exemplarRepository.save(exemplar);

        // Quando: morador reserva o livro
        Reserva reserva = new Reserva();
        reserva.setLivro(livroSalvo);
        reserva.setUsuario(moradorSalvo);
        reserva.setStatus(StatusReserva.ATIVA);
        final Reserva reservaSalva = reservaRepository.save(reserva);

        // Então: reserva ativa existe
        assertThat(reservaSalva.getId()).isNotNull();
        assertThat(reservaSalva.getStatus()).isEqualTo(StatusReserva.ATIVA);

        // E: o morador está na fila (posição 1, total 1)
        var fila = reservaService.filaParaUsuario(livroSalvo.getId(), moradorSalvo.getId());
        assertThat(fila.posicaoUsuario()).isEqualTo(1);
        assertThat(fila.totalFila()).isEqualTo(1);

        // Quando: simula devolução com fila (o exemplar fica reservado para o morador)
        boolean houveFila = reservaService.processarDevolucaoComFila(livroSalvo, exemplar);
        assertThat(houveFila).isTrue();

        // Então: reserva foi atendida
        var atualizada = reservaRepository.findById(reservaSalva.getId()).orElseThrow();
        assertThat(atualizada.getStatus()).isEqualTo(StatusReserva.ATENDIDA);

        // E: notificação foi criada (aguarda por async)
        await().atMost(5, SECONDS).untilAsserted(() -> {
            var notificacoes = notificacaoRepository.findByUsuario(moradorSalvo);
            assertThat(notificacoes)
                    .extracting(Notificacao::getTipo)
                    .contains(TipoNotificacao.RESERVA_DISPONIVEL);
        });

        // E: não há notificações duplicadas para o mesmo tipo no mesmo dia
        await().atMost(5, SECONDS).untilAsserted(() -> {
            var notificacoes = notificacaoRepository.findByUsuario(moradorSalvo);
            var reservasDuplicadas = notificacoes.stream()
                    .filter(n -> n.getTipo() == TipoNotificacao.RESERVA_DISPONIVEL)
                    .count();
            assertThat(reservasDuplicadas).isEqualTo(1);
        });
    }
}
