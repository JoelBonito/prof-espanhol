import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import type { LessonContent } from '../types';

interface LessonSummaryCardProps {
  lesson: LessonContent;
  audioUnavailable: boolean;
  speaking: boolean;
  moduleProgressPercent: number;
}

export function LessonSummaryCard({
  lesson,
  audioUnavailable,
  speaking,
  moduleProgressPercent,
}: LessonSummaryCardProps) {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="info">{lesson.level}</Badge>
        <Badge variant={lesson.cache.hit ? 'completed' : 'pending'}>
          {lesson.cache.hit ? 'Cache' : 'Gemini'}
        </Badge>
        <Badge variant={audioUnavailable ? 'pending' : 'completed'}>
          {audioUnavailable ? 'Áudio em fallback texto' : speaking ? 'IA lendo bloco' : 'Áudio disponível'}
        </Badge>
      </div>
      <h1 className="font-display text-2xl text-neutral-900 font-bold">{lesson.title}</h1>
      <p className="font-body text-neutral-500 text-sm mt-1">{lesson.topic}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-primary-500">Progresso do módulo</span>
          <span className="text-xs font-bold text-neutral-700">{Math.round(moduleProgressPercent)}%</span>
        </div>
        <ProgressBar value={moduleProgressPercent} color="primary" className="h-2" />
      </div>
    </Card>
  );
}
