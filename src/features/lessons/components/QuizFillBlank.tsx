import { useState } from 'react';
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

  return (
    <div className="space-y-4">
      <Badge variant="info">fill_blank</Badge>
      <p className="font-display text-xl text-neutral-900">{exercise.question}</p>

      <Input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Digite sua resposta"
        disabled={disabled}
      />

      <Button
        type="button"
        onClick={() => onSubmit(answer)}
        disabled={!answer.trim() || disabled}
      >
        Confirmar resposta
      </Button>
    </div>
  );
}
