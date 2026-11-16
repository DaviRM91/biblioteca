package br.com.bibliotecabetim.api.repository;

import br.com.bibliotecabetim.api.model.Notificacao;
import br.com.bibliotecabetim.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByUsuario(Usuario usuario);

    boolean existsByUsuarioAndTipoAndEnviadaEmBetween(Usuario usuario,
                                                      br.com.bibliotecabetim.api.model.TipoNotificacao tipo,
                                                      LocalDateTime inicioDoDia,
                                                      LocalDateTime fimDoDia);
}
