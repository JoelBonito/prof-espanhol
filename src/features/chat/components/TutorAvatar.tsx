import { cn } from '../../../lib/utils';
import { Icon } from '../../../components/ui/Icon';

interface TutorAvatarProps {
  isSpeaking: boolean;
  className?: string;
}

export function TutorAvatar({ isSpeaking, className }: TutorAvatarProps) {
  return (
    <div className={cn('relative flex items-center justify-center p-2', className)}>
      {/* Container com Bordas Arredondadas e Efeito de Som */}
      <div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden border-2 bg-[#0A0B10] flex flex-col items-center justify-center transition-all duration-500",
          isSpeaking ? "border-primary-500 shadow-glow-orange" : "border-white/10"
        )}
      >
        {/* Ondas Sonoras Decorativas (Fundo) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className={cn(
            "w-32 h-32 rounded-full border border-primary-500/30 transition-all duration-1000",
            isSpeaking ? "scale-150 opacity-0" : "scale-100"
          )} />
          <div className={cn(
            "absolute w-24 h-24 rounded-full border border-primary-500/20 transition-all duration-700 delay-100",
            isSpeaking ? "scale-125 opacity-0" : "scale-100"
          )} />
        </div>

        {/* Microfone Estilizado (Stitch) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={cn(
            "p-4 rounded-full bg-primary-500/10 transition-transform duration-500",
            isSpeaking ? "scale-110" : "scale-100"
          )}>
            <Icon
              name="mic"
              size={48}
              className={cn(
                "transition-all duration-300",
                isSpeaking ? "text-primary-500 drop-shadow-[0_0_12px_rgba(255,140,66,0.8)]" : "text-white/40"
              )}
            />
          </div>
        </div>

        {/* Badge do Nome (Status) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isSpeaking ? "bg-success shadow-[0_0_8px_#22c55e] animate-pulse" : "bg-white/20"
          )} />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
            Tutor Elena (IA)
          </span>
        </div>
      </div>

      {/* Glow externo persistente suave */}
      <div className="absolute inset-0 bg-primary-500/5 blur-2xl -z-10 rounded-full" />

      {/* Animação de Ring quando fala */}
      {isSpeaking && (
        <div className="absolute -inset-1 rounded-3xl border-2 border-primary-500/20 animate-ping pointer-events-none" />
      )}
    </div>
  );
}
