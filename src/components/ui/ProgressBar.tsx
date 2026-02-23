import { cn } from '../../lib/utils';

const colorMap = {
  success: 'bg-success',
  primary: 'bg-primary-500',
  info: 'bg-info',
  warning: 'bg-warning',
  error: 'bg-error',
} as const;

const heightMap = {
  default: 'h-3',
  segmented: 'h-2',
  thin: 'h-1',
} as const;

export interface ProgressSegment {
  value: number;
  color: keyof typeof colorMap;
}

export interface ProgressBarProps {
  value?: number;
  variant?: 'default' | 'segmented' | 'thin';
  color?: keyof typeof colorMap;
  segments?: ProgressSegment[];
  label?: string;
  className?: string;
}

export function ProgressBar({
  value = 0,
  variant = 'default',
  color = 'success',
  segments,
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  if (variant === 'segmented' && segments) {
    return (
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn('flex bg-neutral-200 rounded-full overflow-hidden gap-0.5', heightMap.segmented, className)}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn('rounded-full transition-all duration-1000 ease-out', colorMap[seg.color])}
            style={{ width: `${Math.min(100, Math.max(0, seg.value))}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('bg-neutral-200 rounded-full overflow-hidden', heightMap[variant], className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-1000 ease-out', colorMap[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
