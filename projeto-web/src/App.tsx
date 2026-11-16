// App - Configuração de rotas

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Catalogo } from './pages/Catalogo';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { LivroDetalhe } from './pages/LivroDetalhe';
import { MinhaConta } from './pages/MinhaConta';
import { MinhasReservas } from './pages/MinhasReservas';
import { MeusEmprestimos } from './pages/MeusEmprestimos';
import { Notificacoes } from './pages/Notificacoes';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/livros/:id" element={<LivroDetalhe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rotas protegidas - Layout já está envolvendo tudo, proteção será no nível de página se necessário */}
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/minhas-reservas" element={<MinhasReservas />} />
          <Route path="/meus-emprestimos" element={<MeusEmprestimos />} />
          <Route path="/notificacoes" element={<Notificacoes />} />

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}