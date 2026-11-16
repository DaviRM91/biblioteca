package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.NotificacaoResponse;
import br.com.bibliotecabetim.api.model.Notificacao;
import br.com.bibliotecabetim.api.model.Usuario;
import br.com.bibliotecabetim.api.repository.NotificacaoRepository;
import br.com.bibliotecabetim.api.repository.UsuarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final JavaMailSender mailSender;

    public NotificacaoService(NotificacaoRepository notificacaoRepository,
                              UsuarioRepository usuarioRepository,
                              JavaMailSender mailSender) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.mailSender = mailSender;
    }

    /**
     * Cria e envia (de forma assíncrona) uma notificação.
     * Evita duplicar notificações do mesmo tipo para o mesmo usuário no mesmo dia
     * via constraint única no banco de dados (uk_notificacao_usuario_tipo_dia).
     * Em dev (MailHog/log), falhas de SMTP não quebram o fluxo de negócio.
     */
    @Async
    @Transactional
    public void criar(Long usuarioId, br.com.bibliotecabetim.api.model.TipoNotificacao tipo, String mensagem) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId));

        var notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setTipo(tipo);
        notificacao.setMensagem(mensagem);
        notificacao.setCanal(br.com.bibliotecabetim.api.model.CanalNotificacao.EMAIL);

        try {
            notificacao = notificacaoRepository.save(notificacao);
            enviarEmail(usuario.getEmail(), tipo, mensagem);
        } catch (DataIntegrityViolationException ex) {
            // Constraint única violada: notificação do mesmo tipo para o mesmo usuário no mesmo dia já existe
            // Ignora silenciosamente (deduplicação no nível do banco)
        }
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> buscarPorUsuario(Long usuarioId) {
        return notificacaoRepository.findByUsuario(
                usuarioRepository.findById(usuarioId)
                        .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + usuarioId))
        ).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void marcarLida(Long id, Long usuarioId) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Notificação não encontrada: " + id));
        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalStateException("Notificação não pertence a este usuário.");
        }
        notificacao.setLida(true);
        notificacaoRepository.save(notificacao);
    }

    private void enviarEmail(String para, br.com.bibliotecabetim.api.model.TipoNotificacao tipo, String mensagem) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(para);
            message.setSubject("Biblioteca Betim - " + tipo);
            message.setText(mensagem);
            mailSender.send(message);
        } catch (Exception ex) {
            // Em dev (MailHog/log), falhas de e-mail não quebram o fluxo de negócio
            System.err.println("Falha ao enviar e-mail: " + ex.getMessage());
        }
    }

    private NotificacaoResponse toResponse(Notificacao n) {
        return new NotificacaoResponse(
                n.getId(),
                n.getTipo().name(),
                n.getMensagem(),
                n.getEnviadaEm() != null ? n.getEnviadaEm() : java.time.LocalDateTime.now(),
                n.getLida(),
                n.getCanal().name()
        );
    }
}
