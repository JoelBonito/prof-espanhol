import { WeeklyActivity } from '../types/progress';

interface WeeklyEvolutionChartProps {
    data: WeeklyActivity[];
}

export function WeeklyEvolutionChart({ data }: WeeklyEvolutionChartProps) {
    const maxVal = Math.max(...data.flatMap(d => [d.completed, d.scheduled]), 1);
    const height = 120;

    return (
        <div className="w-full">
            <div className="flex items-end justify-between h-[120px] px-2 gap-2">
                {data.map((day) => {
                    const scheduledHeight = (day.scheduled / maxVal) * height;
                    const completedHeight = (day.completed / maxVal) * height;

                    return (
                        <div key={day.day} className="flex flex-col items-center flex-1 group relative">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap">
                                {day.completed}/{day.scheduled} sessões
                            </div>

                            <div className="w-full bg-white/5 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                {/* Scheduled Bar (Background) */}
                                <div
                                    className="absolute bottom-0 w-full bg-white/10 transition-all duration-500"
                                    style={{ height: `${scheduledHeight}px` }}
                                />
                                {/* Completed Bar (Foreground) */}
                                <div
                                    className="absolute bottom-0 w-full bg-primary-500 group-hover:bg-primary-600 transition-all duration-500 flex items-center justify-center"
                                    style={{ height: `${completedHeight}px` }}
                                >
                                    {day.completed > 0 && completedHeight > 20 && (
                                        <span className="text-[9px] font-bold text-white mb-1">
                                            {day.completed}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted mt-2 uppercase">
                                {day.day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
