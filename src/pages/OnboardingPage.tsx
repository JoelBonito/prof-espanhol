import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useOnboardingStore } from '../stores/onboardingStore';
import { cn } from '../lib/utils';

const TOTAL = 3;

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  function advance() {
    if (current < TOTAL - 1) {
      setCurrent((c) => c + 1);
    } else {
      finish();
    }
  }

  function finish() {
    completeOnboarding();
    navigate('/diagnostic');
  }

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      <header className="px-6 pt-12 pb-2 flex justify-end">
        <button
          onClick={finish}
          className="flex items-center gap-0.5 text-neutral-500 hover:text-primary-500 font-medium text-sm transition-colors p-2 -mr-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Pular onboarding"
        >
          Pular
          <Icon name="chevron_right" size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-md mx-auto px-6">
        {current === 0 && <Slide1 />}
        {current === 1 && <Slide2 />}
        {current === 2 && <Slide3 />}
      </main>

      <footer className="px-6 pb-10 pt-4 flex flex-col items-center gap-6 w-full max-w-md mx-auto">
        <div className="flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                i === current ? 'w-8 bg-primary-500' : 'w-2.5 bg-neutral-200',
              )}
            />
          ))}
        </div>

        <Button size="lg" className="w-full" onClick={advance}>
          {current === TOTAL - 1 ? 'Começar Teste' : 'Próximo'}
          <Icon name="arrow_forward" size={20} />
        </Button>
      </footer>
    </div>
  );
}

// ─── Slide 1: O que é o Espanhol? ────────────────────────────────────────────

function Slide1() {
  return (
    <div className="flex flex-col items-center text-center w-full pt-4">
      <div className="relative w-full aspect-[4/5] max-h-[46vh] flex items-center justify-center mb-8">
        <div className="absolute w-56 h-56 bg-primary-100 rounded-full blur-3xl -z-10" />
        <div className="relative w-full h-full rounded-2xl bg-white ring-1 ring-black/5 shadow-elevated flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8">
            <span className="text-8xl select-none" role="img" aria-label="Tutora">
              👩‍🏫
            </span>
            <div className="w-16 h-1 rounded-full bg-primary-100" />
            <span className="font-body text-neutral-400 text-sm tracking-widest uppercase">
              Tutor AI
            </span>
          </div>
        </div>
      </div>

      <h1 className="font-display text-neutral-900 text-3xl font-bold leading-tight tracking-tight mb-3">
        O que é o Espanhol?
      </h1>
      <p className="font-body text-neutral-500 text-base leading-relaxed max-w-xs">
        Seu tutor particular de espanhol com inteligência artificial. Ele vê, ouve e conversa com
        você em tempo real — sem julgamento, sem vergonha.
      </p>
    </div>
  );
}

// ─── Slide 2: Como funciona? ──────────────────────────────────────────────────

const PROCESS_STEPS = [
  { emoji: '📋', label: 'Diagnóstico' },
  { emoji: '🗣️', label: 'Lições' },
  { emoji: '📅', label: 'Agenda' },
];

const HOW_STEPS = [
  'Teste diagnóstico avalia seu nível em gramática, escuta e pronúncia',
  'Lições e conversas adaptam ao seu ritmo',
  'Agenda fixa + deveres com prazo garantem disciplina',
];

function Slide2() {
  return (
    <div className="flex flex-col w-full pt-4">
      <div className="w-full aspect-[4/3] max-h-[36vh] rounded-2xl bg-white ring-1 ring-black/5 shadow-card flex items-center justify-center mb-8">
        <div className="flex items-center gap-3 px-6 w-full">
          {PROCESS_STEPS.map(({ emoji, label }, i) => (
            <Fragment key={label}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl">
                  {emoji}
                </div>
                <span className="text-xs font-medium text-neutral-500">{label}</span>
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <div className="flex-1 border-t-2 border-dashed border-primary-200 mb-5" />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <h1 className="font-display text-neutral-900 text-3xl font-bold leading-tight tracking-tight mb-6">
        Como funciona?
      </h1>

      <div className="flex flex-col gap-5">
        {HOW_STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center">
              <span className="text-primary-500 font-bold text-sm">{i + 1}</span>
            </div>
            <p className="text-neutral-800 text-[15px] leading-relaxed font-medium pt-1">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 3: Vamos começar! ──────────────────────────────────────────────────

const FEATURES = [
  { icon: 'school', label: 'Gramática' },
  { icon: 'hearing', label: 'Compreensão' },
  { icon: 'record_voice_over', label: 'Pronúncia' },
];

function Slide3() {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full h-[40vh] min-h-[240px] rounded-2xl bg-amber-50 overflow-hidden mb-6 flex items-center justify-center">
        <span className="text-9xl select-none" role="img" aria-label="Tutora">
          👩
        </span>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-neutral-50 to-transparent" />
        <div
          className="absolute top-5 left-5 animate-bounce"
          style={{ animationDuration: '3s' }}
          aria-hidden="true"
        >
          <div className="bg-white px-4 py-2 rounded-xl rounded-bl-none shadow-md border border-primary-100 -rotate-3">
            <span className="font-display italic font-bold text-lg text-neutral-900">¡Hola!</span>
          </div>
        </div>
      </div>

      <h1 className="font-display text-neutral-900 text-4xl font-bold leading-tight tracking-tight mb-3">
        Vamos começar!
      </h1>
      <p className="font-body text-neutral-500 text-base leading-relaxed mb-6">
        Primeiro, vamos descobrir seu nível de espanhol. O teste dura cerca de 15 minutos e avalia:
      </p>

      <div className="flex flex-col gap-2.5">
        {FEATURES.map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-3.5 rounded-[10px] bg-white shadow-card border border-primary-100"
          >
            <Icon name={icon} size={24} className="text-primary-500" />
            <span className="font-body text-neutral-800 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
