import { AreaScore } from '../types/progress';

interface AreaScoreCardProps {
    title: string;
    data: AreaScore;
}

export function AreaScoreCard({ title, data }: AreaScoreCardProps) {
    const trendIcons = {
        up: '↑',
        down: '↓',
        stable: '→'
    };

    const trendColors = {
        up: 'text-success bg-success-light',
        down: 'text-error bg-error-light',
        stable: 'text-text-muted bg-white/5'
    };

    return (
        <div className="bg-[var(--color-glass-bg)] p-5 rounded-default border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-text-muted">{title}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-display text-2xl font-bold text-text-primary">{data.score}</span>
                        <span className="text-sm font-bold text-primary-500">{data.level}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendColors[data.trend]}`}>
                    <span>{trendIcons[data.trend]}</span>
                    <span>{Math.abs(data.lastChange)}%</span>
                </div>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.score}%` }}
                />
            </div>
        </div>
    );
}
