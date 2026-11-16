// Catálogo - Página principal com lista de livros

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { livrosApi } from '../api/livros';
import { Card, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useAccessibility } from '../contexts/AccessibilityContext';
import type { Livro, LivroFiltros, PageResponse } from '../types/api';

export function Catalogo() {
  const { falar, leituraPorVoz } = useAccessibility();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<LivroFiltros>({
    page: 0,
    size: 12,
    sort: 'titulo,asc',
  });
  const [pagination, setPagination] = useState<PageResponse<Livro> | null>(null);

  // Derivar categorias dos livros carregados
  const categorias: string[] = Array.from(
    new Set(livros.map(l => l.categoria).filter((c): c is string => typeof c === 'string' && c.length > 0))
  ).sort();

  const carregarLivros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await livrosApi.listar(filtros);
      setLivros(response.content);
      setPagination(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar catálogo';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarLivros();
  }, [carregarLivros]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltros(prev => ({ ...prev, page: 0 }));
  };

  const handleFiltroChange = (key: keyof LivroFiltros, value: string | boolean | number) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (novaPagina: number) => {
    setFiltros(prev => ({ ...prev, page: novaPagina }));
    // Scroll suave para o topo
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const anunciarResultados = () => {
    if (leituraPorVoz && pagination) {
      const total = pagination.totalElements;
      const mostrando = livros.length;
      const pagina = pagination.page + 1;
      const totalPaginas = pagination.totalPages;
      falar(`${mostrando} de ${total} livros encontrados. Página ${pagina} de ${totalPaginas}.`);
    }
  };

  useEffect(() => {
    anunciarResultados();
  }, [livros, pagination, leituraPorVoz, falar]);

  if (loading && livros.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Carregando catálogo..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={carregarLivros}
        retryLabel="Tentar novamente"
      />
    );
  }

  return (
    <div>
      {/* Header da página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Catálogo de Livros
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-base-accessible">
          Explore nossa coleção e faça reservas
        </p>
      </div>

      {/* Filtros e Busca */}
      <Card variant="outlined" className="mb-6">
        <CardBody>
          <form onSubmit={handleBusca} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="md:flex-1">
              <Input
                label="Buscar"
                type="search"
                placeholder="Título, autor ou ISBN..."
                value={filtros.q || ''}
                onChange={(e) => handleFiltroChange('q', e.target.value)}
                hint="Digite para buscar por título, autor ou ISBN"
              />
            </div>

            <div className="md:w-48">
              <Select
                label="Categoria"
                options={[
                  { value: '', label: 'Todas as categorias' },
                  ...categorias.map(c => ({ value: c, label: c })),
                ]}
                value={filtros.categoria || ''}
                onChange={(e) => handleFiltroChange('categoria', e.target.value ?? '')}
                placeholder="Todas"
              />
            </div>

            <div className="md:w-40">
              <Select
                label="Disponibilidade"
                options={[
                  { value: '', label: 'Todas' },
                  { value: 'true', label: 'Disponíveis' },
                  { value: 'false', label: 'Indisponíveis' },
                ]}
                value={String(filtros.disponivel ?? false)}
                onChange={(e) => handleFiltroChange('disponivel', e.target.value === '' ? false : e.target.value === 'true')}
                placeholder="Todas"
              />
            </div>

            <div className="md:w-40">
              <Select
                label="Ordenar"
                options={[
                  { value: 'titulo,asc', label: 'Título (A-Z)' },
                  { value: 'titulo,desc', label: 'Título (Z-A)' },
                  { value: 'autor,asc', label: 'Autor (A-Z)' },
                  { value: 'anoPublicacao,desc', label: 'Ano (mais recentes)' },
                  { value: 'anoPublicacao,asc', label: 'Ano (mais antigos)' },
                ]}
                value={filtros.sort || 'titulo,asc'}
                onChange={(e) => handleFiltroChange('sort', e.target.value)}
              />
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Resultados */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {pagination
            ? `Mostrando ${livros.length} de ${pagination.totalElements} livro${pagination.totalElements !== 1 ? 's' : ''}`
            : 'Carregando...'
          }
        </p>
      </div>

      {/* Grid de Livros */}
      {livros.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            role="list"
            aria-label="Lista de livros"
          >
            {livros.map(livro => (
              <article key={livro.id} className="card-elevated flex flex-col h-full" role="listitem">
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={livro.capaUrl || ''}
                    alt={`Capa de ${livro.titulo}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.classList.add('bg-gray-200', 'dark:bg-gray-700', 'flex', 'items-center', 'justify-center');
                        parent.innerHTML = '<span class="text-gray-500 dark:text-gray-400 text-4xl" aria-hidden="true">📖</span>';
                      }
                    }}
                  />
                  {!livro.disponivel && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="badge badge-danger px-3 py-1 text-sm">
                        Indisponível
                      </span>
                    </div>
                  )}
                </div>
                <CardBody className="flex-1 flex flex-col p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate-2 mb-1">
                    {livro.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                    {livro.autor}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{livro.categoria || 'Sem categoria'}</span>
                    {livro.anoPublicacao && <span>{livro.anoPublicacao}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`badge ${livro.disponivel ? 'badge-success' : 'badge-danger'} flex-1 text-center`}>
                      {livro.disponivel ? 'Disponível para empréstimo' : 'Todos os exemplares emprestados'}
                    </span>
                  </div>
                  <Link
                    to={`/livros/${livro.id}`}
                    className="mt-3 block text-center"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Ver detalhes
                    </Button>
                  </Link>
                </CardBody>
              </article>
            ))}
          </div>

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginação">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={pagination.first}
                aria-label="Primeira página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.first}
                aria-label="Página anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              <div className="flex items-center gap-1" role="group" aria-label="Páginas">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i;
                  } else if (pagination.page <= 2) {
                    pageNum = i;
                  } else if (pagination.page >= pagination.totalPages - 3) {
                    pageNum = pagination.totalPages - 5 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Página ${pageNum + 1}`}
                      aria-current={pagination.page === pageNum ? 'page' : undefined}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.last}
                aria-label="Próxima página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages - 1)}
                disabled={pagination.last}
                aria-label="Última página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
                </svg>
              </Button>
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Nenhum livro encontrado"
          message={filtros.q || filtros.categoria
            ? 'Tente ajustar seus filtros ou busca para encontrar mais resultados.'
            : 'Ainda não há livros cadastrados no catálogo.'}
          action={filtros.q || filtros.categoria ? {
            label: 'Limpar filtros',
            onClick: () => setFiltros({ page: 0, size: 12, sort: 'titulo,asc' }),
            variant: 'outline',
          } : undefined}
        />
      )}
    </div>
  );
}

export default Catalogo;