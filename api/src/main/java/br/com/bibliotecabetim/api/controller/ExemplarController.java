package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.ExemplarRequest;
import br.com.bibliotecabetim.api.dto.ExemplarResponse;
import br.com.bibliotecabetim.api.service.ExemplarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/livros/{livroId}/exemplares")
@Tag(name = "Exemplares", description = "CRUD de exemplares para livros (bibliotecário)")
public class ExemplarController {

    private final ExemplarService exemplarService;

    public ExemplarController(ExemplarService exemplarService) {
        this.exemplarService = exemplarService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Criar exemplar", description = "Cadastra um novo exemplar para um livro. Apenas bibliotecário.")
    @ApiResponse(responseCode = "201", description = "Exemplar criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Código de tombamento duplicado")
    @ApiResponse(responseCode = "404", description = "Livro não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ExemplarResponse> criar(
            @Parameter(description = "ID do livro") @PathVariable Long livroId,
            @RequestBody ExemplarRequest request) {
        var response = exemplarService.criar(livroId, request);
        return ResponseEntity.created(URI.create("/api/livros/" + livroId + "/exemplares/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Atualizar exemplar", description = "Atualiza um exemplar. Apenas bibliotecário.")
    @ApiResponse(responseCode = "200", description = "Exemplar atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Código de tombamento duplicado ou não pertence ao livro")
    @ApiResponse(responseCode = "404", description = "Exemplar não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ExemplarResponse> atualizar(
            @Parameter(description = "ID do livro") @PathVariable Long livroId,
            @Parameter(description = "ID do exemplar") @PathVariable Long id,
            @RequestBody ExemplarRequest request) {
        return ResponseEntity.ok(exemplarService.atualizar(livroId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Excluir exemplar", description = "Exclui um exemplar. Apenas bibliotecário.")
    @ApiResponse(responseCode = "204", description = "Exemplar excluído com sucesso")
    @ApiResponse(responseCode = "404", description = "Exemplar não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do livro") @PathVariable Long livroId,
            @Parameter(description = "ID do exemplar") @PathVariable Long id) {
        exemplarService.deletar(livroId, id);
        return ResponseEntity.noContent().build();
    }
}
