import { useSyncExternalStore } from 'react';

const QUERY = '(orientation: landscape) and (min-width: 768px)';

let currentValue = typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false;

function subscribe(cb: () => void) {
  const mql = window.matchMedia(QUERY);
  const handler = () => { currentValue = mql.matches; cb(); };
  mql.addEventListener('change', handler);
  currentValue = mql.matches;
  return () => mql.removeEventListener('change', handler);
}

function getSnapshot() {
  return currentValue;
}

function getServerSnapshot() {
  return false;
}

export function useIsLandscape() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
