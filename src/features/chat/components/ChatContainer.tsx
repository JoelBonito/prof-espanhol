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
import { Icon } from '../../../components/ui/Icon';
import { ChatHeader } from './ChatHeader';
import { TutorAvatar } from './TutorAvatar';
import { UserVideoPreview } from './UserVideoPreview';
import { ChatControls } from './ChatControls';
import { VirtualBoard } from './VirtualBoard';
import { LessonPhaseIndicator } from './LessonPhaseIndicator';
import { TranscriptionFeedback } from './TranscriptionFeedback';
import { ClassNotes } from './ClassNotes';
import { SubtitleBar } from './SubtitleBar';
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
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A] via-app-bg to-black pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[80%] h-[60%] bg-primary-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <ChatHeader
          elapsedMs={elapsedMs}
          onExit={handleEnd}
          lessonTitle={board?.lessonTitle}
        />

        {/* Main: flex-row on desktop */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden pt-[68px]">

          {/* === LEFT: Board area (mobile: full, desktop: 70%) === */}
          <section className="flex-1 lg:flex-[7] relative flex flex-col overflow-hidden">

            {/* Central content area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 overflow-y-auto">
              {board ? (
                <VirtualBoard board={board} />
              ) : (
                /* Idle state — empty board placeholder */
                <div
                  className="relative w-full max-w-3xl flex flex-col items-center justify-center p-8 sm:p-12 rounded-[2.5rem] min-h-[300px] sm:min-h-[400px]"
                  style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.2), 0 0 40px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Decorative icon */}
                  <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
                    <Icon name="school" size={48} className="text-primary-500" />
                  </div>

                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.3em] mb-4">
                    Quadro Digital
                  </span>

                  {/* Tutor icon */}
                  <div className="w-20 h-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6">
                    <Icon name="mic" size={36} className={isActive ? 'text-primary-500' : 'text-white/30'} />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl text-white text-center mb-3">
                    {isActive ? 'Aguardando tutor...' : 'Sua Aula de Espanhol'}
                  </h2>

                  <p className="text-sm text-text-muted text-center max-w-sm">
                    {isStartable
                      ? 'Toque no microfone abaixo para começar a praticar com a tutora Elena'
                      : isConnecting
                        ? 'Conectando com a tutora...'
                        : 'O conteúdo da aula aparecerá aqui'}
                  </p>

                  {isConnecting && (
                    <div className="mt-6 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                      <span className="text-xs text-primary-500 font-medium">
                        {status === 'reconnecting' ? 'Reconectando...' : 'Conectando...'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tutor PiP — floating top-right on mobile (Stitch style) */}
            {isActive && (
              <div className="absolute top-2 right-3 lg:hidden z-20 w-28 h-20 rounded-2xl overflow-hidden border border-white/20 bg-black/60"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              >
                <TutorAvatar isSpeaking={!isMuted} className="w-full h-full" />
                <div className="absolute bottom-1 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <span className="text-[8px] font-bold text-white uppercase tracking-wider">Elena</span>
                </div>
              </div>
            )}

            {/* User Video PiP — below tutor on mobile */}
            {isActive && (
              <div className="absolute top-24 right-3 lg:hidden z-20">
                <UserVideoPreview
                  stream={media.stream}
                  hasVideo={media.hasVideo}
                  isMuted={isMuted}
                  className="w-20 h-14 rounded-xl"
                />
              </div>
            )}

            {/* Bottom panel: phase + feedback */}
            <div className="w-full z-20 shrink-0">
              <LessonPhaseIndicator />
              <TranscriptionFeedback />
            </div>
          </section>

          {/* === RIGHT: Sidebar (desktop only, 30%) === */}
          <aside className="hidden lg:flex lg:flex-[3] lg:max-w-[380px] flex-col bg-surface-dark/30 border-l border-white/5 overflow-hidden">
            {/* Tutor + User video */}
            <div className="p-4 space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <TutorAvatar isSpeaking={isActive && !isMuted} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Tutor Elena (IA)</span>
                </div>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <UserVideoPreview
                  stream={media.stream}
                  hasVideo={media.hasVideo}
                  isMuted={isMuted}
                  className="w-full h-full rounded-none border-0"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Você</span>
                </div>
              </div>
            </div>

            {/* Class Notes */}
            <div className="flex-1 flex flex-col min-h-0 border-t border-white/5">
              <ClassNotes />
            </div>
          </aside>
        </main>

        {/* Footer: controls + subtitle bar (Stitch: subtitles below controls) */}
        <footer className="shrink-0 z-30">
          {isFallbackText && (
            <div className="px-4 pb-2">
              <TextFallbackInput onSend={sendText} />
            </div>
          )}
          <ChatControls
            isMuted={isMuted}
            isRecording={isRecording}
            isActive={isActive}
            onMicAction={handleMicAction}
            onEnd={handleEnd}
          />
          <SubtitleBar />
        </footer>
      </div>

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-error/20 backdrop-blur-md rounded-full border border-error/40">
            <Icon name="error" className="text-error" size={18} />
            <span className="text-sm text-error">
              {connectionError ?? 'Erro na conexão'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
