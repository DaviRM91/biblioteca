// MeusEmprestimos - Página de empréstimos do usuário

import { useState, useEffect, useCallback } from 'react';
import { emprestimosApi } from '../api/emprestimos';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import toast from 'react-hot-toast';
import type { Emprestimo } from '../types/api';


export function MeusEmprestimos() {
  const { isAuthenticated } = useAuth();
  const { falar } = useAccessibility();
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const carregarEmprestimos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await emprestimosApi.listarMeus();
      setEmprestimos(data);
    } catch (err) {
      // Não exibir erro 500 na tela - usar estado vazio amigável
      setError('friendly');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      carregarEmprestimos();
    }
  }, [isAuthenticated, carregarEmprestimos]);

  const handleRenovar = async (emprestimo: Emprestimo) => {
    setActionLoading(emprestimo.id);
    try {
      const renovado = await emprestimosApi.renovar(emprestimo.id);
      falar(`Empréstimo renovado. Nova data de devolução: ${new Date(renovado.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}`);
      toast.success('Empréstimo renovado com sucesso!');
      carregarEmprestimos();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao renovar empréstimo';
      falar(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDevolver = async (emprestimo: Emprestimo) => {
    if (!window.confirm(`Confirmar devolução de "${emprestimo.livro.titulo}"?`)) return;

    setActionLoading(emprestimo.id);
    try {
      await emprestimosApi.devolver(emprestimo.id);
      falar('Devolução realizada com sucesso');
      toast.success('Livro devolvido com sucesso!');
      carregarEmprestimos();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao devolver livro';
      falar(message);
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: Emprestimo['status']) => {
    switch (status) {
      case 'ATIVO': return 'info';
      case 'DEVOLVIDO': return 'success';
      case 'ATRASADO': return 'danger';
      case 'PERDIDO': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: Emprestimo['status']) => {
    switch (status) {
      case 'ATIVO': return 'Em andamento';
      case 'DEVOLVIDO': return 'Devolvido';
      case 'ATRASADO': return 'Atrasado';
      case 'PERDIDO': return 'Perdido';
      default: return status;
    }
  };

  const isAtrasado = (emprestimo: Emprestimo) => {
    return emprestimo.status === 'ATRASADO' ||
      (emprestimo.status === 'ATIVO' && new Date(emprestimo.dataDevolucaoPrevista) < new Date());
  };

  const diasParaDevolucao = (dataPrevista: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prevista = new Date(dataPrevista);
    prevista.setHours(0, 0, 0, 0);
    const diff = prevista.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && emprestimos.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Carregando empréstimos..." />
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
        message="Não foi possível carregar seus empréstimos. Tente novamente mais tarde."
        action={{
          label: 'Tentar novamente',
          onClick: carregarEmprestimos,
          variant: 'primary',
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Meus Empréstimos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
          Acompanhe seus empréstimos ativos e histórico
        </p>
      </div>

      {emprestimos.length > 0 ? (
        <div className="space-y-4" role="list" aria-label="Lista de empréstimos">
          {emprestimos.map(emprestimo => (
            <article
              key={emprestimo.id}
              className={`card-elevated ${isAtrasado(emprestimo) ? 'border-red-300 dark:border-red-700' : ''}`}
              role="listitem"
            >
              <CardBody className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Capa do livro */}
                  <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {emprestimo.livro.capaUrl ? (
                      <img
                        src={emprestimo.livro.capaUrl}
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
                      {emprestimo.livro.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {emprestimo.livro.autor}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={getStatusVariant(emprestimo.status)}>
                        {getStatusLabel(emprestimo.status)}
                      </Badge>
                      {emprestimo.status === 'ATIVO' && (
                        <>
                          {isAtrasado(emprestimo) ? (
                            <Badge variant="danger">
                              Atrasado há {Math.abs(diasParaDevolucao(emprestimo.dataDevolucaoPrevista))} dia(s)
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              {diasParaDevolucao(emprestimo.dataDevolucaoPrevista)} dia(s) para devolver
                            </Badge>
                          )}
                        </>
                      )}
                      {emprestimo.renovacoes > 0 && (
                        <Badge variant="info">
                          {emprestimo.renovacoes}/{emprestimo.maxRenovacoes} renovações
                        </Badge>
                      )}
                      {emprestimo.multa && emprestimo.multa > 0 && (
                        <Badge variant="danger">
                          Multa: R$ {(emprestimo.multa / 100).toFixed(2).replace('.', ',')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:items-end gap-2 sm:flex-row">
                    {emprestimo.status === 'ATIVO' && !isAtrasado(emprestimo) && emprestimo.renovacoes < emprestimo.maxRenovacoes && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRenovar(emprestimo)}
                        disabled={actionLoading === emprestimo.id}
                        isLoading={actionLoading === emprestimo.id}
                      >
                        Renovar
                      </Button>
                    )}
                    {emprestimo.status === 'ATIVO' && (
                      <Button
                        variant={isAtrasado(emprestimo) ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => handleDevolver(emprestimo)}
                        disabled={actionLoading === emprestimo.id}
                        isLoading={actionLoading === emprestimo.id}
                      >
                        Devolver
                      </Button>
                    )}
                    {emprestimo.status !== 'ATIVO' && (
                      <Button variant="ghost" size="sm" disabled>
                        {getStatusLabel(emprestimo.status)}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detalhes do empréstimo */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Emprestado em</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Devolução prevista</p>
                    <p className={`font-medium ${isAtrasado(emprestimo) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {new Date(emprestimo.dataDevolucaoPrevista).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {emprestimo.dataDevolucaoReal && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Devolvido em</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(emprestimo.dataDevolucaoReal).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {emprestimo.multa && emprestimo.multa > 0 && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Multa</p>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        R$ {(emprestimo.multa / 100).toFixed(2).replace('.', ',')}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          title="Nenhum empréstimo encontrado"
          message="Você ainda não fez nenhum empréstimo. Faça uma reserva e retire o livro na biblioteca para começar."
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

export default MeusEmprestimos;