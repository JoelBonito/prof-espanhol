import { useRef, useCallback, useEffect } from 'react';
import { functions, httpsCallable } from '../../../lib/functions';
import { useChatStore } from '../../../stores/chatStore';
import {
  GeminiLiveManager,
  type ConnectionStatus,
  type GeminiLiveCallbacks,
} from '../lib/geminiLive';
import { parseCorrectionMarkers } from '../lib/correctionParser';

interface CreateChatSessionResult {
  sessionId: string;
  sessionToken: string;
  model: string;
  systemPrompt: string;
  tokenTtlMinutes: number;
}

const createChatSessionFn = httpsCallable<
  { timezone?: string },
  CreateChatSessionResult
>(functions, 'createChatSession');

export function useGeminiLive() {
  const managerRef = useRef<GeminiLiveManager | null>(null);
  const modelRef = useRef<string>('');
  const systemPromptRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');

  // External audio handler — set by ChatContainer to pipe audio to useAudioPlayback
  const audioHandlerRef = useRef<((data: string, mime: string) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.disconnect();
    };
  }, []);

  const createCallbacks = useCallback((): GeminiLiveCallbacks => {
    const addMsg = useChatStore.getState().addMessage;
    const addCorrection = useChatStore.getState().addCorrection;
    const setStatus = useChatStore.getState().setStatus;
    type ChatStatus = ReturnType<typeof useChatStore.getState>['status'];

    return {
      onStatusChange: (status: ConnectionStatus) => {
        const map: Record<ConnectionStatus, ChatStatus> = {
          disconnected: 'idle',
          connecting: 'connecting',
          connected: 'active',
          reconnecting: 'reconnecting',
          error: 'error',
        };
        setStatus(map[status]);
      },

      onTextResponse: (text: string) => {
        const { cleanText, corrections } = parseCorrectionMarkers(text);
        const now = Date.now();

        // Add corrections to store
        for (const c of corrections) {
          addCorrection({
            phoneme: c.phoneme,
            expected: c.expected,
            heard: c.heard,
            score: c.score,
            timestamp: now,
          });
        }

        // Add clean text as tutor message (if any text remains after removing markers)
        if (cleanText) {
          addMsg({
            id: `tutor-${now}`,
            role: 'tutor',
            text: cleanText,
            timestamp: now,
          });
        }
      },

      onAudioResponse: (audioData: string, mimeType: string) => {
        audioHandlerRef.current?.(audioData, mimeType);
      },

      onTurnComplete: () => {
        // Turn complete — ready for next user input
      },

      onError: (error: string) => {
        if (error === 'latency_exceeded') {
          // Fallback to text mode (latency > 3s)
          setStatus('fallback_text');
        }
      },

      onTokenExpired: () => {
        setStatus('expired');
      },
    };
  }, []);

  /**
   * Start a new chat session: get token from CF → connect WebSocket.
   */
  const connect = useCallback(async () => {
    useChatStore.getState().setStatus('connecting');

    try {
      const res = await createChatSessionFn({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const { sessionId, sessionToken, model, systemPrompt } = res.data;

      modelRef.current = model;
      systemPromptRef.current = systemPrompt;
      sessionIdRef.current = sessionId;

      // Create manager and connect
      const callbacks = createCallbacks();
      const manager = new GeminiLiveManager(callbacks, model);
      managerRef.current = manager;

      useChatStore.getState().startSession(sessionId, sessionToken, systemPrompt);

      await manager.connect(sessionToken, systemPrompt);
    } catch (err) {
      console.error('Chat session creation failed:', err);
      useChatStore.getState().setStatus('error');
      throw err;
    }
  }, [createCallbacks]);

  /**
   * Reconnect with a new ephemeral token (after expiry).
   */
  const reconnect = useCallback(async () => {
    useChatStore.getState().setStatus('reconnecting');

    try {
      // Disconnect old session
      managerRef.current?.disconnect();

      // Get a new token
      const res = await createChatSessionFn({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const { sessionToken, model, systemPrompt } = res.data;

      // Reconnect with new token
      const callbacks = createCallbacks();
      const manager = new GeminiLiveManager(callbacks, model);
      managerRef.current = manager;

      useChatStore.getState().updateToken(sessionToken);

      await manager.connect(sessionToken, systemPrompt);
    } catch (err) {
      console.error('Reconnection failed:', err);
      useChatStore.getState().setStatus('error');
    }
  }, [createCallbacks]);

  /**
   * Send audio data to the Gemini Live session.
   */
  const sendAudio = useCallback((base64Data: string) => {
    managerRef.current?.sendAudio(base64Data);
  }, []);

  /**
   * Send text message (fallback mode).
   */
  const sendText = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message to store
    useChatStore.getState().addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    });

    managerRef.current?.sendText(text);
  }, []);

  /**
   * End the session and disconnect.
   */
  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
    managerRef.current = null;
    useChatStore.getState().endSession();
  }, []);

  /**
   * Register external audio handler (e.g. useAudioPlayback.playChunk).
   */
  const setAudioHandler = useCallback((handler: (data: string, mime: string) => void) => {
    audioHandlerRef.current = handler;
  }, []);

  return {
    connect,
    reconnect,
    sendAudio,
    sendText,
    disconnect,
    setAudioHandler,
    isConnected: managerRef.current?.isConnected ?? false,
  };
}
