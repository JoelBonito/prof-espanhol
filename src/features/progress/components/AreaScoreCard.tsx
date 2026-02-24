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
        stable: 'text-neutral-500 bg-neutral-100'
    };

    return (
        <div className="bg-white p-5 rounded-default border border-neutral-100 shadow-card">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-display text-2xl font-bold text-neutral-900">{data.score}</span>
                        <span className="text-sm font-bold text-primary-500">{data.level}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendColors[data.trend]}`}>
                    <span>{trendIcons[data.trend]}</span>
                    <span>{Math.abs(data.lastChange)}%</span>
                </div>
            </div>

            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                    style={{ width: `${data.score}%` }}
                />
            </div>
        </div>
    );
}
