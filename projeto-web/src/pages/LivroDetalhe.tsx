// LivroDetalhe - Página de detalhes do livro

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { livrosApi } from '../api/livros';
import { reservasApi } from '../api/reservas';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Card, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { ErrorState } from '../components/ErrorState';
import toast from 'react-hot-toast';
import type { Livro, Reserva } from '../types/api';

export function LivroDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { falar, leituraPorVoz } = useAccessibility();
  const [livro, setLivro] = useState<Livro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservando, setReservando] = useState(false);
  const [minhaReserva, setMinhaReserva] = useState<Reserva | null>(null);
  const [filaInfo, setFilaInfo] = useState<{ totalFila: number; posicaoUsuario?: number } | null>(null);

  const carregarLivro = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await livrosApi.buscarPorId(parseInt(id, 10));
      setLivro(data);

      // Se usuário logado E livro indisponível, verifica fila e reserva
      if (isAuthenticated && !data.disponivel) {
        try {
          const fila = await reservasApi.consultarFila(data.id);
          setFilaInfo({ totalFila: fila.totalFila, posicaoUsuario: fila.posicaoUsuario });
          if (fila.posicaoUsuario && fila.posicaoUsuario > 0) {
            // Busca detalhes da reserva
            const minhasReservas = await reservasApi.listarMinhas();
            const reserva = minhasReservas.find((r: Reserva) => r.livro.id === data.id);
            if (reserva) setMinhaReserva(reserva);
          }
        } catch {
          // Ignora erros de fila
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar livro';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLivro();
  }, [id, isAuthenticated]);

  const handleReservar = async () => {
    if (!id || !isAuthenticated) {
      navigate('/login', { state: { from: `/livros/${id}` } });
      return;
    }

    setReservando(true);
    try {
      const livroId = parseInt(id, 10);
      const reserva = await reservasApi.criar(livroId);
      setMinhaReserva(reserva);
      falar('Reserva realizada com sucesso. Você está na posição ' + reserva.posicaoFila + ' da fila.');
      toast.success(`Reserva realizada! Posição na fila: ${reserva.posicaoFila}`);
      // Atualiza info da fila
      const fila = await reservasApi.consultarFila(livroId);
      setFilaInfo({ totalFila: fila.totalFila, posicaoUsuario: fila.posicaoUsuario });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reservar';
      falar(message);
      toast.error(message);
    } finally {
      setReservando(false);
    }
  };

  const handleCancelarReserva = async () => {
    if (!minhaReserva || !livro) return;
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      await reservasApi.cancelar(livro.id, minhaReserva.id);
      setMinhaReserva(null);
      falar('Reserva cancelada com sucesso');
      toast.success('Reserva cancelada');
      // Atualiza info da fila
      const fila = await reservasApi.consultarFila(livro.id);
      setFilaInfo({ totalFila: fila.totalFila, posicaoUsuario: fila.posicaoUsuario });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      falar(message);
      toast.error(message);
    }
  };

  const anunciarLivro = () => {
    if (!livro || !leituraPorVoz) return;
    const disponivel = livro.disponivel;
    falar(
      `${livro.titulo}, de ${livro.autor}. ` +
      `${disponivel ? 'Disponível para empréstimo.' : 'Indisponível no momento.'} ` +
      (livro.descricao ? livro.descricao.substring(0, 200) : '')
    );
  };

  useEffect(() => {
    if (livro) {
      anunciarLivro();
    }
  }, [livro, leituraPorVoz, falar]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Carregando livro..." />
      </div>
    );
  }

  if (error || !livro) {
    return (
      <ErrorState
        title="Livro não encontrado"
        message={error || 'O livro solicitado não existe ou foi removido.'}
        onRetry={carregarLivro}
        retryLabel="Tentar novamente"
      />
    );
  }

  const disponivel = livro.disponivel;
  const jaReservado = !!minhaReserva;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botão voltar */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao catálogo
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Imagem e info principal */}
        <div className="lg:col-span-1">
          <Card variant="elevated" className="h-full">
            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden">
              <img
                src={livro.capaUrl || ''}
                alt={`Capa de ${livro.titulo}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.classList.add('bg-gray-200', 'dark:bg-gray-700', 'flex', 'items-center', 'justify-center');
                    parent.innerHTML = '<span class="text-gray-500 dark:text-gray-400 text-6xl" aria-hidden="true">📖</span>';
                  }
                }}
              />
              {!disponivel && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="badge badge-danger px-4 py-2 text-lg">
                    Indisponível
                  </span>
                </div>
              )}
            </div>
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={leituraPorVoz ? 'primary' : 'outline'}
                  size="sm"
                  onClick={anunciarLivro}
                  aria-pressed={leituraPorVoz}
                  className="flex-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Ler descrição
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Detalhes */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardBody>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {livro.titulo}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {livro.autor}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {livro.categoria && (
                  <span className="badge badge-info">{livro.categoria}</span>
                )}
                {livro.anoPublicacao && (
                  <span className="badge badge-gray">{livro.anoPublicacao}</span>
                )}
                {livro.isbn && (
                  <span className="badge badge-gray">ISBN: {livro.isbn}</span>
                )}
                {livro.editora && (
                  <span className="badge badge-gray">{livro.editora}</span>
                )}
              </div>

              {/* Status de disponibilidade */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${disponivel ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {disponivel ? 'Disponível para empréstimo' : 'Indisponível no momento'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações de reserva */}
              <div className="space-y-3">
                {jaReservado && minhaReserva && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-400">
                          Você tem uma reserva ativa
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Status: <span className="capitalize">{minhaReserva.status.toLowerCase()}</span>
                          {minhaReserva.posicaoFila > 0 && ` • Posição na fila: ${minhaReserva.posicaoFila}`}
                          {minhaReserva.dataExpiracao && ` • Expira em: ${new Date(minhaReserva.dataExpiracao).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleCancelarReserva}
                      >
                        Cancelar reserva
                      </Button>
                    </div>
                  </div>
                )}

                {!jaReservado && !isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/login', { state: { from: `/livros/${id}` } })}
                  >
                    Faça login para reservar
                  </Button>
                )}

                {!jaReservado && isAuthenticated && disponivel && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Disponível para empréstimo presencial
                  </Button>
                )}

                {!jaReservado && isAuthenticated && !disponivel && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleReservar}
                    disabled={reservando}
                  >
                    {reservando ? 'Reservando...' : 'Reservar'}
                  </Button>
                )}

                {filaInfo && !jaReservado && !disponivel && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {filaInfo.totalFila} pessoa{filaInfo.totalFila !== 1 ? 's' : ''} na fila de espera
                    {filaInfo.posicaoUsuario && ` • Sua posição: ${filaInfo.posicaoUsuario}`}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Descrição */}
          {livro.descricao && (
            <Card variant="elevated">
              <CardBody>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Descrição
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none text-base-accessible">
                  <p className="whitespace-pre-wrap">{livro.descricao}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Informações adicionais */}
          <Card variant="outlined">
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Informações bibliográficas
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base-accessible">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Título</dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.titulo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Autor</dt>
                  <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.autor}</dd>
                </div>
                {livro.isbn && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ISBN</dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.isbn}</dd>
                  </div>
                )}
                {livro.editora && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Editora</dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.editora}</dd>
                  </div>
                )}
                {livro.anoPublicacao && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano</dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.anoPublicacao}</dd>
                  </div>
                )}
                {livro.categoria && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Categoria</dt>
                    <dd className="mt-1 text-gray-900 dark:text-gray-100">{livro.categoria}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LivroDetalhe;