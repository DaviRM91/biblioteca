package br.com.bibliotecabetim.api.job;

import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.EmprestimoRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import br.com.bibliotecabetim.api.service.NotificacaoService;
import br.com.bibliotecabetim.api.service.ReservaService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class NotificacaoJob {

    private final EmprestimoRepository emprestimoRepository;
    private final ReservaService reservaService;
    private final NotificacaoService notificacaoService;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoJob(EmprestimoRepository emprestimoRepository,
                          ReservaService reservaService,
                          NotificacaoService notificacaoService,
                          UsuarioRepository usuarioRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.reservaService = reservaService;
        this.notificacaoService = notificacaoService;
        this.usuarioRepository = usuarioRepository;
    }

    // Diário às 08:00: lembrete de devolução (vence em 2 dias e em 1 dia) e aviso de atraso
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void verificarEmprestimos() {
        LocalDate hoje = LocalDate.now();

        // Lembrete: vence em 2 dias e em 1 dia
        List<Emprestimo> vencendo2Dias = emprestimoRepository.findByDataPrevistaDevolucao(hoje.plusDays(2));
        for (Emprestimo e : vencendo2Dias) {
            notificar(e.getUsuario(), br.com.bibliotecabetim.api.model.TipoNotificacao.LEMBRETE_DEVOLUCAO,
                    "Lembrete: o empréstimo do exemplar " + e.getExemplar().getCodigoTombamento()
                            + " vence em 2 dias (data prevista: " + e.getDataPrevistaDevolucao() + ").");
        }

        List<Emprestimo> vencendo1Dia = emprestimoRepository.findByDataPrevistaDevolucao(hoje.plusDays(1));
        for (Emprestimo e : vencendo1Dia) {
            notificar(e.getUsuario(), br.com.bibliotecabetim.api.model.TipoNotificacao.LEMBRETE_DEVOLUCAO,
                    "Lembrete: o empréstimo do exemplar " + e.getExemplar().getCodigoTombamento()
                            + " vence amanhã (data prevista: " + e.getDataPrevistaDevolucao() + ").");
        }

        // Aviso de atraso para os vencidos (data prevista <= hoje e não devolvido)
        List<Emprestimo> atrasados = emprestimoRepository.findByDataPrevistaDevolucaoBeforeAndDataDevolucaoIsNull(hoje.plusDays(1));
        for (Emprestimo e : atrasados) {
            notificar(e.getUsuario(), br.com.bibliotecabetim.api.model.TipoNotificacao.ATRASO,
                    "Aviso de atraso: o empréstimo do exemplar " + e.getExemplar().getCodigoTombamento()
                            + " estava previsto para " + e.getDataPrevistaDevolucao() + " e ainda não foi devolvido.");
        }
    }

    // A cada hora: expirar reservas não retiradas e avançar a fila
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expirarReservas() {
        reservaService.expirarReservas();
    }

    private void notificar(Usuario usuario, br.com.bibliotecabetim.api.model.TipoNotificacao tipo, String mensagem) {
        notificacaoService.criar(usuario.getId(), tipo, mensagem);
    }
}
