package br.com.bibliotecabetim.api.dto;

public record TokenResponse(
        String token,
        String tipo,
        String papel
) {
}
