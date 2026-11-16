// Layout - Layout principal da aplicação

import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="page-container">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="main-content" className="main-content" role="main" tabIndex={-1}>
        {children || <Outlet />}
      </main>
      <footer className="footer" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Biblioteca Pública Municipal de Betim &copy; 2024</p>
            <p>
              Projeto de Extensão - CST em Análise e Desenvolvimento de Sistemas - UNINTER
            </p>
          </div>
        </div>
      </footer>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            minHeight: '48px',
            fontSize: '1.125rem',
            lineHeight: '1.7',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default Layout;