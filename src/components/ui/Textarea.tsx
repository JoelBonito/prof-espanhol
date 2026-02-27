import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, disabled, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const state = disabled
    ? 'bg-[var(--color-glass-bg)] text-text-muted cursor-not-allowed border-[var(--color-border-default)]'
    : error
      ? 'border-error focus:border-error focus:ring-error/50'
      : 'border-[var(--color-border-default)] hover:border-[var(--color-border-active)] focus:border-primary-500 focus:ring-primary-500/50';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'w-full p-4 bg-[var(--color-glass-bg)] border rounded-[10px] text-text-primary placeholder:text-text-muted min-h-[100px] resize-none transition-colors focus:ring-2 focus:outline-none',
          state
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
