import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';

interface DailyGoalsCardProps {
  className?: string;
  streak?: number;
  xpToday?: number;
  xpGoal?: number;
}

export function DailyGoalsCard({
  className,
  streak = 0,
  xpToday = 0,
  xpGoal = 500,
}: DailyGoalsCardProps) {
  const xpPercent = xpGoal > 0 ? Math.min((xpToday / xpGoal) * 100, 100) : 0;

  return (
    <section className={cn('premium-card p-8', className)}>
      <h2 className="font-display text-2xl font-bold text-text-primary mb-6">
        Metas Diárias
      </h2>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Ofensiva de dias</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-500">{streak}</span>
            <Icon name="local_fire_department" size={20} fill className="text-primary-500" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">XP de hoje</span>
          <span className="text-xl font-bold text-text-primary">{xpToday} / {xpGoal}</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-[0_0_10px_rgba(255,140,66,0.2)] transition-all duration-1000 ease-out"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
