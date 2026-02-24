import { useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { Icon } from '../../../components/ui/Icon';

interface UserVideoPreviewProps {
  stream: MediaStream | null;
  hasVideo: boolean;
  isMuted: boolean;
  className?: string;
}

export function UserVideoPreview({ stream, hasVideo, isMuted, className }: UserVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && hasVideo) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, hasVideo]);

  return (
    <div
      className={cn(
        'relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden bg-chat-surface shadow-chat border border-white/10',
        className,
      )}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon name="person" size={32} className="text-chat-muted" />
        </div>
      )}

      {/* Mic indicator */}
      {isMuted && (
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-error/80 flex items-center justify-center">
          <Icon name="mic_off" size={14} className="text-white" />
        </div>
      )}
    </div>
  );
}
