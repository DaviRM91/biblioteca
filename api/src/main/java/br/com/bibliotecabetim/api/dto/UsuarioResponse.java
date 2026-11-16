package br.com.bibliotecabetim.api.dto;

import br.com.bibliotecabetim.api.model.Papel;

import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        Papel papel,
        Boolean ativo,
        LocalDateTime criadoEm
) {
}
