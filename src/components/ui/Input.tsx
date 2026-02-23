import { type ComponentProps, useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

const baseStyles =
  'h-14 w-full px-4 bg-white border rounded-[10px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:ring-2 focus:outline-none';

const stateStyles = {
  default: 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-500/50',
  error: 'border-error focus:border-error focus:ring-error/50',
  disabled: 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200',
};

export function Input({ label, error, className, disabled, id, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const state = disabled ? 'disabled' : error ? 'error' : 'default';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
