import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <BottomNav />
      <main className="lg:pl-[72px] pb-20 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
