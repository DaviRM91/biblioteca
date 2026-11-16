package br.com.bibliotecabetim.api.dto;

import br.com.bibliotecabetim.api.model.StatusExemplar;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados para criar ou atualizar um exemplar")
public record ExemplarRequest(
        @Schema(description = "Código de tombamento único do exemplar", example = "12345")
        String codigoTombamento,

        @Schema(description = "Status atual do exemplar", example = "DISPONIVEL")
        StatusExemplar status
) {
}
