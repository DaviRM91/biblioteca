package br.com.bibliotecabetim.api.dto;

import java.time.LocalDate;
import java.util.List;

public record LivroResponse(
        Long id,
        String titulo,
        String autor,
        String isbn,
        String categoria,
        Integer anoPublicacao,
        String resumo,
        String capaUrl,
        Boolean disponivel
) {
}
