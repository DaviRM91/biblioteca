package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.EmprestimoRequest;
import br.com.bibliotecabetim.api.dto.EmprestimoResponse;
import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.config.AppProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final ExemplarRepository exemplarRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaService reservaService;
    private final AppProperties appProperties;

    public EmprestimoService(EmprestimoRepository emprestimoRepository,
                             ExemplarRepository exemplarRepository,
                             UsuarioRepository usuarioRepository,
                             ReservaService reservaService,
                             AppProperties appProperties) {
        this.emprestimoRepository = emprestimoRepository;
        this.exemplarRepository = exemplarRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaService = reservaService;
        this.appProperties = appProperties;
    }

    public EmprestimoResponse buscarPorId(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Empréstimo não encontrado: " + id));
        return toResponse(emprestimo);
    }

    public java.util.List<EmprestimoResponse> buscarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId));
        return emprestimoRepository.findByUsuario(usuario).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public EmprestimoResponse criar(EmprestimoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + request.usuarioId()));
        if (!usuario.getAtivo()) {
            throw new IllegalStateException("Usuário inativo não pode realizar empréstimos.");
        }

        Exemplar exemplar = exemplarRepository.findById(request.exemplarId())
                .orElseThrow(() -> new NoSuchElementException("Exemplar não encontrado: " + request.exemplarId()));
        if (exemplar.getStatus() != StatusExemplar.DISPONIVEL) {
            throw new IllegalStateException("Exemplar não está disponível para empréstimo.");
        }

        // Regra: bloquear novo empréstimo se houver atraso
        boolean temAtraso = emprestimoRepository.findByUsuarioAndDataDevolucaoIsNull(usuario).stream()
                .anyMatch(e -> e.getDataPrevistaDevolucao().isBefore(LocalDate.now()));
        if (temAtraso) {
            throw new IllegalStateException("Usuário possui empréstimo em atraso. Não é possível realizar novo empréstimo.");
        }

        // Regra: limite de 3 empréstimos simultâneos
        long emprestimosAtivos = emprestimoRepository.findByUsuarioAndDataDevolucaoIsNull(usuario).stream()
                .filter(e -> !e.getExemplar().getId().equals(exemplar.getId()))
                .count();
        if (emprestimosAtivos >= appProperties.getLibrary().getMaxLoansPerUser()) {
            throw new IllegalStateException("Usuário atingiu o limite máximo de empréstimos simultâneos ("
                    + appProperties.getLibrary().getMaxLoansPerUser() + ").");
        }

        // Criar empréstimo
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setExemplar(exemplar);
        emprestimo.setUsuario(usuario);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(appProperties.getLibrary().getLoanDays()));
        emprestimo.setRenovacoes(0);
        emprestimo = emprestimoRepository.save(emprestimo);

        // Atualizar status do exemplar
        exemplar.setStatus(StatusExemplar.EMPRESTADO);
        exemplarRepository.save(exemplar);

        return toResponse(emprestimo);
    }

    @Transactional
    public EmprestimoResponse devolver(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Empréstimo não encontrado: " + id));
        if (emprestimo.getDataDevolucao() != null) {
            throw new IllegalStateException("Este empréstimo já foi devolvido.");
        }

        emprestimo.setDataDevolucao(LocalDate.now());
        emprestimo = emprestimoRepository.save(emprestimo);

        Exemplar exemplar = emprestimo.getExemplar();
        // Se há fila de reservas para este livro, o exemplar fica RESERVADO para o primeiro da fila
        boolean houveFila = reservaService.processarDevolucaoComFila(exemplar.getLivro(), exemplar);
        if (!houveFila) {
            exemplar.setStatus(StatusExemplar.DISPONIVEL);
            exemplarRepository.save(exemplar);
        }
        return toResponse(emprestimo);
    }

    @Transactional
    public EmprestimoResponse renovar(Long id) {
        Emprestimo emprestimo = emprestimoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Empréstimo não encontrado: " + id));
        if (emprestimo.getDataDevolucao() != null) {
            throw new IllegalStateException("Não é possível renovar um empréstimo já devolvido.");
        }

        int maxRenovacoes = appProperties.getLibrary().getMaxRenewals();
        if (emprestimo.getRenovacoes() >= maxRenovacoes) {
            throw new IllegalStateException("Limite máximo de renovações atingido (" + maxRenovacoes + ").");
        }

        // Só renovar se não houver reserva ATIVA para o livro
        if (reservaService.existeReservaAtivaParaLivro(emprestimo.getExemplar().getLivro())) {
            throw new IllegalStateException("Não é possível renovar: há reserva ativa para este livro.");
        }

        emprestimo.setDataPrevistaDevolucao(emprestimo.getDataPrevistaDevolucao().plusDays(appProperties.getLibrary().getLoanDays()));
        emprestimo.setRenovacoes(emprestimo.getRenovacoes() + 1);
        emprestimo = emprestimoRepository.save(emprestimo);
        return toResponse(emprestimo);
    }

    private EmprestimoResponse toResponse(Emprestimo e) {
        return new EmprestimoResponse(
                e.getId(),
                e.getExemplar().getId(),
                e.getExemplar().getLivro().getId(),
                e.getExemplar().getCodigoTombamento(),
                e.getUsuario().getId(),
                e.getUsuario().getNome(),
                e.getDataEmprestimo(),
                e.getDataPrevistaDevolucao(),
                e.getDataDevolucao(),
                e.getRenovacoes()
        );
    }
}
