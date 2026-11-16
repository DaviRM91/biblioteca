package br.com.bibliotecabetim.api.service;

import br.com.bibliotecabetim.api.dto.LivroRequest;
import br.com.bibliotecabetim.api.dto.LivroResponse;
import br.com.bibliotecabetim.api.model.Livro;
import br.com.bibliotecabetim.api.repository.LivroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@Transactional(readOnly = true)
public class LivroService {

    private final LivroRepository livroRepository;

    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    public Page<LivroResponse> buscar(String busca, String categoria, Pageable pageable) {
        Page<Livro> livros = livroRepository.buscar(busca, categoria, pageable);
        return livros.map(this::toResponse);
    }

    public LivroResponse buscarPorId(Long id) {
        Livro livro = livroRepository.findByIdWithExemplares(id)
                .orElseThrow(() -> new NoSuchElementException("Livro não encontrado: " + id));
        return toResponse(livro);
    }

    @Transactional
    public LivroResponse criar(LivroRequest request) {
        if (request.isbn() != null && !request.isbn().isBlank() && livroRepository.existsByIsbn(request.isbn())) {
            throw new IllegalArgumentException("Já existe um livro com o ISBN informado: " + request.isbn());
        }
        Livro livro = new Livro();
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setIsbn(request.isbn());
        livro.setCategoria(request.categoria());
        livro.setAnoPublicacao(request.anoPublicacao());
        livro.setResumo(request.resumo());
        livro.setCapaUrl(request.capaUrl());
        livro = livroRepository.save(livro);
        return toResponse(livro);
    }

    @Transactional
    public LivroResponse atualizar(Long id, LivroRequest request) {
        Livro livro = livroRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Livro não encontrado: " + id));
        if (request.isbn() != null && !request.isbn().equals(livro.getIsbn())
                && livroRepository.existsByIsbn(request.isbn())) {
            throw new IllegalArgumentException("Já existe um livro com o ISBN informado: " + request.isbn());
        }
        livro.setTitulo(request.titulo());
        livro.setAutor(request.autor());
        livro.setIsbn(request.isbn());
        livro.setCategoria(request.categoria());
        livro.setAnoPublicacao(request.anoPublicacao());
        livro.setResumo(request.resumo());
        livro.setCapaUrl(request.capaUrl());
        livro = livroRepository.save(livro);
        return toResponse(livro);
    }

    @Transactional
    public void deletar(Long id) {
        if (!livroRepository.existsById(id)) {
            throw new NoSuchElementException("Livro não encontrado: " + id);
        }
        livroRepository.deleteById(id);
    }

    private LivroResponse toResponse(Livro livro) {
        Boolean disponivel = livro.getExemplares() != null
                && livro.getExemplares().stream()
                .anyMatch(e -> e.getStatus() == br.com.bibliotecabetim.api.model.StatusExemplar.DISPONIVEL);
        return new LivroResponse(
                livro.getId(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getIsbn(),
                livro.getCategoria(),
                livro.getAnoPublicacao(),
                livro.getResumo(),
                livro.getCapaUrl(),
                disponivel
        );
    }
}
