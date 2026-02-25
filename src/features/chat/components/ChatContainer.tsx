import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { functions, httpsCallable } from '../../../lib/functions';
import { useChatStore } from '../../../stores/chatStore';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useWakeLock } from '../hooks/useWakeLock';
import { useUserMedia } from '../hooks/useUserMedia';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { buildSessionSummary } from '../lib/sessionSummary';
import { auth } from '../../../lib/firebase';
import { ChatHeader } from './ChatHeader';
import { TutorAvatar } from './TutorAvatar';
import { UserVideoPreview } from './UserVideoPreview';
import { MessageFeed } from './MessageFeed';
import { ChatControls } from './ChatControls';
import { VirtualBoard } from './VirtualBoard';
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

interface EvaluateAdaptiveSessionInput {
  sessionId: string;
  durationMs: number;
  overallScore: number;
  messages: Array<{
    role: 'tutor' | 'user';
    text: string;
    timestamp: number;
  }>;
  corrections: Array<{
    phoneme: string;
    expected: string;
    heard: string;
    score: number;
    attempt: number;
    accepted: boolean;
  }>;
}

const completeChatSessionFn = httpsCallable<CompleteChatSessionInput, { ok: boolean }>(
  functions,
  'completeChatSession',
);

const evaluateAdaptiveSessionFn = httpsCallable<EvaluateAdaptiveSessionInput, unknown>(
  functions,
  'evaluateAdaptiveSession',
);

export function ChatContainer() {
  const navigate = useNavigate();
  const status = useChatStore((s) => s.status);
  const isMuted = useChatStore((s) => s.isMuted);
  const isRecording = useChatStore((s) => s.isRecording);
  const elapsedMs = useChatStore((s) => s.elapsedMs);
  const startTime = useChatStore((s) => s.startTime);
  const board = useChatStore((s) => s.board);

  const { connect, reconnect, sendAudio, sendText, disconnect, setAudioHandler } = useGeminiLive();
  const wakeLock = useWakeLock();
  const media = useUserMedia();
  const audio = useAudioPlayback();
  const audioCapture = useAudioCapture(sendAudio);

  const isTutorSpeaking = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingRef = useRef(false); // prevent double-end
  const expiredPromptOpenRef = useRef(false);
  const startingRef = useRef(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
      })
        .catch((err) => {
          console.error('completeChatSession failed:', err);
          throw err; // Re-throw to skip the next then block
        })
        .then(() => {
          const messages = state.messages
            .slice(-120)
            .filter((message) => message.text.trim().length > 0)
            .map((message) => ({
              role: message.role,
              text: message.text,
              timestamp: message.timestamp,
            }));
          const corrections = state.corrections.slice(-600).map((item) => ({
            phoneme: item.phoneme,
            expected: item.expected,
            heard: item.heard,
            score: item.score,
            attempt: item.attempt,
            accepted: item.accepted,
          }));

          return evaluateAdaptiveSessionFn({
            sessionId: summary.sessionId,
            durationMs: summary.durationMs,
            overallScore: summary.overallScore,
            messages,
            corrections,
          });
        })
        .catch((err) => console.error('Session completion or evaluation failed:', err));
    }

    // Reset store then navigate to summary
    useChatStore.getState().reset();
    navigate(`/session-summary?sessionId=${summary.sessionId}`, { state: summary, replace: true });
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

  // Initialize session on explicit user action only
  const handleStart = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setConnectionError(null);

    if (!auth.currentUser) {
      setConnectionError('Você precisa estar logado para iniciar uma conversa.');
      startingRef.current = false;
      return;
    }

    try {
      const stream = await media.start();
      if (!stream) return;

      await wakeLock.request();
      await connect();
    } catch (err) {
      const errorCode = typeof err === 'object' && err && 'code' in err ? String(err.code) : '';
      if (errorCode.includes('resource-exhausted')) {
        setConnectionError('Limite diário de sessões atingido. Tente novamente amanhã.');
      } else {
        setConnectionError('Erro na conexão. Toque no microfone para tentar novamente.');
      }
      audioCapture.stop();
      audio.stop();
      media.stop();
      wakeLock.release();
      useChatStore.getState().setRecording(false);
      useChatStore.getState().setStatus('error');
    } finally {
      startingRef.current = false;
    }
  }, [media, wakeLock, connect, audioCapture, audio]);

  // Keep audio capture in sync with websocket state.
  useEffect(() => {
    if (status === 'active' && media.stream && !isRecording) {
      audioCapture.start(media.stream);
      useChatStore.getState().setRecording(true);
      return;
    }

    if (status !== 'active' && isRecording) {
      audioCapture.stop();
      useChatStore.getState().setRecording(false);
    }
  }, [status, media.stream, isRecording, audioCapture]);

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
  const isStartable = status === 'idle' || status === 'error';

  const handleMicAction = useCallback(() => {
    if (isStartable) {
      void handleStart();
      return;
    }
    handleToggleMute();
  }, [isStartable, handleStart, handleToggleMute]);

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
              <span className="text-sm text-error">
                {connectionError ?? 'Erro na conexão. Toque no microfone para tentar novamente.'}
              </span>
            </div>
          )}

          {isFallbackText && (
            <div className="flex items-center justify-center gap-2 py-3 bg-warning/10">
              <span className="text-sm text-warning">
                Conexao lenta. Mudando para modo texto.
              </span>
            </div>
          )}

          {/* Virtual board (shown when active) */}
          {board && (
            <div className="px-4 pt-3 shrink-0">
              <VirtualBoard board={board} />
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
            onMicAction={handleMicAction}
            onEnd={handleEnd}
          />
        </div>
      </div>
    </div>
  );
}
