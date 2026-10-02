import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'signal' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-x-[1px] active:translate-y-[1px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-ink text-paper border hairline hover:bg-paper hover:text-ink shadow-hard hover:shadow-hard-lg',
    secondary:
      'bg-transparent text-ink border hairline hover:bg-bone shadow-sm',
    signal:
      'bg-signal text-paper border border-ink hover:bg-ink hover:text-signal shadow-hard hover:shadow-hard-lg font-bold',
    destructive:
      'bg-transparent text-status-failed border border-status-failed hover:bg-status-failed hover:text-paper shadow-sm',
    ghost:
      'bg-transparent text-ink hover:bg-bone/60 border-none shadow-none',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
