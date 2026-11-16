package br.com.bibliotecabetim.api.repository;

import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.Reserva;
import br.com.bibliotecabetim.api.model.StatusReserva;
import br.com.bibliotecabetim.api.model.Usuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByLivroAndStatus(Livro livro, StatusReserva status);

    List<Reserva> findByLivroAndStatusOrderByDataReservaAsc(Livro livro, StatusReserva status);

    List<Reserva> findByUsuarioAndStatus(Usuario usuario, StatusReserva status);

    boolean existsByLivroAndUsuarioAndStatus(Livro livro, Usuario usuario, StatusReserva status);

    List<Reserva> findByDataReservaBeforeAndStatus(LocalDateTime dataLimite, StatusReserva status);

    /**
     * Busca a primeira reserva ATIVA da fila de um livro com lock pessimista (SELECT ... FOR UPDATE).
     * Garante exclusão mútua entre devolução com fila e job de expiração de reservas.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.livro = :livro AND r.status = :status
        ORDER BY r.dataReserva ASC
    """)
    Optional<Reserva> findFirstByLivroAndStatusOrderByDataReservaAscWithLock(Livro livro, StatusReserva status);
}
