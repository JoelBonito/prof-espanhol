import { type ComponentProps, useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

const baseStyles =
  'h-14 w-full px-4 bg-[var(--color-glass-bg)] backdrop-blur-[20px] border rounded-[var(--radius-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-[var(--duration-default)] focus:outline-none';

const stateStyles = {
  default: 'border-[var(--color-border-default)] hover:border-[var(--color-border-active)] focus:border-[var(--color-primary-500)] focus:shadow-[var(--shadow-glow-subtle)]',
  error: 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  disabled: 'bg-[var(--color-surface-dark)] text-[var(--color-text-disabled)] cursor-not-allowed border-[var(--color-border-subtle)]',
};

export function Input({ label, error, className, disabled, id, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const state = disabled ? 'disabled' : error ? 'error' : 'default';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(baseStyles, stateStyles[state], isPassword && 'pr-12')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-[var(--duration-fast)]"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
