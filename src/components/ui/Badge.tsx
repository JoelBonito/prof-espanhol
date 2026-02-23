import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

const variantStyles = {
  streak:
    'bg-primary-50 border border-primary-500/10 rounded-[10px] px-3 py-1.5 text-sm font-bold text-primary-500 inline-flex items-center gap-1.5',
  level:
    'bg-success/10 text-success font-bold text-4xl font-display rounded-xl px-6 py-4 inline-block',
  pending:
    'bg-warning-light text-warning font-medium text-xs rounded-full px-3 py-1 inline-block',
  completed:
    'bg-success-light text-success font-medium text-xs rounded-full px-3 py-1 inline-block',
  overdue:
    'bg-error-light text-error font-medium text-xs rounded-full px-3 py-1 inline-block',
  info: 'bg-info-light text-info font-medium text-xs rounded-full px-3 py-1 inline-block',
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
