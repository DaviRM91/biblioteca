package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.FilaResponse;
import br.com.bibliotecabetim.api.dto.ReservaResponse;
import br.com.bibliotecabetim.api.security.UsuarioPrincipal;
import br.com.bibliotecabetim.api.service.ReservaService;
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

@RestController
@RequestMapping("/api/livros/{livroId}/reservas")
@Tag(name = "Reservas", description = "Reserva prévia de livros e fila de espera")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Reservar livro", description = "Reserva um livro quando não há exemplar disponível.")
    @ApiResponse(responseCode = "200", description = "Reserva criada com sucesso")
    @ApiResponse(responseCode = "404", description = "Livro não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ReservaResponse> reservar(
            @Parameter(description = "ID do livro") @PathVariable Long livroId,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        var response = reservaService.criar(principal.getId(), livroId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Cancelar reserva", description = "Cancela uma reserva própria do usuário logado.")
    @ApiResponse(responseCode = "204", description = "Reserva cancelada com sucesso")
    @ApiResponse(responseCode = "404", description = "Reserva não encontrada")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> cancelar(
            @Parameter(description = "ID da reserva") @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        reservaService.cancelar(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fila")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Fila de espera", description = "Retorna a posição do usuário logado e o total de pessoas na fila, sem expor dados de outros usuários.")
    @ApiResponse(responseCode = "200", description = "Fila de espera retornada")
    @ ApiResponse(responseCode = "404", description = "Livro não encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FilaResponse> fila(
            @Parameter(description = "ID do livro") @PathVariable Long livroId,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        var response = reservaService.filaParaUsuario(livroId, principal.getId());
        return ResponseEntity.ok(response);
    }
}
