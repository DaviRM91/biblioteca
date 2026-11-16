package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.ExemplarRequest;
import br.com.bibliotecabetim.api.dto.ExemplarResponse;
import br.com.bibliotecabetim.api.model.Exemplar;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.model.StatusExemplar;
import br.com.bibliotecabetim.api.repository.ExemplarRepository;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class ExemplarService {

    private final ExemplarRepository exemplarRepository;
    private final LivroRepository livroRepository;

    public ExemplarService(ExemplarRepository exemplarRepository, LivroRepository livroRepository) {
        this.exemplarRepository = exemplarRepository;
        this.livroRepository = livroRepository;
    }

    public ExemplarResponse buscarPorId(Long id) {
        Exemplar exemplar = exemplarRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Exemplar não encontrado: " + id));
        return toResponse(exemplar);
    }

    @Transactional
    public ExemplarResponse criar(Long livroId, ExemplarRequest request) {
        Livro livro = livroRepository.findById(livroId)
                .orElseThrow(() -> new NoSuchElementException("Livro não encontrado: " + livroId));
        if (request.codigoTombamento() != null
                && exemplarRepository.existsByCodigoTombamento(request.codigoTombamento())) {
            throw new IllegalArgumentException("Já existe um exemplar com o código de tombamento: " + request.codigoTombamento());
        }
        Exemplar exemplar = new Exemplar();
        exemplar.setLivro(livro);
        exemplar.setCodigoTombamento(request.codigoTombamento());
        exemplar.setStatus(request.status() != null ? request.status() : StatusExemplar.DISPONIVEL);
        exemplar = exemplarRepository.save(exemplar);
        return toResponse(exemplar);
    }

    @Transactional
    public ExemplarResponse atualizar(Long livroId, Long id, ExemplarRequest request) {
        Exemplar exemplar = exemplarRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Exemplar não encontrado: " + id));
        if (!exemplar.getLivro().getId().equals(livroId)) {
            throw new IllegalArgumentException("Exemplar não pertence ao livro informado.");
        }
        if (request.codigoTombamento() != null
                && !request.codigoTombamento().equals(exemplar.getCodigoTombamento())
                && exemplarRepository.existsByCodigoTombamento(request.codigoTombamento())) {
            throw new IllegalArgumentException("Já existe um exemplar com o código de tombamento: " + request.codigoTombamento());
        }
        exemplar.setCodigoTombamento(request.codigoTombamento());
        exemplar.setStatus(request.status() != null ? request.status() : exemplar.getStatus());
        exemplar = exemplarRepository.save(exemplar);
        return toResponse(exemplar);
    }

    @Transactional
    public void deletar(Long livroId, Long id) {
        Exemplar exemplar = exemplarRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Exemplar não encontrado: " + id));
        if (!exemplar.getLivro().getId().equals(livroId)) {
            throw new IllegalArgumentException("Exemplar não pertence ao livro informado.");
        }
        exemplarRepository.deleteById(id);
    }

    private ExemplarResponse toResponse(Exemplar exemplar) {
        return new ExemplarResponse(
                exemplar.getId(),
                exemplar.getLivro() != null ? exemplar.getLivro().getId() : null,
                exemplar.getCodigoTombamento(),
                exemplar.getStatus()
        );
    }
}
