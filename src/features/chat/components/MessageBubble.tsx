import { cn } from '../../../lib/utils';
import type { ChatMessage } from '../../../stores/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isTutor = message.role === 'tutor';

  return (
    <div className={cn('flex', isTutor ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isTutor
            ? 'bg-chat-bubble-tutor text-chat-text rounded-bl-md'
            : 'bg-chat-bubble-user text-chat-text rounded-br-md',
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
}
