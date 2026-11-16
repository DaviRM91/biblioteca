package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.EmprestimoRequest;
import br.com.bibliotecabetim.api.dto.EmprestimoResponse;
import br.com.bibliotecabetim.api.security.UsuarioPrincipal;
import br.com.bibliotecabetim.api.service.EmprestimoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;

@RestController
@RequestMapping("/api/emprestimos")
@Tag(name = "Empréstimos", description = "Empréstimo, devolução e renovação de exemplares")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Registrar empréstimo", description = "Registra um empréstimo de exemplar para um usuário. Apenas bibliotecário.")
    @ApiResponse(responseCode = "201", description = "Empréstimo criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Requisição inválida ou exemplar indisponível")
    @ApiResponse(responseCode = "404", description = "Exemplar não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<EmprestimoResponse> criar(@RequestBody EmprestimoRequest request) {
        var response = emprestimoService.criar(request);
        return ResponseEntity.created(URI.create("/api/emprestimos/" + response.id())).body(response);
    }

    @PostMapping("/{id}/devolucao")
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Registrar devolução", description = "Registra a devolução de um empréstimo. Apenas bibliotecário.")
    @ApiResponse(responseCode = "200", description = "Devolução registrada com sucesso")
    @ApiResponse(responseCode = "404", description = "Empréstimo não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<EmprestimoResponse> devolucao(
            @Parameter(description = "ID do empréstimo") @PathVariable Long id) {
        return ResponseEntity.ok(emprestimoService.devolver(id));
    }

    @PostMapping("/{id}/renovacao")
    @PreAuthorize("hasRole('BIBLIOTECARIO')")
    @Operation(summary = "Renovar empréstimo", description = "Renova um empréstimo (máx. 2 renovações, sem reserva ativa). Apenas bibliotecário.")
    @ApiResponse(responseCode = "200", description = "Empréstimo renovado com sucesso")
    @ApiResponse(responseCode = "400", description = "Não foi possível renovar (limite atingido ou reserva ativa)")
    @ApiResponse(responseCode = "404", description = "Empréstimo não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<EmprestimoResponse> renovacao(
            @Parameter(description = "ID do empréstimo") @PathVariable Long id) {
        return ResponseEntity.ok(emprestimoService.renovar(id));
    }

    }
