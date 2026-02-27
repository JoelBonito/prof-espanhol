/**
 * SubtitleBar — Live subtitles (TV-style)
 *
 * Shows tutor speech as subtitles at the bottom of the screen.
 * Follows Stitch design: "AO VIVO" badge + italic serif text.
 */

import { useChatStore } from '../../../stores/chatStore';
import { CorrectionCard } from './CorrectionCard';

export function SubtitleBar() {
  const messages = useChatStore((s) => s.messages);
  const lastTutorMsg = [...messages].reverse().find((m) => m.role === 'tutor');
  const lastCorrection = useChatStore((s) => s.corrections.length > 0 ? s.corrections[s.corrections.length - 1] : null);

  const showCorrection =
    lastCorrection && lastTutorMsg && lastCorrection.timestamp >= lastTutorMsg.timestamp;

  if (showCorrection && lastCorrection) {
    return (
      <div
        className="shrink-0 px-4 sm:px-6 lg:px-10 py-4 bg-app-bg/80 backdrop-blur-2xl border-t border-white/5 safe-area-pb"
        style={{ boxShadow: '0 -10px 30px rgba(0,0,0,0.3)' }}
      >
        <CorrectionCard correction={lastCorrection} compact />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 px-4 sm:px-6 lg:px-10 py-4 lg:py-5 bg-app-bg/80 backdrop-blur-2xl border-t border-white/5 safe-area-pb"
      style={{ boxShadow: '0 -10px 30px rgba(0,0,0,0.3)' }}
    >
      {lastTutorMsg ? (
        <div className="flex items-start gap-3">
          {/* AO VIVO badge */}
          <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest leading-none">
              Ao vivo
            </span>
          </div>

          {/* Subtitle text */}
          <p className="text-base sm:text-lg lg:text-xl font-display text-white/90 italic leading-relaxed line-clamp-2">
            {lastTutorMsg.text}
          </p>
        </div>
      ) : (
        <p className="text-sm text-text-muted italic font-body">
          Toque no microfone para iniciar...
        </p>
      )}
    </div>
  );
}
