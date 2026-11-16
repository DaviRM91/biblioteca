// Cliente API - Biblioteca Pública Municipal de Betim

import type { ProblemDetail, LoginRequest, RegistroRequest, TokenResponse, StoredAuth } from '../types/api';

const API_BASE = import.meta.env.VITE_API_URL || '';
const AUTH_STORAGE_KEY = 'biblioteca.auth';

// ========================================
// UTILITÁRIOS DE STORAGE
// ========================================

export function getStoredToken(): string | null {
  const auth = getStoredAuth();
  return auth?.token ?? null;
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ========================================
// ERRO PERSONALIZADO
// ========================================

export class ApiError extends Error {
  public readonly status: number;
  public readonly problemDetail?: ProblemDetail;

  constructor(message: string, status: number, problemDetail?: ProblemDetail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problemDetail = problemDetail;
  }
}

// ========================================
// FETCH WRAPPER PRINCIPAL
// ========================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Tratamento de respostas sem corpo (204, etc.)
  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Sucesso
  if (response.ok) {
    return data as T;
  }

  // Erro - parse ProblemDetail
  let problemDetail: ProblemDetail | undefined;
  if (typeof data === 'object' && data !== null && 'type' in data) {
    problemDetail = data as ProblemDetail;
  }

  // Tratamento específico por status
  switch (response.status) {
    case 401:
      // Token expirado ou inválido
      clearAuthStorage();
      // Dispara evento para o AuthContext reagir
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new ApiError(
        problemDetail?.detail || 'Sessão expirada. Faça login novamente.',
        401,
        problemDetail
      );

    case 403:
      throw new ApiError(
        problemDetail?.detail || 'Acesso negado. Você não tem permissão para esta ação.',
        403,
        problemDetail
      );

    case 404:
      throw new ApiError(
        problemDetail?.detail || 'Recurso não encontrado.',
        404,
        problemDetail
      );

    case 400:
      // Erros de validação
      const validationErrors = problemDetail?.errors;
      const message = validationErrors?.length
        ? validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')
        : problemDetail?.detail || 'Dados inválidos.';
      throw new ApiError(message, 400, problemDetail);

    case 409:
      throw new ApiError(
        problemDetail?.detail || 'Conflito: o recurso já existe ou está em estado inválido.',
        409,
        problemDetail
      );

    case 422:
      throw new ApiError(
        problemDetail?.detail || 'Entidade não processável.',
        422,
        problemDetail
      );

    case 500:
      throw new ApiError(
        problemDetail?.detail || 'Erro interno do servidor. Tente novamente mais tarde.',
        500,
        problemDetail
      );

    default:
      throw new ApiError(
        problemDetail?.detail || `Erro HTTP ${response.status}`,
        response.status,
        problemDetail
      );
  }
}

// ========================================
// MÉTODOS HTTP
// ========================================

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};

// ========================================
// AUTENTICAÇÃO
// ========================================

export async function loginApi(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/api/auth/login', credentials);
  const auth: StoredAuth = {
    token: response.token,
    tipo: response.tipo,
    papel: response.papel,
    email: credentials.email,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  return response;
}

export async function registerApi(data: RegistroRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/api/auth/registro', data);
  const auth: StoredAuth = {
    token: response.token,
    tipo: response.tipo,
    papel: response.papel,
    email: data.email,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  return response;
}

export function logoutApi(): void {
  clearAuthStorage();
}

// ========================================
// HEALTH CHECK
// ========================================

export async function healthCheck(): Promise<{ status: string }> {
  return api.get<{ status: string }>('/api/health');
}