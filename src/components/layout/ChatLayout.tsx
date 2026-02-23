import { type ReactNode } from 'react';

export interface ChatLayoutProps {
  children: ReactNode;
}

// Full-screen dark mode layout for chat sessions (G-DS-04)
// No sidebar, no bottom nav — immersive mode
export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="min-h-screen bg-chat-bg text-chat-text">
      {children}
    </div>
  );
}
