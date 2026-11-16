// ErrorState - Componente de estado de erro acessível

import { HTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title = 'Oops! Algo deu errado', message, onRetry, retryLabel = 'Tentar novamente', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`error-state ${className}`}
        role="alert"
        {...props}
      >
        <div className="error-state-icon" aria-hidden="true">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-16 h-16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="error-state-title">{title}</h3>
        <p className="error-state-message">{message}</p>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

export default ErrorState;