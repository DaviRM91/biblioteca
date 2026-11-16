package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.model.Papel;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.ReservaRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmprestimoRepository emprestimoRepository;

    @Mock
    private NotificacaoService notificacaoService;

    @Mock
    private AppProperties appProperties;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void devePermitirReservaQuandoNaoHouverExemplarDisponivel() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Livro livro = new Livro();
        livro.setId(10L);
        livro.setTitulo("Livro X");

        when(livroRepository.findByIdWithExemplares(10L)).thenReturn(Optional.of(livro));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(reservaRepository.existsByLivroAndUsuarioAndStatus(livro, usuario, StatusReserva.ATIVA)).thenReturn(false);
        when(reservaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // sem exemplares disponíveis
        livro.setExemplares(List.of());

        var response = reservaService.criar(1L, 10L);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("ATIVA");
    }

    @Test
    void deveBloquearReservaQuandoHouverExemplarDisponivel() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Livro livro = new Livro();
        livro.setId(10L);
        livro.setTitulo("Livro X");

        Exemplar exemplar = new Exemplar();
        exemplar.setStatus(StatusExemplar.DISPONIVEL);

        when(livroRepository.findByIdWithExemplares(10L)).thenReturn(Optional.of(livro));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        livro.setExemplares(List.of(exemplar));

        assertThatThrownBy(() -> reservaService.criar(1L, 10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("disponível");
    }

    @Test
    void deveBloquearDuplaReservaAtivaDoMesmoLivro() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Livro livro = new Livro();
        livro.setId(10L);

        when(livroRepository.findByIdWithExemplares(10L)).thenReturn(Optional.of(livro));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        livro.setExemplares(List.of());
        when(reservaRepository.existsByLivroAndUsuarioAndStatus(livro, usuario, StatusReserva.ATIVA)).thenReturn(true);

        assertThatThrownBy(() -> reservaService.criar(1L, 10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("já possui uma reserva ativa");
    }
}
