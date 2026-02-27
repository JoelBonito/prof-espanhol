import { PhonemeStats } from '../types/progress';

interface PhonemeTrackerProps {
    phonemes: PhonemeStats[];
}

export function PhonemeTracker({ phonemes }: PhonemeTrackerProps) {
    const improved = phonemes.filter(p => p.status === 'improved');
    const pending = phonemes.filter(p => p.status === 'pending');

    return (
        <div className="bg-[var(--color-glass-bg)] p-5 rounded-default border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Fonemas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Melhorados */}
                <div className="bg-success-light border border-success/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-success text-sm font-bold uppercase tracking-wide">Melhorados</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {improved.length > 0 ? improved.map(p => (
                            <span
                                key={p.phoneme}
                                className="inline-flex items-center justify-center h-10 w-10 rounded bg-[var(--color-glass-bg)] shadow-[var(--shadow-card)] text-lg font-display font-bold text-text-primary"
                                title={`${p.accuracy}% de acerto`}
                            >
                                /{p.phoneme}/
                            </span>
                        )) : <span className="text-xs text-text-muted">Nenhum ainda</span>}
                    </div>
                </div>

                {/* Pendentes */}
                <div className="bg-warning-light border border-warning/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-warning text-sm font-bold uppercase tracking-wide">Pendentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {pending.length > 0 ? pending.map(p => (
                            <span
                                key={p.phoneme}
                                className="inline-flex items-center justify-center h-10 w-10 rounded bg-[var(--color-glass-bg)] shadow-[var(--shadow-card)] text-lg font-display font-bold text-text-primary"
                                title={`${p.accuracy}% de acerto`}
                            >
                                /{p.phoneme}/
                            </span>
                        )) : <span className="text-xs text-text-muted">Tudo em dia!</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
