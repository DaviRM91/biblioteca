package br.com.bibliotecabetim.api.controller;

import br.com.bibliotecabetim.api.dto.EmprestimoResponse;
import br.com.bibliotecabetim.api.dto.NotificacaoResponse;
import br.com.bibliotecabetim.api.dto.ReservaResponse;
import br.com.bibliotecabetim.api.security.UsuarioPrincipal;
import br.com.bibliotecabetim.api.service.EmprestimoService;
import br.com.bibliotecabetim.api.service.NotificacaoService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@Tag(name = "Meu perfil", description = "Endpoints do usuário logado")
public class MeController {

    private final EmprestimoService emprestimoService;
    private final ReservaService reservaService;
    private final NotificacaoService notificacaoService;

    public MeController(EmprestimoService emprestimoService, ReservaService reservaService, NotificacaoService notificacaoService) {
        this.emprestimoService = emprestimoService;
        this.reservaService = reservaService;
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("/emprestimos")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Meus empréstimos", description = "Lista os empréstimos do usuário logado.")
    @ApiResponse(responseCode = "200", description = "Lista de empréstimos retornada")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<EmprestimoResponse>> meusEmprestimos(@AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        var lista = emprestimoService.buscarPorUsuario(principal.getId());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/reservas")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Minhas reservas", description = "Lista as reservas do usuário logado.")
    @ApiResponse(responseCode = "200", description = "Lista de reservas retornada")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<ReservaResponse>> minhasReservas(@AuthenticationPrincipal UsuarioPrincipal principal) {
        System.out.println("[MeController] Principal recebido: " + principal);
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        var lista = reservaService.buscarPorUsuario(principal.getId());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/notificacoes")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Minhas notificações", description = "Lista as notificações do usuário logado.")
    @ApiResponse(responseCode = "200", description = "Lista de notificações retornada")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<NotificacaoResponse>> minhasNotificacoes(@AuthenticationPrincipal UsuarioPrincipal principal) {
        System.out.println("[MeController] Principal recebido: " + principal);
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        var lista = notificacaoService.buscarPorUsuario(principal.getId());
        return ResponseEntity.ok(lista);
    }

    @PatchMapping("/notificacoes/{id}/lida")
    @PreAuthorize("hasAnyRole('MORADOR', 'BIBLIOTECARIO')")
    @Operation(summary = "Marcar notificação como lida", description = "Marca uma notificação própria como lida.")
    @ApiResponse(responseCode = "204", description = "Notificação marcada como lida")
    @ApiResponse(responseCode = "404", description = "Notificação não encontrada")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> marcarNotificacaoLida(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Parameter(description = "ID da notificação") @PathVariable Long id) {
        System.out.println("[MeController] Principal recebido: " + principal);
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        notificacaoService.marcarLida(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
