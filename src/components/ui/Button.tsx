import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500/50',
  secondary:
    'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-500/50',
  ghost:
    'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-500/50',
  destructive:
    'bg-error text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-error/50',
} as const;

const sizeStyles = {
  sm: 'h-8 px-3 py-1.5 text-sm',
  default: 'h-10 px-6 py-2.5 text-sm font-semibold',
  lg: 'h-[52px] px-8 py-4 text-lg font-bold',
} as const;

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof variantStyles | 'pill';
  size?: keyof typeof sizeStyles;
  isLoading?: boolean;
  pillActive?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  pillActive = true,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-100 select-none min-h-[44px] min-w-[44px]';
  const radius = variant === 'pill' ? 'rounded-full' : 'rounded-[10px]';
  const sizing = variant === 'pill' ? 'px-5 py-2 text-sm' : sizeStyles[size];

  let appearance: string;
  if (disabled && !isLoading) {
    appearance = 'bg-neutral-200 text-neutral-400 cursor-not-allowed';
  } else if (variant === 'pill') {
    appearance = pillActive
      ? 'bg-primary-500 text-white'
      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50';
  } else {
    appearance = `${variantStyles[variant as keyof typeof variantStyles]} active:scale-95 cursor-pointer`;
  }

  return (
    <button
      className={cn(base, radius, sizing, appearance, isLoading && 'opacity-75', className)}
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
