// API de Autenticação

import { loginApi, registerApi, logoutApi, getStoredAuth } from './client';
import type { LoginRequest, RegistroRequest, TokenResponse } from '../types/api';

export const authApi = {
  /**
   * Realiza login do usuário
   */
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    return loginApi(credentials);
  },

  /**
   * Registra novo usuário (morador)
   */
  registro: async (data: RegistroRequest): Promise<TokenResponse> => {
    return registerApi(data);
  },

  /**
   * Realiza logout (limpa storage local)
   */
  logout: (): void => {
    logoutApi();
  },

  /**
   * Obtém dados do usuário do localStorage
   */
  getStoredAuth: (): { token: string; tipo: string; papel: string; email: string } | null => {
    return getStoredAuth();
  },
};

export default authApi;