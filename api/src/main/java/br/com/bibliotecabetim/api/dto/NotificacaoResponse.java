package br.com.bibliotecabetim.api.dto;

import java.time.LocalDateTime;

public record NotificacaoResponse(
        Long id,
        String tipo,
        String mensagem,
        LocalDateTime enviadaEm,
        Boolean lida,
        String canal
) {
}
