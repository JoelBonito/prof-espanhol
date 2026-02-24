import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../lib/utils';
import { formatDuration, scoreLabel, type SessionSummaryData } from '../lib/sessionSummary';

interface SessionSummaryProps {
  data: SessionSummaryData;
  onDone: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-primary-500';

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        {/* Track */}
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
          className="text-white/10" />
        {/* Progress */}
        <circle
          cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={cn('text-2xl font-bold', color)}>{score}</span>
        <span className="text-[10px] text-chat-muted">/ 100</span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  variant = 'default',
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const colors = {
    default: 'text-chat-text border-white/10',
    success: 'text-success border-success/20',
    warning: 'text-warning border-warning/20',
  };

  return (
    <div className={cn('bg-chat-surface rounded-xl p-4 border', colors[variant])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={18} className={cn('opacity-80', colors[variant])} />
        <span className="text-xs text-chat-muted">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-chat-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export function SessionSummary({ data, onDone }: SessionSummaryProps) {
  const {
    durationMs,
    phonemesCorrect,
    phonemesPending,
    overallScore,
    totalCorrections,
    messageCount,
  } = data;

  return (
    <div className="min-h-dvh bg-chat-bg text-chat-text flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
          <Icon name="check_circle" size={28} className="text-success" fill />
        </div>
        <h1 className="text-2xl font-display font-bold text-chat-text">Sessão concluída!</h1>
        <p className="text-sm text-chat-muted mt-1">Aqui está o resumo do que você praticou</p>
      </div>

      {/* Score ring */}
      <div className="flex flex-col items-center gap-2 pb-6">
        <ScoreRing score={overallScore} />
        <div className="text-center">
          <p className="text-sm font-semibold text-chat-text">{scoreLabel(overallScore)}</p>
          <p className="text-xs text-chat-muted">pontuação fonética</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <StatCard
          icon="timer"
          label="Duração"
          value={formatDuration(durationMs)}
          sub="tempo de prática"
        />
        <StatCard
          icon="forum"
          label="Mensagens"
          value={String(messageCount)}
          sub="trocas com o tutor"
        />
        <StatCard
          icon="check_circle"
          label="Fonemas corrigidos"
          value={phonemesCorrect.length === 0 ? '—' : phonemesCorrect.join(', ')}
          sub={`${phonemesCorrect.length} fonema${phonemesCorrect.length !== 1 ? 's' : ''} OK`}
          variant="success"
        />
        <StatCard
          icon="pending"
          label="Pendentes"
          value={phonemesPending.length === 0 ? 'Nenhum' : phonemesPending.join(', ')}
          sub={`${phonemesPending.length} a trabalhar`}
          variant={phonemesPending.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Corrections detail */}
      {totalCorrections > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-chat-muted mb-2">
            {totalCorrections} correção{totalCorrections !== 1 ? 'ões' : ''} feita{totalCorrections !== 1 ? 's' : ''} durante a sessão
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto px-4 pb-10 pt-4">
        <button
          onClick={onDone}
          className="w-full h-[52px] bg-primary-500 text-white rounded-[10px] font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Icon name="home" size={20} />
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
