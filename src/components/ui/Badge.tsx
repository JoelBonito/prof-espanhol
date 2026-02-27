import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

const variantStyles = {
  default:
    'bg-[var(--color-glass-bg)] backdrop-blur-[20px] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-medium text-xs rounded-full px-3 py-1',
  success:
    'bg-[var(--color-success-light)] text-[var(--color-success)] font-medium text-xs rounded-full px-3 py-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  warning:
    'bg-[var(--color-warning-light)] text-[var(--color-warning)] font-medium text-xs rounded-full px-3 py-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
  error:
    'bg-[var(--color-error-light)] text-[var(--color-error)] font-medium text-xs rounded-full px-3 py-1 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  primary: 'glow-badge',
  info:
    'bg-[var(--color-info-light)] text-[var(--color-info)] font-medium text-xs rounded-full px-3 py-1 shadow-[0_0_8px_rgba(59,130,246,0.3)]',
  pending:
    'bg-[var(--color-warning-light)] text-[var(--color-warning)] font-medium text-xs rounded-full px-3 py-1',
  completed:
    'bg-[var(--color-success-light)] text-[var(--color-success)] font-medium text-xs rounded-full px-3 py-1',
  overdue:
    'bg-[var(--color-error-light)] text-[var(--color-error)] font-medium text-xs rounded-full px-3 py-1',
  streak:
    'bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 rounded-[var(--radius-default)] px-3 py-1.5 text-sm font-bold text-[var(--color-primary-500)] inline-flex items-center gap-1.5',
  level:
    'glass-panel border-success/20 text-success font-bold text-lg md:text-xl font-display px-4 py-2 inline-flex items-center gap-2 shadow-sm',
} as const;

export interface BadgeProps {
  variant: keyof typeof variantStyles;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(variantStyles[variant], className)}>
      {variant === 'streak' && <Icon name="local_fire_department" size={20} fill />}
      {children}
    </span>
  );
}
