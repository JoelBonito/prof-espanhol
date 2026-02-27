import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <Icon name={icon} size={48} className="text-text-muted" />}
      <h3 className="font-display text-xl font-bold text-text-primary mt-4">{title}</h3>
      {description && <p className="text-text-secondary mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
