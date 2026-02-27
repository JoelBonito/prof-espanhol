import { Icon } from '../../../components/ui/Icon';

interface ChatHeaderProps {
  elapsedMs: number;
  onExit: () => void;
  lessonTitle?: string;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function ChatHeader({ elapsedMs, onExit, lessonTitle }: ChatHeaderProps) {
  return (
    <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-5 bg-gradient-to-b from-app-bg/95 via-app-bg/60 to-transparent">
      <div className="flex items-center gap-3">
        {/* Back button — glass circle (Stitch) */}
        <button
          onClick={onExit}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          aria-label="Sair da aula"
        >
          <Icon name="arrow_back_ios_new" size={18} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-white font-display text-base sm:text-xl leading-none">Aula de Espanhol</h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-0.5 line-clamp-1 max-w-[160px] sm:max-w-[240px] md:max-w-md">
            {lessonTitle || 'Prática com Tutor IA'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Badge Sessão Ativa */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] font-bold text-success uppercase tracking-widest">Sessão Ativa</span>
        </div>

        {/* Timer pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <Icon name="schedule" size={14} className="text-text-muted" />
          <span className="text-xs font-mono font-medium text-white tabular-nums">
            {formatTime(elapsedMs)} / 30:00
          </span>
        </div>
      </div>
    </header>
  );
}
