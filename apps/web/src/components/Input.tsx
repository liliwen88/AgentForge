import React from 'react';
import { type BaseComponentProps } from '../types';
import { cn } from '../utils';

interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  leftIcon,
  rightIcon,
  className,
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-4 py-2.5 bg-input text-foreground border border-input-border rounded-lg',
            'placeholder:text-foreground-muted',
            'transition-all duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helperText && !error && (
        <p className="text-sm text-foreground-muted mt-1.5">{helperText}</p>
      )}
      
      {error && (
        <p className="text-sm text-error mt-1.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
