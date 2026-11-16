// MinhaConta - Página de perfil do usuário logado

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { emprestimosApi } from '../api/emprestimos';
import { reservasApi } from '../api/reservas';
import type { Emprestimo, Reserva } from '../types/api';

export function MinhaConta() {
  const { state, logout, isAuthenticated } = useAuth();
  const { falar, tema, escalaFonte } = useAccessibility();
  const navigate = useNavigate();
  const [emprestimosAtivos, setEmprestimosAtivos] = useState(0);
  const [totalReservas, setTotalReservas] = useState(0);
  const [loadingDados, setLoadingDados] = useState(true);
  const [erroDados, setErroDados] = useState<string | null>(null);
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

  const handleLogout = () => {
    falar('Logout realizado');
    logout();
    navigate('/');
  };

  // Carregar contadores do morador
  useEffect(() => {
    if (state.papel !== 'MORADOR') {
      setLoadingDados(false);
      return;
    }

    const carregarDados = async () => {
      setLoadingDados(true);
      setErroDados(null);
      try {
        // Busca empréstimos e reservas em paralelo
        const [emprestimos, reservas] = await Promise.all([
          emprestimosApi.listarMeus(),
          reservasApi.listarMinhas(),
        ]);

        // Empréstimos ativos = sem data de devolução real
        const ativos = emprestimos.filter((e: Emprestimo) => !e.dataDevolucaoReal).length;
        setEmprestimosAtivos(ativos);

        // Reservas ativas = status AGUARDANDO ou DISPONIVEL
        const ativas = reservas.filter((r: Reserva) =>
          r.status === 'AGUARDANDO' || r.status === 'DISPONIVEL'
        ).length;
        setTotalReservas(ativas);

        // Notificações não lidas (simplificado - pode ser expandido com API de notificações)
        // Por enquanto, usa o total de reservas disponíveis como proxy
        const disponiveis = reservas.filter((r: Reserva) => r.status === 'DISPONIVEL').length;
        setNotificacoesNaoLidas(disponiveis);
      } catch {
        setErroDados('Não foi possível carregar seus dados agora');
      } finally {
        setLoadingDados(false);
      }
    };

    carregarDados();
  }, [state.papel, state.token]);

  if (!isAuthenticated) {
    return null; // Protegido por RequireAuth
  }

  const papelLabel = state.papel === 'BIBLIOTECARIO' ? 'Bibliotecário' : 'Morador';
  const papelVariant = state.papel === 'BIBLIOTECARIO' ? 'info' : 'success';

  const temaLabel = tema === 'light' ? 'Claro' : tema === 'dark' ? 'Escuro' : 'Alto Contraste';
  const escalaLabel = escalaFonte === 'sm' ? '87.5%' :
    escalaFonte === 'md' ? '100%' :
    escalaFonte === 'lg' ? '112.5%' :
    escalaFonte === 'xl' ? '125%' : '150%';

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Minha Conta
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
          Gerencie seu perfil e preferências
        </p>
      </div>

      <Card variant="elevated">
        <CardBody className="p-6 sm:p-8 space-y-6">
          {/* Avatar e informações principais */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl sm:text-4xl font-bold text-blue-700 dark:text-blue-400">
                {state.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {state.email}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={papelVariant} size="lg">
                  {papelLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contadores (apenas Morador) */}
          {state.papel === 'MORADOR' && (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                {loadingDados ? (
                  <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium">Carregando seus dados...</span>
                  </div>
                ) : erroDados ? (
                  <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">{erroDados}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {emprestimosAtivos === 0 && totalReservas === 0
                          ? 'Nenhum empréstimo ativo ou reserva no momento.'
                          : `Você tem ${emprestimosAtivos} empréstimo${emprestimosAtivos !== 1 ? 's' : ''} ativo${emprestimosAtivos !== 1 ? 's' : ''} e ${totalReservas} reserva${totalReservas !== 1 ? 's' : ''}.`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {emprestimosAtivos > 0 && `${emprestimosAtivos} empréstimo${emprestimosAtivos !== 1 ? 's' : ''} para devolver`}
                        {emprestimosAtivos > 0 && totalReservas > 0 && ' • '}
                        {totalReservas > 0 && `${totalReservas} reserva${totalReservas !== 1 ? 's' : ''} na fila`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Atalhos rápidos para Morador */}
          {state.papel === 'MORADOR' && (
            <div className="space-y-4" role="list" aria-label="Ações rápidas">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Ações rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/minhas-reservas"
                  className="block"
                  role="listitem"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[60px] justify-start gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-base-accessible">Minhas Reservas</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ver fila de espera e status</p>
                    </div>
                    {totalReservas > 0 && (
                      <Badge variant="info" size="sm" className="flex-shrink-0">
                        {totalReservas}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link
                  to="/meus-emprestimos"
                  className="block"
                  role="listitem"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[60px] justify-start gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-base-accessible">Meus Empréstimos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Renovar, devolver, ver multas</p>
                    </div>
                    {emprestimosAtivos > 0 && (
                      <Badge variant="success" size="sm" className="flex-shrink-0">
                        {emprestimosAtivos}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link
                  to="/notificacoes"
                  className="block sm:col-span-2"
                  role="listitem"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[60px] justify-start gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-yellow-700 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-base-accessible">Notificações</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alertas de reservas e devoluções</p>
                    </div>
                    {notificacoesNaoLidas > 0 && (
                      <Badge variant="warning" size="sm" className="flex-shrink-0">
                        {notificacoesNaoLidas} nova{notificacoesNaoLidas !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Acessibilidade - Estado atual */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Precisa de acessibilidade?
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium text-gray-900 dark:text-gray-100">Tema atual:</span> {temaLabel}
              </p>
              <p>
                <span className="font-medium text-gray-900 dark:text-gray-100">Tamanho da fonte:</span> {escalaLabel}
              </p>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
              Use os botões no topo da página para ajustar:
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-xs mx-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Tema
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-xs mx-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                A+
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-xs mx-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                Voz
              </span>
            </p>
          </div>

          {/* Botão Sair */}
          <div className="pt-2">
            <Button
              variant="danger"
              size="lg"
              className="w-full min-h-[48px]"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair da conta
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default MinhaConta;