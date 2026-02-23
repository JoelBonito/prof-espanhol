import { useDiagnosticStore } from '../stores/diagnosticStore';
import { GrammarSection } from '../features/diagnostic/GrammarSection';
import { ListeningSection } from '../features/diagnostic/ListeningSection';
import { PronunciationSection } from '../features/diagnostic/PronunciationSection';
import { Icon } from '../components/ui/Icon';
import type {
  GrammarResult,
  ListeningResult,
  PronunciationResult,
} from '../features/diagnostic/types';

// Weight constants for overall score (per RN07)
const GRAMMAR_WEIGHT = 0.3;
const LISTENING_WEIGHT = 0.3;
const PRONUNCIATION_WEIGHT = 0.4;

export default function DiagnosticPage() {
  const {
    grammarCompleted,
    listeningCompleted,
    pronunciationCompleted,
    grammarScore,
    listeningScore,
    pronunciationScore,
  } = useDiagnosticStore();

  if (!grammarCompleted) {
    return <GrammarSection onComplete={(_result: GrammarResult) => void 0} />;
  }

  if (!listeningCompleted) {
    return <ListeningSection onComplete={(_result: ListeningResult) => void 0} />;
  }

  if (!pronunciationCompleted) {
    return <PronunciationSection onComplete={(_result: PronunciationResult) => void 0} />;
  }

  // All sections done — show summary
  const overallScore = Math.round(
    (grammarScore ?? 0) * GRAMMAR_WEIGHT +
      (listeningScore ?? 0) * LISTENING_WEIGHT +
      (pronunciationScore ?? 0) * PRONUNCIATION_WEIGHT,
  );

  return (
    <DiagnosticSummary
      grammarScore={grammarScore}
      listeningScore={listeningScore}
      pronunciationScore={pronunciationScore}
      overallScore={overallScore}
    />
  );
}

// ─── Summary shown after all 3 sections ─────────────────────────────────────

interface DiagnosticSummaryProps {
  grammarScore: number | null;
  listeningScore: number | null;
  pronunciationScore: number | null;
  overallScore: number;
}

function DiagnosticSummary({
  grammarScore,
  listeningScore,
  pronunciationScore,
  overallScore,
}: DiagnosticSummaryProps) {
  const level = scoreToLevel(overallScore);

  return (
    <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center">
          <Icon name="emoji_events" size={48} className="text-success" />
        </div>

        <div>
          <h1 className="font-display text-neutral-900 text-2xl font-bold mb-2">
            Diagnóstico concluído!
          </h1>
          <p className="font-body text-neutral-500 text-sm">Seu nível estimado:</p>
          <span className="inline-block mt-2 px-4 py-2 bg-primary-500 text-white font-display font-bold text-lg rounded-full">
            {level}
          </span>
        </div>

        {/* Score summary */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 w-full flex flex-col gap-3">
          <ScoreRow label="Gramática" score={grammarScore} icon="assignment" weight="30%" />
          <ScoreRow label="Compreensão" score={listeningScore} icon="hearing" weight="30%" />
          <ScoreRow label="Pronúncia" score={pronunciationScore} icon="mic" weight="40%" />
          <div className="border-t border-neutral-100 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="font-body font-bold text-neutral-900">Nota Final</span>
              <span className="font-display font-bold text-primary-500 text-lg">
                {overallScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Story 1.5 will add the CTA to continue */}
        <p className="font-body text-sm text-neutral-400">
          O diagnóstico foi salvo. Em breve você poderá continuar.
        </p>
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  score,
  icon,
  weight,
}: {
  label: string;
  score: number | null;
  icon: string;
  weight: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={20} className="text-neutral-400" />
        <span className="font-body text-sm text-neutral-700">{label}</span>
        <span className="font-body text-xs text-neutral-400">({weight})</span>
      </div>
      {score !== null ? (
        <span className="font-body font-bold text-primary-500">{score}/100</span>
      ) : (
        <span className="font-body text-sm text-neutral-400">—</span>
      )}
    </div>
  );
}

function scoreToLevel(score: number): string {
  if (score >= 85) return 'B2';
  if (score >= 70) return 'B1';
  if (score >= 50) return 'A2';
  return 'A1';
}
