import { type ReactNode, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { preloadMainRoutes } from '../../app/routePreload';

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('requestIdleCallback' in window && 'cancelIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => preloadMainRoutes());
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(() => preloadMainRoutes(), 120);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      <BottomNav />
      <main className="xl:pl-[320px] pb-20 xl:pb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
