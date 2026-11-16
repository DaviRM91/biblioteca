// Tipos da API - Biblioteca Pública Municipal de Betim

// ========================================
// AUTENTICAÇÃO
// ========================================

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
}

export interface TokenResponse {
  token: string;
  tipo: string;
  papel: 'BIBLIOTECARIO' | 'MORADOR';
}

// Interface para dados armazenados no localStorage (inclui email do formulário)
export interface StoredAuth {
  token: string;
  tipo: string;
  papel: 'BIBLIOTECARIO' | 'MORADOR';
  email: string;
}

// ========================================
// LIVROS
// ========================================

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  editora?: string;
  anoPublicacao?: number;
  categoria?: string;
  descricao?: string;
  totalExemplares: number;
  exemplaresDisponiveis?: number; // NÃO retornado pela API, apenas no detalhe
  disponivel: boolean; // true se há exemplares disponíveis para empréstimo
  capaUrl?: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface LivroFiltros {
  q?: string;           // busca por título, autor, ISBN
  categoria?: string;
  disponivel?: boolean; // true = apenas com exemplares disponíveis
  page?: number;        // 0-indexed
  size?: number;        // padrão 20, máx 100
  sort?: string;        // ex: "titulo,asc" ou "createdAt,desc"
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ========================================
// RESERVAS
// ========================================

export interface Reserva {
  id: number;
  livro: LivroResumido;
  usuario: UsuarioResumido;
  status: 'AGUARDANDO' | 'DISPONIVEL' | 'EXPIRADA' | 'CANCELADA' | 'CONCLUIDA';
  posicaoFila: number;
  dataReserva: string;     // ISO 8601
  dataExpiracao?: string;  // quando status = DISPONIVEL
  dataCancelamento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LivroResumido {
  id: number;
  titulo: string;
  autor: string;
  capaUrl?: string;
}

export interface FilaReservaResponse {
  livroId: number;
  livroTitulo: string;
  posicaoUsuario?: number; // posição do usuário na fila (null se não estiver)
  totalFila: number;       // total de pessoas na fila
}

export interface CriarReservaRequest {
  livroId: number;
}

// ========================================
// EMPRÉSTIMOS
// ========================================

export interface Emprestimo {
  id: number;
  livro: LivroResumido;
  usuario: UsuarioResumido;
  dataEmprestimo: string;    // ISO 8601
  dataDevolucaoPrevista: string; // ISO 8601
  dataDevolucaoReal?: string;    // ISO 8601
  status: 'ATIVO' | 'DEVOLVIDO' | 'ATRASADO' | 'PERDIDO';
  renovacoes: number;
  maxRenovacoes: number;
  multa?: number;            // em centavos
  createdAt: string;
  updatedAt: string;
}

export interface RenovarEmprestimoRequest {
  emprestimoId: number;
}

export interface DevolverEmprestimoRequest {
  emprestimoId: number;
}

// ========================================
// NOTIFICAÇÕES
// ========================================

export interface Notificacao {
  id: number;
  tipo: 'RESERVA_DISPONIVEL' | 'EMPRESTIMO_VENCENDO' | 'EMPRESTIMO_ATRASADO' | 'RESERVA_EXPIRADA' | 'NOVA_RESERVA' | 'SISTEMA';
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataEnvio: string; // ISO 8601
  link?: string;     // rota relativa, ex: "/minhas-reservas"
  metadata?: Record<string, unknown>;
}

export interface NotificacaoFiltros {
  lida?: boolean;
  tipo?: Notificacao['tipo'];
  page?: number;
  size?: number;
}

// ========================================
// ERROS - ProblemDetail (RFC 7807) do Spring Boot
// ========================================

export interface ProblemDetail {
  type: string;           // URI do tipo do problema
  title: string;          // Título legível
  status: number;         // HTTP status code
  detail: string;         // Detalhe específico da ocorrência
  instance: string;       // URI da ocorrência específica
  timestamp: string;      // ISO 8601
  errors?: FieldError[];  // Erros de validação (400)
}

export interface FieldError {
  field: string;          // Nome do campo
  message: string;        // Mensagem de erro
  rejectedValue?: unknown; // Valor rejeitado (opcional)
}

// ========================================
// UTILITÁRIOS
// ========================================

export type PapelUsuario = 'BIBLIOTECARIO' | 'MORADOR';

export interface ApiError extends Error {
  status: number;
  problemDetail?: ProblemDetail;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.problemDetail?.detail) {
      return error.problemDetail.detail;
    }
    if (error.problemDetail?.errors?.length) {
      return error.problemDetail.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}