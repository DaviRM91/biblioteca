package br.com.bibliotecabetim.api.dto;

import br.com.bibliotecabetim.api.model.StatusReserva;

public record ReservaRequest(
        Long livroId
) {
}
