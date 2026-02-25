import { cn } from '../../../lib/utils';
import type { BoardData, BoardState } from '../lib/boardParser';

interface VirtualBoardProps {
  board: BoardData;
}

const STATE_LABELS: Record<BoardState, string> = {
  presentation: 'Presentacion',
  tutor_reading: 'Lectura del tutor',
  student_reading: 'Tu turno de leer',
  analyzing: 'Analizando...',
  correcting: 'Correccion',
  request_translation: 'Traduccion',
  student_translating: 'Tu turno de traducir',
  correcting_translation: 'Correccion de traduccion',
  next_section: 'Siguiente seccion',
  completed: 'Completado!',
};

function stateDotColor(state: BoardState): string {
  if (state === 'student_reading' || state === 'student_translating') {
    return 'bg-primary-400';
  }
  if (state === 'correcting' || state === 'correcting_translation') {
    return 'bg-warning';
  }
  if (state === 'completed') {
    return 'bg-success';
  }
  return 'bg-chat-muted';
}

export function VirtualBoard({ board }: VirtualBoardProps) {
  const progress =
    board.sectionTotal > 0
      ? Math.round((board.sectionIndex / board.sectionTotal) * 100)
      : 0;

  return (
    <div className="bg-chat-surface/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
      {/* Header: title + level badge */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-chat-text truncate">
          {board.lessonTitle}
        </h3>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/15 px-2 py-0.5 rounded">
          {board.level}
        </span>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full shrink-0', stateDotColor(board.state))} />
        <span className="text-xs text-chat-muted">{STATE_LABELS[board.state]}</span>
      </div>

      {/* Lesson text */}
      {board.text && (
        <div className="bg-white/5 rounded-lg p-4 text-base leading-relaxed text-chat-text">
          {board.text}
        </div>
      )}

      {/* Section progress bar */}
      {board.sectionTotal > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-chat-muted">
              Trecho {board.sectionIndex}/{board.sectionTotal}
            </span>
            <span className="text-[10px] text-chat-muted tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
