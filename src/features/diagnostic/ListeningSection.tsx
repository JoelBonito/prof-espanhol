import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AudioPlayer } from './AudioPlayer';
import { useDiagnosticStore } from '../../stores/diagnosticStore';
import { listeningItems } from './data/listeningQuestions';
import type { ErrorType, ListeningAnswer, ListeningResult } from './types';
import { cn } from '../../lib/utils';

const TOTAL = listeningItems.length; // 5
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface ListeningSectionProps {
  onComplete: (result: ListeningResult) => void;
}

export function ListeningSection({ onComplete }: ListeningSectionProps) {
  const {
    listeningIndex,
    listeningAnswers,
    recordListeningAnswer,
    advanceListening,
    completeListening,
  } = useDiagnosticStore();

  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const currentItem = listeningItems[listeningIndex];
  const isLastItem = listeningIndex === TOTAL - 1;
  const hasAnswer = selected !== '';

  async function handleNext() {
    if (!selected) return;

    recordListeningAnswer(currentItem.id, selected);

    if (!isLastItem) {
      setSelected('');
      advanceListening();
      return;
    }

    // Last item: compute result
    const allAnswers = { ...listeningAnswers, [currentItem.id]: selected };

    const answerRecords: ListeningAnswer[] = listeningItems.map((item) => {
      const ans = allAnswers[item.id] ?? '';
      return {
        itemId: item.id,
        answer: ans,
        correct: ans === item.correct,
        errorType: item.errorType,
      };
    });

    const correctCount = answerRecords.filter((a) => a.correct).length;
    const score = Math.round((correctCount / TOTAL) * 100);

    const breakdown: Record<ErrorType, number> = { vocabulario: 0, velocidade: 0, contexto: 0 };
    answerRecords
      .filter((a) => !a.correct)
      .forEach((a) => {
        breakdown[a.errorType] += 1;
      });

    const completedAt = new Date().toISOString();
    completeListening(score);

    const result: ListeningResult = { score, answers: answerRecords, breakdown, completedAt };

    // Persist to Firestore (best-effort)
    const uid = auth.currentUser?.uid;
    const docId = useDiagnosticStore.getState().diagnosticId;
    if (uid && docId) {
      setSaving(true);
      try {
        await setDoc(
          doc(db, 'users', uid, 'diagnostics', docId),
          {
            listeningScore: score,
            listeningAnswers: answerRecords,
            listeningBreakdown: breakdown,
            listeningCompletedAt: completedAt,
            status: 'listening_complete',
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

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon name="hearing" size={20} className="text-primary-500" />
            <span className="font-body font-semibold text-neutral-900">Teste Diagnóstico</span>
          </div>
          <span className="font-body text-sm text-neutral-500">Seção 2 de 3: Compreensão</span>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-primary-500">Progresso</span>
          <span className="text-xs font-bold text-neutral-700">
            {listeningIndex + 1}/{TOTAL}
          </span>
        </div>
        <ProgressBar value={(listeningIndex / TOTAL) * 100} className="h-2.5" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pb-4 flex flex-col gap-5 max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
          {/* Audio player block */}
          <div className="px-6 pt-6 pb-5 border-b border-neutral-100">
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Áudio {listeningIndex + 1} de {TOTAL}
            </span>
            <p className="font-body text-neutral-600 font-medium mb-5">
              Ouça o áudio e responda à pergunta:
            </p>
            <AudioPlayer
              key={currentItem.id}
              text={currentItem.audioText}
            />
          </div>

          {/* Question + options */}
          <div className="px-6 py-5">
            <h2 className="font-display text-neutral-900 text-xl font-bold mb-5 text-center">
              {currentItem.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentItem.options.map((opt, i) => {
                const isSelected = selected === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50',
                    )}
                  >
                    <div
                      className={cn(
                        'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors',
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-500',
                      )}
                    >
                      {OPTION_LABELS[i]}
                    </div>
                    <span
                      className={cn(
                        'font-body text-sm font-medium',
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
          {isLastItem ? 'Concluir Seção' : 'Próximo'}
          <Icon name={isLastItem ? 'check_circle' : 'double_arrow'} size={20} />
        </Button>
      </footer>
    </div>
  );
}
