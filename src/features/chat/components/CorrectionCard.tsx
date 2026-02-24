import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import type { PhonemeCorrectionEvent } from '../../../stores/chatStore';
import { useChatStore } from '../../../stores/chatStore';
import { ReportFeedbackButton } from '../../feedback/components/ReportFeedbackButton';

const MAX_ATTEMPTS = 3;

interface CorrectionCardProps {
  correction: PhonemeCorrectionEvent;
}

export function CorrectionCard({ correction }: CorrectionCardProps) {
  const { accepted, attempt, score } = correction;
  const maxedOut = attempt >= MAX_ATTEMPTS && !accepted;
  const sessionId = useChatStore((s) => s.sessionId);

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-4 py-3 border relative group',
          accepted
            ? 'bg-success/10 border-success/30'
            : maxedOut
              ? 'bg-chat-surface border-chat-muted/30'
              : 'bg-primary-500/10 border-primary-500/30',
        )}
      >
        <ReportFeedbackButton
          screen="Chat/Correction"
          content={`Heard: ${correction.heard}, Expected: ${correction.expected}, Score: ${score}%`}
          sessionId={sessionId || undefined}
          className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        {/* Header: icon + label + attempt badge */}
        <div className="flex items-center gap-2 mb-2">
          <Icon
            name={accepted ? 'check_circle' : maxedOut ? 'info' : 'lightbulb'}
            size={16}
            className={cn(
              accepted ? 'text-success' : maxedOut ? 'text-chat-muted' : 'text-primary-400',
            )}
          />
          <span
            className={cn(
              'text-xs font-medium',
              accepted ? 'text-success' : maxedOut ? 'text-chat-muted' : 'text-primary-400',
            )}
          >
            {accepted ? 'Correto!' : maxedOut ? 'Pendente' : 'Correção'}
          </span>

          {/* Attempt badge */}
          {!accepted && (
            <span className="ml-auto text-[10px] text-chat-muted tabular-nums">
              {attempt}/{MAX_ATTEMPTS}
            </span>
          )}
        </div>

        {/* Phoneme: heard → expected */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-display">
            <span className="line-through text-chat-muted">{correction.heard}</span>
            <span className="mx-2 text-chat-muted">→</span>
            <span
              className={cn(
                'font-semibold',
                accepted ? 'text-success' : 'text-primary-400',
              )}
            >
              {correction.expected}
            </span>
          </span>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                score >= 60 ? 'bg-success' : score >= 30 ? 'bg-warning' : 'bg-error',
              )}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <span className="text-[10px] text-chat-muted tabular-nums w-7 text-right">{score}%</span>
        </div>

        {/* Status message */}
        {maxedOut && (
          <p className="text-xs text-chat-muted mt-2 italic">
            Fonema registrado para praticar depois.
          </p>
        )}
      </div>
    </div>
  );
}
