// Header - Cabeçalho acessível com navegação e controles de acessibilidade

import { useState, Fragment } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Button } from './Button';

export function Header() {
  const { state, isAuthenticated, logout, hasRole } = useAuth();
  const { tema, setTema, escalaFonte, setEscalaFonte, leituraPorVoz, setLeituraPorVoz } = useAccessibility();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isBibliotecario = hasRole('BIBLIOTECARIO');

  // Classes de botão reutilizáveis para Links que precisam parecer botões
  const buttonPrimary = 'inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-blue-600 text-white font-bold text-base-accessible hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 border-2 border-transparent';
  const buttonSecondary = 'inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-gray-100 text-gray-900 font-bold text-base-accessible hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
  const buttonOutline = 'inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-transparent text-blue-600 font-bold text-base-accessible hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 border-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20';

  return (
    <header className="header" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Título */}
          <Link
            to="/"
            className="flex items-center gap-3 text-blue-600 dark:text-blue-400 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-lg px-2 py-1"
            aria-label="Biblioteca Pública Municipal de Betim - Página inicial"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            </svg>
            <span className="font-bold text-xl text-base-accessible hidden sm:block">
              Biblioteca Betim
            </span>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Navegação principal">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                }`
              }
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              Catálogo
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/minhas-reservas"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    }`
                  }
                >
                  Minhas Reservas
                </NavLink>
                <NavLink
                  to="/meus-emprestimos"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    }`
                  }
                >
                  Meus Empréstimos
                </NavLink>
                <NavLink
                  to="/notificacoes"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    }`
                  }
                >
                  Notificações
                </NavLink>
              </>
            )}

            {isBibliotecario && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                  }`
                }
              >
                Administração
              </NavLink>
            )}
          </nav>

          {/* Ações à direita */}
          <div className="flex items-center gap-2">
            {/* Controles de Acessibilidade */}
            <div className="hidden sm:flex items-center gap-2" role="group" aria-label="Configurações de acessibilidade">
              {/* Tema */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const temas: ('light' | 'dark' | 'high-contrast')[] = ['light', 'dark', 'high-contrast'];
                    const idx = temas.indexOf(tema);
                    setTema(temas[(idx + 1) % temas.length]);
                  }}
                  aria-label={`Tema atual: ${tema === 'light' ? 'Claro' : tema === 'dark' ? 'Escuro' : 'Alto contraste'}. Clique para alternar.`}
                  title={`Tema: ${tema === 'light' ? 'Claro' : tema === 'dark' ? 'Escuro' : 'Alto contraste'}`}
                >
                  {tema === 'light' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  {tema === 'dark' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                  {tema === 'high-contrast' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </Button>
              </div>

              {/* Escala de fonte */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const escalas = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
                    const idx = escalas.indexOf(escalaFonte);
                    setEscalaFonte(escalas[(idx + 1) % escalas.length]);
                  }}
                  aria-label={`Tamanho da fonte: ${escalaFonte}. Clique para aumentar.`}
                  title={`Fonte: ${escalaFonte}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </Button>
              </div>

              {/* Leitura por voz */}
              <Button
                variant={leituraPorVoz ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setLeituraPorVoz(!leituraPorVoz)}
                aria-pressed={leituraPorVoz}
                aria-label={leituraPorVoz ? 'Leitura por voz ativada. Clique para desativar.' : 'Leitura por voz desativada. Clique para ativar.'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </Button>
            </div>

            {/* Menu do usuário / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label={`Menu do usuário ${state.email}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-700 dark:text-blue-400 font-medium text-sm">
                        {state.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-gray-700 dark:text-gray-300 font-medium">
                      {state.email}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </Button>

                {dropdownOpen && (
                  <Fragment>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="dropdown-menu" role="menu">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{state.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{state.papel?.toLowerCase()}</p>
                      </div>
                      <Link
                        to="/minha-conta"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Minha Conta
                      </Link>
                      <Link
                        to="/minhas-reservas"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Minhas Reservas
                      </Link>
                      <Link
                        to="/meus-emprestimos"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Meus Empréstimos
                      </Link>
                      <Link
                        to="/notificacoes"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Notificações
                      </Link>
                      {isBibliotecario && (
                        <Link
                          to="/admin"
                          className="dropdown-item"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Administração
                        </Link>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="dropdown-item text-red-600 dark:text-red-400"
                        role="menuitem"
                      >
                        Sair
                      </button>
                    </div>
                  </Fragment>
                )}
              </div>
            ) : (
              // DESLOGADO - Desktop: botões Entrar e Cadastrar como Links estilizados
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={buttonPrimary}
                  role="button"
                  aria-label="Entrar na conta"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  className={buttonSecondary}
                  role="button"
                  aria-label="Criar nova conta"
                >
                  Cadastrar
                </Link>
              </div>
            )}

            {/* Menu Mobile (Hambúrguer) */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up" role="navigation" aria-label="Menu mobile">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                className="px-4 py-3 text-base-accessible font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/minha-conta"
                    className="px-4 py-3 text-base-accessible font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Minha Conta
                  </NavLink>
                  <NavLink
                    to="/minhas-reservas"
                    className="px-4 py-3 text-base-accessible font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Minhas Reservas
                  </NavLink>
                  <NavLink
                    to="/meus-emprestimos"
                    className="px-4 py-3 text-base-accessible font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meus Empréstimos
                  </NavLink>
                  <NavLink
                    to="/notificacoes"
                    className="px-4 py-3 text-base-accessible font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Notificações
                  </NavLink>
                </>
              )}
              {isBibliotecario && (
                <NavLink
                  to="/admin"
                  className="px-4 py-3 text-base-accessible font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Administração
                </NavLink>
              )}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonPrimary}
                    role="button"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/registro"
                    onClick={() => setMobileMenuOpen(false)}
                    className={buttonSecondary}
                    role="button"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-4 py-3 text-base-accessible font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left min-h-[48px]"
                >
                  Sair
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;