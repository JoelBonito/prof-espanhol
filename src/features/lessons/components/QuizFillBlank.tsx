import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import type { LessonExercise } from '../types';

interface QuizFillBlankProps {
  exercise: LessonExercise;
  disabled?: boolean;
  onSubmit: (answer: string) => void;
}

export function QuizFillBlank({ exercise, disabled = false, onSubmit }: QuizFillBlankProps) {
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    setAnswer('');
  }, [exercise.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim() || disabled) return;
    onSubmit(answer);
  }

  return (
    <div className="space-y-4">
      <Badge variant="info">fill_blank</Badge>
      <p id={`question-${exercise.id}`} className="font-display text-xl text-neutral-900">{exercise.question}</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Digite sua resposta"
          disabled={disabled}
          aria-labelledby={`question-${exercise.id}`}
        />

        <Button
          type="submit"
          disabled={!answer.trim() || disabled}
        >
          Confirmar resposta
        </Button>
      </form>
    </div>
  );
}
