import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { LessonExercise } from '../types';

interface FlashCardProps {
  exercise: LessonExercise;
  disabled?: boolean;
  onEvaluate: (correct: boolean) => void;
}

const SWIPE_THRESHOLD = 48;

export function FlashCard({ exercise, disabled = false, onEvaluate }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const containerClass = useMemo(
    () =>
      [
        'relative w-full h-64 [perspective:1200px]',
        disabled ? 'opacity-70 pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' '),
    [disabled],
  );

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  function onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = Math.abs(endX - touchStartX);

    if (deltaX > SWIPE_THRESHOLD) {
      handleFlip();
    }

    setTouchStartX(null);
  }

  return (
    <div className="space-y-4">
      <Badge variant="info">flashcard</Badge>

      <div className={containerClass} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button
          type="button"
          onClick={handleFlip}
          className="relative w-full h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="Virar flashcard"
        >
          <div
            className={[
              'absolute inset-0 rounded-2xl [transform-style:preserve-3d] transition-transform duration-500',
              flipped ? '[transform:rotateY(180deg)]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="absolute inset-0 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-glass-bg)] shadow-flashcard p-6 flex items-center justify-center [backface-visibility:hidden]">
              <p className="font-display text-xl text-text-primary text-center leading-relaxed">
                {exercise.question}
              </p>
            </div>

            <div className="absolute inset-0 rounded-2xl border border-success/20 bg-success-light shadow-flashcard p-6 flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="font-body text-sm text-success font-semibold uppercase tracking-wide mb-2">
                Resposta
              </p>
              <p className="font-display text-xl text-text-primary leading-relaxed">{exercise.answer}</p>
              <p className="font-body text-sm text-text-secondary mt-4">{exercise.explanation}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" type="button" onClick={handleFlip}>
          {flipped ? 'Ver frente' : 'Ver resposta'}
        </Button>
        <Button type="button" onClick={() => onEvaluate(true)} disabled={!flipped}>
          Acertei
        </Button>
        <Button variant="ghost" type="button" onClick={() => onEvaluate(false)} disabled={!flipped}>
          Preciso revisar
        </Button>
      </div>
    </div>
  );
}
