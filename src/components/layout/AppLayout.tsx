import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      <BottomNav />
      <main className="lg:pl-[72px] xl:pl-[320px] pb-20 lg:pb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
