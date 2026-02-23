import { type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export interface IconProps extends ComponentProps<'span'> {
  name: string;
  size?: 20 | 24 | 48;
  fill?: boolean;
  weight?: number;
}

export function Icon({
  name,
  size = 24,
  fill = false,
  weight = 400,
  className,
  style,
  ...props
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none leading-none', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
