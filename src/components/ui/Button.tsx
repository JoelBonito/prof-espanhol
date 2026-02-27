import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const variantStyles = {
  primary:
    'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-[var(--shadow-glow-orange)] hover:shadow-[var(--shadow-glow-orange),var(--shadow-elevated)] active:scale-95',
  secondary:
    'bg-[var(--color-glass-bg)] backdrop-blur-[20px] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] hover:shadow-[var(--shadow-glow-subtle)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-bg)] hover:backdrop-blur-[20px]',
  outline:
    'border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white hover:border-[var(--color-primary-500)]',
} as const;

const sizeStyles = {
  sm: 'h-8 px-3 py-1.5 text-sm',
  default: 'h-10 px-6 py-2.5 text-sm font-semibold',
  lg: 'h-[52px] px-8 py-4 text-lg font-bold',
} as const;

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-[var(--duration-default)] select-none min-h-[44px] min-w-[44px] rounded-[var(--radius-default)]';

  const appearance = disabled && !isLoading
    ? 'bg-[var(--color-text-disabled)] text-[var(--color-text-muted)] cursor-not-allowed'
    : variantStyles[variant];

  return (
    <button
      className={cn(base, sizeStyles[size], appearance, isLoading && 'opacity-75', className)}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
