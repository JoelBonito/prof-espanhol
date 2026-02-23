import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'bg-white border border-neutral-100 rounded-[10px] shadow-card p-5',
  elevated: 'bg-white rounded-xl shadow-elevated p-6',
  highlight: 'bg-primary-50 border border-primary-500/10 rounded-[10px] p-5',
  dark: 'bg-chat-surface rounded-[10px] p-4 text-chat-text',
  interactive:
    'bg-white border border-neutral-100 rounded-[10px] shadow-card p-5 hover:shadow-elevated hover:border-neutral-200 transition-all cursor-pointer',
} as const;

const statusBorderColors = {
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  error: 'border-l-4 border-l-error',
} as const;

export interface CardProps extends ComponentProps<'div'> {
  variant?: keyof typeof variantStyles;
  status?: keyof typeof statusBorderColors;
}

export function Card({
  variant = 'default',
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
