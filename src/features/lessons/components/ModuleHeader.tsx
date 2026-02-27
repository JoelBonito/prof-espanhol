import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import type { LessonModule } from '../lib/moduleCatalog';
import type { ModuleProgressState } from '../persistence';

interface ModuleHeaderProps {
  userLevel: string;
  modules: LessonModule[];
  moduleProgress: Record<string, ModuleProgressState>;
  selectedModuleId: string | null;
  blockedMessage: string | null;
  onSelectModule: (module: LessonModule) => void;
}

export function ModuleHeader({
  userLevel,
  modules,
  moduleProgress,
  selectedModuleId,
  blockedMessage,
  onSelectModule,
}: ModuleHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null;
  const selectedIndex = modules.findIndex((m) => m.id === selectedModuleId);
  const progress = selectedModule ? moduleProgress[selectedModule.id] : null;

  return (
    <>
      {/* Breadcrumb header */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-glass-bg)] backdrop-blur-sm px-4 py-3 transition-colors hover:border-[var(--color-border-active)]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-body text-xs uppercase tracking-wider text-text-muted">
              Módulo {selectedIndex + 1} de {modules.length}
            </span>
            <Badge variant="info" className="text-[10px] px-1.5 py-0">{userLevel}</Badge>
          </div>
          <p className="font-display text-base font-semibold text-text-primary truncate">
            {selectedModule?.title ?? 'Selecionar módulo'}
          </p>
          {progress && (
            <ProgressBar
              value={progress.score ?? 0}
              color={progress.status === 'completed' ? 'success' : 'primary'}
              className="h-1 mt-2"
            />
          )}
        </div>
        <Icon name="expand_more" size={24} className="text-text-muted shrink-0" />
      </button>

      {/* Bottom sheet overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-[var(--color-surface-dark)] border-t border-[var(--color-border-default)] rounded-t-3xl p-5 pb-8 animate-slide-up max-h-[70vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">
              Módulos {userLevel}
            </h2>
            <p className="font-body text-xs text-text-muted mb-4">
              Desbloqueio progressivo por score mínimo de 60.
            </p>

            <div className="space-y-2">
              {modules.map((module) => {
                const mp = moduleProgress[module.id];
                const locked = !mp?.unlocked;
                const selected = selectedModuleId === module.id;

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      onSelectModule(module);
                      if (!locked) setDrawerOpen(false);
                    }}
                    className={[
                      'w-full text-left rounded-xl border p-3 transition-all',
                      selected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-[var(--color-border-default)] bg-[var(--color-glass-bg)] hover:border-[var(--color-border-active)]',
                      locked ? 'opacity-60' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-body text-sm font-semibold text-text-primary">
                        {module.order}. {module.title}
                      </p>
                      <Icon
                        name={locked ? 'lock' : 'lock_open'}
                        size={18}
                        className={locked ? 'text-text-muted' : 'text-success'}
                      />
                    </div>
                    <ProgressBar
                      value={mp?.score ?? 0}
                      color={mp?.status === 'completed' ? 'success' : 'primary'}
                      className="h-1 mt-2"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      {mp?.status === 'completed'
                        ? `Concluído (${mp.score ?? 0}/100)`
                        : locked
                          ? 'Bloqueado'
                          : mp?.score
                            ? `Último score: ${mp.score}/100`
                            : 'Disponível'}
                    </p>
                  </button>
                );
              })}
            </div>

            {blockedMessage && (
              <p className="mt-3 text-sm text-warning font-medium">{blockedMessage}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
