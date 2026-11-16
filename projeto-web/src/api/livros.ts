// API de Livros

import { api } from './client';
import type { Livro, LivroFiltros, PageResponse } from '../types/api';

export const livrosApi = {
  /**
   * Lista livros com paginação e filtros
   * GET /api/livros
   */
  listar: async (filtros: LivroFiltros = {}): Promise<PageResponse<Livro>> => {
    const params = new URLSearchParams();
    if (filtros.q) params.append('q', filtros.q);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.disponivel !== undefined) params.append('disponivel', String(filtros.disponivel));
    if (filtros.page !== undefined) params.append('page', String(filtros.page));
    if (filtros.size !== undefined) params.append('size', String(filtros.size));
    if (filtros.sort) params.append('sort', filtros.sort);

    const query = params.toString();
    return api.get<PageResponse<Livro>>(`/api/livros${query ? `?${query}` : ''}`);
  },

  /**
   * Busca livro por ID
   * GET /api/livros/{id}
   */
  buscarPorId: async (id: number): Promise<Livro> => {
    return api.get<Livro>(`/api/livros/${id}`);
  },
};

export default livrosApi;