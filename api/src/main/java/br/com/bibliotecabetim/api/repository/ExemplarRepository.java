package br.com.bibliotecabetim.api.repository;

import br.com.bibliotecabetim.api.model.Exemplar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExemplarRepository extends JpaRepository<Exemplar, Long> {
    Optional<Exemplar> findByCodigoTombamento(String codigoTombamento);
    boolean existsByCodigoTombamento(String codigoTombamento);
}
