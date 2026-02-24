import { useRef, useCallback, useEffect } from 'react';

/**
 * Keep screen awake during chat sessions (G-UX-11).
 * Uses Screen Wake Lock API with AudioContext fallback for Safari.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const request = useCallback(async () => {
    // Try native Wake Lock API first
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
        return;
      } catch {
        // Fall through to AudioContext fallback
      }
    }

    // Fallback: silent AudioContext keeps Safari awake
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // Play silent buffer every 15s to prevent sleep
    intervalRef.current = setInterval(() => {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
    }, 15_000);
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      await audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  return { request, release };
}
