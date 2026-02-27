import { type ReactNode } from 'react';

export interface ChatLayoutProps {
  children: ReactNode;
}

// Full-screen immersive layout for chat sessions — no sidebar, no bottom nav
export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="min-h-dvh bg-app-bg text-text-primary">
      {children}
    </div>
  );
}
