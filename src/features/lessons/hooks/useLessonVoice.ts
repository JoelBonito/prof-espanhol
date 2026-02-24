import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SpeakOptions {
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
}

interface LessonVoiceState {
  supported: boolean;
  speaking: boolean;
  speak: (text: string, options?: SpeakOptions) => boolean;
  stop: () => void;
}

export function useLessonVoice(): LessonVoiceState {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    [],
  );

  const stop = useCallback(() => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  }, [supported]);

  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!supported) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const pyVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('es-py'));
    if (pyVoice) return pyVoice;

    const anySpanish = voices.find((voice) => voice.lang.toLowerCase().startsWith('es-'));
    return anySpanish ?? null;
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions): boolean => {
      if (!supported || !text.trim()) return false;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice();

      utterance.lang = voice?.lang ?? 'es-ES';
      utterance.voice = voice;
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        options?.onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
      };
      utterance.onboundary = (event) => {
        if (typeof event.charIndex === 'number') {
          options?.onBoundary?.(event.charIndex);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [getPreferredVoice, supported],
  );

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  return { supported, speaking, speak, stop };
}
