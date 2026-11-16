// Button - Componente de botão acessível

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg ' +
      'transition-all duration-150 touch-target ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 ' +
        'focus-visible:ring-blue-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 ' +
        'border-2 border-transparent',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 ' +
        'focus-visible:ring-gray-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 ' +
        'border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      outline:
        'bg-transparent text-blue-600 hover:bg-blue-50 ' +
        'focus-visible:ring-blue-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 ' +
        'border-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20',
      danger:
        'bg-red-600 text-white hover:bg-red-700 ' +
        'focus-visible:ring-red-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 ' +
        'border-2 border-transparent',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 ' +
        'focus-visible:ring-gray-500 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900 ' +
        'border-2 border-transparent dark:text-gray-300 dark:hover:bg-gray-800',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-3',
      lg: 'px-6 py-4 text-lg',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;