// Página de Login

import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useAccessibility } from '../contexts/AccessibilityContext';
import toast from 'react-hot-toast';

export function Login() {
  const { login } = useAuth();
  const { falar } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string; general?: string }>({});

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      await login(email, senha);
      falar('Login realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setErrors({ general: message });
      falar(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoSenha: string) => {
    setEmail(demoEmail);
    setSenha(demoSenha);
    setLoading(true);
    setErrors({});
    try {
      await login(demoEmail, demoSenha);
      falar('Login de demonstração realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setErrors({ general: message });
      falar(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrar na Biblioteca</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Acesse sua conta para fazer reservas e ver empréstimos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errors.general && (
            <div
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => validateForm()}
            error={errors.email}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onBlur={() => validateForm()}
            error={errors.senha}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Não tem conta?{' '}
            <Link
              to="/registro"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Registre-se
            </Link>
          </p>
        </div>

        <details className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
            Credenciais de teste (desenvolvimento)
          </summary>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Bibliotecário:</strong> biblio@bibliotecabetim.br / biblio123</p>
            <p><strong>Morador:</strong> maria@email.com.br / morador123</p>
          </div>
        </details>

        {/* Botões de login rápido para desenvolvimento */}
        <div className="mt-6 space-y-2" role="group" aria-label="Login rápido para desenvolvimento">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => handleDemoLogin('biblio@bibliotecabetim.br', 'biblio123')}
            disabled={loading}
          >
            Entrar como Bibliotecário
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => handleDemoLogin('maria@email.com.br', 'morador123')}
            disabled={loading}
          >
            Entrar como Morador
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Login;