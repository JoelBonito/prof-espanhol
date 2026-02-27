import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const variantStyles = {
  glass: 'glass-panel p-5',
  premium: 'premium-card p-5',
  solid: 'bg-[var(--color-surface-dark)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-border-subtle)]',
  interactive: 'glass-panel p-5 cursor-pointer transition-all duration-[var(--duration-default)] hover:border-[var(--color-primary-500)] hover:shadow-[var(--shadow-glow-subtle)]',
  default: 'glass-panel p-5',
  highlight: 'bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 rounded-[var(--radius-xl)] p-5',
} as const;

const statusBorderColors = {
  success: 'border-l-4 border-l-[var(--color-success)]',
  warning: 'border-l-4 border-l-[var(--color-warning)]',
  error: 'border-l-4 border-l-[var(--color-error)]',
} as const;

export interface CardProps extends ComponentProps<'div'> {
  variant?: keyof typeof variantStyles;
  status?: keyof typeof statusBorderColors;
}

export function Card({
  variant = 'glass',
  status,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantStyles[variant], status && statusBorderColors[status], className)}
      {...props}
    >
      {children}
    </div>
  );
}
