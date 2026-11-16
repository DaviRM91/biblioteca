package br.com.bibliotecabetim.api.dto;

public record FilaResponse(
        Long livroId,
        String livroTitulo,
        Integer posicaoUsuario,
        Integer totalFila
) {
}
