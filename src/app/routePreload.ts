import type { ComponentType } from 'react';

export type RouteImporter = () => Promise<{ default: ComponentType }>;

export const routeImporters: Record<string, RouteImporter> = {
  '/': () => import('../pages/HomePage'),
  '/lessons': () => import('../pages/LessonsPage'),
  '/homework': () => import('../pages/HomeworkPage'),
  '/schedule': () => import('../pages/SchedulePage'),
  '/progress': () => import('../pages/ProgressPage'),
  '/profile': () => import('../pages/ProfilePage'),
  '/chat': () => import('../pages/ChatPage'),
};

const preloadedPaths = new Set<string>();

function normalizePath(path: string): string {
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

export function preloadRoute(path: string): void {
  const normalized = normalizePath(path);
  const importer = routeImporters[normalized];

  if (!importer || preloadedPaths.has(normalized)) {
    return;
  }

  preloadedPaths.add(normalized);
  void importer().catch(() => {
    preloadedPaths.delete(normalized);
  });
}

// ChatPage (310KB) is deferred — preloaded on hover via preloadRoute('/chat') in HomePage
const DEFERRED_ROUTES = new Set(['/chat']);

export function preloadMainRoutes(): void {
  Object.keys(routeImporters)
    .filter((path) => !DEFERRED_ROUTES.has(path))
    .forEach((path) => preloadRoute(path));
}
