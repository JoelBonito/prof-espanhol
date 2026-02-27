import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { LessonExercise } from '../types';

interface QuizMultipleChoiceProps {
  exercise: LessonExercise;
  disabled?: boolean;
  onSubmit: (answer: string) => void;
}

export function QuizMultipleChoice({
  exercise,
  disabled = false,
  onSubmit,
}: QuizMultipleChoiceProps) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    setSelected('');
  }, [exercise.id]);

  const options = useMemo(() => {
    return exercise.options ?? [];
  }, [exercise.options]);

  if (options.length === 0) {
    return (
      <div className="space-y-4">
        <Badge variant="info">multiple_choice</Badge>
        <p id={`question-${exercise.id}`} className="font-display text-xl text-text-primary">{exercise.question}</p>
        <p className="font-body text-sm text-warning">
          Exercício indisponível no momento. Tente outro módulo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Badge variant="info">multiple_choice</Badge>
      <p id={`question-${exercise.id}`} className="font-display text-xl text-text-primary">{exercise.question}</p>

      <div
        className="space-y-2"
        role="radiogroup"
        aria-labelledby={`question-${exercise.id}`}
      >
        {options.map((option) => {
          const active = selected === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              disabled={disabled}
              role="radio"
              aria-checked={active}
              className={[
                'w-full text-left rounded-xl border p-4 transition-colors font-body',
                active
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-[var(--color-border-default)] bg-[var(--color-glass-bg)] text-text-secondary hover:border-[var(--color-border-active)]',
                disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {option}
            </button>
          );
        })}
      </div>

      <Button type="button" onClick={() => onSubmit(selected)} disabled={!selected || disabled}>
        Confirmar resposta
      </Button>
    </div>
  );
}
