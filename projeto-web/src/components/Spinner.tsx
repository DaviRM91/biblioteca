// Spinner - Componente de carregamento acessível

import { HTMLAttributes, forwardRef } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', label = 'Carregando...', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-6 h-6 border-3',
      lg: 'w-8 h-8 border-4',
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
        {...props}
      >
        <svg
          className={`animate-spin ${sizeClasses[size]} border-gray-200 border-t-blue-600 rounded-full`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// SpinnerFullScreen - Para carregamento de página inteira
interface SpinnerFullScreenProps {
  label?: string;
  size?: 'md' | 'lg';
}

export function SpinnerFullScreen({ label = 'Carregando...', size = 'lg' }: SpinnerFullScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
        <Spinner size={size} label={label} />
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-base-accessible">{label}</p>
      </div>
    </div>
  );
}

export default Spinner;