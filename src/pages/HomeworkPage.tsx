import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { auth, db } from '../lib/firebase';
import { completeHomework } from '../features/homework/api/completeHomework';
import { ReportFeedbackButton } from '../features/feedback/components/ReportFeedbackButton';

type HomeworkStatus = 'pending' | 'completed' | 'overdue' | 'mastered';
type HomeworkInterval = '1h' | '1d' | '3d' | '7d' | '30d';

interface HomeworkItem {
  id: string;
  sourceType: 'grammar' | 'pronunciation' | 'vocabulary';
  contentRef: string;
  status: HomeworkStatus;
  score: number | null;
  deadline: Date | null;
  nextReviewAt: Date | null;
  interval: HomeworkInterval;
  repetitionCount: number;
  isReviewDue: boolean;
}

const SOURCE_LABELS: Record<HomeworkItem['sourceType'], string> = {
  grammar: 'Gramática',
  pronunciation: 'Pronúncia',
  vocabulary: 'Vocabulário',
};

function asDate(value: unknown): Date | null {
  if (!value || typeof value !== 'object') return null;
  if ('toDate' in (value as Record<string, unknown>)) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function parseHomework(raw: unknown, id: string): HomeworkItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;

  if (
    (value.sourceType !== 'grammar' &&
      value.sourceType !== 'pronunciation' &&
      value.sourceType !== 'vocabulary') ||
    (value.status !== 'pending' &&
      value.status !== 'completed' &&
      value.status !== 'overdue' &&
      value.status !== 'mastered')
  ) {
    return null;
  }

  const nextReviewAt = asDate(value.nextReviewAt) ?? asDate(value.nextReviewDate);
  const status = value.status as HomeworkStatus;

  return {
    id,
    sourceType: value.sourceType,
    contentRef: typeof value.contentRef === 'string' ? value.contentRef : 'reforco',
    status,
    score: typeof value.score === 'number' ? value.score : null,
    deadline: asDate(value.deadline),
    nextReviewAt,
    interval:
      value.interval === '1h' ||
        value.interval === '1d' ||
        value.interval === '3d' ||
        value.interval === '7d' ||
        value.interval === '30d'
        ? value.interval
        : '1h',
    repetitionCount: typeof value.repetitionCount === 'number' ? value.repetitionCount : 0,
    isReviewDue: status !== 'mastered' && !!nextReviewAt && nextReviewAt.getTime() <= Date.now(),
  };
}

function countdown(deadline: Date | null): string {
  if (!deadline) return 'Sem prazo';
  const suffix = isPast(deadline) ? 'atrasado' : 'restantes';
  return `${formatDistanceToNowStrict(deadline, { locale: ptBR })} ${suffix}`;
}

export default function HomeworkPage() {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHomework = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'users', uid, 'homework'), orderBy('createdAt', 'desc'), limit(50)),
      );
      const parsed = snap.docs
        .map((docSnap) => parseHomework(docSnap.data(), docSnap.id))
        .filter((entry): entry is HomeworkItem => entry !== null);
      setItems(parsed);
      setError(null);
    } catch (loadError) {
      console.error('Failed to load homework:', loadError);
      setError('Não foi possível carregar os deveres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomework();
  }, [loadHomework]);

  const prioritized = useMemo(() => {
    const active = items.filter((item) => item.status !== 'mastered');
    return active.sort((a, b) => {
      const priorityA = a.isReviewDue ? 0 : a.status === 'overdue' ? 1 : 2;
      const priorityB = b.isReviewDue ? 0 : b.status === 'overdue' ? 1 : 2;
      if (priorityA !== priorityB) return priorityA - priorityB;

      const dateA = a.isReviewDue ? a.nextReviewAt : a.deadline;
      const dateB = b.isReviewDue ? b.nextReviewAt : b.deadline;
      const valueA = dateA ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
      const valueB = dateB ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
      return valueA - valueB;
    });
  }, [items]);

  const markCompleted = async (homeworkId: string) => {
    setSavingId(homeworkId);
    try {
      await completeHomework({ homeworkId, score: 80 });
      await loadHomework();
    } catch (actionError) {
      console.error('Failed to complete homework:', actionError);
      setError('Não foi possível atualizar o dever.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Deveres</h1>
        <p className="font-body text-neutral-500">
          Exercícios de reforço com prazo de 48h e revisão espaçada.
        </p>
      </header>

      {loading && (
        <Card className="p-6">
          <p className="text-sm text-neutral-500">Carregando deveres...</p>
        </Card>
      )}

      {!loading && error && (
        <Card status="error" className="p-4">
          <p className="text-sm text-neutral-700">{error}</p>
        </Card>
      )}

      {!loading && prioritized.length === 0 && (
        <EmptyState
          icon="task_alt"
          title="Tudo em dia! Continue assim."
          description="Você concluiu os deveres pendentes. Que tal fazer uma sessão extra hoje?"
        />
      )}

      {!loading &&
        prioritized.map((item) => (
          <Card
            key={item.id}
            status={item.isReviewDue ? 'warning' : item.status === 'overdue' ? 'error' : 'warning'}
            className="p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-neutral-900">
                  Reforço de {SOURCE_LABELS[item.sourceType]}
                </h2>
                <p className="text-xs text-neutral-600 mt-1">{item.contentRef}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={item.isReviewDue ? 'info' : item.status === 'overdue' ? 'overdue' : 'pending'}
                >
                  {item.isReviewDue ? `Review ${item.interval}` : item.status === 'overdue' ? 'Vencido' : 'Pendente'}
                </Badge>
                <ReportFeedbackButton
                  screen="Homework"
                  content={`Source: ${item.sourceType}, Ref: ${item.contentRef}`}
                  sessionId={item.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <p className="text-sm text-neutral-700">
              {item.isReviewDue ? (
                <>
                  Revisão devida: <span className="font-semibold">{countdown(item.nextReviewAt)}</span>
                </>
              ) : (
                <>
                  Prazo: <span className="font-semibold">{countdown(item.deadline)}</span>
                </>
              )}
            </p>

            <p className="text-xs text-neutral-500">
              Repetições concluídas: {item.repetitionCount}
            </p>

            <div className="flex justify-end">
              <Button
                onClick={() => void markCompleted(item.id)}
                isLoading={savingId === item.id}
                size="sm"
              >
                Marcar como Completo
              </Button>
            </div>
          </Card>
        ))}
    </div>
  );
}
