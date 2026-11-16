package br.com.bibliotecabetim.api.dto;

import java.time.LocalDate;

public record EmprestimoResponse(
        Long id,
        Long exemplarId,
        Long livroId,
        String codigoTombamento,
        Long usuarioId,
        String usuarioNome,
        LocalDate dataEmprestimo,
        LocalDate dataPrevistaDevolucao,
        LocalDate dataDevolucao,
        Integer renovacoes
) {
}
