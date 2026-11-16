package br.com.bibliotecabetim.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciais para login")
public record LoginRequest(
        @NotBlank(message = "E-mail é obrigatório")
        @Schema(description = "E-mail cadastrado", example = "usuario@email.com")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Schema(description = "Senha do usuário", example = "senha123")
        String senha
) {
}
