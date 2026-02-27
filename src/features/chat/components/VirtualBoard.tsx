/**
 * VirtualBoard — Quadro Digital Premium
 *
 * Glass panel with orange border glow following Stitch design.
 * Central area for lesson content display.
 */

import { Icon } from '../../../components/ui/Icon';
import type { BoardData, BoardState } from '../lib/boardParser';

interface VirtualBoardProps {
  board: BoardData;
}

const STATE_LABELS: Record<BoardState, string> = {
  presentation: 'Apresentação',
  tutor_reading: 'Tutor está lendo',
  student_reading: 'Sua vez de ler',
  analyzing: 'Analisando...',
  correcting: 'Correção',
  request_translation: 'Traduza agora',
  student_translating: 'Você está traduzindo',
  correcting_translation: 'Correção de tradução',
  next_section: 'Próxima seção',
  completed: 'Concluído!',
};

function getStateIcon(state: BoardState): string {
  if (state === 'student_reading' || state === 'student_translating') return 'menu_book';
  if (state === 'correcting' || state === 'correcting_translation') return 'check_circle';
  if (state === 'completed') return 'celebration';
  if (state === 'tutor_reading') return 'headphones';
  if (state === 'request_translation') return 'translate';
  if (state === 'analyzing') return 'psychology';
  return 'draw';
}

export function VirtualBoard({ board }: VirtualBoardProps) {
  const progress =
    board.sectionTotal > 0
      ? Math.round((board.sectionIndex / board.sectionTotal) * 100)
      : 0;

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Ambient glow behind the board */}
      <div className="absolute -inset-16 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main board container — glass + orange border glow */}
      <div
        className="relative flex flex-col p-6 sm:p-8 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] min-h-[280px] sm:min-h-[340px]"
        style={{
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255, 140, 66, 0.25)',
          boxShadow: 'inset 0 0 30px rgba(255, 140, 66, 0.04), 0 0 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Decorative icon (top-right, subtle) */}
        <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
          <Icon name="draw" size={48} className="text-primary-500" />
        </div>

        {/* Header: label + title + level badge */}
        <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.3em]">
              Quadro Digital
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mt-2 leading-tight">
              {board.lessonTitle}
            </h2>
          </div>

          <span className="shrink-0 px-3 py-1.5 text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 border border-primary-500/20 rounded-full">
            {board.level}
          </span>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center py-4 lg:py-6">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 leading-relaxed tracking-wide">
            {board.text}
          </p>
        </div>

        {/* Footer: state badge + section info */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* State indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Icon name={getStateIcon(board.state)} size={14} className="text-primary-500" />
              <span className="text-xs font-medium text-text-secondary">
                {STATE_LABELS[board.state]}
              </span>
            </div>

            {board.sectionTotal > 1 && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-text-muted">
                Seção {board.sectionIndex}/{board.sectionTotal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar (below board) */}
      {board.sectionTotal > 1 && (
        <div className="px-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Progresso da Aula
            </span>
            <span className="text-[10px] font-bold text-primary-500 tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: '0 0 8px rgba(255, 140, 66, 0.4)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
