import { isMonday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useProgressData } from '../features/progress/hooks/useProgressData';
import { WeeklyEvolutionChart } from '../features/progress/components/WeeklyEvolutionChart';
import { AreaScoreCard } from '../features/progress/components/AreaScoreCard';
import { PhonemeTracker } from '../features/progress/components/PhonemeTracker';
import { AdaptationTimeline } from '../features/progress/components/AdaptationTimeline';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AdapterHistoryEntry } from '../features/progress/types/adaptation';

export default function ProgressPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useProgressData();
  const [adaptationEntries, setAdaptationEntries] = useState<AdapterHistoryEntry[]>([]);
  const isMon = isMonday(new Date());

  // Adaptation History - separate fetch to keep existing logic but integrated
  useEffect(() => {
    async function loadAdaptation() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        const rawHistory = snapshot.data()?.adapterHistory;
        if (Array.isArray(rawHistory)) {
          setAdaptationEntries(rawHistory.slice(0, 10)); // Top 10 latest
        }
      } catch (err) {
        console.error('Failed to load adaptation history:', err);
      }
    }
    loadAdaptation();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white/10 rounded-lg" />
        <div className="h-64 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-white/5 rounded-lg" />
          <div className="h-32 bg-white/5 rounded-lg" />
          <div className="h-32 bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card status="error" className="p-10 text-center">
        <p className="text-text-secondary font-medium">{error || 'Dados não disponíveis'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Meu Progresso</h1>
          <p className="font-body text-text-muted mt-1">
            Última atualização: {format(new Date(), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--color-glass-bg)] px-3 py-1.5 rounded-full shadow-[var(--shadow-card)] border border-[var(--color-border-subtle)]">
            <div className="w-8 h-8 rounded-full bg-primary-500/100/15 flex items-center justify-center text-primary-500 font-bold text-xs">
              {data.grammar.level}
            </div>
            <span className="text-sm font-semibold text-text-secondary">Explorador</span>
          </div>

          <Button variant="secondary" size="sm" onClick={() => navigate('/diagnostic?type=retest&restart=1')}>
            <Icon name="refresh" size={18} />
            Refazer Diagnóstico
          </Button>
        </div>
      </header>

      {/* Monday Report Banner */}
      {isMon && (() => {
        const totalCompleted = data.weeklyActivity.reduce((sum, d) => sum + d.completed, 0);
        const pronChange = data.pronunciation.lastChange;
        return totalCompleted > 0 ? (
          <div className="bg-info-light border border-info/10 rounded-lg p-5 flex items-start gap-4 shadow-[var(--shadow-card)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-bl-full -mr-8 -mt-8 rotate-12 transition-transform group-hover:scale-110" />
            <div className="bg-[var(--color-glass-bg)] p-2 rounded-lg shadow-[var(--shadow-card)] text-info relative z-10">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div className="relative z-10">
              <h4 className="font-display text-lg font-bold text-info mb-1">Relatório Semanal Disponível</h4>
              <p className="text-sm text-info/80 leading-relaxed">
                Você completou{' '}
                <span className="font-bold underline">{totalCompleted} {totalCompleted === 1 ? 'sessão' : 'sessões'}</span>{' '}
                esta semana
                {pronChange !== 0 && (
                  <> e seu maior avanço foi em{' '}
                    <span className="font-bold">
                      Pronúncia ({pronChange > 0 ? '+' : ''}{pronChange}pts)
                    </span>
                  </>
                )}
                . Bom trabalho!
              </p>
            </div>
          </div>
        ) : null;
      })()}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Evolution */}
        <Card className="p-6">
          {(() => {
            const totalCompleted = data.weeklyActivity.reduce((sum, d) => sum + d.completed, 0);
            const totalScheduled = data.weeklyActivity.reduce((sum, d) => sum + d.scheduled, 0);
            const pct = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
            return (
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Evolução Semanal</h2>
                  <p className="text-xs text-text-muted mt-1">Sessões agendadas vs completadas</p>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-text-primary block">{totalCompleted}</span>
                  {totalScheduled > 0 && (
                    <div className={`text-xs font-bold flex items-center justify-end ${pct >= 50 ? 'text-success' : 'text-warning'}`}>
                      <span className="material-symbols-outlined text-sm">{pct >= 50 ? 'trending_up' : 'trending_down'}</span>
                      <span>{pct}% concluído</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <WeeklyEvolutionChart data={data.weeklyActivity} />
        </Card>

        {/* Areas Mastery */}
        <div className="grid grid-cols-1 gap-4">
          <AreaScoreCard title="Gramática" data={data.grammar} />
          <AreaScoreCard title="Compreensão" data={data.vocabulary} />
          <AreaScoreCard title="Pronúncia" data={data.pronunciation} />
        </div>
      </div>

      {/* Phonemes & Adaptation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhonemeTracker phonemes={data.phonemes} />

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold text-text-primary">Nível do Sistema</h3>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-1 rounded">Dinamismo Ativo</span>
          </div>
          <div className="bg-surface-dark rounded-lg p-4 mb-4 border border-[var(--color-border-subtle)]">
            <p className="text-sm text-text-secondary italic">
              "O motor de adaptação está focando em exercícios de compreensão auditiva para equilibrar seu perfil de fluência."
            </p>
          </div>
          {adaptationEntries.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <AdaptationTimeline entries={adaptationEntries} />
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">Ainda sem ajustes automáticos.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
