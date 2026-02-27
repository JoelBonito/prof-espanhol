import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';

interface CompletedStageCardProps {
  finalScore: number;
  weakCount: number;
  savingProgress: boolean;
  savingError: string | null;
  onRetryModule: () => void;
}

export function CompletedStageCard({
  finalScore,
  weakCount,
  savingProgress,
  savingError,
  onRetryModule,
}: CompletedStageCardProps) {
  return (
    <Card className="p-5 md:p-6" status={finalScore >= 60 ? 'success' : 'warning'}>
      <h2 className="font-display text-2xl text-text-primary font-bold mb-2">Módulo concluído</h2>
      <p className="font-body text-text-secondary">Score final: {finalScore}/100</p>
      <p className="font-body text-text-secondary text-sm mt-1">
        Exercícios para revisão no Schedule Adapter: {weakCount}
      </p>

      {savingProgress && <p className="font-body text-sm text-text-muted mt-3">Salvando progresso…</p>}
      {savingError && <p className="font-body text-sm text-error mt-3">{savingError}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onRetryModule}>
          Refazer módulo
          <Icon name="replay" size={20} />
        </Button>
      </div>
    </Card>
  );
}
