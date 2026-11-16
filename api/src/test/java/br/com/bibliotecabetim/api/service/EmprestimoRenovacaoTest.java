package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.model.Papel;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.ReservaRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmprestimoRenovacaoTest {

    @Mock
    private EmprestimoRepository emprestimoRepository;

    @Mock
    private ExemplarRepository exemplarRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ReservaService reservaService;

    @Mock
    private AppProperties appProperties;

    @InjectMocks
    private EmprestimoService emprestimoService;

    @Test
    void deveBloquearRenovacaoQuandoLimiteAtingido() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Livro livro = new Livro();
        livro.setId(10L);

        Exemplar exemplar = new Exemplar();
        exemplar.setId(100L);
        exemplar.setLivro(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setId(1000L);
        emprestimo.setExemplar(exemplar);
        emprestimo.setRenovacoes(2); // já no limite

        when(appProperties.getLibrary()).thenReturn(new AppProperties.Library());
        when(emprestimoRepository.findById(1000L)).thenReturn(Optional.of(emprestimo));

        assertThatThrownBy(() -> emprestimoService.renovar(1000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Limite máximo de renovações");
    }

    @Test
    void deveBloquearRenovacaoQuandoHouverReservaAtiva() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);

        Livro livro = new Livro();
        livro.setId(10L);

        Exemplar exemplar = new Exemplar();
        exemplar.setId(100L);
        exemplar.setLivro(livro);

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setId(1000L);
        emprestimo.setExemplar(exemplar);
        emprestimo.setRenovacoes(0);

        when(appProperties.getLibrary()).thenReturn(new AppProperties.Library());
        when(emprestimoRepository.findById(1000L)).thenReturn(Optional.of(emprestimo));
        when(reservaService.existeReservaAtivaParaLivro(livro)).thenReturn(true);

        assertThatThrownBy(() -> emprestimoService.renovar(1000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("reserva ativa");
    }
}
