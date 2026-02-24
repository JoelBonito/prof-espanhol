import { useRef, useState, useCallback, useEffect } from 'react';

export interface UserMediaState {
  stream: MediaStream | null;
  hasVideo: boolean;
  hasAudio: boolean;
  error: string | null;
}

/**
 * Manage camera + microphone access via getUserMedia.
 * Camera is optional (degrades to audio-only).
 */
export function useUserMedia() {
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<UserMediaState>({
    stream: null,
    hasVideo: false,
    hasAudio: false,
    error: null,
  });

  const start = useCallback(async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: video ? { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } } : false,
      });

      streamRef.current = stream;
      setState({
        stream,
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
        error: null,
      });
      return stream;
    } catch (err) {
      // Retry audio-only if video failed
      if (video) {
        return start(false);
      }
      const msg = err instanceof Error ? err.message : 'Media access denied';
      setState((s) => ({ ...s, error: msg }));
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState({ stream: null, hasVideo: false, hasAudio: false, error: null });
  }, []);

  const toggleMute = useCallback((muted: boolean) => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { ...state, start, stop, toggleMute };
}
