import { cn } from '../../../lib/utils';

interface AudioWaveformProps {
  active: boolean;
  className?: string;
}

const BAR_COUNT = 7;
const DELAYS = [0, 0.1, 0.2, 0.3, 0.2, 0.1, 0];

/**
 * CSS-animated waveform bars (G-DS-07).
 * Uses the @keyframes waveform defined in globals.css.
 */
export function AudioWaveform({ active, className }: AudioWaveformProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-[3px] h-8', className)}
      aria-label={active ? 'Audio ativo' : 'Audio inativo'}
      role="img"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-[3px] rounded-full bg-primary-500 transition-all',
            active ? 'opacity-100' : 'opacity-30 !h-[10%]',
          )}
          style={
            active
              ? {
                  animation: `waveform 1.2s ease-in-out infinite`,
                  animationDelay: `${DELAYS[i]}s`,
                  height: '100%',
                }
              : { height: '10%' }
          }
        />
      ))}
    </div>
  );
}
