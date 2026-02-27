import { useNavigate } from 'react-router';
import { useProgressData } from '../features/progress/hooks/useProgressData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth } from '../lib/firebase';
import { getCachedUserDoc } from '../lib/userCache';
import { useEffect, useState } from 'react';
import { preloadRoute } from '../app/routePreload';

export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading } = useProgressData();
  const [lastDiagnosticDate, setLastDiagnosticDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!auth.currentUser) return;
      const data = await getCachedUserDoc();
      const date = data.lastDiagnosticDate;
      if (date) {
        setLastDiagnosticDate(
          typeof date === 'object' && 'toDate' in (date as object)
            ? (date as { toDate: () => Date }).toDate()
            : new Date(date as string),
        );
      }
    }
    fetchUser();
  }, []);

  const daysSinceLastDiagnostic = lastDiagnosticDate ? differenceInDays(new Date(), lastDiagnosticDate) : 0;
  const showBanner = daysSinceLastDiagnostic >= 30;

  if (loading) {
    return (
      <div className="p-6 lg:p-10 animate-pulse space-y-6">
        <div className="h-10 w-64 bg-white/10 rounded-xl" />
        <div className="h-32 w-full bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 bg-white/5 rounded-xl" />
          <div className="lg:col-span-5 h-80 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-8 max-w-7xl mx-auto relative">
      {/* Mesh Gradient Background (Stitch Style) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-500/10 rounded-full blur-[140px] animate-float opacity-50" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-600/5 rounded-full blur-[120px] animate-float-slow opacity-40" />
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse opacity-30" />
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-scale-in">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            ¡Hola, {auth.currentUser?.displayName?.split(' ')[0] || 'Estudiante'}!
          </h1>
          <p className="text-text-secondary text-sm lg:text-base opacity-70">
            ¿Listo para tu dosis diaria de español?
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="level" className="shadow-glow-orange/10 border-success/20 text-base md:text-lg px-3 py-1.5">
            {data?.grammar.level || 'A1'}
          </Badge>
          <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold mr-0.5">Nivel Actual</span>
        </div>
      </header>

      {/* 30-Day Diagnostic Re-test Banner */}
      {showBanner && (
        <div className="premium-card p-6 relative overflow-hidden group animate-scale-in [animation-delay:100ms]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="glass-panel border-primary-500/20 p-2.5 rounded-xl flex-shrink-0">
                <Icon name="history_edu" size={24} className="text-primary-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Hora de medir seu progresso!
                </h3>
                <p className="text-text-secondary text-xs mt-0.5 opacity-80">
                  Já faz {formatDistanceToNow(lastDiagnosticDate!, { locale: ptBR })} desde seu último teste.
                  Refaça o diagnóstico para ver quanto você evoluiu!
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/diagnostic?type=retest&restart=1')}
              className="whitespace-nowrap flex-shrink-0 shadow-glow-orange h-9 px-6 font-bold text-xs"
            >
              Começar Re-teste
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Hero Card - Conversação em Tempo Real */}
        <div className="lg:col-span-7 animate-scale-in [animation-delay:200ms] flex">
          <Card
            variant="premium"
            className="w-full p-6 lg:p-10 flex flex-col items-center justify-center text-center group cursor-pointer border-primary-500/20 hover:border-primary-500/40 transition-all duration-500"
            onClick={() => navigate('/chat')}
            onMouseEnter={() => preloadRoute('/chat')}
            onTouchStart={() => preloadRoute('/chat')}
          >
            {/* Mic Icon with rings */}
            <div className="relative mb-6">
              <div className="absolute inset-[-15%] bg-primary-500/20 rounded-full blur-[40px] group-hover:bg-primary-500/40 transition-colors duration-500" />
              <div className="relative w-28 h-28 rounded-full border border-primary-500/30 flex items-center justify-center bg-surface-dark/40 backdrop-blur-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-400/30 flex items-center justify-center animate-pulse shadow-glow-orange/50">
                  <Icon name="mic" size={40} className="text-primary-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </div>

            {/* Content */}
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-primary mb-2">
              Conversación Real
            </h2>
            <p className="text-text-secondary text-sm lg:text-base max-w-[280px] mb-6 opacity-70">
              Pratique sua fala com o Tutor AI agora mesmo.
            </p>

            {/* CTA Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/10 border border-primary-400/30 text-primary-400 text-xs font-bold tracking-widest group-hover:bg-primary-500/20 group-hover:border-primary-400 transition-all duration-300 shadow-sm scale-100 group-hover:scale-105">
              <span>TOQUE PARA COMEÇAR</span>
              <Icon name="arrow_forward" size={14} className="animate-bounce-x" />
            </div>
          </Card>
        </div>

        {/* Secondary Card - Continuar Aprendendo */}
        <div className="lg:col-span-5 animate-scale-in [animation-delay:300ms] flex">
          <Card
            variant="interactive"
            className="w-full p-6 lg:p-8 flex flex-col justify-between hover:shadow-glow-subtle transition-all duration-500"
            onClick={() => navigate('/lessons')}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 shadow-inner">
                <Icon name="school" size={28} className="text-blue-400" />
              </div>
              <Icon
                name="arrow_forward"
                size={22}
                className="text-text-muted group-hover:text-primary-400 transition-all duration-300"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-text-primary mb-1">
                  Continuar
                </h3>
                <p className="text-text-secondary text-xs lg:text-sm font-medium opacity-60">
                  Próxima: Objeto Direto & Indireto
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-muted font-bold tracking-wider uppercase opacity-80">Progresso da Unidade</span>
                  <span className="text-text-primary font-bold">45%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                  <div
                    className="h-full w-[45%] bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Deveres Section */}
      <div className="animate-scale-in [animation-delay:400ms]">
        <Card variant="glass" className="p-6 lg:p-7 border-white/5 hover:border-white/10 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary-500/10">
                <Icon name="assignment" size={20} className="text-primary-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary tracking-tight">Deveres</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/homework')} className="text-primary-400 hover:text-primary-300 font-bold text-xs h-8 px-3">
              Ver tudo
            </Button>
          </div>
          <p className="text-sm lg:text-base text-text-secondary opacity-60 leading-relaxed max-w-2xl">
            Acesse a aba de deveres para ver seus exercícios de reforço e revisões pendentes.
          </p>
        </Card>
      </div>
    </div>
  );
}
