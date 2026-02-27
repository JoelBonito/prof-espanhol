import { Icon } from '../../../components/ui/Icon';
import { AudioWaveform } from './AudioWaveform';
import { cn } from '../../../lib/utils';

interface ChatControlsProps {
  isMuted: boolean;
  isRecording: boolean;
  isActive: boolean;
  onMicAction: () => void;
  onEnd: () => void;
}

export function ChatControls({ isMuted, isRecording, isActive, onMicAction, onEnd }: ChatControlsProps) {
  const micLabel = !isActive
    ? 'Iniciar sessão'
    : isMuted
      ? 'Ativar microfone'
      : 'Desativar microfone';

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-5">

      {/* Waveform */}
      <div className="h-3 w-28 flex items-center justify-center opacity-50">
        <AudioWaveform active={isRecording && isActive && !isMuted} />
      </div>

      <div className="flex items-center gap-8">
        {/* Translate button */}
        <button
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
          aria-label="Traduzir"
        >
          <Icon name="translate" size={22} />
        </button>

        {/* Main MIC button */}
        <div className="relative">
          <button
            onClick={onMicAction}
            className={cn(
              'w-22 h-22 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all active:scale-95 z-10 relative',
              !isActive
                ? 'bg-primary-500 shadow-glow-orange'
                : isMuted
                  ? 'bg-surface-dark border-2 border-white/10 text-text-muted'
                  : 'bg-primary-500 shadow-glow-orange',
            )}
            aria-label={micLabel}
          >
            <Icon
              name={!isActive ? 'mic' : isMuted ? 'mic_off' : 'mic'}
              size={isActive && !isMuted ? 44 : 36}
              fill={!isActive || !isMuted}
              className={!isActive || !isMuted ? 'text-white' : 'text-text-muted'}
            />
          </button>

          {/* Ping ring when active */}
          {isActive && !isMuted && (
            <div className="absolute -inset-3 rounded-full border-2 border-primary-500/20 animate-ping opacity-30" />
          )}
          <div className="absolute -inset-2 rounded-full ring-[10px] ring-primary-500/10 pointer-events-none" />
        </div>

        {/* Volume button */}
        <button
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
          aria-label="Ajustar Volume"
        >
          <Icon name="volume_up" size={22} />
        </button>
      </div>

      {/* End session */}
      <button
        onClick={onEnd}
        className="flex items-center gap-2 text-[9px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-[0.4em] transition-all"
        aria-label="Encerrar sessão"
      >
        <Icon name="call_end" size={12} />
        <span>Encerrar Sessão</span>
      </button>
    </div>
  );
}
