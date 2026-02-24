import { cn } from '../../../lib/utils';

interface TutorAvatarProps {
  isSpeaking: boolean;
  className?: string;
}

export function TutorAvatar({ isSpeaking, className }: TutorAvatarProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulsing ring when tutor speaks */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-primary-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {/* Avatar circle */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-chat-surface border-2 border-chat-surface flex items-center justify-center shadow-chat">
        <span className="text-4xl sm:text-5xl" role="img" aria-label="Tutor">
          🧑‍🏫
        </span>
      </div>

      {/* Status label */}
      {isSpeaking && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-chat-muted">Tutor falando...</span>
        </div>
      )}
    </div>
  );
}
