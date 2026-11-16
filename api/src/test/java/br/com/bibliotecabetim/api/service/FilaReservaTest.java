package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.FilaResponse;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.Reserva;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.ReservaRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FilaReservaTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private LivroRepository livroRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void deveRetornarPosicaoUsuarioEFilaSemExporOutrosUsuarios() {
        Livro livro = new Livro();
        livro.setId(10L);
        livro.setTitulo("Livro Fila");

        Usuario usuario1 = new Usuario();
        usuario1.setId(1L);

        Usuario usuario2 = new Usuario();
        usuario2.setId(2L);

        Reserva r1 = new Reserva();
        r1.setId(100L);
        r1.setLivro(livro);
        r1.setUsuario(usuario1);
        r1.setDataReserva(LocalDateTime.now().minusMinutes(10));
        r1.setStatus(StatusReserva.ATIVA);

        Reserva r2 = new Reserva();
        r2.setId(101L);
        r2.setLivro(livro);
        r2.setUsuario(usuario2);
        r2.setDataReserva(LocalDateTime.now());
        r2.setStatus(StatusReserva.ATIVA);

        when(livroRepository.findById(10L)).thenReturn(Optional.of(livro));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario2));
        when(reservaRepository.findByLivroAndStatusOrderByDataReservaAsc(livro, StatusReserva.ATIVA))
                .thenReturn(List.of(r1, r2));

        FilaResponse fila = reservaService.filaParaUsuario(10L, 2L);

        assertThat(fila.totalFila()).isEqualTo(2);
        assertThat(fila.posicaoUsuario()).isEqualTo(2);
        // não expõe dados de outros usuários
        assertThat(fila.livroTitulo()).isEqualTo("Livro Fila");
    }

    @Test
    void deveRetornarPosicaoNulaQuandoUsuarioNaoEstaNaFila() {
        Livro livro = new Livro();
        livro.setId(10L);

        Usuario usuario = new Usuario();
        usuario.setId(99L);

        when(livroRepository.findById(10L)).thenReturn(Optional.of(livro));
        when(usuarioRepository.findById(99L)).thenReturn(Optional.of(usuario));
        when(reservaRepository.findByLivroAndStatusOrderByDataReservaAsc(livro, StatusReserva.ATIVA))
                .thenReturn(List.of());

        FilaResponse fila = reservaService.filaParaUsuario(10L, 99L);

        assertThat(fila.totalFila()).isEqualTo(0);
        assertThat(fila.posicaoUsuario()).isNull();
    }
}
