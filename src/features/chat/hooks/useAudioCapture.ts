import { useRef, useCallback } from 'react';

const TARGET_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

/**
 * Capture microphone audio and stream as base64 PCM 16kHz chunks.
 * Each chunk is sent via the onChunk callback (for Gemini sendAudio).
 */
export function useAudioCapture(onChunk: (base64Pcm: string) => void) {
  const ctxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const start = useCallback(
    (stream: MediaStream) => {
      const ctx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // ScriptProcessorNode for broad compatibility (AudioWorklet would be ideal but more complex)
      const processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        onChunk(btoa(binary));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    },
    [onChunk],
  );

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
    }
    processorRef.current = null;
    sourceRef.current = null;
    ctxRef.current = null;
  }, []);

  return { start, stop };
}
