// EmptyState - Componente de estado vazio acessível

import { HTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, message, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`empty-state ${className}`}
        {...props}
      >
        {icon ? (
          <div className="empty-state-icon" aria-hidden="true">
            {icon}
          </div>
        ) : (
          <svg
            className="empty-state-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <h3 className="empty-state-title">{title}</h3>
        {message && <p className="empty-state-message">{message}</p>}
        {action && (
          <Button variant={action.variant || 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {children}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;