import { cn } from '../../lib/utils';

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  default: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
} as const;

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

export function Avatar({ src, alt, name, size = 'default', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center',
        sizeStyles[size],
        className
      )}
      role="img"
      aria-label={alt || name || 'Avatar'}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
}
