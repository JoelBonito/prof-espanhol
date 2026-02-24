import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProgressBar, type ProgressBarProps } from '../../components/ui/ProgressBar';
import { functions, httpsCallable } from '../../lib/functions';
import { cn } from '../../lib/utils';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { EvolutionComparisonView } from './EvolutionComparisonView';
import { ReportFeedbackButton } from '../feedback/components/ReportFeedbackButton';

interface DiagnosticResultData {
  overallScore: number;
  level: string;
  grammarScore: number;
  listeningScore: number;
  pronunciationScore: number;
  strengths: string[];
  weaknesses: string[];
  phonemesToWork: string[];
}

interface DiagnosticResultViewProps {
  diagnosticId: string;
}

const calculateFn = httpsCallable<{ diagnosticId: string }, DiagnosticResultData>(
  functions,
  'calculateDiagnosticResult',
);

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-neutral-400',
  A2: 'bg-sky-500',
  B1: 'bg-primary-500',
  B2: 'bg-accent',
  C1: 'bg-success',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: 'Você reconhece palavras básicas e frases simples. Com prática consistente, vai evoluir rapidamente.',
  A2: 'Você entende o básico e consegue se comunicar em situações cotidianas simples. Bom começo!',
  B1: 'Você lida bem com o dia a dia e entende conversas comuns. Estamos no nível ideal para crescer juntos.',
  B2: 'Você se expressa com fluência em vários temas e entende textos complexos. Parabéns pelo nível avançado!',
  C1: 'Você usa o espanhol com naturalidade e eficiência. Nível quase nativo — impressionante!',
};

export function DiagnosticResultView({ diagnosticId }: DiagnosticResultViewProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'result' | 'error'>('loading');
  const [result, setResult] = useState<DiagnosticResultData | null>(null);
  const [previousResult, setPreviousResult] = useState<DiagnosticResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState('loading');

    calculateFn({ diagnosticId })
      .then(async (res) => {
        if (cancelled) return;
        setResult(res.data);

        // Fetch previous diagnostic for comparison
        try {
          const user = auth.currentUser;
          if (user) {
            const diagRef = collection(db, 'users', user.uid, 'diagnostics');
            const q = query(
              diagRef,
              where('status', '==', 'completed'),
              orderBy('completedAt', 'desc'),
              limit(2),
            );
            const snap = await getDocs(q);

            // index 0 = current, index 1 = previous
            if (snap.docs.length >= 2) {
              const prev = snap.docs[1].data();
              setPreviousResult({
                overallScore: prev.overallScore,
                level: prev.levelAssigned,
                grammarScore: prev.grammarScore,
                listeningScore: prev.listeningScore,
                pronunciationScore: prev.pronunciationScore,
                strengths: prev.strengths || [],
                weaknesses: prev.weaknesses || [],
                phonemesToWork: prev.phonemesToWork || [],
              });
            }
          }
        } catch (err) {
          console.error('Error fetching previous diagnostic:', err);
        }

        setState('result');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('calculateDiagnosticResult error:', err);
        setErrorMsg('Não foi possível calcular o resultado. Tente novamente.');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [diagnosticId, retryTrigger]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="font-body text-neutral-600 font-medium">
            Calculando seu nível…
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <Icon name="error" size={48} className="text-error" />
          </div>
          <p className="font-body text-neutral-600">{errorMsg}</p>
          <Button onClick={() => setRetryTrigger((t) => t + 1)}>
            <Icon name="refresh" size={20} />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ─── Result ────────────────────────────────────────────────────────────────
  const r = result!;
  const levelColor = LEVEL_COLORS[r.level] ?? 'bg-primary-500';
  const levelDesc = LEVEL_DESCRIPTIONS[r.level] ?? '';

  if (previousResult) {
    return <EvolutionComparisonView current={r} previous={previousResult} />;
  }

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-2 text-center relative">
        <h1 className="font-display text-neutral-900 text-xl font-bold">
          Resultado do Diagnóstico
        </h1>
        <ReportFeedbackButton
          screen="DiagnosticResult"
          content={`Level: ${r.level}, Strengths: ${r.strengths.join()}, Weaknesses: ${r.weaknesses.join()}`}
          className="absolute right-4 top-10"
        />
      </header>

      <main className="flex-1 px-6 pb-4 flex flex-col gap-4 max-w-2xl w-full mx-auto pt-4">
        {/* Level + description card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 flex gap-5">
          {/* Level badge */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg',
                levelColor,
              )}
            >
              <span className="font-display text-white text-3xl font-bold">{r.level}</span>
            </div>
            <span className="font-body text-xs text-neutral-500 font-medium">Seu nível</span>
          </div>

          {/* Description */}
          <div className="flex-1">
            <p className="font-body text-sm text-neutral-700 leading-relaxed">{levelDesc}</p>

            {/* Strengths */}
            {r.strengths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.strengths.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-light text-success text-xs font-medium rounded-full"
                  >
                    <Icon name="check" size={12} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scores per area */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5 flex flex-col gap-4">
          <h2 className="font-body font-semibold text-neutral-700 text-sm">
            Detalhes por área
          </h2>

          <AreaScore
            label="Gramática"
            icon="assignment"
            score={r.grammarScore}
            weight="30%"
            color="primary"
          />
          <AreaScore
            label="Compreensão Auditiva"
            icon="hearing"
            score={r.listeningScore}
            weight="30%"
            color="info"
          />
          <AreaScore
            label="Pronúncia"
            icon="mic"
            score={r.pronunciationScore}
            weight="40%"
            color="warning"
          />

          {/* Overall */}
          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-body font-bold text-neutral-900 text-sm">Nota Final</span>
              <span className="font-display font-bold text-primary-500 text-xl">
                {r.overallScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Phonemes to work */}
        {r.phonemesToWork.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5">
            <h2 className="font-body font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
              <Icon name="campaign" size={18} className="text-warning" />
              Fonemas a trabalhar:
            </h2>
            <div className="flex flex-wrap gap-2">
              {r.phonemesToWork.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 bg-warning/10 text-warning text-sm font-bold rounded-full"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {r.weaknesses.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5">
            <h2 className="font-body font-semibold text-neutral-700 text-sm mb-3 flex items-center gap-2">
              <Icon name="trending_up" size={18} className="text-primary-500" />
              Áreas para focar:
            </h2>
            <ul className="space-y-1.5">
              {r.weaknesses.map((w) => (
                <li key={w} className="font-body text-sm text-neutral-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-300 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* CTA */}
      <footer className="px-6 pb-10 pt-2 max-w-2xl w-full mx-auto">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate('/schedule')}
        >
          Configurar Minha Agenda
          <Icon name="calendar_today" size={20} />
        </Button>
      </footer>
    </div>
  );
}

// ─── Area score row with progress bar ────────────────────────────────────────

function AreaScore({
  label,
  icon,
  score,
  weight,
  color,
}: {
  label: string;
  icon: string;
  score: number;
  weight: string;
  color: ProgressBarProps['color'];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} className="text-neutral-400" />
          <span className="font-body text-sm text-neutral-700">{label}</span>
          <span className="font-body text-xs text-neutral-400">({weight})</span>
        </div>
        <span className="font-body font-bold text-neutral-800 text-sm">{score}/100</span>
      </div>
      <ProgressBar value={score} color={color} className="h-2" />
    </div>
  );
}
