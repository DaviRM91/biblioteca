package br.com.bibliotecabetim.api.repository;

import br.com.bibliotecabetim.api.model.Livro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    Optional<Livro> findByIsbn(String isbn);
    boolean existsByIsbn(String isbn);

    @Query("""
        SELECT l FROM Livro l
        WHERE (:busca IS NULL OR :busca = '' OR LOWER(l.titulo) LIKE LOWER(CONCAT('%', :busca, '%'))
             OR LOWER(l.autor) LIKE LOWER(CONCAT('%', :busca, '%'))
             OR LOWER(l.isbn) LIKE LOWER(CONCAT('%', :busca, '%')))
          AND (:categoria IS NULL OR :categoria = '' OR LOWER(l.categoria) = LOWER(:categoria))
        ORDER BY l.id ASC
    """)
    Page<Livro> buscar(String busca, String categoria, Pageable pageable);

    @Query("SELECT l FROM Livro l LEFT JOIN FETCH l.exemplares WHERE l.id = :id")
    Optional<Livro> findByIdWithExemplares(@Param("id") Long id);

    @Query("SELECT l FROM Livro l LEFT JOIN FETCH l.exemplares")
    List<Livro> findAllWithExemplares();
}
