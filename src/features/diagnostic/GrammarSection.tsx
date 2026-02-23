import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useDiagnosticStore } from '../../stores/diagnosticStore';
import { grammarQuestions } from './data/grammarQuestions';
import type { GrammarQuestion, GrammarResult, QuestionAnswer } from './types';
import { cn } from '../../lib/utils';

const TOTAL = grammarQuestions.length; // 15
const TIMER_SECONDS = 60;

interface GrammarSectionProps {
  onComplete: (result: GrammarResult) => void;
}

export function GrammarSection({ onComplete }: GrammarSectionProps) {
  const {
    diagnosticId,
    grammarIndex,
    grammarAnswers,
    grammarTimes,
    setDiagnosticId,
    recordGrammarAnswer,
    advanceGrammar,
    completeGrammar,
  } = useDiagnosticStore();

  const [selected, setSelected] = useState('');
  const [fillValue, setFillValue] = useState('');
  const [timerLeft, setTimerLeft] = useState(TIMER_SECONDS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const questionStartRef = useRef<number>(Date.now());

  const currentQuestion = grammarQuestions[grammarIndex];
  const isLastQuestion = grammarIndex === TOTAL - 1;
  const hasAnswer = currentQuestion.type === 'mc' ? selected !== '' : fillValue.trim() !== '';

  // Init diagnostic doc in Firestore (only once per session)
  useEffect(() => {
    if (diagnosticId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    addDoc(collection(db, 'users', uid, 'diagnostics'), {
      status: 'in_progress',
      startedAt: serverTimestamp(),
      grammarScore: null,
      listeningScore: null,
      pronunciationScore: null,
      overallScore: null,
    })
      .then((ref) => setDiagnosticId(ref.id))
      .catch(() => {
        // Non-fatal: proceed without Firestore; local state persists
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset local answer state + timer on question change
  useEffect(() => {
    const saved = grammarAnswers[currentQuestion.id];
    setSelected(currentQuestion.type === 'mc' ? (saved ?? '') : '');
    setFillValue(currentQuestion.type === 'fill' ? (saved ?? '') : '');
    setTimerLeft(TIMER_SECONDS);
    questionStartRef.current = Date.now();
  }, [grammarIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(
      () => setTimerLeft((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, [grammarIndex]);

  function getAnswer(): string {
    return currentQuestion.type === 'mc' ? selected : fillValue.trim();
  }

  function checkAnswer(q: GrammarQuestion, answer: string): boolean {
    const norm = answer.trim().toLowerCase();
    if (norm === q.correct.toLowerCase()) return true;
    if (q.type === 'fill' && q.alternatives) {
      return q.alternatives.some((a) => a.toLowerCase() === norm);
    }
    return false;
  }

  async function handleNext() {
    const answer = getAnswer();
    if (!answer) return;
    const timeMs = Date.now() - questionStartRef.current;

    recordGrammarAnswer(currentQuestion.id, answer, timeMs);

    if (!isLastQuestion) {
      advanceGrammar();
      return;
    }

    // Last question: compute score with all answers (include the one just recorded)
    const allAnswers = { ...grammarAnswers, [currentQuestion.id]: answer };
    const allTimes = { ...grammarTimes, [currentQuestion.id]: timeMs };

    const answerRecords: QuestionAnswer[] = grammarQuestions.map((q) => {
      const ans = allAnswers[q.id] ?? '';
      return {
        questionId: q.id,
        answer: ans,
        correct: checkAnswer(q, ans),
        timeMs: allTimes[q.id] ?? 0,
      };
    });

    const correctCount = answerRecords.filter((a) => a.correct).length;
    const score = Math.round((correctCount / TOTAL) * 100);
    const avgTimeMs = Math.round(
      answerRecords.reduce((sum, a) => sum + a.timeMs, 0) / TOTAL,
    );
    const completedAt = new Date().toISOString();

    completeGrammar(score);

    const result: GrammarResult = { score, answers: answerRecords, completedAt, avgTimeMs };

    // Persist to Firestore (best-effort)
    const uid = auth.currentUser?.uid;
    const docId = useDiagnosticStore.getState().diagnosticId;
    if (uid && docId) {
      setSaving(true);
      try {
        await setDoc(
          doc(db, 'users', uid, 'diagnostics', docId),
          {
            grammarScore: score,
            grammarAnswers: answerRecords,
            grammarAvgTimeMs: avgTimeMs,
            grammarCompletedAt: completedAt,
            status: 'grammar_complete',
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }

    onComplete(result);
  }

  const timerPct = (timerLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timerLeft > 20 ? 'bg-primary-500' : timerLeft > 10 ? 'bg-warning' : 'bg-error';

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon name="assignment" size={20} className="text-primary-500" />
            <span className="font-body font-semibold text-neutral-900">Teste Diagnóstico</span>
          </div>
          <span className="font-body text-sm text-neutral-500">Seção 1 de 3: Gramática</span>
        </div>

        {/* Main progress */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-primary-500">Progresso</span>
          <span className="text-xs font-bold text-neutral-700">
            {grammarIndex + 1}/{TOTAL}
          </span>
        </div>
        <ProgressBar value={((grammarIndex) / TOTAL) * 100} className="h-2.5" />
      </header>

      {/* Question card */}
      <main className="flex-1 px-6 pb-4 flex flex-col gap-5 max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
          {/* Question header */}
          <div className="px-6 pt-6 pb-4 border-b border-neutral-100">
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
              Questão {grammarIndex + 1} de {TOTAL}
              {grammarIndex < 10 ? ' • Múltipla Escolha' : ' • Preencha o Espaço'}
            </span>
            <p className="font-body text-neutral-700 font-medium mb-4">
              {currentQuestion.instruction}
            </p>

            {/* Sentence with blank */}
            <div className="bg-neutral-50 border-l-4 border-primary-500 px-5 py-4 rounded-r-xl">
              <SentenceWithBlank sentence={currentQuestion.sentence} />
            </div>

            {/* Timer bar */}
            <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', timerColor)}
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <div className="flex justify-end mt-0.5">
              <span
                className={cn(
                  'text-xs font-mono',
                  timerLeft <= 10 ? 'text-error' : 'text-neutral-400',
                )}
              >
                {timerLeft}s
              </span>
            </div>
          </div>

          {/* Answer area */}
          <div className="px-6 py-5">
            {currentQuestion.type === 'mc' ? (
              <MCOptions
                question={currentQuestion}
                selected={selected}
                onSelect={setSelected}
              />
            ) : (
              <FillInput
                question={currentQuestion}
                value={fillValue}
                onChange={setFillValue}
                onSubmit={hasAnswer ? handleNext : undefined}
              />
            )}
          </div>
        </div>

        {saveError && (
          <p className="text-center text-sm text-warning">
            Resultado salvo apenas localmente (sem conexão com servidor).
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-2 max-w-2xl w-full mx-auto">
        <Button
          size="lg"
          className="w-full"
          disabled={!hasAnswer || saving}
          isLoading={saving}
          onClick={handleNext}
        >
          {isLastQuestion ? 'Concluir Seção' : 'Próximo'}
          <Icon name={isLastQuestion ? 'check_circle' : 'double_arrow'} size={20} />
        </Button>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SentenceWithBlank({ sentence }: { sentence: string }) {
  const parts = sentence.split('___');
  return (
    <p className="font-body text-lg md:text-xl leading-relaxed italic text-neutral-800">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="inline-block border-b-2 border-primary-500 min-w-[100px] text-center px-2 font-bold text-primary-500 not-italic mx-1">
              ___
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

function MCOptions({
  question,
  selected,
  onSelect,
}: {
  question: Extract<GrammarQuestion, { type: 'mc' }>;
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {question.options.map((opt, i) => {
        const isSelected = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer',
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
            )}
          >
            <div
              className={cn(
                'shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-500',
              )}
            >
              {OPTION_LABELS[i]}
            </div>
            <span
              className={cn(
                'font-body text-base font-medium',
                isSelected ? 'text-primary-500' : 'text-neutral-800',
              )}
            >
              {opt}
            </span>
            {isSelected && (
              <Icon name="check_circle" size={20} className="ml-auto text-primary-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function FillInput({
  question,
  value,
  onChange,
  onSubmit,
}: {
  question: Extract<GrammarQuestion, { type: 'fill' }>;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder="Escribe tu respuesta aquí…"
        autoFocus
        className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:outline-none font-body text-base text-neutral-900 placeholder:text-neutral-400 transition-colors"
        aria-label="Respuesta"
      />
      <p className="text-sm text-neutral-400 italic flex items-center gap-1.5">
        <Icon name="lightbulb" size={20} className="text-warning" />
        Dica: {question.hint}
      </p>
    </div>
  );
}
