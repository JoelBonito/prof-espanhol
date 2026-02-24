import { useRef, useEffect } from 'react';
import { useChatStore } from '../../../stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { CorrectionCard } from './CorrectionCard';

export function MessageFeed() {
  const messages = useChatStore((s) => s.messages);
  const corrections = useChatStore((s) => s.corrections);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, corrections.length]);

  // Interleave messages and corrections by timestamp
  const items = [
    ...messages.map((m) => ({ type: 'message' as const, data: m, ts: m.timestamp })),
    ...corrections.map((c) => ({ type: 'correction' as const, data: c, ts: c.timestamp })),
  ].sort((a, b) => a.ts - b.ts);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-chat-muted">Aguardando conversa...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
      {items.map((item) =>
        item.type === 'message' ? (
          <MessageBubble key={item.data.id} message={item.data} />
        ) : (
          <CorrectionCard key={`corr-${item.ts}`} correction={item.data} />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
