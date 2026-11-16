package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.LivroRequest;
import br.com.bibliotecabetim.api.dto.LivroResponse;
import br.com.bibliotecabetim.api.dto.PageResponse;
import br.com.bibliotecabetim.api.service.LivroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/livros")
@Tag(name = "Livros", description = "Consulta ao catálogo (público) e gestão de livros (bibliotecário)")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping
    @Operation(summary = "Listar livros", description = "Busca paginada por título, autor ou ISBN, com filtro opcional de categoria. Indica disponibilidade.")
    @ApiResponse(responseCode = "200", description = "Lista paginada de livros")
    public PageResponse<LivroResponse> listar(
            @Parameter(description = "Texto para buscar em título, autor ou ISBN") @RequestParam(required = false) String busca,
            @Parameter(description = "Filtrar por categoria (ex.: Romance, Tecnologia)") @RequestParam(required = false) String categoria,
            @PageableDefault(size = 10) Pageable pageable) {
        var page = livroService.buscar(busca, categoria, pageable);
        return new PageResponse<>(page.getContent(), page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar livro por ID", description = "Retorna um livro pelo ID, incluindo o campo resumo (texto puro, sem HTML).")
    @ApiResponse(responseCode = "200", description = "Livro encontrado")
    @ApiResponse(responseCode = "404", description = "Livro não encontrado")
    public ResponseEntity<LivroResponse> buscarPorId(
            @Parameter(description = "ID do livro") @PathVariable Long id) {
        return ResponseEntity.ok(livroService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar livro", description = "Cadastra um novo livro no catálogo. Apenas bibliotecário.")
    @ApiResponse(responseCode = "201", description = "Livro criado com sucesso")
    @ApiResponse(responseCode = "400", description = "ISBN já existe")
    @ApiResponse(responseCode = "401", description = "Não autenticado")
    @ApiResponse(responseCode = "403", description = "Acesso negado (requer papel BIBLIOTECARIO)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LivroResponse> criar(@RequestBody LivroRequest request) {
        var response = livroService.criar(request);
        return ResponseEntity.created(URI.create("/api/livros/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar livro", description = "Atualiza um livro existente. Apenas bibliotecário.")
    @ApiResponse(responseCode = "200", description = "Livro atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "ISBN já existe em outro livro")
    @ApiResponse(responseCode = "401", description = "Não autenticado")
    @ApiResponse(responseCode = "403", description = "Acesso negado (requer papel BIBLIOTECARIO)")
    @ApiResponse(responseCode = "404", description = "Livro não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LivroResponse> atualizar(
            @Parameter(description = "ID do livro") @PathVariable Long id,
            @RequestBody LivroRequest request) {
        return ResponseEntity.ok(livroService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir livro", description = "Exclui um livro do catálogo. Apenas bibliotecário.")
    @ApiResponse(responseCode = "204", description = "Livro excluído com sucesso")
    @ApiResponse(responseCode = "401", description = "Não autenticado")
    @ApiResponse(responseCode = "403", description = "Acesso negado (requer papel BIBLIOTECARIO)")
    @ApiResponse(responseCode = "404", description = "Livro não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do livro") @PathVariable Long id) {
        livroService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
