import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ReportFeedbackButton } from '../../feedback/components/ReportFeedbackButton';
import { HighlightableContent } from './HighlightableContent';
import type { LessonBlock } from '../types';

interface ReadingStageCardProps {
  blockIndex: number;
  currentBlock: LessonBlock;
  audioUnavailable: boolean;
  selectedModuleId: string | null;
  speaking: boolean;
  hasReadingText: boolean;
  highlightRef: React.RefObject<HTMLDivElement | null>;
  onSpeakBlock: () => void;
  onStopReading: () => void;
  onStartExercises: () => void;
}

export function ReadingStageCard({
  blockIndex,
  currentBlock,
  audioUnavailable,
  selectedModuleId,
  speaking,
  hasReadingText,
  highlightRef,
  onSpeakBlock,
  onStopReading,
  onStartExercises,
}: ReadingStageCardProps) {
  return (
    <Card className="p-5 md:p-6 relative group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary">
          Bloco {blockIndex + 1}: {currentBlock.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{currentBlock.durationMinutes} min</span>
          <ReportFeedbackButton
            screen="Lessons/Reading"
            content={currentBlock.contentHtml}
            sessionId={selectedModuleId || undefined}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <HighlightableContent
        html={currentBlock.contentHtml}
        containerRef={highlightRef}
        className="prose prose-invert max-w-none prose-p:font-body prose-li:font-body"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant={speaking ? 'primary' : 'secondary'}
          onClick={speaking ? onStopReading : onSpeakBlock}
          disabled={audioUnavailable || !hasReadingText}
        >
          <Icon name={speaking ? 'pause' : 'play_arrow'} size={20} />
          {speaking ? 'Pausar leitura' : 'Iniciar leitura'}
        </Button>
        <Button onClick={onStartExercises}>
          Iniciar exercícios do bloco
          <Icon name="arrow_forward" size={20} />
        </Button>
      </div>
    </Card>
  );
}
