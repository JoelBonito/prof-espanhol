import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../../stores/chatStore';

export const MAX_SESSION_MS = 30 * 60 * 1000;

export function useSessionTimer(onExpired: () => void) {
  const status = useChatStore((s) => s.status);
  const startTime = useChatStore((s) => s.startTime);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (status === 'active' && startTime) {
      setElapsedMs(Date.now() - startTime);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_SESSION_MS) {
          onExpiredRef.current();
        }
      }, 1000);
    } else {
      setElapsedMs(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime]);

  return elapsedMs;
}
