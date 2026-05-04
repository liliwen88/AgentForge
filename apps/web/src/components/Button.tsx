import React from 'react';
import { type BaseComponentProps } from '../types';
import { cn } from '../utils';
import { Spinner } from './Spinner';

interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className,
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md rounded-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active shadow-sm hover:shadow-md rounded-lg',
    outline: 'border border-input-border bg-transparent text-foreground hover:bg-background-muted hover:border-border-dark rounded-lg',
    ghost: 'bg-transparent text-foreground hover:bg-background-muted rounded-lg',
    destructive: 'bg-error text-error-foreground hover:bg-error/90 active:bg-error/80 shadow-sm hover:shadow-md rounded-lg',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-xs rounded-md',
    md: 'h-10 px-4 py-2 text-sm rounded-lg',
    lg: 'h-12 px-6 py-3 text-base rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};
