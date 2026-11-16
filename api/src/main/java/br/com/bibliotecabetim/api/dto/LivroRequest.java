package br.com.bibliotecabetim.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criar ou atualizar um livro")
public record LivroRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
        @Schema(description = "Título do livro", example = "Dom Casmurro")
        String titulo,

        @NotBlank(message = "Autor é obrigatório")
        @Size(max = 200, message = "Autor deve ter no máximo 200 caracteres")
        @Schema(description = "Nome do autor", example = "Machado de Assis")
        String autor,

        @Size(max = 20, message = "ISBN deve ter no máximo 20 caracteres")
        @Schema(description = "ISBN do livro", example = "9788573584321")
        String isbn,

        @Size(max = 100, message = "Categoria deve ter no máximo 100 caracteres")
        @Schema(description = "Categoria do livro", example = "Romance")
        String categoria,

        @Schema(description = "Ano de publicação", example = "1897")
        Integer anoPublicacao,

        @Schema(description = "Resumo do livro (texto puro, sem HTML)", example = "Narrativa sobre amor, ciúmes e traição...")
        String resumo,

        @Size(max = 500, message = "URL da capa deve ter no máximo 500 caracteres")
        @Schema(description = "URL da capa do livro", example = "https://exemplo.com/capa.jpg")
        String capaUrl
) {
}
