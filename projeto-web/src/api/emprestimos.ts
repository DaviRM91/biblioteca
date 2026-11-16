// API de Empréstimos

import { api } from './client';
import type { Emprestimo, PageResponse } from '../types/api';

export const emprestimosApi = {
  /**
   * Lista empréstimos do usuário logado
   * GET /api/me/emprestimos → Emprestimo[]
   */
  listarMeus: async (): Promise<Emprestimo[]> => {
    return api.get<Emprestimo[]>('/api/me/emprestimos');
  },

  /**
   * Renova um empréstimo
   * POST /api/emprestimos/{id}/renovar
   */
  renovar: async (id: number): Promise<Emprestimo> => {
    return api.post<Emprestimo>(`/api/emprestimos/${id}/renovar`, {});
  },

  /**
   * Devolve um empréstimo
   * POST /api/emprestimos/{id}/devolver
   */
  devolver: async (id: number): Promise<Emprestimo> => {
    return api.post<Emprestimo>(`/api/emprestimos/${id}/devolver`, {});
  },

  /**
   * Lista todos os empréstimos (apenas bibliotecário)
   * GET /api/emprestimos
   */
  listarTodos: async (page = 0, size = 20): Promise<PageResponse<Emprestimo>> => {
    return api.get<PageResponse<Emprestimo>>(`/api/emprestimos?page=${page}&size=${size}`);
  },

  /**
   * Busca empréstimo por ID (apenas bibliotecário)
   * GET /api/emprestimos/{id}
   */
  buscarPorId: async (id: number): Promise<Emprestimo> => {
    return api.get<Emprestimo>(`/api/emprestimos/${id}`);
  },
};

export default emprestimosApi;