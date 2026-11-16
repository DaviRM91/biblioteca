package br.com.bibliotecabetim.api.dto;

import java.time.LocalDateTime;

public record ReservaResponse(
        Long id,
        Long livroId,
        String livroTitulo,
        Long usuarioId,
        LocalDateTime dataReserva,
        String status,
        Integer posicaoFila
) {
}
