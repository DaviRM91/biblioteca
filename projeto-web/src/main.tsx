// main.tsx - Ponto de entrada da aplicação

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import App from './App';
import './index.css';

// Cria a raiz da aplicação React 18
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no HTML');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AccessibilityProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AccessibilityProvider>
  </StrictMode>
);

// Hot Module Replacement para desenvolvimento
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // O App será recarregado automaticamente pelo Vite
  });
}