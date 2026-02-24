import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface GeminiLiveCallbacks {
  onStatusChange: (status: ConnectionStatus) => void;
  onTextResponse: (text: string) => void;
  onAudioResponse: (audioData: string, mimeType: string) => void;
  onTurnComplete: () => void;
  onError: (error: string) => void;
  onTokenExpired: () => void;
}

const LATENCY_TIMEOUT_MS = 3000;
const MAX_SESSION_MS = 30 * 60 * 1000; // 30 min (RN08)

export class GeminiLiveManager {
  private session: Session | null = null;
  private callbacks: GeminiLiveCallbacks;
  private model: string;
  private lastSendTime = 0;
  private latencyTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionStartTime = 0;
  private _isConnected = false;

  constructor(callbacks: GeminiLiveCallbacks, model: string) {
    this.callbacks = callbacks;
    this.model = model;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(token: string, systemPrompt: string): Promise<void> {
    this.callbacks.onStatusChange('connecting');

    try {
      const ai = new GoogleGenAI({ apiKey: token });

      this.session = await ai.live.connect({
        model: this.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        },
        callbacks: {
          onopen: () => {
            this._isConnected = true;
            this.sessionStartTime = Date.now();
            this.callbacks.onStatusChange('connected');
          },
          onmessage: (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onerror: (error: ErrorEvent) => {
            console.error('Gemini Live error:', error);
            this.callbacks.onError(error.message ?? 'WebSocket error');
            this.callbacks.onStatusChange('error');
          },
          onclose: (event: CloseEvent) => {
            this._isConnected = false;
            this.clearLatencyTimer();

            // Code 1000 = normal close; anything else may be token expiry
            if (event.code !== 1000) {
              this.callbacks.onTokenExpired();
            }
            this.callbacks.onStatusChange('disconnected');
          },
        },
      });
    } catch (err) {
      this._isConnected = false;
      const msg = err instanceof Error ? err.message : 'Connection failed';
      console.error('Gemini Live connect error:', err);
      this.callbacks.onError(msg);
      this.callbacks.onStatusChange('error');
    }
  }

  /**
   * Send raw audio data (PCM 16kHz) to the Gemini session.
   */
  sendAudio(base64Data: string): void {
    if (!this.session || !this._isConnected) return;

    // Check max session duration (RN08)
    if (Date.now() - this.sessionStartTime > MAX_SESSION_MS) {
      this.disconnect();
      return;
    }

    this.lastSendTime = Date.now();
    this.startLatencyTimer();

    this.session.sendRealtimeInput({
      audio: {
        data: base64Data,
        mimeType: 'audio/pcm;rate=16000',
      },
    });
  }

  /**
   * Send a text message (for fallback text mode or explicit text input).
   */
  sendText(text: string): void {
    if (!this.session || !this._isConnected) return;

    this.lastSendTime = Date.now();
    this.startLatencyTimer();

    this.session.sendClientContent({
      turns: text,
      turnComplete: true,
    });
  }

  disconnect(): void {
    this.clearLatencyTimer();
    this._isConnected = false;

    if (this.session) {
      try {
        this.session.close();
      } catch {
        // Already closed
      }
      this.session = null;
    }

    this.callbacks.onStatusChange('disconnected');
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private handleMessage(message: LiveServerMessage): void {
    this.clearLatencyTimer();

    // Text response
    if (message.text) {
      this.callbacks.onTextResponse(message.text);
    }

    // Audio response
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.data) {
          this.callbacks.onAudioResponse(
            part.inlineData.data,
            part.inlineData.mimeType ?? 'audio/pcm;rate=24000',
          );
        }
        if (part.text) {
          this.callbacks.onTextResponse(part.text);
        }
      }
    }

    // Turn complete
    if (message.serverContent?.turnComplete) {
      this.callbacks.onTurnComplete();
    }

    // goAway = server shutting down / token expiring
    if (message.goAway) {
      this.callbacks.onTokenExpired();
    }
  }

  private startLatencyTimer(): void {
    this.clearLatencyTimer();
    this.latencyTimer = setTimeout(() => {
      // If no response after 3s, signal high latency
      if (this.lastSendTime > 0 && Date.now() - this.lastSendTime >= LATENCY_TIMEOUT_MS) {
        this.callbacks.onError('latency_exceeded');
      }
    }, LATENCY_TIMEOUT_MS);
  }

  private clearLatencyTimer(): void {
    if (this.latencyTimer) {
      clearTimeout(this.latencyTimer);
      this.latencyTimer = null;
    }
  }
}
