import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { FlashCard } from './FlashCard';
import { QuizMultipleChoice } from './QuizMultipleChoice';
import { QuizFillBlank } from './QuizFillBlank';
import { ReportFeedbackButton } from '../../feedback/components/ReportFeedbackButton';
import type { LessonExercise } from '../types';

interface ExerciseFeedback {
  status: 'correct' | 'incorrect';
  message: string;
  explanation: string;
}

interface ExerciseStageCardProps {
  exerciseIndex: number;
  exercisesForBlockLength: number;
  blockIndex: number;
  activeExercise: LessonExercise;
  audioUnavailable: boolean;
  selectedModuleId: string | null;
  feedback: ExerciseFeedback | null;
  retryExercise: LessonExercise | null;
  onPlayHint: () => void;
  onShowTextHint: () => void;
  onEvaluate: (correct: boolean) => void;
  onChoiceSubmit: (answer: string) => void;
  onSpeakFeedback: () => void;
  onRetrySimilar: () => void;
  onContinue: () => void;
}

export function ExerciseStageCard({
  exerciseIndex,
  exercisesForBlockLength,
  blockIndex,
  activeExercise,
  audioUnavailable,
  selectedModuleId,
  feedback,
  retryExercise,
  onPlayHint,
  onShowTextHint,
  onEvaluate,
  onChoiceSubmit,
  onSpeakFeedback,
  onRetrySimilar,
  onContinue,
}: ExerciseStageCardProps) {
  return (
    <Card className="p-5 md:p-6 relative group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Exercício {exerciseIndex + 1} de {exercisesForBlockLength}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Bloco {blockIndex + 1}</span>
          <ReportFeedbackButton
            screen="Lessons/Exercise"
            content={`Question: ${activeExercise.question}, Answer: ${activeExercise.answer}`}
            sessionId={selectedModuleId || undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      {audioUnavailable && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning-light p-3">
          <p className="font-body text-sm text-text-secondary">
            Áudio indisponível. Alternativa textual ativada automaticamente.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onPlayHint} disabled={audioUnavailable}>
          <Icon name="record_voice_over" size={20} />
          Ouvir dica
        </Button>
        <Button variant="ghost" onClick={onShowTextHint}>
          Ver dica em texto
        </Button>
      </div>

      {activeExercise.type === 'flashcard' && <FlashCard exercise={activeExercise} onEvaluate={onEvaluate} />}
      {activeExercise.type === 'multiple_choice' && <QuizMultipleChoice exercise={activeExercise} onSubmit={onChoiceSubmit} />}
      {activeExercise.type === 'fill_blank' && <QuizFillBlank exercise={activeExercise} onSubmit={onChoiceSubmit} />}

      {feedback && (
        <div
          className={feedback.status === 'correct'
            ? 'mt-5 rounded-xl border border-success/20 bg-success-light p-4'
            : 'mt-5 rounded-xl border border-warning/30 bg-warning-light p-4'}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="font-body text-sm font-semibold text-text-primary">{feedback.message}</p>
          <p className="font-body text-sm text-text-secondary mt-1">{feedback.explanation}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="secondary" onClick={onSpeakFeedback} disabled={audioUnavailable}>
              <Icon name="volume_up" size={20} />
              Ouvir explicação
            </Button>
            {feedback.status === 'incorrect' && !retryExercise && (
              <Button variant="secondary" onClick={onRetrySimilar}>
                Tentar exercício similar
              </Button>
            )}
            <Button onClick={onContinue}>Continuar</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
