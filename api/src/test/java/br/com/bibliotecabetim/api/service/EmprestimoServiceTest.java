package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.EmprestimoRequest;
import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.model.Papel;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.config.AppProperties;
import br.com.bibliotecabetim.api.service.ReservaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmprestimoServiceTest {

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
    void devePermitirEmprestimoQuandoExemplarDisponivel() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setAtivo(true);

        Livro livro = new Livro();
        livro.setId(1L);

        Exemplar exemplar = new Exemplar();
        exemplar.setId(10L);
        exemplar.setStatus(StatusExemplar.DISPONIVEL);
        exemplar.setLivro(livro);

        Emprestimo emprestimoSalvo = new Emprestimo();
        emprestimoSalvo.setId(1000L);
        emprestimoSalvo.setExemplar(exemplar);
        emprestimoSalvo.setUsuario(usuario);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(exemplarRepository.findById(10L)).thenReturn(Optional.of(exemplar));
        when(emprestimoRepository.findByUsuarioAndDataDevolucaoIsNull(usuario)).thenReturn(List.of());
        when(emprestimoRepository.save(any(Emprestimo.class))).thenReturn(emprestimoSalvo);
        when(appProperties.getLibrary()).thenReturn(new AppProperties.Library());

        var request = new EmprestimoRequest(10L, 1L);

        assertThatCode(() -> emprestimoService.criar(request)).doesNotThrowAnyException();
        verify(exemplarRepository).save(any(Exemplar.class));
    }

    @Test
    void deveBloquearEmprestimoQuandoExemplarNaoDisponivel() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setAtivo(true);

        Livro livro = new Livro();
        livro.setId(1L);

        Exemplar exemplar = new Exemplar();
        exemplar.setId(10L);
        exemplar.setStatus(StatusExemplar.EMPRESTADO);
        exemplar.setLivro(livro);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(exemplarRepository.findById(10L)).thenReturn(Optional.of(exemplar));

        var request = new EmprestimoRequest(10L, 1L);

        assertThatThrownBy(() -> emprestimoService.criar(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não está disponível");
    }

    @Test
    void deveBloquearEmprestimoQuandoUsuarioTemAtraso() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setAtivo(true);

        Exemplar exemplar = new Exemplar();
        exemplar.setId(10L);
        exemplar.setStatus(StatusExemplar.DISPONIVEL);

        Emprestimo atrasado = new Emprestimo();
        atrasado.setId(100L);
        atrasado.setDataPrevistaDevolucao(LocalDate.now().minusDays(1));

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(exemplarRepository.findById(10L)).thenReturn(Optional.of(exemplar));
        when(emprestimoRepository.findByUsuarioAndDataDevolucaoIsNull(usuario)).thenReturn(List.of(atrasado));

        var request = new EmprestimoRequest(10L, 1L);

        assertThatThrownBy(() -> emprestimoService.criar(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("atraso");
    }
}
