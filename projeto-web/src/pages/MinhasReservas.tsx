// MinhasReservas - Página de reservas do usuário

import { useState, useEffect, useCallback } from 'react';
import { reservasApi } from '../api/reservas';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import toast from 'react-hot-toast';
import type { Reserva } from '../types/api';


export function MinhasReservas() {
  const { isAuthenticated } = useAuth();
  const { falar } = useAccessibility();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const carregarReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservasApi.listarMinhas();
      setReservas(data);
    } catch (err) {
      // Não exibir erro 500 na tela - usar estado vazio amigável
      setError('friendly');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      carregarReservas();
    }
  }, [isAuthenticated, carregarReservas]);

  const handleCancelar = async (reserva: Reserva) => {
    if (!window.confirm(`Tem certeza que deseja cancelar a reserva de "${reserva.livro.titulo}"?`)) return;

    setCancellingId(reserva.id);
    try {
      await reservasApi.cancelar(reserva.id);
      falar('Reserva cancelada com sucesso');
      toast.success('Reserva cancelada');
      carregarReservas();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      falar(message);
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusVariant = (status: Reserva['status']) => {
    switch (status) {
      case 'DISPONIVEL': return 'success';
      case 'AGUARDANDO': return 'warning';
      case 'EXPIRADA': return 'danger';
      case 'CANCELADA': return 'gray';
      case 'CONCLUIDA': return 'info';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: Reserva['status']) => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível para retirada';
      case 'AGUARDANDO': return 'Aguardando na fila';
      case 'EXPIRADA': return 'Expirada';
      case 'CANCELADA': return 'Cancelada';
      case 'CONCLUIDA': return 'Concluída';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return null; // Protegido por RequireAuth
  }

  if (loading && reservas.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Carregando reservas..." />
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
        message="Não foi possível carregar suas reservas. Tente novamente mais tarde."
        action={{
          label: 'Tentar novamente',
          onClick: carregarReservas,
          variant: 'primary',
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Minhas Reservas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
          Acompanhe o status das suas reservas
        </p>
      </div>

      {reservas.length > 0 ? (
        <div className="space-y-4" role="list" aria-label="Lista de reservas">
          {reservas.map(reserva => (
            <article
              key={reserva.id}
              className="card-elevated"
              role="listitem"
            >
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Capa do livro */}
                  <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {reserva.livro.capaUrl ? (
                      <img
                        src={reserva.livro.capaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info do livro */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {reserva.livro.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {reserva.livro.autor}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={getStatusVariant(reserva.status)}>
                        {getStatusLabel(reserva.status)}
                      </Badge>
                      {reserva.status === 'AGUARDANDO' && (
                        <Badge variant="info">
                          Posição: {reserva.posicaoFila}
                        </Badge>
                      )}
                      {reserva.dataExpiracao && (
                        <Badge variant="warning">
                          Expira: {new Date(reserva.dataExpiracao).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:items-end gap-2 sm:flex-row">
                    {reserva.status === 'AGUARDANDO' || reserva.status === 'DISPONIVEL' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelar(reserva)}
                        disabled={cancellingId === reserva.id}
                        isLoading={cancellingId === reserva.id}
                      >
                        Cancelar
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        {reserva.status === 'CONCLUIDA' ? 'Finalizada' : reserva.status}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detalhes da reserva */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reservado em</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(reserva.dataReserva).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {reserva.dataExpiracao && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Disponível até</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(reserva.dataExpiracao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                  {reserva.dataCancelamento && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Cancelado em</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(reserva.dataCancelamento).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          title="Nenhuma reserva encontrada"
          message="Você ainda não fez nenhuma reserva. Explore o catálogo e reserve seus livros favoritos."
          action={{
            label: 'Ir ao catálogo',
            onClick: () => window.location.href = '/',
            variant: 'primary',
          }}
        />
      )}
    </div>
  );
}

export default MinhasReservas;