import { Icon } from '../../../components/ui/Icon';

interface ChatHeaderProps {
  elapsedMs: number;
  onExit: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function ChatHeader({ elapsedMs, onExit }: ChatHeaderProps) {
  return (
    <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-chat-bg/90 to-transparent">
      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-chat-muted hover:text-chat-text transition-colors min-h-[44px] min-w-[44px]"
        aria-label="Sair do chat"
      >
        <Icon name="arrow_back" size={20} />
        <span className="text-sm font-medium hidden sm:inline">Sair</span>
      </button>

      <div className="flex items-center gap-2 text-chat-muted">
        <span className="text-sm font-body tabular-nums">
          {formatTime(elapsedMs)} / 30:00
        </span>
      </div>

      <div className="w-11" aria-hidden="true" />
    </header>
  );
}
