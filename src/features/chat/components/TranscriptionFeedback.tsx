/**
 * TranscriptionFeedback — Feedback Visual de Correção
 *
 * Exibe a transcrição do que o aluno falou com destaque:
 * - Verde: palavra correta
 * - Vermelho: palavra com erro
 *
 * Aparece durante as fases de correção (correcting-pronunciation, correcting-translation).
 */

import { Icon } from '../../../components/ui/Icon';
import { useChatStore } from '../../../stores/chatStore';
import type { Correction } from '../types/lesson';

export function TranscriptionFeedback() {
  const lessonPhase = useChatStore((s) => s.lessonPhase);
  const corrections = useChatStore((s) => s.pronunciationCorrections);
  const transcript = useChatStore((s) => s.lessonTranscript);

  // Só exibir durante fases de correção
  if (
    lessonPhase !== 'correcting-pronunciation' &&
    lessonPhase !== 'correcting-translation'
  ) {
    return null;
  }

  // Se não há correções, exibir apenas a transcrição
  if (corrections.length === 0 && !transcript) {
    return null;
  }

  return (
    <div className="w-full px-6 py-6 border-t border-white/5 bg-[#0D0E14]/40 backdrop-blur-3xl animate-slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Header de Status */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none">Análise de IA</span>
          </div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-tight">
            {lessonPhase === 'correcting-pronunciation'
              ? 'Correção de Pronúncia'
              : 'Correção de Tradução'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Coluna 1: O que você disse (Transcrição) */}
          <div className="md:col-span-12 space-y-4">
            {transcript && (
              <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="record_voice_over" size={40} />
                </div>
                <p className="text-[10px] font-black text-primary-500/60 uppercase tracking-widest mb-3">Sua fala transcrita</p>
                <p className="text-xl md:text-2xl font-display text-white italic leading-snug">
                  "{transcript}"
                </p>
              </div>
            )}

            {/* Correções palavra por palavra */}
            {corrections.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Análise Detalhada</p>
                <div className="flex flex-wrap gap-3">
                  {corrections.map((correction, index) => (
                    <CorrectionBadge key={index} correction={correction} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legenda de Filtro Inferior */}
        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success/20 border border-success" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Acorrect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error/20 border border-error" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Badge individual de correção (palavra)
 */
interface CorrectionBadgeProps {
  correction: Correction;
}

function CorrectionBadge({ correction }: CorrectionBadgeProps) {
  const isCorrect = correction.status === 'correct';

  return (
    <div
      className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border ${isCorrect
          ? 'bg-success/10 border-success/30'
          : 'bg-error/10 border-error/30'
        }`}
    >
      {/* Palavra original (esperada) */}
      <span className={`text-sm font-medium ${isCorrect ? 'text-success' : 'text-error'
        }`}>
        {correction.word}
      </span>

      {/* Se houver erro, mostrar como o aluno falou */}
      {!isCorrect && correction.spoken !== correction.word && (
        <span className="text-xs text-text-muted line-through">
          {correction.spoken}
        </span>
      )}

      {/* Pronúncia correta (se houver erro) */}
      {!isCorrect && correction.correct && (
        <span className="text-xs text-text-muted">
          ✓ {correction.correct}
        </span>
      )}
    </div>
  );
}
