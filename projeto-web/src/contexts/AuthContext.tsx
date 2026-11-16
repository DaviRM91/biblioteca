// AuthContext - Gerenciamento de autenticação global

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loginApi, registerApi, logoutApi, getStoredAuth } from '../api/client';
import type { StoredAuth } from '../types/api';

interface AuthState {
  token: string | null;
  papel: 'BIBLIOTECARIO' | 'MORADOR' | null;
  email: string | null;
}

interface AuthContextType {
  state: AuthState;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registro: (data: { nome: string; email: string; senha: string; cpf: string; telefone?: string; endereco?: string }) => Promise<void>;
  logout: () => void;
  hasRole: (role: 'BIBLIOTECARIO' | 'MORADOR' | ('BIBLIOTECARIO' | 'MORADOR')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    papel: null,
    email: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carrega auth do localStorage na inicialização
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = getStoredAuth();
        if (stored && stored.token) {
          setState({
            token: stored.token,
            papel: stored.papel,
            email: stored.email,
          });
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        localStorage.removeItem('biblioteca.auth');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Escuta evento de logout forçado (401)
    const handleUnauthorized = () => {
      localStorage.removeItem('biblioteca.auth');
      setState({ token: null, papel: null, email: null });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi({ email, senha });
      // loginApi já salva no localStorage com email
      const stored = getStoredAuth();
      if (stored) {
        setState({
          token: stored.token,
          papel: stored.papel,
          email: stored.email,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registro = useCallback(async (data: { nome: string; email: string; senha: string; cpf: string; telefone?: string; endereco?: string }) => {
    setIsLoading(true);
    try {
      const response = await registerApi(data);
      // registerApi já salva no localStorage com email
      const stored = getStoredAuth();
      if (stored) {
        setState({
          token: stored.token,
          papel: stored.papel,
          email: stored.email,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setState({ token: null, papel: null, email: null });
  }, []);

  const hasRole = useCallback((role: 'BIBLIOTECARIO' | 'MORADOR' | ('BIBLIOTECARIO' | 'MORADOR')[]) => {
    if (!state.papel) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(state.papel);
  }, [state.papel]);

  const value: AuthContextType = {
    state,
    isAuthenticated: !!state.token,
    isLoading,
    login,
    registro,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;