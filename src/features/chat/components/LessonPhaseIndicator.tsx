/**
 * LessonPhaseIndicator — Indicador de Fase da Aula
 *
 * Exibe:
 * - Barra de progresso (1-6 fases)
 * - Ícone da fase atual
 * - Texto explicativo
 *
 * Usado para orientar o aluno sobre em que etapa da aula ele está.
 */

import { useChatStore } from '../../../stores/chatStore';
import { PHASE_METADATA } from '../types/lesson';

export function LessonPhaseIndicator() {
  const lessonPhase = useChatStore((s) => s.lessonPhase);

  // Não exibir durante loading
  if (lessonPhase === 'loading') {
    return null;
  }

  const metadata = PHASE_METADATA[lessonPhase];
  const progress = ((metadata.progress) / 6) * 100;

  return (
    <div className="w-full px-4 py-3 bg-surface-dark/50 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Ícone + Texto explicativo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-label={metadata.label}>
            {metadata.icon}
          </span>
          <span className="text-sm font-medium text-text-primary">
            {metadata.label}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={metadata.progress}
            aria-valuemin={0}
            aria-valuemax={6}
            aria-label={`Progresso da lição: ${metadata.progress} de 6 fases`}
          />
        </div>

        {/* Marcadores das fases (dots) */}
        <div className="flex justify-between px-1">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all ${
                step <= metadata.progress
                  ? 'bg-primary-500 scale-110'
                  : 'bg-white/20'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
