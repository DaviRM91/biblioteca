// Notificacoes - Página de notificações do usuário

import { useState, useEffect, useCallback } from 'react';
import { notificacoesApi } from '../api/notificacoes';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import toast from 'react-hot-toast';
import type { Notificacao } from '../types/api';

export function Notificacoes() {
  const { isAuthenticated } = useAuth();
  const { falar } = useAccessibility();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroLida, setFiltroLida] = useState<boolean | undefined>(undefined);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [marcandoId, setMarcandoId] = useState<number | null>(null);

  const carregarNotificacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificacoesApi.listar({ lida: filtroLida });
      setNotificacoes(response);
    } catch (err) {
      // Não exibir erro 500 na tela - usar estado vazio amigável
      setError('friendly');
    } finally {
      setLoading(false);
    }
  }, [filtroLida]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarNotificacoes();
    }
  }, [isAuthenticated, carregarNotificacoes]);

  const handleMarcarComoLida = async (notificacao: Notificacao) => {
    if (notificacao.lida) return;

    setMarcandoId(notificacao.id);
    try {
      const atualizada = await notificacoesApi.marcarComoLida(notificacao.id);
      setNotificacoes(prev =>
        prev.map(n => (n.id === notificacao.id ? atualizada : n))
      );
      falar('Notificação marcada como lida');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar como lida';
      falar(message);
      toast.error(message);
    } finally {
      setMarcandoId(null);
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    if (naoLidas.length === 0) return;

    setMarcandoTodas(true);
    try {
      await notificacoesApi.marcarTodasComoLidas();
      falar(`${naoLidas.length} notificações marcadas como lidas`);
      toast.success('Todas as notificações marcadas como lidas');
      carregarNotificacoes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar todas como lidas';
      falar(message);
      toast.error(message);
    } finally {
      setMarcandoTodas(false);
    }
  };

  const getTipoIcon = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'RESERVA_DISPONIVEL':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'EMPRESTIMO_VENCENDO':
        return (
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'EMPRESTIMO_ATRASADO':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'RESERVA_EXPIRADA':
        return (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'NOVA_RESERVA':
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTipoLabel = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'RESERVA_DISPONIVEL': return 'Reserva disponível';
      case 'EMPRESTIMO_VENCENDO': return 'Empréstimo vencendo';
      case 'EMPRESTIMO_ATRASADO': return 'Empréstimo atrasado';
      case 'RESERVA_EXPIRADA': return 'Reserva expirada';
      case 'NOVA_RESERVA': return 'Nova reserva';
      case 'SISTEMA': return 'Sistema';
      default: return tipo;
    }
  };

  const getTipoVariant = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'RESERVA_DISPONIVEL': return 'success';
      case 'EMPRESTIMO_VENCENDO': return 'warning';
      case 'EMPRESTIMO_ATRASADO': return 'danger';
      case 'RESERVA_EXPIRADA': return 'gray';
      case 'NOVA_RESERVA': return 'info';
      default: return 'gray';
    }
  };

  const naoLidasCount = notificacoes.filter(n => !n.lida).length;

  if (!isAuthenticated) {
    return null;
  }

  if (loading && notificacoes.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Carregando notificações..." />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        title="Não foi possível carregar"
        message="Não foi possível carregar suas notificações agora. Tente novamente mais tarde."
        action={{
          label: 'Tentar novamente',
          onClick: carregarNotificacoes,
          variant: 'primary',
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Notificações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
            {naoLidasCount > 0
              ? `Você tem ${naoLidasCount} notificação${naoLidasCount !== 1 ? 'ões' : ''} não lida${naoLidasCount !== 1 ? 's' : ''}`
              : 'Todas as notificações estão em dia'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filtroLida !== undefined ? String(filtroLida) : ''}
            onChange={(e) => setFiltroLida(e.target.value === '' ? undefined : e.target.value === 'true')}
            className="form-input w-auto"
            aria-label="Filtrar por status de leitura"
          >
            <option value="">Todas</option>
            <option value="false">Não lidas</option>
            <option value="true">Lidas</option>
          </select>
          {naoLidasCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarcarTodasComoLidas}
              disabled={marcandoTodas}
              isLoading={marcandoTodas}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {notificacoes.length > 0 ? (
        <div className="space-y-3" role="list" aria-label="Lista de notificações">
          {notificacoes.map(notificacao => (
            <article
              key={notificacao.id}
              className={`card ${!notificacao.lida ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              role="listitem"
            >
              <div className="p-4 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    {getTipoIcon(notificacao.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {notificacao.titulo}
                          </h3>
                          <Badge variant={getTipoVariant(notificacao.tipo)}>
                            {getTipoLabel(notificacao.tipo)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
                          {notificacao.mensagem}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(notificacao.dataEnvio).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notificacao.lida && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarcarComoLida(notificacao)}
                            disabled={marcandoId === notificacao.id}
                            isLoading={marcandoId === notificacao.id}
                          >
                            Marcar como lida
                          </Button>
                        )}
                        {notificacao.lida && (
                          <Badge variant="success" className="text-xs">
                            Lida
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          title="Nenhuma notificação"
          message={filtroLida === false
            ? 'Parabéns! Você não tem notificações não lidas.'
            : 'Você ainda não recebeu nenhuma notificação.'}
        />
      )}
    </div>
  );
}

export default Notificacoes;