import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { cn } from '../../lib/utils';
import { ReportFeedbackButton } from '../feedback/components/ReportFeedbackButton';

interface DiagnosticResultData {
    overallScore: number;
    level: string;
    grammarScore: number;
    listeningScore: number;
    pronunciationScore: number;
    strengths: string[];
    weaknesses: string[];
    phonemesToWork: string[];
}

interface EvolutionComparisonViewProps {
    current: DiagnosticResultData;
    previous: DiagnosticResultData;
}

const LEVEL_COLORS: Record<string, string> = {
    A1: 'bg-neutral-400',
    A2: 'bg-sky-500',
    B1: 'bg-primary-500',
    B2: 'bg-accent',
    C1: 'bg-success',
};

export function EvolutionComparisonView({ current, previous }: EvolutionComparisonViewProps) {
    const navigate = useNavigate();
    const levelImproved = current.level > previous.level; // Simple string comparison works for A1, A2, B1...

    return (
        <div className="min-h-dvh bg-neutral-50 flex flex-col p-6 max-w-4xl mx-auto w-full">
            <header className="text-center mb-10 relative">
                <h1 className="font-display text-3xl font-bold text-neutral-900">Sua Evolução</h1>
                <p className="text-neutral-500 mt-2 italic">Veja o quanto você evoluiu nos últimos 30 dias!</p>
                <ReportFeedbackButton
                    screen="EvolutionComparison"
                    content={`Prev Level: ${previous.level}, New Level: ${current.level}`}
                    className="absolute right-0 top-0"
                />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Previous Results */}
                <ComparisonCard
                    title="Anterior"
                    result={previous}
                    isSecondary
                />

                {/* Current Results */}
                <ComparisonCard
                    title="Agora"
                    result={current}
                    isHighlight
                    improvement={current.overallScore - previous.overallScore}
                />
            </div>

            {/* Celebration Message */}
            {levelImproved ? (
                <div className="bg-success-light border border-success/20 rounded-2xl p-6 flex items-center gap-5 mb-10 animate-reveal">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-success">
                        <Icon name="celebration" size={32} />
                    </div>
                    <div>
                        <h4 className="font-display text-xl font-bold text-neutral-900">Parabéns! Você subiu de nível!</h4>
                        <p className="text-neutral-700">De <span className="font-bold">{previous.level}</span> para <span className="font-bold text-success">{current.level}</span>. Novos conteúdos foram desbloqueados.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 flex items-center gap-5 mb-10">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-primary-500">
                        <Icon name="trending_up" size={32} />
                    </div>
                    <div>
                        <h4 className="font-display text-xl font-bold text-neutral-900">Continue firme!</h4>
                        <p className="text-neutral-700">Seu desempenho em <span className="font-bold">Pronúncia</span> melhorou bastante. Vamos focar nos fonemas pendentes para atingir o próximo nível.</p>
                    </div>
                </div>
            )}

            <footer className="mt-auto">
                <Button size="lg" className="w-full" onClick={() => navigate('/')}>
                    Ir para o Dashboard
                    <Icon name="arrow_forward" size={20} />
                </Button>
            </footer>
        </div>
    );
}

function ComparisonCard({
    title,
    result,
    isSecondary,
    isHighlight,
    improvement
}: {
    title: string;
    result: DiagnosticResultData;
    isSecondary?: boolean;
    isHighlight?: boolean;
    improvement?: number;
}) {
    const levelColor = LEVEL_COLORS[result.level] ?? 'bg-primary-500';

    return (
        <div className={cn(
            "bg-white rounded-2xl border p-6 flex flex-col gap-6 relative overflow-hidden",
            isSecondary ? "border-neutral-200 opacity-70" : "border-primary-200 shadow-elevated",
            isHighlight && "ring-2 ring-primary-500/20"
        )}>
            {improvement !== undefined && improvement > 0 && (
                <div className="absolute top-4 right-4 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    +{improvement} pts
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{title}</span>
                    <h3 className={cn("text-2xl font-bold font-display mt-1", isHighlight ? "text-neutral-900" : "text-neutral-500")}>
                        Nível {result.level}
                    </h3>
                </div>
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white font-display text-xl font-bold shadow-lg", levelColor)}>
                    {result.level}
                </div>
            </div>

            <div className="space-y-4">
                <ScoreRow label="Gramática" score={result.grammarScore} color={isHighlight ? "primary" : "neutral"} />
                <ScoreRow label="Compreensão" score={result.listeningScore} color={isHighlight ? "info" : "neutral"} />
                <ScoreRow label="Pronúncia" score={result.pronunciationScore} color={isHighlight ? "warning" : "neutral"} />
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between items-baseline">
                <span className="text-sm text-neutral-500 font-medium">Nota Final</span>
                <span className={cn("text-xl font-display font-bold", isHighlight ? "text-primary-500" : "text-neutral-400")}>
                    {result.overallScore}/100
                </span>
            </div>
        </div>
    );
}

function ScoreRow({ label, score, color }: { label: string; score: number; color: "primary" | "info" | "warning" | "neutral" }) {
    const barColors = {
        primary: 'bg-primary-500',
        info: 'bg-info',
        warning: 'bg-warning',
        neutral: 'bg-neutral-300'
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-neutral-500">
                <span>{label}</span>
                <span>{score}</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", barColors[color])} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}
