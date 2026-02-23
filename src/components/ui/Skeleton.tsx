import { cn } from '../../lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'circle';
  width?: string;
  className?: string;
}

const variantStyles = {
  text: 'h-4 bg-neutral-200 rounded w-3/4',
  card: 'h-32 bg-neutral-100 rounded-[10px]',
  avatar: 'h-12 w-12 bg-neutral-200 rounded-full',
  circle: 'h-8 w-8 bg-neutral-200 rounded-full',
} as const;

export function Skeleton({ variant = 'text', width, className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse', variantStyles[variant], className)}
      style={width ? { width } : undefined}
      role="status"
      aria-label="Carregando"
    />
  );
}
