import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface SelectProps extends ComponentProps<'select'> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, disabled, id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const state = disabled
    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200'
    : error
      ? 'border-error focus:border-error focus:ring-error/50'
      : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-500/50';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'h-14 w-full px-4 pr-10 bg-white border rounded-[10px] text-neutral-900 appearance-none transition-colors focus:ring-2 focus:outline-none',
            state
          )}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="expand_more"
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
