// Página de Registro

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useAccessibility } from '../contexts/AccessibilityContext';
import toast from 'react-hot-toast';

export function Registro() {
  const { registro } = useAuth();
  const { falar } = useAccessibility();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: '',
    endereco: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const handleChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    }
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    // Limpa erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      await registro({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.trim() || undefined,
        endereco: formData.endereco.trim() || undefined,
      });
      falar('Cadastro realizado com sucesso');
      toast.success('Conta criada com sucesso! Bem-vindo à Biblioteca.');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setErrors({ general: message });
      falar(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Criar Conta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Cadastre-se para acessar o catálogo e fazer reservas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.general && (
            <div
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <Input
            label="Nome completo"
            type="text"
            autoComplete="name"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            onBlur={() => validateForm()}
            error={errors.nome}
            placeholder="João da Silva"
            required
            disabled={loading}
          />

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => validateForm()}
            error={errors.email}
            placeholder="seu@email.com"
            required
            disabled={loading}
          />

          <Input
            label="CPF"
            type="text"
            value={formData.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            onBlur={() => validateForm()}
            error={errors.cpf}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            disabled={loading}
          />

          <Input
            label="Telefone (opcional)"
            type="tel"
            autoComplete="tel"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            disabled={loading}
          />

          <Input
            label="Endereço (opcional)"
            type="text"
            autoComplete="street-address"
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            placeholder="Rua, número, bairro, cidade"
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={formData.senha}
            onChange={(e) => handleChange('senha', e.target.value)}
            onBlur={() => validateForm()}
            error={errors.senha}
            placeholder="••••••••"
            required
            disabled={loading}
            hint="Mínimo 6 caracteres"
          />

          <Input
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={formData.confirmarSenha}
            onChange={(e) => handleChange('confirmarSenha', e.target.value)}
            onBlur={() => validateForm()}
            error={errors.confirmarSenha}
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
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Registro;