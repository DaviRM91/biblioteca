package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.FilaResponse;
import br.com.bibliotecabetim.api.dto.ReservaResponse;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.Reserva;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import br.com.bibliotecabetim.api.repository.ReservaRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.config.AppProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final NotificacaoService notificacaoService;
    private final AppProperties appProperties;

    public ReservaService(ReservaRepository reservaRepository,
                          LivroRepository livroRepository,
                          UsuarioRepository usuarioRepository,
                          EmprestimoRepository emprestimoRepository,
                          NotificacaoService notificacaoService,
                          AppProperties appProperties) {
        this.reservaRepository = reservaRepository;
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.notificacaoService = notificacaoService;
        this.appProperties = appProperties;
    }

    public ReservaResponse buscarPorId(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva não encontrada: " + id));
        return toResponse(reserva, posicaoFila(reserva.getLivro(), reserva.getUsuario()));
    }

    public java.util.List<ReservaResponse> buscarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId));
        return reservaRepository.findByUsuarioAndStatus(usuario, StatusReserva.ATIVA).stream()
                .map(r -> toResponse(r, posicaoFila(r.getLivro(), usuario)))
                .toList();
    }

    public FilaResponse filaParaUsuario(Long livroId, Long usuarioId) {
        Livro livro = livroRepository.findById(livroId)
                .orElseThrow(() -> new NoSuchElementException("Livro não encontrado: " + livroId));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId));
        List<Reserva> fila = reservaRepository.findByLivroAndStatusOrderByDataReservaAsc(livro, StatusReserva.ATIVA);
        Integer posicao = null;
        int total = fila.size();
        for (int i = 0; i < fila.size(); i++) {
            if (fila.get(i).getUsuario().getId().equals(usuario.getId())) {
                posicao = i + 1;
                break;
            }
        }
        return new FilaResponse(livro.getId(), livro.getTitulo(), posicao, total);
    }

    @Transactional
    public ReservaResponse criar(Long usuarioId, Long livroId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId));
        Livro livro = livroRepository.findByIdWithExemplares(livroId)
                .orElseThrow(() -> new NoSuchElementException("Livro não encontrado: " + livroId));

        // Regra: reserva só é permitida quando não há exemplar DISPONIVEL
        boolean temDisponivel = livro.getExemplares().stream()
                .anyMatch(e -> e.getStatus() == StatusExemplar.DISPONIVEL);
        if (temDisponivel) {
            throw new IllegalStateException("Não é possível reservar: há exemplar disponível para empréstimo.");
        }

        // Regra: um usuário não pode ter duas reservas ATIVAS do mesmo livro
        if (reservaRepository.existsByLivroAndUsuarioAndStatus(livro, usuario, StatusReserva.ATIVA)) {
            throw new IllegalStateException("Usuário já possui uma reserva ativa para este livro.");
        }

        Reserva reserva = new Reserva();
        reserva.setLivro(livro);
        reserva.setUsuario(usuario);
        reserva.setStatus(StatusReserva.ATIVA);
        reserva = reservaRepository.save(reserva);
        return toResponse(reserva, posicaoFila(livro, usuario));
    }

    @Transactional
    public void cancelar(Long id, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva não encontrada: " + id));
        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalStateException("Reserva não pertence a este usuário.");
        }
        reserva.setStatus(StatusReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    /**
     * Processa a devolução de um exemplar quando há fila de reservas.
     * Usa lock pessimista (SELECT ... FOR UPDATE) na primeira reserva da fila
     * para evitar race condition com o job de expiração de reservas.
     */
    @Transactional
    public boolean processarDevolucaoComFila(Livro livro, br.com.bibliotecabetim.api.model.Exemplar exemplar) {
        Optional<Reserva> primeiraOpt = reservaRepository.findFirstByLivroAndStatusOrderByDataReservaAscWithLock(livro, StatusReserva.ATIVA);
        if (primeiraOpt.isEmpty()) {
            return false;
        }
        Reserva primeira = primeiraOpt.get();
        primeira.setStatus(StatusReserva.ATENDIDA);
        reservaRepository.save(primeira);
        exemplar.setStatus(StatusExemplar.RESERVADO);
        notificacaoService.criar(primeira.getUsuario().getId(),
                br.com.bibliotecabetim.api.model.TipoNotificacao.RESERVA_DISPONIVEL,
                "O livro \"" + livro.getTitulo() + "\" está disponível para retirada. Você tem "
                        + appProperties.getLibrary().getReservationHoldHours() + " horas para retirar a reserva.");
        return true;
    }

    /**
     * Expira reservas não retiradas no prazo e avança a fila.
     * Usa lock pessimista ao buscar a próxima reserva para evitar race condition
     * com devoluções simultâneas.
     */
    @Transactional
    public void expirarReservas() {
        LocalDateTime limite = LocalDateTime.now().minusHours(appProperties.getLibrary().getReservationHoldHours());
        List<Reserva> expiradas = reservaRepository.findByDataReservaBeforeAndStatus(limite, StatusReserva.ATIVA);
        for (Reserva reserva : expiradas) {
            reserva.setStatus(StatusReserva.EXPIRADA);
            reservaRepository.save(reserva);
            reservaRepository.flush(); // Garante que a expiração está persistida antes de buscar a próxima

            // Busca a próxima reserva ATIVA com lock pessimista para evitar race condition
            Optional<Reserva> proximaOpt = reservaRepository.findFirstByLivroAndStatusOrderByDataReservaAscWithLock(reserva.getLivro(), StatusReserva.ATIVA);
            if (proximaOpt.isPresent()) {
                Reserva proxima = proximaOpt.get();
                proxima.setStatus(StatusReserva.ATENDIDA);
                reservaRepository.save(proxima);
                notificacaoService.criar(proxima.getUsuario().getId(),
                        br.com.bibliotecabetim.api.model.TipoNotificacao.RESERVA_DISPONIVEL,
                        "O livro \"" + reserva.getLivro().getTitulo() + "\" está disponível para retirada (próximo da fila).");
            }
        }
    }

    public boolean existeReservaAtivaParaLivro(Livro livro) {
        return !reservaRepository.findByLivroAndStatus(livro, StatusReserva.ATIVA).isEmpty();
    }

    private Integer posicaoFila(Livro livro, Usuario usuario) {
        List<Reserva> fila = reservaRepository.findByLivroAndStatusOrderByDataReservaAsc(livro, StatusReserva.ATIVA);
        for (int i = 0; i < fila.size(); i++) {
            if (fila.get(i).getUsuario().getId().equals(usuario.getId())) {
                return i + 1;
            }
        }
        return null;
    }

    private ReservaResponse toResponse(Reserva reserva, Integer posicao) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getLivro().getId(),
                reserva.getLivro().getTitulo(),
                reserva.getUsuario().getId(),
                reserva.getDataReserva(),
                reserva.getStatus().name(),
                posicao
        );
    }
}
