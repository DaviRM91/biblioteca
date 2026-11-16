// AccessibilityContext - Gerenciamento de acessibilidade global

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Tema = 'light' | 'dark' | 'high-contrast';
type EscalaFonte = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AccessibilityContextType {
  tema: Tema;
  setTema: (tema: Tema) => void;
  escalaFonte: EscalaFonte;
  setEscalaFonte: (escala: EscalaFonte) => void;
  leituraPorVoz: boolean;
  setLeituraPorVoz: (ativo: boolean) => void;
  prefersReducedMotion: boolean;
  falar: (texto: string, opcoes?: { rate?: number; pitch?: number; volume?: number }) => void;
  pararFala: () => void;
  falarElemento: (elemento: HTMLElement) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEYS = {
  tema: 'biblioteca.tema',
  escalaFonte: 'biblioteca.escalaFonte',
  leituraPorVoz: 'biblioteca.leituraPorVoz',
} as const;

const ESCALAS: EscalaFonte[] = ['sm', 'md', 'lg', 'xl', '2xl'];
const ESCALA_PADRAO: EscalaFonte = 'lg'; // 18px base

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>('light');
  const [escalaFonte, setEscalaFonteState] = useState<EscalaFonte>(ESCALA_PADRAO);
  const [leituraPorVoz, setLeituraPorVozState] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [vozSelecionada, setVozSelecionada] = useState<SpeechSynthesisVoice | null>(null);

  // Carrega preferências do localStorage
  useEffect(() => {
    try {
      const storedTema = localStorage.getItem(STORAGE_KEYS.tema) as Tema | null;
      const storedEscala = localStorage.getItem(STORAGE_KEYS.escalaFonte) as EscalaFonte | null;
      const storedLeitura = localStorage.getItem(STORAGE_KEYS.leituraPorVoz);

      if (storedTema && ['light', 'dark', 'high-contrast'].includes(storedTema)) {
        setTemaState(storedTema);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTemaState('dark');
      }

      if (storedEscala && ESCALAS.includes(storedEscala)) {
        setEscalaFonteState(storedEscala);
      }

      if (storedLeitura !== null) {
        setLeituraPorVozState(storedLeitura === 'true');
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de acessibilidade:', error);
    }
  }, []);

  // Detecta prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Aplica tema no document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(tema);
    localStorage.setItem(STORAGE_KEYS.tema, tema);
  }, [tema]);

  // Aplica escala de fonte
  useEffect(() => {
    const root = document.documentElement;
    ESCALAS.forEach(escala => root.classList.remove(`font-scale-${escala}`));
    root.classList.add(`font-scale-${escalaFonte}`);
    localStorage.setItem(STORAGE_KEYS.escalaFonte, escalaFonte);
  }, [escalaFonte]);

  // Carrega vozes disponíveis
  useEffect(() => {
    const carregarVozes = () => {
      const vozes = speechSynthesis.getVoices();
      // Prefere voz em português do Brasil
      const vozPtBR = vozes.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
      const vozPt = vozes.find(v => v.lang.startsWith('pt'));
      setVozSelecionada(vozPtBR || vozPt || vozes[0] || null);
    };

    carregarVozes();
    speechSynthesis.addEventListener('voiceschanged', carregarVozes);
    return () => speechSynthesis.removeEventListener('voiceschanged', carregarVozes);
  }, []);

  const setTema = useCallback((novoTema: Tema) => {
    setTemaState(novoTema);
  }, []);

  const setEscalaFonte = useCallback((novaEscala: EscalaFonte) => {
    setEscalaFonteState(novaEscala);
  }, []);

  const setLeituraPorVoz = useCallback((ativo: boolean) => {
    setLeituraPorVozState(ativo);
    localStorage.setItem(STORAGE_KEYS.leituraPorVoz, String(ativo));
    if (!ativo) {
      speechSynthesis.cancel();
    }
  }, []);

  const falar = useCallback((
    texto: string,
    opcoes: { rate?: number; pitch?: number; volume?: number } = {}
  ) => {
    if (!leituraPorVoz) return;

    // Cancela fala anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = opcoes.rate ?? 0.9;
    utterance.pitch = opcoes.pitch ?? 1;
    utterance.volume = opcoes.volume ?? 1;

    if (vozSelecionada) {
      utterance.voice = vozSelecionada;
    }

    speechSynthesis.speak(utterance);
  }, [leituraPorVoz, vozSelecionada]);

  const pararFala = useCallback(() => {
    speechSynthesis.cancel();
  }, []);

  const falarElemento = useCallback((elemento: HTMLElement) => {
    if (!leituraPorVoz) return;

    // Extrai texto legível do elemento
    const texto = elemento.innerText || elemento.textContent || '';
    if (texto.trim()) {
      falar(texto.trim());
    }
  }, [leituraPorVoz, falar]);

  const value: AccessibilityContextType = {
    tema,
    setTema,
    escalaFonte,
    setEscalaFonte,
    leituraPorVoz,
    setLeituraPorVoz,
    prefersReducedMotion,
    falar,
    pararFala,
    falarElemento,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
}

export default AccessibilityContext;