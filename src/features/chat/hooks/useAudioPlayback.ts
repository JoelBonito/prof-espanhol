import { useRef, useCallback, useEffect } from 'react';

/**
 * Play raw PCM audio from Gemini Live via Web Audio API.
 * Gemini sends base64-encoded PCM at 24kHz mono.
 */
export function useAudioPlayback() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const isPlayingRef = useRef(false);

  const getContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    return ctxRef.current;
  }, []);

  /**
   * Enqueue a chunk of base64 PCM audio for gapless playback.
   */
  const playChunk = useCallback(
    (base64Data: string, sampleRate = 24000) => {
      const ctx = getContext();
      if (ctx.state === 'suspended') ctx.resume();

      // Decode base64 to Int16 PCM
      const raw = atob(base64Data);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const buffer = ctx.createBuffer(1, float32.length, sampleRate);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // Schedule gapless: each chunk starts right after the previous one ends
      const now = ctx.currentTime;
      const startAt = Math.max(now, nextStartTime.current);
      source.start(startAt);
      nextStartTime.current = startAt + buffer.duration;

      isPlayingRef.current = true;
      source.onended = () => {
        if (ctx.currentTime >= nextStartTime.current - 0.01) {
          isPlayingRef.current = false;
        }
      };
    },
    [getContext],
  );

  const stop = useCallback(() => {
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    nextStartTime.current = 0;
    isPlayingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { playChunk, stop, isPlaying: () => isPlayingRef.current };
}
