/**
 * Sprint 0 — Safari iPadOS 17+ Web API Validation Page
 * Abrir em: /device-test (deploy no Firebase Hosting)
 * Testar em: Safari no iPad real (iPadOS 17+)
 */
import { useState, useRef, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

// Web Speech API — not fully typed in @types/web (use minimal local interfaces)
interface SpeechRecognitionResultItem {
  readonly transcript: string;
}
interface SpeechRecognitionResultEntry {
  readonly [index: number]: SpeechRecognitionResultItem;
}
interface WebSpeechEvent extends Event {
  readonly results: ArrayLike<SpeechRecognitionResultEntry>;
}
interface WebSpeechErrorEvent extends Event {
  readonly error: string;
}
interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((e: Event) => void) | null;
  onresult: ((e: WebSpeechEvent) => void) | null;
  onerror: ((e: WebSpeechErrorEvent) => void) | null;
  onnomatch: (() => void) | null;
  start(): void;
}

type TestStatus = 'idle' | 'testing' | 'pass' | 'partial' | 'fail';

interface TestResult {
  status: TestStatus;
  message: string;
  detail?: string;
}

type TestKey =
  | 'getUserMedia'
  | 'webSocket'
  | 'wakeLock'
  | 'webPush'
  | 'pwaInstall'
  | 'mediaRecorder'
  | 'audioContext'
  | 'webSpeech';

type Results = Record<TestKey, TestResult>;

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL: Results = {
  getUserMedia: { status: 'idle', message: 'Câmera + microfone — BLOQUEADOR se falhar' },
  webSocket: { status: 'idle', message: 'WebSocket wss:// bidirecional — BLOQUEADOR se falhar' },
  wakeLock: { status: 'idle', message: 'Wake Lock API (tela acesa durante chat)' },
  webPush: { status: 'idle', message: 'Web Push Notifications (agenda)' },
  pwaInstall: { status: 'idle', message: 'PWA install / Service Worker' },
  mediaRecorder: { status: 'idle', message: 'MediaRecorder (gravação de áudio)' },
  audioContext: { status: 'idle', message: 'AudioContext (processamento de áudio)' },
  webSpeech: { status: 'idle', message: 'Web Speech API (transcrição local)' },
};

// ─── StatusIcon ───────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: TestStatus }) {
  if (status === 'testing') {
    return (
      <span
        className="w-5 h-5 rounded-full border-2 border-neutral-300 border-t-primary-500 animate-spin inline-block"
        aria-hidden="true"
      />
    );
  }
  const icons: Record<Exclude<TestStatus, 'testing'>, { name: string; cls: string }> = {
    idle: { name: 'radio_button_unchecked', cls: 'text-neutral-300' },
    pass: { name: 'check_circle', cls: 'text-success' },
    partial: { name: 'warning', cls: 'text-warning' },
    fail: { name: 'cancel', cls: 'text-error' },
  };
  const { name, cls } = icons[status];
  return <Icon name={name} size={20} fill={status !== 'idle'} className={cls} />;
}

// ─── DeviceTest page ──────────────────────────────────────────────────────────

