import { useNavigate } from 'react-router';
import { useProgressData } from '../features/progress/hooks/useProgressData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { auth, db } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';


export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading } = useProgressData();
  const [lastDiagnosticDate, setLastDiagnosticDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      const date = snap.data()?.lastDiagnosticDate;
      if (date) {
        setLastDiagnosticDate(date.toDate ? date.toDate() : new Date(date));
      }
    }
    fetchUser();
  }, []);

  const daysSinceLastDiagnostic = lastDiagnosticDate ? differenceInDays(new Date(), lastDiagnosticDate) : 0;
  const showBanner = daysSinceLastDiagnostic >= 30;

  if (loading) {
    return <div className="p-10 animate-pulse space-y-4">
      <div className="h-10 w-48 bg-neutral-200 rounded" />
      <div className="h-32 w-full bg-neutral-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-40 bg-neutral-100 rounded-xl" />
        <div className="h-40 bg-neutral-100 rounded-xl" />
      </div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <header className="flex justify-between items-center px-4 md:px-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">¡Hola, {auth.currentUser?.displayName?.split(' ')[0] || 'Estudiante'}!</h1>
          <p className="text-neutral-500">Pronto para sua dose diária de espanhol?</p>
        </div>
        <div className="bg-primary-50 px-4 py-2 rounded-full border border-primary-100 hidden sm:block">
          <span className="text-primary-600 font-bold text-sm">Nível {data?.grammar.level || 'A1'}</span>
        </div>
      </header>

      {/* 30-Day Diagnostic Re-test Banner */}
      {showBanner && (
        <div className="mx-4 md:mx-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Icon name="history_edu" size={32} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Hora de medir seu progresso!</h3>
                <p className="text-primary-50 opacity-90 text-sm mt-1">
                  Já faz {formatDistanceToNow(lastDiagnosticDate!, { locale: ptBR })} desde seu último teste.
                  Refaça o diagnóstico para ver quanto você evoluiu!
                </p>
              </div>
            </div>
            <Button
              className="bg-white text-primary-600 hover:bg-neutral-50 shadow-md font-bold whitespace-nowrap"
              onClick={() => navigate('/diagnostic')}
            >
              Começar Re-teste
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
        <Card className="p-6 flex flex-col justify-between group hover:border-primary-200 transition-colors cursor-pointer" onClick={() => navigate('/lessons')}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-info-light rounded-xl text-info">
              <Icon name="school" size={28} />
            </div>
            <Icon name="arrow_forward" size={20} className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-neutral-900">Continuar Aprendendo</h3>
            <p className="text-neutral-500 text-sm mt-1">Sua próxima lição: Objeto Direto & Indireto</p>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between group hover:border-primary-200 transition-colors cursor-pointer" onClick={() => navigate('/chat')}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-warning-light rounded-xl text-warning">
              <Icon name="forum" size={28} />
            </div>
            <Icon name="arrow_forward" size={20} className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-neutral-900">Conversação em Tempo Real</h3>
            <p className="text-neutral-500 text-sm mt-1">Pratique sua fala com o Tutor AI agora.</p>
          </div>
        </Card>
      </div>

      <div className="px-4 md:px-0">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-bold text-neutral-900">Deveres</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>Ver tudo</Button>
          </div>
          <p className="text-sm text-neutral-500">
            Acesse a aba de deveres para ver seus exercícios de reforço e revisões pendentes.
          </p>
        </Card>
      </div>
    </div>
  );
}


