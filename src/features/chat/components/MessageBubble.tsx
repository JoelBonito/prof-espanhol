import { cn } from '../../../lib/utils';
import type { ChatMessage } from '../../../stores/chatStore';
import { useChatStore } from '../../../stores/chatStore';
import { ReportFeedbackButton } from '../../feedback/components/ReportFeedbackButton';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isTutor = message.role === 'tutor';
  const sessionId = useChatStore((s) => s.sessionId);

  return (
    <div className={cn('flex', isTutor ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative group',
          isTutor
            ? 'bg-chat-bubble-tutor text-chat-text rounded-bl-md'
            : 'bg-chat-bubble-user text-chat-text rounded-br-md',
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>

        {isTutor && (
          <ReportFeedbackButton
            screen="Chat"
            content={message.text}
            sessionId={sessionId || undefined}
            className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
    </div>
  );
}
