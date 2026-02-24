import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { functions, httpsCallable } from '../../../lib/functions';
import { useChatStore } from '../../../stores/chatStore';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useWakeLock } from '../hooks/useWakeLock';
import { useUserMedia } from '../hooks/useUserMedia';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { buildSessionSummary } from '../lib/sessionSummary';
import { ChatHeader } from './ChatHeader';
import { TutorAvatar } from './TutorAvatar';
import { UserVideoPreview } from './UserVideoPreview';
import { MessageFeed } from './MessageFeed';
import { ChatControls } from './ChatControls';
import { TextFallbackInput } from './TextFallbackInput';

const MAX_SESSION_MS = 30 * 60 * 1000; // RN08: 30 min

interface CompleteChatSessionInput {
  sessionId: string;
  durationMs: number;
  phonemesCorrected: string[];
  phonemesPending: string[];
  overallScore: number;
  totalCorrections: number;
  messageCount: number;
}

const completeChatSessionFn = httpsCallable<CompleteChatSessionInput, { ok: boolean }>(
  functions,
  'completeChatSession',
);

export function ChatContainer() {
  const navigate = useNavigate();
  const status = useChatStore((s) => s.status);
  const isMuted = useChatStore((s) => s.isMuted);
  const isRecording = useChatStore((s) => s.isRecording);
  const elapsedMs = useChatStore((s) => s.elapsedMs);
  const startTime = useChatStore((s) => s.startTime);

  const { connect, reconnect, sendAudio, sendText, disconnect, setAudioHandler } = useGeminiLive();
  const wakeLock = useWakeLock();
  const media = useUserMedia();
  const audio = useAudioPlayback();
  const audioCapture = useAudioCapture(sendAudio);

  const isTutorSpeaking = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false); // prevent double-end
  const expiredPromptOpenRef = useRef(false);

  const handleToggleMute = useCallback(() => {
    useChatStore.getState().toggleMute();
  }, []);

  const handleEnd = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;

    // Stop media + audio before reading store (prevents re-renders)
    audioCapture.stop();
    audio.stop();
    media.stop();
    wakeLock.release();
    disconnect();

    // Snapshot store BEFORE reset
    const state = useChatStore.getState();
    const summary = buildSessionSummary({
      sessionId: state.sessionId ?? '',
      durationMs: state.elapsedMs,
      corrections: state.corrections,
      messageCount: state.messages.filter((m) => m.role === 'user').length,
    });

    // Save to Firestore (fire-and-forget — don't block navigation)
    if (summary.sessionId) {
      completeChatSessionFn({
        sessionId: summary.sessionId,
        durationMs: summary.durationMs,
        phonemesCorrected: summary.phonemesCorrect,
        phonemesPending: summary.phonemesPending,
        overallScore: summary.overallScore,
        totalCorrections: summary.totalCorrections,
        messageCount: summary.messageCount,
      }).catch((err) => console.error('Session save failed:', err));
    }

    // Reset store then navigate to summary
    useChatStore.getState().reset();
    navigate('/session-summary', { state: summary, replace: true });
  }, [audioCapture, audio, media, wakeLock, disconnect, navigate]);

  // Elapsed time ticker
  useEffect(() => {
    if (status === 'active' && startTime) {
      timerRef.current = setInterval(() => {
        useChatStore.getState().setElapsedMs(Date.now() - startTime);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, startTime]);

  // Auto-end at 30 min (RN08)
  useEffect(() => {
    if (elapsedMs >= MAX_SESSION_MS && status === 'active') {
      handleEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedMs, status]);

  // Wire audio playback to Gemini Live audio responses
  useEffect(() => {
    setAudioHandler((data: string, _mime: string) => {
      audio.playChunk(data);
      isTutorSpeaking.current = true;
    });
  }, [setAudioHandler, audio]);

  // Initialize session
  const handleInit = useCallback(async () => {
    try {
      const stream = await media.start();
      if (!stream) return;

      await wakeLock.request();
      await connect();

      // Start capturing mic audio
      audioCapture.start(stream);
      useChatStore.getState().setRecording(true);
    } catch (err) {
      console.error('Chat init failed:', err);
      useChatStore.getState().setStatus('error');
    }
  }, [media, wakeLock, connect, audioCapture]);

  // Start session on mount
  useEffect(() => {
    void handleInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'expired' || expiredPromptOpenRef.current) {
      return;
    }

    expiredPromptOpenRef.current = true;
    const shouldReconnect = window.confirm('Sessao expirou. Deseja continuar?');

    if (shouldReconnect) {
      reconnect()
        .catch((err) => {
          console.error('Reconnection prompt flow failed:', err);
        })
        .finally(() => {
          expiredPromptOpenRef.current = false;
        });
      return;
    }

    expiredPromptOpenRef.current = false;
    void handleEnd();
  }, [status, reconnect, handleEnd]);

  // Sync mute state with media tracks
  useEffect(() => {
    media.toggleMute(isMuted);
  }, [isMuted, media]);

  const isActive = status === 'active';
  const isFallbackText = status === 'fallback_text';
  const isConnecting = status === 'connecting' || status === 'reconnecting';

  return (
    <div className="relative flex flex-col h-dvh overflow-hidden">
      <ChatHeader elapsedMs={elapsedMs} onExit={handleEnd} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-14">
        {/* Left: Tutor avatar (center on mobile, left 60% on desktop) */}
        <div className="flex items-center justify-center lg:flex-[3] lg:relative bg-gradient-to-b from-chat-bg to-chat-surface/30 p-6">
          <TutorAvatar isSpeaking={isActive && !isMuted} />

          {/* User video PiP — top right corner */}
          <div className="absolute top-16 right-4 lg:top-4">
            <UserVideoPreview
              stream={media.stream}
              hasVideo={media.hasVideo}
              isMuted={isMuted}
            />
          </div>
        </div>

        {/* Right: Transcript + controls (bottom on mobile, right 40% on desktop) */}
        <div className="flex flex-col flex-1 lg:flex-[2] min-h-0">
          {/* Connection status */}
          {isConnecting && (
            <div className="flex items-center justify-center gap-2 py-3 bg-chat-surface/50">
              <span className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              <span className="text-sm text-chat-muted">
                {status === 'reconnecting' ? 'Reconectando...' : 'Conectando...'}
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center justify-center gap-2 py-3 bg-error/10">
              <span className="text-sm text-error">Erro na conexão. Tente novamente.</span>
            </div>
          )}

          {isFallbackText && (
            <div className="flex items-center justify-center gap-2 py-3 bg-warning/10">
              <span className="text-sm text-warning">
                Conexao lenta. Mudando para modo texto.
              </span>
            </div>
          )}

          {/* Message feed */}
          <MessageFeed />

          {/* Text fallback input (when audio latency exceeds threshold) */}
          {isFallbackText && <TextFallbackInput onSend={sendText} />}

          {/* Bottom controls */}
          <ChatControls
            isMuted={isMuted}
            isRecording={isRecording}
            isActive={isActive}
            onToggleMute={handleToggleMute}
            onEnd={handleEnd}
          />
        </div>
      </div>
    </div>
  );
}
