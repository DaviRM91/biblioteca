package br.com.bibliotecabetim.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados para criar um empréstimo")
public record EmprestimoRequest(
        @Schema(description = "ID do exemplar a ser emprestado", example = "1")
        Long exemplarId,

        @Schema(description = "ID do usuário que vai pegar o empréstimo", example = "5")
        Long usuarioId
) {
}
