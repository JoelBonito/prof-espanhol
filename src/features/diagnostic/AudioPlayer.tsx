import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { cn } from '../../lib/utils';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'done' | 'error';

const LOAD_TIMEOUT_MS = 10_000;
// Bar heights (%) define the static waveform shape
const WAVEFORM_BARS = [35, 60, 80, 100, 75, 90, 55, 70, 45, 85, 65, 50, 40, 75, 55];

interface AudioPlayerProps {
  text: string;
  /** Called once the audio finishes playing (not on replay). */
  onEnded?: () => void;
}

export function AudioPlayer({ text, onEnded }: AudioPlayerProps) {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasEndedOnceRef = useRef(false);

  // Cancel speech when the text changes (question advances)
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text]);

  function speak() {
    if (!window.speechSynthesis) {
      setStatus('error');
      return;
    }

    window.speechSynthesis.cancel();
    setStatus('loading');

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es';
    u.rate = 0.88;
    u.pitch = 1.0;

    // Try to pick a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find((v) => v.lang === 'es-419' || v.lang === 'es-MX' || v.lang === 'es-AR') ??
      voices.find((v) => v.lang.startsWith('es')) ??
      null;
    if (spanishVoice) u.voice = spanishVoice;

    utteranceRef.current = u;

    // 10-second timeout if onstart never fires
    timeoutRef.current = setTimeout(() => {
      window.speechSynthesis.cancel();
      setStatus('error');
    }, LOAD_TIMEOUT_MS);

    u.onstart = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus('playing');
    };

    u.onend = () => {
      setStatus('done');
      if (!hasEndedOnceRef.current) {
        hasEndedOnceRef.current = true;
        onEnded?.();
      }
    };

    u.onerror = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus('error');
    };

    window.speechSynthesis.speak(u);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setStatus('idle');
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2 text-error">
          <Icon name="error_outline" size={20} />
          <span className="font-body text-sm font-medium">
            Áudio não carregou. Verifique sua conexão.
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setStatus('idle');
          }}
        >
          <Icon name="replay" size={20} />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Play row */}
      <div className="flex items-center gap-5 w-full">
        {/* Play / Stop button */}
        <button
          onClick={isPlaying ? stop : speak}
          disabled={isLoading}
          aria-label={isPlaying ? 'Parar áudio' : 'Reproduzir áudio'}
          className={cn(
            'shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150 shadow-elevated',
            isLoading
              ? 'bg-neutral-200 cursor-wait'
              : 'bg-primary-500 hover:bg-primary-600 active:scale-95 cursor-pointer',
          )}
        >
          {isLoading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Icon
              name={isPlaying ? 'stop' : 'play_arrow'}
              size={48}
              fill
              className="text-white"
            />
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 flex flex-col gap-2">
          <Waveform playing={isPlaying} />
          <div className="flex items-center justify-between px-0.5">
            <span className="font-mono text-xs text-neutral-500">
              {isPlaying ? '▶ reproduzindo…' : status === 'done' ? '✓ concluído' : 'pronto'}
            </span>
            <span className="text-xs text-neutral-400 uppercase tracking-wider">Espanhol</span>
          </div>
        </div>
      </div>

      {/* Replay */}
      {(status === 'done' || isPlaying) && (
        <button
          onClick={speak}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 font-semibold text-sm transition-colors"
        >
          <Icon name="replay" size={20} />
          Ouvir novamente
        </button>
      )}
    </div>
  );
}

// ─── Waveform ─────────────────────────────────────────────────────────────────

function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end h-12 gap-[3px]" aria-hidden="true">
      {WAVEFORM_BARS.map((heightPct, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-full transition-colors duration-300')}
          style={{
            height: `${heightPct}%`,
            backgroundColor: playing
              ? 'var(--color-primary-500)'
              : 'var(--color-neutral-200)',
            ...(playing && {
              animation: 'waveform 0.8s ease-in-out infinite',
              animationDelay: `${i * 0.055}s`,
            }),
          }}
        />
      ))}
    </div>
  );
}
