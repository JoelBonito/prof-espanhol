import { Icon } from '../../../components/ui/Icon';
import { AudioWaveform } from './AudioWaveform';
import { cn } from '../../../lib/utils';

interface ChatControlsProps {
  isMuted: boolean;
  isRecording: boolean;
  isActive: boolean;
  onToggleMute: () => void;
  onEnd: () => void;
}

export function ChatControls({ isMuted, isRecording, isActive, onToggleMute, onEnd }: ChatControlsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-chat-surface/50 backdrop-blur-sm safe-area-pb">
      {/* Waveform */}
      <div className="w-20">
        <AudioWaveform active={isRecording && isActive && !isMuted} />
      </div>

      {/* Mic button */}
      <button
        onClick={onToggleMute}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95',
          isMuted
            ? 'bg-chat-surface border-2 border-chat-muted'
            : 'bg-primary-500 shadow-lg shadow-primary-500/30',
        )}
        aria-label={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
      >
        <Icon
          name={isMuted ? 'mic_off' : 'mic'}
          size={28}
          fill={!isMuted}
          className={isMuted ? 'text-chat-muted' : 'text-white'}
        />
      </button>

      {/* End session */}
      <button
        onClick={onEnd}
        className="flex items-center gap-1.5 text-chat-muted hover:text-error transition-colors min-h-[44px] px-3"
        aria-label="Encerrar sessão"
      >
        <Icon name="call_end" size={20} />
        <span className="text-sm font-medium hidden sm:inline">Encerrar</span>
      </button>
    </div>
  );
}
