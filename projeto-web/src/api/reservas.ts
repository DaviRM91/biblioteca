// API de Reservas

import { api } from './client';
import type { Reserva, FilaReservaResponse, CriarReservaRequest, PageResponse } from '../types/api';

export const reservasApi = {
  /**
   * Lista reservas do usuário logado
   * GET /api/me/reservas → Reserva[]
   */
  listarMinhas: async (): Promise<Reserva[]> => {
    return api.get<Reserva[]>('/api/me/reservas');
  },

  /**
   * Cria uma nova reserva
   * POST /api/livros/{livroId}/reservas
   */
  criar: async (livroId: number): Promise<Reserva> => {
    return api.post<Reserva>(`/api/livros/${livroId}/reservas`, {});
  },

  /**
   * Cancela uma reserva
   * DELETE /api/livros/{livroId}/reservas/{id}
   */
  cancelar: async (livroId: number, id: number): Promise<void> => {
    return api.delete<void>(`/api/livros/${livroId}/reservas/${id}`);
  },

  /**
   * Consulta fila de espera de um livro
   * GET /api/livros/{livroId}/reservas/fila
   */
  consultarFila: async (livroId: number): Promise<FilaReservaResponse> => {
    return api.get<FilaReservaResponse>(`/api/livros/${livroId}/reservas/fila`);
  },

  /**
   * Lista todas as reservas (apenas bibliotecário)
   * GET /api/reservas
   */
  listarTodas: async (page = 0, size = 20): Promise<PageResponse<Reserva>> => {
    return api.get<PageResponse<Reserva>>(`/api/reservas?page=${page}&size=${size}`);
  },
};

export default reservasApi;