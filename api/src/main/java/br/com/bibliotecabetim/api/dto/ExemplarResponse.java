package br.com.bibliotecabetim.api.dto;

import br.com.bibliotecabetim.api.model.StatusExemplar;

public record ExemplarResponse(
        Long id,
        Long livroId,
        String codigoTombamento,
        StatusExemplar status
) {
}
