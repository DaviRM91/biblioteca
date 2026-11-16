package br.com.bibliotecabetim.api.repository;

import br.com.bibliotecabetim.api.model.Emprestimo;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    List<Emprestimo> findByUsuarioAndDataDevolucaoIsNull(Usuario usuario);

    List<Emprestimo> findByUsuario(Usuario usuario);

    List<Emprestimo> findByExemplarAndDataDevolucaoIsNull(Exemplar exemplar);

    List<Emprestimo> findByDataPrevistaDevolucao(LocalDate dataPrevistaDevolucao);

    List<Emprestimo> findByDataPrevistaDevolucaoBeforeAndDataDevolucaoIsNull(LocalDate data);
}
