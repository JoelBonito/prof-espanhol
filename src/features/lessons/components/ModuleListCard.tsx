import { Card } from '../../../components/ui/Card';
import { Icon } from '../../../components/ui/Icon';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import type { LessonModule } from '../lib/moduleCatalog';
import type { ModuleProgressState } from '../persistence';

interface ModuleListCardProps {
  userLevel: string;
  modules: LessonModule[];
  moduleProgress: Record<string, ModuleProgressState>;
  selectedModuleId: string | null;
  blockedMessage: string | null;
  onSelectModule: (module: LessonModule) => void;
}

export function ModuleListCard({
  userLevel,
  modules,
  moduleProgress,
  selectedModuleId,
  blockedMessage,
  onSelectModule,
}: ModuleListCardProps) {
  return (
    <Card className="p-4 md:p-5 h-fit lg:sticky lg:top-4">
      <div className="mb-3">
        <h2 className="font-display text-xl font-semibold text-neutral-900">Módulos {userLevel}</h2>
        <p className="font-body text-sm text-neutral-600">Desbloqueio progressivo por score mínimo de 60.</p>
      </div>

      <div className="space-y-2">
        {modules.map((module) => {
          const progress = moduleProgress[module.id];
          const locked = !progress?.unlocked;
          const selected = selectedModuleId === module.id;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelectModule(module)}
              className={[
                'w-full text-left rounded-xl border p-3 transition-all',
                selected ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300',
                locked ? 'opacity-75' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-body text-sm font-semibold text-neutral-800">{module.order}. {module.title}</p>
                <Icon name={locked ? 'lock' : 'lock_open'} size={20} className={locked ? 'text-neutral-400' : 'text-success'} />
              </div>
              <div className="mt-2">
                <ProgressBar value={progress?.score ?? 0} color={progress?.status === 'completed' ? 'success' : 'primary'} className="h-1" />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {progress?.status === 'completed'
                  ? `Concluído (${progress.score ?? 0}/100)`
                  : locked
                    ? 'Bloqueado'
                    : progress?.score
                      ? `Último score: ${progress.score}/100`
                      : 'Disponível'}
              </p>
            </button>
          );
        })}
      </div>

      {blockedMessage && (
        <p className="mt-3 text-sm text-warning font-medium">{blockedMessage}</p>
      )}
    </Card>
  );
}
