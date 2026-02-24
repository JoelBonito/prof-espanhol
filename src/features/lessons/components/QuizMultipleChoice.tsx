import { useMemo, useState } from 'react';
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

  const options = useMemo(() => {
    if (!exercise.options || exercise.options.length === 0) {
      return [exercise.answer];
    }

    return exercise.options;
  }, [exercise.answer, exercise.options]);

  return (
    <div className="space-y-4">
      <Badge variant="info">multiple_choice</Badge>
      <p id={`question-${exercise.id}`} className="font-display text-xl text-neutral-900">{exercise.question}</p>

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
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
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
