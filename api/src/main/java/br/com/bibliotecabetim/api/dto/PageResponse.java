package br.com.bibliotecabetim.api.dto;

public record PageResponse<T>(
        java.util.List<T> content,
        long totalElements,
        int totalPages,
        int number,
        int size
) {
}
