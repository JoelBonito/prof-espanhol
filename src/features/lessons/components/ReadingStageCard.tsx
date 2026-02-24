import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ReportFeedbackButton } from '../../feedback/components/ReportFeedbackButton';
import { sanitizeHtml } from '../../../lib/utils';
import type { LessonBlock } from '../types';

interface ReadingStageCardProps {
  blockIndex: number;
  currentBlock: LessonBlock;
  readingWords: string[];
  activeWordIndex: number;
  readingText: string;
  audioUnavailable: boolean;
  selectedModuleId: string | null;
  onSpeakBlock: () => void;
  onStartExercises: () => void;
}

export function ReadingStageCard({
  blockIndex,
  currentBlock,
  readingWords,
  activeWordIndex,
  readingText,
  audioUnavailable,
  selectedModuleId,
  onSpeakBlock,
  onStartExercises,
}: ReadingStageCardProps) {
  return (
    <Card className="p-5 md:p-6 relative group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Bloco {blockIndex + 1}: {currentBlock.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{currentBlock.durationMinutes} min</span>
          <ReportFeedbackButton
            screen="Lessons/Reading"
            content={currentBlock.contentHtml}
            sessionId={selectedModuleId || undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <div
        className="prose prose-neutral max-w-none prose-p:font-body prose-li:font-body"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentBlock.contentHtml) }}
      />

      {readingWords.length > 0 && (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="font-body text-xs uppercase tracking-wide text-neutral-500 mb-2">
            Acompanhamento da leitura
          </p>
          <p className="font-body text-sm leading-7 text-neutral-700">
            {readingWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={activeWordIndex === index ? 'px-0.5 rounded bg-primary-100 text-primary-700' : 'px-0.5'}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onSpeakBlock} disabled={audioUnavailable || !readingText}>
          <Icon name="volume_up" size={20} />
          Ouvir bloco
        </Button>
        <Button onClick={onStartExercises}>
          Iniciar exercícios do bloco
          <Icon name="arrow_forward" size={20} />
        </Button>
      </div>
    </Card>
  );
}
