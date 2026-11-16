// API de Notificações

import { api } from './client';
import type { Notificacao, NotificacaoFiltros } from '../types/api';

export const notificacoesApi = {
  /**
   * Lista notificações do usuário logado
   * GET /api/me/notificacoes → Notificacao[] (array direto, sem paginação)
   */
  listar: async (filtros: NotificacaoFiltros = {}): Promise<Notificacao[]> => {
    const params = new URLSearchParams();
    if (filtros.lida !== undefined) params.append('lida', String(filtros.lida));
    if (filtros.tipo) params.append('tipo', filtros.tipo);

    const query = params.toString();
    return api.get<Notificacao[]>(`/api/me/notificacoes${query ? `?${query}` : ''}`);
  },

  /**
   * Marca notificação como lida
   * PATCH /api/me/notificacoes/{id}/ler
   */
  marcarComoLida: async (id: number): Promise<Notificacao> => {
    return api.patch<Notificacao>(`/api/me/notificacoes/${id}/ler`, {});
  },

  /**
   * Marca todas as notificações como lidas
   * PATCH /api/me/notificacoes/ler-todas
   */
  marcarTodasComoLidas: async (): Promise<void> => {
    return api.patch<void>('/api/me/notificacoes/ler-todas', {});
  },

  /**
   * Conta notificações não lidas
   * GET /api/me/notificacoes/nao-lidas/count
   */
  contarNaoLidas: async (): Promise<number> => {
    return api.get<number>('/api/me/notificacoes/nao-lidas/count');
  },
};

export default notificacoesApi;