export default function DeviceTest() {
  const [results, setResults] = useState<Results>(INITIAL);
  const [wsTimer, setWsTimer] = useState(0);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const setResult = useCallback((key: TestKey, result: TestResult) => {
    setResults((prev) => ({ ...prev, [key]: result }));
  }, []);

  const setTesting = useCallback(
    (key: TestKey) => setResult(key, { status: 'testing', message: 'Testando...' }),
    [setResult]
  );

  // ── getUserMedia ─────────────────────────────────────────────────────────────
  const testGetUserMedia = useCallback(async () => {
    setTesting('getUserMedia');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const tracks = stream.getTracks().map((t) => `${t.kind}:${t.label || t.kind}`).join(', ');
      setResult('getUserMedia', {
        status: 'pass',
        message: 'getUserMedia funciona',
        detail: tracks,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResult('getUserMedia', { status: 'fail', message: 'Falhou', detail: msg });
    }
  }, [setTesting, setResult]);

  // ── WebSocket ────────────────────────────────────────────────────────────────
  const testWebSocket = useCallback(() => {
    setTesting('webSocket');
    setWsTimer(0);

    if (wsRef.current) {
      wsRef.current.close();
      if (wsIntervalRef.current) clearInterval(wsIntervalRef.current);
    }

    const ws = new WebSocket('wss://echo.websocket.events');
    wsRef.current = ws;
    let received = false;
    const startTime = Date.now();

    ws.onopen = () => {
      ws.send('espanhol-sprint0-test');
      wsIntervalRef.current = setInterval(() => {
        setWsTimer(Math.floor((Date.now() - startTime) / 1000));
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 5000);
    };

    ws.onmessage = (e) => {
      if (!received && (e.data === 'espanhol-sprint0-test' || e.data)) {
        received = true;
        setResult('webSocket', {
          status: 'pass',
          message: 'WebSocket wss:// funcionando — manter aberto para testar 30 min',
          detail: `Mensagem recebida: "${String(e.data).slice(0, 50)}"`,
        });
      }
    };

    ws.onerror = () => {
      setResult('webSocket', {
        status: 'fail',
        message: 'Erro ao conectar WebSocket',
        detail: 'Verifique a rede ou tente novamente',
      });
    };

    ws.onclose = (e) => {
      if (wsIntervalRef.current) clearInterval(wsIntervalRef.current);
      if (!received) {
        setResult('webSocket', { status: 'fail', message: 'Conexão fechada antes de receber dados', detail: `code: ${e.code}` });
      }
    };
  }, [setTesting, setResult]);

  // ── Wake Lock ────────────────────────────────────────────────────────────────
  const testWakeLock = useCallback(async () => {
    setTesting('wakeLock');
    try {
      const wl = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => void }> } }).wakeLock?.request('screen');
      if (wl) {
        await wl.release();
        setResult('wakeLock', { status: 'pass', message: 'Wake Lock nativo funciona' });
        return;
      }
      throw new Error('wakeLock API não disponível');
    } catch {
      // AudioContext fallback workaround
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0; // silent
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 500);
        setResult('wakeLock', {
          status: 'partial',
          message: 'Wake Lock não disponível no Safari',
          detail: 'Workaround: AudioContext silent (gain=0) mantém tela ativa. Testar no iPad.',
        });
      } catch (err2) {
        setResult('wakeLock', { status: 'fail', message: 'Wake Lock e AudioContext falharam', detail: String(err2) });
      }
    }
  }, [setTesting, setResult]);

  // ── Web Push ─────────────────────────────────────────────────────────────────
  const testWebPush = useCallback(async () => {
    setTesting('webPush');
    try {
      if (!('Notification' in window)) throw new Error('Notification API não disponível');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setResult('webPush', { status: 'partial', message: `Permissão: ${perm}`, detail: 'Aceite a permissão de notificações no Safari' });
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      if (!('pushManager' in reg)) {
        setResult('webPush', { status: 'partial', message: 'Notificações OK, PushManager indisponível', detail: 'Safari pode não suportar Web Push nesta versão' });
        return;
      }
      setResult('webPush', { status: 'pass', message: 'Notifications + PushManager disponíveis' });
    } catch (err) {
      setResult('webPush', { status: 'fail', message: 'Falhou', detail: String(err) });
    }
  }, [setTesting, setResult]);

  // ── PWA Install ──────────────────────────────────────────────────────────────
  const testPwaInstall = useCallback(async () => {
    setTesting('pwaInstall');
    try {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;

      const swReg = await navigator.serviceWorker.getRegistration();

      if (isStandalone) {
        setResult('pwaInstall', { status: 'pass', message: 'Executando em modo PWA standalone ✓' });
      } else if (swReg) {
        setResult('pwaInstall', {
          status: 'partial',
          message: 'Service Worker registrado. Não está em modo standalone.',
          detail: 'Para instalar: Safari > botão Compartilhar (□↑) > "Adicionar à Tela de Início"',
        });
      } else {
        setResult('pwaInstall', { status: 'fail', message: 'Service Worker não registrado' });
      }
    } catch (err) {
      setResult('pwaInstall', { status: 'fail', message: 'Falhou', detail: String(err) });
    }
  }, [setTesting, setResult]);

  // ── MediaRecorder ────────────────────────────────────────────────────────────
  const testMediaRecorder = useCallback(async () => {
    setTesting('mediaRecorder');
    try {
      const stream = mediaStreamRef.current ?? await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (!mediaStreamRef.current) stream.getTracks().forEach((t) => t.stop());
        setResult('mediaRecorder', {
          status: 'pass',
          message: 'MediaRecorder funciona',
          detail: `mimeType: ${recorder.mimeType} | blob: ${blob.size} bytes`,
        });
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 1000);
    } catch (err) {
      setResult('mediaRecorder', { status: 'fail', message: 'Falhou', detail: String(err) });
    }
  }, [setTesting, setResult]);

  // ── AudioContext ─────────────────────────────────────────────────────────────
  const testAudioContext = useCallback(async () => {
    setTesting('audioContext');
    try {
      const ctx = new AudioContext();
      await ctx.resume();
      const state = ctx.state;
      const sampleRate = ctx.sampleRate;
      await ctx.close();
      setResult('audioContext', {
        status: state === 'running' ? 'pass' : 'partial',
        message: `AudioContext state: ${state}`,
        detail: `sampleRate: ${sampleRate} Hz`,
      });
    } catch (err) {
      setResult('audioContext', { status: 'fail', message: 'Falhou', detail: String(err) });
    }
  }, [setTesting, setResult]);

  // ── Web Speech ───────────────────────────────────────────────────────────────
  const testWebSpeech = useCallback(() => {
    setTesting('webSpeech');
    type SRConstructor = new () => WebSpeechRecognition;
    const win = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SR) {
      setResult('webSpeech', {
        status: 'fail',
        message: 'SpeechRecognition não disponível',
        detail: 'Fallback: Gemini server-side transcription via Cloud Function',
      });
      return;
    }

    const rec = new SR();
    rec.lang = 'es-ES';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setResult('webSpeech', { status: 'testing', message: 'Fale algo em espanhol...' });
    rec.onresult = (e: WebSpeechEvent) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      setResult('webSpeech', { status: 'pass', message: 'Web Speech funciona', detail: `Transcrito: "${transcript}"` });
    };
    rec.onerror = (e: WebSpeechErrorEvent) => {
      setResult('webSpeech', {
        status: e.error === 'not-allowed' ? 'fail' : 'partial',
        message: `Erro: ${e.error}`,
        detail: 'Fallback: Gemini server-side transcription',
      });
    };
    rec.onnomatch = () => setResult('webSpeech', { status: 'partial', message: 'API disponível mas sem match', detail: 'Funcionalidade limitada no Safari' });

    try {
      rec.start();
    } catch (err) {
      setResult('webSpeech', { status: 'fail', message: 'Não iniciou', detail: String(err) });
    }
  }, [setTesting, setResult]);

  // ── Run all ──────────────────────────────────────────────────────────────────
  const runAll = useCallback(async () => {
    await testGetUserMedia();
    testWebSocket();
    await testWakeLock();
    await testWebPush();
    await testPwaInstall();
    await testMediaRecorder();
    await testAudioContext();
    testWebSpeech();
  }, [testGetUserMedia, testWebSocket, testWakeLock, testWebPush, testPwaInstall, testMediaRecorder, testAudioContext, testWebSpeech]);

  // ── Copy results ─────────────────────────────────────────────────────────────
  const copyResults = useCallback(() => {
    const ua = navigator.userAgent;
    const lines = [
      `# Sprint 0 — Resultados de Validação iPad`,
      `Data: ${new Date().toLocaleString('pt-BR')}`,
      `User-Agent: ${ua}`,
      '',
      ...Object.entries(results).map(([k, r]) =>
        `${k}: [${r.status.toUpperCase()}] ${r.message}${r.detail ? '\n  → ' + r.detail : ''}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  // ── Summary ───────────────────────────────────────────────────────────────────
  const counts = Object.values(results).reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<TestStatus, number>
  );

  const TESTS: { key: TestKey; label: string; run: () => void; critical?: boolean }[] = [
    { key: 'getUserMedia', label: 'getUserMedia (câmera + mic)', run: testGetUserMedia, critical: true },
    { key: 'webSocket', label: 'WebSocket wss://', run: testWebSocket, critical: true },
    { key: 'wakeLock', label: 'Wake Lock API', run: testWakeLock },
    { key: 'webPush', label: 'Web Push Notifications', run: testWebPush },
    { key: 'pwaInstall', label: 'PWA Install / Service Worker', run: testPwaInstall },
    { key: 'mediaRecorder', label: 'MediaRecorder', run: testMediaRecorder },
    { key: 'audioContext', label: 'AudioContext', run: testAudioContext },
    { key: 'webSpeech', label: 'Web Speech API', run: testWebSpeech },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="science" size={24} className="text-primary-500" />
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">Sprint 0</span>
        </div>
        <h1
          className="text-3xl font-bold text-neutral-900 mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Validação Safari iPadOS
        </h1>
        <p className="text-neutral-500">
          Abrir no Safari do iPad real. Testar cada API antes de iniciar o desenvolvimento.
        </p>

        {/* Summary bar */}
        <div className="mt-4 flex gap-3 flex-wrap">
          <span className="text-xs bg-success-light text-success font-semibold px-2 py-1 rounded-full">
            ✓ {counts.pass ?? 0} passou
          </span>
          <span className="text-xs bg-warning-light text-warning font-semibold px-2 py-1 rounded-full">
            ⚠ {counts.partial ?? 0} parcial
          </span>
          <span className="text-xs bg-error-light text-error font-semibold px-2 py-1 rounded-full">
            ✗ {counts.fail ?? 0} falhou
          </span>
          {wsTimer > 0 && (
            <span className="text-xs bg-info-light text-info font-semibold px-2 py-1 rounded-full">
              WS aberto: {wsTimer}s
            </span>
          )}
        </div>
      </div>

      {/* Run all button */}
      <div className="flex gap-3 mb-6">
        <Button onClick={runAll} variant="primary" size="lg" className="flex-1">
          <Icon name="play_arrow" size={20} />
          Executar Todos
        </Button>
        <Button onClick={copyResults} variant="secondary">
          <Icon name={copied ? 'check' : 'content_copy'} size={20} />
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>

      {/* Test list */}
      <div className="flex flex-col gap-3">
        {TESTS.map(({ key, label, run, critical }) => {
          const r = results[key];
          return (
            <Card key={key} variant="default" className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <StatusIcon status={r.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{label}</span>
                    {critical && (
                      <span className="text-[10px] font-bold text-error bg-error-light px-1.5 py-0.5 rounded uppercase">
                        crítico
                      </span>
                    )}
                  </div>
                  {r.status !== 'idle' && (
                    <p className="text-sm text-neutral-600 mt-0.5">{r.message}</p>
                  )}
                  {r.detail && (
                    <p className="text-xs text-neutral-400 mt-0.5 font-mono break-all">{r.detail}</p>
                  )}
                </div>
                <Button
                  onClick={run}
                  variant="ghost"
                  size="sm"
                  disabled={r.status === 'testing'}
                  className="shrink-0"
                >
                  {r.status === 'idle' ? 'Testar' : 'Repetir'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* getUserMedia video preview */}
      {results.getUserMedia.status === 'pass' && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
            Preview câmera
          </p>
          <video
            ref={videoRef}
            className="w-full rounded-[10px] bg-neutral-900 max-h-48 object-cover"
            autoPlay
            muted
            playsInline
          />
        </div>
      )}

      {/* WebSocket 30-min instructions */}
      {results.webSocket.status === 'pass' && (
        <Card variant="highlight" className="mt-4 text-sm text-neutral-700">
          <strong>Teste de 30 minutos:</strong> A conexão WebSocket está aberta ({wsTimer}s). Deixe esta
          página aberta no iPad por 30 minutos e verifique se o contador continua subindo.
        </Card>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-neutral-200 text-xs text-neutral-400 space-y-1">
        <p>User-Agent: {navigator.userAgent.slice(0, 100)}...</p>
        <p>URL: {window.location.href}</p>
      </div>
    </div>
  );
}
