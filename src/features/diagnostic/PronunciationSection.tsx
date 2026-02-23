import { useState, useRef, useCallback, useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { functions, httpsCallable } from '../../lib/functions';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useDiagnosticStore } from '../../stores/diagnosticStore';
import { pronunciationPhrases } from './data/pronunciationPhrases';
import type { PronunciationItemResult, PronunciationResult } from './types';
import { cn } from '../../lib/utils';

const TOTAL = pronunciationPhrases.length; // 5

type MicPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';
type RecordingState = 'idle' | 'recording' | 'analyzing' | 'done';

interface PronunciationSectionProps {
  onComplete: (result: PronunciationResult) => void;
}

const analyzePronunciationFn = httpsCallable<
  { audioBase64: string; phraseId: string; expectedText: string },
  PronunciationItemResult
>(functions, 'analyzePronunciation');

export function PronunciationSection({ onComplete }: PronunciationSectionProps) {
  const {
    pronunciationIndex,
    pronunciationResults,
    recordPronunciationResult,
    advancePronunciation,
    completePronunciation,
  } = useDiagnosticStore();

  const [micPermission, setMicPermission] = useState<MicPermission>('prompt');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [currentResult, setCurrentResult] = useState<PronunciationItemResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const currentPhrase = pronunciationPhrases[pronunciationIndex];
  const isLastPhrase = pronunciationIndex === TOTAL - 1;

  // Check microphone support on mount
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicPermission('unsupported');
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setCurrentResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      setMicPermission('granted');

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error('Mic access error:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setMicPermission('denied');
      } else {
        setError('Não foi possível acessar o microfone.');
      }
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        stopStream();
        setRecordingState('analyzing');

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];

          try {
            const res = await analyzePronunciationFn({
              audioBase64: base64,
              phraseId: currentPhrase.id,
              expectedText: currentPhrase.text,
            });

            const itemResult: PronunciationItemResult = res.data;
            setCurrentResult(itemResult);
            recordPronunciationResult(itemResult);
            setRecordingState('done');
          } catch (err) {
            console.error('Analysis error:', err);
            setError('Erro ao analisar pronúncia. Tente gravar novamente.');
            setRecordingState('idle');
          }
          resolve();
        };
        reader.readAsDataURL(blob);
      };
      recorder.stop();
    });
  }, [currentPhrase, recordPronunciationResult, stopStream]);

  async function handleNext() {
    if (!isLastPhrase) {
      advancePronunciation();
      setRecordingState('idle');
      setCurrentResult(null);
      setError(null);
      return;
    }

    // Last phrase — finalize
    const allResults = pronunciationResults.concat(currentResult ? [] : []);
    // currentResult was already added via recordPronunciationResult
    const finalResults = useDiagnosticStore.getState().pronunciationResults;

    const avgScore = Math.round(
      finalResults.reduce((sum, r) => sum + r.score, 0) / TOTAL,
    );

    const allPhonemes = [
      ...new Set(finalResults.flatMap((r) => r.problematicPhonemes)),
    ];

    completePronunciation(avgScore);

    const completedAt = new Date().toISOString();
    const result: PronunciationResult = {
      score: avgScore,
      items: finalResults,
      allProblematicPhonemes: allPhonemes,
      completedAt,
    };

    // Persist to Firestore (best-effort)
    const uid = auth.currentUser?.uid;
    const docId = useDiagnosticStore.getState().diagnosticId;
    if (uid && docId) {
      setSaving(true);
      try {
        await setDoc(
          doc(db, 'users', uid, 'diagnostics', docId),
          {
            pronunciationScore: avgScore,
            pronunciationResults: finalResults,
            phonemesToWork: allPhonemes,
            pronunciationCompletedAt: completedAt,
            status: 'pronunciation_complete',
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }

    void allResults; // consumed above
    onComplete(result);
  }

  // ─── Mic permission denied UI ──────────────────────────────────────────────

  if (micPermission === 'denied' || micPermission === 'unsupported') {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
            <Icon name="mic_off" size={48} className="text-warning" />
          </div>
          <div>
            <h1 className="font-display text-neutral-900 text-2xl font-bold mb-2">
              Microfone necessário
            </h1>
            <p className="font-body text-neutral-600 text-sm leading-relaxed">
              {micPermission === 'unsupported'
                ? 'Seu navegador não suporta gravação de áudio. Use o Safari ou Chrome mais recente.'
                : 'A permissão do microfone foi negada. Para habilitá-lo:'}
            </p>
          </div>
          {micPermission === 'denied' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 w-full text-left">
              <ol className="font-body text-sm text-neutral-700 space-y-2 list-decimal pl-4">
                <li>Abra <strong>Ajustes</strong> do seu dispositivo</li>
                <li>Vá em <strong>Safari</strong> → <strong>Microfone</strong></li>
                <li>Selecione <strong>Permitir</strong></li>
                <li>Volte e recarregue esta página</li>
              </ol>
            </div>
          )}
          <Button variant="primary" onClick={() => window.location.reload()}>
            <Icon name="refresh" size={20} />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon name="mic" size={20} className="text-primary-500" />
            <span className="font-body font-semibold text-neutral-900">Teste Diagnóstico</span>
          </div>
          <span className="font-body text-sm text-neutral-500">Seção 3 de 3: Pronúncia</span>
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-primary-500">Progresso</span>
          <span className="text-xs font-bold text-neutral-700">
            {pronunciationIndex + 1}/{TOTAL}
          </span>
        </div>
        <ProgressBar value={(pronunciationIndex / TOTAL) * 100} className="h-2.5" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pb-4 flex flex-col gap-5 max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
          {/* Phrase to read */}
          <div className="px-6 pt-6 pb-5 border-b border-neutral-100">
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-500 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              Frase {pronunciationIndex + 1} de {TOTAL}
            </span>

            <p className="font-body text-neutral-500 text-sm mb-3">
              Leia a frase abaixo em voz alta:
            </p>

            <blockquote className="font-display text-neutral-900 text-xl font-bold leading-relaxed text-center py-4 px-2 bg-neutral-50 rounded-xl">
              &ldquo;{currentPhrase.text}&rdquo;
            </blockquote>

            <p className="font-body text-xs text-neutral-400 mt-3 flex items-center gap-1.5">
              <Icon name="lightbulb" size={16} className="text-accent" />
              {currentPhrase.tip}
            </p>
          </div>

          {/* Recording controls */}
          <div className="px-6 py-6 flex flex-col items-center gap-5">
            {recordingState === 'idle' && (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg"
              >
                <Icon name="mic" size={36} className="text-white" />
              </button>
            )}

            {recordingState === 'recording' && (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-error hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg animate-pulse"
              >
                <Icon name="stop" size={36} className="text-white" />
              </button>
            )}

            {recordingState === 'analyzing' && (
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                <span className="w-8 h-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
              </div>
            )}

            {recordingState === 'done' && currentResult && (
              <div className="w-full">
                <ScoreDisplay result={currentResult} />
              </div>
            )}

            <p className="font-body text-sm text-neutral-500 text-center">
              {recordingState === 'idle' && 'Toque para gravar'}
              {recordingState === 'recording' && 'Gravando… Toque para parar'}
              {recordingState === 'analyzing' && 'Analisando sua pronúncia…'}
              {recordingState === 'done' && ''}
            </p>

            {error && (
              <div className="bg-error/5 border border-error/20 rounded-xl p-4 w-full">
                <p className="font-body text-sm text-error text-center">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 mx-auto"
                  onClick={() => {
                    setError(null);
                    setRecordingState('idle');
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <p className="text-center text-sm text-warning">
            Resultado salvo apenas localmente (sem conexão com servidor).
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-2 max-w-2xl w-full mx-auto">
        <Button
          size="lg"
          className="w-full"
          disabled={recordingState !== 'done' || saving}
          isLoading={saving}
          onClick={handleNext}
        >
          {isLastPhrase ? 'Concluir Diagnóstico' : 'Próxima Frase'}
          <Icon name={isLastPhrase ? 'check_circle' : 'double_arrow'} size={20} />
        </Button>
      </footer>
    </div>
  );
}

// ─── Score feedback card ─────────────────────────────────────────────────────

function ScoreDisplay({ result }: { result: PronunciationItemResult }) {
  const scoreColor =
    result.score >= 70 ? 'text-success' : result.score >= 50 ? 'text-accent' : 'text-error';

  const scoreBg =
    result.score >= 70
      ? 'bg-success-light'
      : result.score >= 50
        ? 'bg-accent/10'
        : 'bg-error/10';

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Score circle */}
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          scoreBg,
        )}
      >
        <span className={cn('font-display text-2xl font-bold', scoreColor)}>
          {result.score}
        </span>
      </div>

      {/* Feedback */}
      <p className="font-body text-sm text-neutral-700 text-center leading-relaxed">
        {result.feedback}
      </p>

      {/* Problematic phonemes */}
      {result.problematicPhonemes.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {result.problematicPhonemes.map((p) => (
            <span
              key={p}
              className="px-3 py-1 bg-warning/10 text-warning text-xs font-bold rounded-full"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
