import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import type { AdaptationArea, AdapterHistoryEntry } from '../types/adaptation';

interface AdaptationTimelineProps {
  entries: AdapterHistoryEntry[];
}

const AREA_LABELS: Record<AdaptationArea, string> = {
  grammar: 'Gramática',
  pronunciation: 'Fonética',
  vocabulary: 'Vocabulário',
  all: 'Geral',
};

function zoneLabel(zone: AdapterHistoryEntry['zone']): string {
  if (zone === 'tooEasy') return 'Muito Fácil';
  if (zone === 'tooHard') return 'Muito Difícil';
  return 'Zona Ideal';
}

function zoneBadge(zone: AdapterHistoryEntry['zone']): 'completed' | 'pending' | 'overdue' {
  if (zone === 'ideal') return 'completed';
  if (zone === 'tooEasy') return 'pending';
  return 'overdue';
}

function adjustmentText(adjustment: AdapterHistoryEntry['adjustment']): string {
  if (adjustment === 'increased') return 'Dificuldade aumentada';
  if (adjustment === 'decreased') return 'Dificuldade reduzida';
  return 'Dificuldade mantida';
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdaptationTimeline({ entries }: AdaptationTimelineProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="timeline"
        title="Adaptação ainda não iniciada"
        description="Complete mais sessões para o sistema começar a se adaptar ao seu ritmo"
      />
    );
  }

  const grouped = entries.reduce<Record<AdaptationArea, AdapterHistoryEntry[]>>(
    (acc, entry) => {
      const area = entry.area ?? 'all';
      acc[area].push(entry);
      return acc;
    },
    { grammar: [], pronunciation: [], vocabulary: [], all: [] },
  );

  const renderArea = (area: AdaptationArea) => {
    const areaEntries = grouped[area];
    if (areaEntries.length === 0) return null;

    return (
      <Card key={area} className="p-5 md:p-6">
        <h3 className="font-display text-xl font-semibold text-text-primary mb-3">{AREA_LABELS[area]}</h3>
        <div className="space-y-3">
          {areaEntries
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((entry, index) => (
              <div key={`${entry.date}-${entry.reason}-${index}`} className="relative rounded-xl border border-[var(--color-border-default)] p-4 bg-[var(--color-glass-bg)]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={zoneBadge(entry.zone)}>{zoneLabel(entry.zone)}</Badge>
                  <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
                </div>

                <p className="font-body text-sm text-text-primary">{adjustmentText(entry.adjustment)}</p>
                <p className="font-body text-xs text-text-muted mt-1">Motivo: {entry.reason}</p>

                {(entry.difficultyBefore || entry.previousDifficulty) &&
                  (entry.difficultyAfter || entry.newDifficulty) && (
                    <p className="font-body text-xs text-text-secondary mt-2">
                      {entry.difficultyBefore ?? entry.previousDifficulty} {'→'} {entry.difficultyAfter ?? entry.newDifficulty}
                    </p>
                  )}

                <p className="font-body text-xs text-text-secondary mt-1">
                  Zona anterior: {zoneLabel(entry.previousZone)} {'→'} Nova zona: {zoneLabel(entry.zone)}
                </p>
              </div>
            ))}
        </div>
      </Card>
    );
  };

  return <div className="space-y-4">{(['pronunciation', 'grammar', 'vocabulary', 'all'] as AdaptationArea[]).map(renderArea)}</div>;
}
