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
        <div className="h-20 bg-neutral-200 rounded-lg" />
        <div className="h-64 bg-neutral-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-neutral-100 rounded-lg" />
          <div className="h-32 bg-neutral-100 rounded-lg" />
          <div className="h-32 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card status="error" className="p-10 text-center">
        <p className="text-neutral-600 font-medium">{error || 'Dados não disponíveis'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Meu Progresso</h1>
          <p className="font-body text-neutral-500 mt-1">
            Última atualização: {format(new Date(), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-card border border-neutral-100">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
              {data.grammar.level}
            </div>
            <span className="text-sm font-semibold text-neutral-700">Explorador</span>
          </div>

          <Button variant="secondary" size="sm" onClick={() => navigate('/diagnostic')}>
            <Icon name="refresh" size={18} />
            Refazer Diagnóstico
          </Button>
        </div>
      </header>

      {/* Monday Report Banner */}
      {isMon && (
        <div className="bg-info-light border border-info/10 rounded-lg p-5 flex items-start gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-bl-full -mr-8 -mt-8 rotate-12 transition-transform group-hover:scale-110" />
          <div className="bg-white p-2 rounded-lg shadow-sm text-info relative z-10">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div className="relative z-10">
            <h4 className="font-display text-lg font-bold text-info-text mb-1">Relatório Semanal Disponível</h4>
            <p className="text-sm text-info-text/80 leading-relaxed">
              Você completou <span className="font-bold underline">8 sessões</span> na semana passada e seu maior avanço foi em
              <span className="font-bold"> Pronúncia (+15%)</span>. Bom trabalho!
            </p>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Evolution */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Evolução Semanal</h2>
              <p className="text-xs text-neutral-500 mt-1">Sessões agendadas vs completadas</p>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl font-bold text-neutral-900 block">12</span>
              <div className="text-success text-xs font-bold flex items-center justify-end">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+20%</span>
              </div>
            </div>
          </div>
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
            <h3 className="font-display text-lg font-semibold text-neutral-900">Nível do Sistema</h3>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded">Dinamismo Ativo</span>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 mb-4 border border-neutral-100">
            <p className="text-sm text-neutral-600 italic">
              "O motor de adaptação está focando em exercícios de compreensão auditiva para equilibrar seu perfil de fluência."
            </p>
          </div>
          {adaptationEntries.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <AdaptationTimeline entries={adaptationEntries} />
            </div>
          ) : (
            <p className="text-sm text-neutral-400 text-center py-4">Ainda sem ajustes automáticos.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

