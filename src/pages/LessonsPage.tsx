import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { sanitizeHtml } from '../lib/utils';
import { generateLesson } from '../features/lessons/api/generateLesson';
import { FlashCard } from '../features/lessons/components/FlashCard';
import { QuizFillBlank } from '../features/lessons/components/QuizFillBlank';
import { QuizMultipleChoice } from '../features/lessons/components/QuizMultipleChoice';
import { useLessonVoice } from '../features/lessons/hooks/useLessonVoice';
import { getModulesByLevel, type LessonModule } from '../features/lessons/lib/moduleCatalog';
import {
  loadModuleProgress,
  loadUserLevel,
  saveLessonProgress,
  unlockModule,
  type ExerciseResultRecord,
  type ModuleProgressState,
} from '../features/lessons/persistence';
import type { LessonContent, LessonExercise } from '../features/lessons/types';

type Stage = 'reading' | 'exercises' | 'completed';

interface ExerciseAttemptState {
  attempts: number;
  completed: boolean;
  score: number;
}

interface ReadingTimeline {
  words: string[];
  starts: number[];
  text: string;
}

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getExercisesForBlock(exercises: LessonExercise[], blockIndex: number): LessonExercise[] {
  if (exercises.length <= 3) return exercises.slice();

  const start = (blockIndex * 2) % exercises.length;
  const chunk: LessonExercise[] = [];

  for (let offset = 0; offset < 3; offset += 1) {
    const item = exercises[(start + offset) % exercises.length];
    if (!chunk.some((exercise) => exercise.id === item.id)) chunk.push(item);
  }

  return chunk;
}

function createRetryExercise(exercise: LessonExercise): LessonExercise {
  const retryId = `${exercise.id}__retry`;

  if (exercise.type === 'multiple_choice') {
    const options = exercise.options ?? [];
    const rotated = options.length > 1 ? options.slice(1).concat(options[0]) : options;

    return {
      ...exercise,
      id: retryId,
      question: `Exercício similar: ${exercise.question}`,
      options: rotated,
      explanation: `${exercise.explanation} Pratique este padrão novamente para fixar.`,
    };
  }

  if (exercise.type === 'fill_blank') {
    return {
      ...exercise,
      id: retryId,
      question: `Preenchimento similar: ${exercise.question}`,
      explanation: `${exercise.explanation} Foque na estrutura da frase.`,
    };
  }

  return {
    ...exercise,
    id: retryId,
    question: `Flashcard similar: ${exercise.question}`,
    explanation: `${exercise.explanation} Leia em voz alta antes de marcar a resposta.`,
  };
}

function scoreByAttempts(attempts: number, correct: boolean): number {
  if (correct && attempts === 1) return 100;
  if (correct) return 70;
  return 40;
}

function getExerciseKey(blockId: string, exerciseId: string): string {
  return `${blockId}:${exerciseId}`;
}

function stripHtmlToText(html: string): string {
  if (typeof window === 'undefined') return html;

  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(html);
  return div.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function buildReadingTimeline(text: string): ReadingTimeline {
  const words = text.split(/\s+/).filter(Boolean);
  const starts: number[] = [];
  let cursor = 0;

  for (const word of words) {
    starts.push(cursor);
    cursor += word.length + 1;
  }

  return { words, starts, text };
}

function getWordIndexByChar(starts: number[], charIndex: number): number {
  if (starts.length === 0) return -1;
  if (charIndex <= 0) return 0;

  let found = 0;
  for (let index = 0; index < starts.length; index += 1) {
    if (starts[index] <= charIndex) found = index;
    else break;
  }

  return found;
}

function getExerciseHint(exercise: LessonExercise): string {
  if (exercise.type === 'flashcard') {
    return 'Escutá a pergunta e repetí em voz alta ajuda a fixar o vocabulário.';
  }
  if (exercise.type === 'fill_blank') {
    return 'Prestá atención al contexto de la frase antes de completar el espacio.';
  }
  return 'Compará as alternativas e eliminá primeiro as opções claramente incorretas.';
}

export default function LessonsPage() {
  const [userLevel, setUserLevel] = useState('A1');
  const [modules, setModules] = useState<LessonModule[]>([]);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgressState>>({});
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>('reading');
  const [blockIndex, setBlockIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [retryExercise, setRetryExercise] = useState<LessonExercise | null>(null);
  const [attemptsByExercise, setAttemptsByExercise] = useState<Record<string, ExerciseAttemptState>>({});
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect';
    message: string;
    explanation: string;
  } | null>(null);

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [microphoneBlocked, setMicrophoneBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  const [savingProgress, setSavingProgress] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  const { supported: voiceSupported, speaking, speak, stop } = useLessonVoice();
  const lastNarratedBlockRef = useRef<string>('');

  const currentBlock = lesson?.blocks[blockIndex] ?? null;
  const exercisesForBlock = useMemo(() => {
    if (!lesson) return [];
    return getExercisesForBlock(lesson.exercises, blockIndex);
  }, [lesson, blockIndex]);

  const activeExercise = retryExercise ?? exercisesForBlock[exerciseIndex] ?? null;

  const readingTimeline = useMemo(() => {
    if (!currentBlock) return buildReadingTimeline('');
    return buildReadingTimeline(stripHtmlToText(currentBlock.contentHtml));
  }, [currentBlock]);

  const audioUnavailable = !voiceSupported || microphoneBlocked;

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) ?? null,
    [modules, selectedModuleId],
  );

  const moduleProgressPercent = useMemo(() => {
    if (!lesson) return 0;
    const base = (blockIndex / lesson.blocks.length) * 100;
    if (stage === 'reading') return base;
    if (stage === 'completed') return 100;

    const exerciseProgress = exercisesForBlock.length
      ? ((exerciseIndex + (feedback ? 1 : 0)) / exercisesForBlock.length) * (100 / lesson.blocks.length)
      : 0;

    return Math.min(100, base + exerciseProgress);
  }, [lesson, blockIndex, stage, exercisesForBlock.length, exerciseIndex, feedback]);

  const speakText = useCallback(
    (text: string, withHighlight = false) => {
      if (!text.trim()) return false;

      const success = speak(text, {
        onBoundary: withHighlight
          ? (charIndex) => setActiveWordIndex(getWordIndexByChar(readingTimeline.starts, charIndex))
          : undefined,
        onEnd: withHighlight ? () => setActiveWordIndex(-1) : undefined,
      });

      if (!success) setActiveWordIndex(-1);
      return success;
    },
    [readingTimeline.starts, speak],
  );

  const resetLessonSession = useCallback(() => {
    setStage('reading');
    setBlockIndex(0);
    setExerciseIndex(0);
    setRetryExercise(null);
    setAttemptsByExercise({});
    setFeedback(null);
    setSavingError(null);
    setActiveWordIndex(-1);
    lastNarratedBlockRef.current = '';
    stop();
  }, [stop]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setError(null);

    try {
      const level = await loadUserLevel();
      const levelModules = getModulesByLevel(level);
      const progress = await loadModuleProgress(levelModules);

      setUserLevel(level);
      setModules(levelModules);
      setModuleProgress(progress);

      const firstAvailable = levelModules.find((module) => progress[module.id]?.unlocked) ?? levelModules[0] ?? null;
      setSelectedModuleId(firstAvailable?.id ?? null);
    } catch (err) {
      console.error('loadCatalog error:', err);
      setError('Não foi possível carregar os módulos.');
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const loadLesson = useCallback(
    async (module: LessonModule) => {
      setLoadingLesson(true);
      setError(null);

      try {
        const data = await generateLesson({
          moduleId: module.id,
          topic: module.topic,
        });

        setLesson(data);
        resetLessonSession();
      } catch (err) {
        console.error('generateLesson error:', err);
        setError('Não foi possível carregar a lição agora. Tente novamente.');
      } finally {
        setLoadingLesson(false);
      }
    },
    [resetLessonSession],
  );

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) return;

    const permissions = navigator.permissions as Permissions;

    permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setMicrophoneBlocked(result.state === 'denied');
        result.onchange = () => setMicrophoneBlocked(result.state === 'denied');
      })
      .catch(() => setMicrophoneBlocked(false));
  }, []);

  useEffect(() => {
    if (!selectedModuleId || modules.length === 0) return;

    const module = modules.find((item) => item.id === selectedModuleId);
    if (!module) return;

    void loadLesson(module);
  }, [selectedModuleId, modules, loadLesson]);

  useEffect(() => {
    if (!currentBlock || stage !== 'reading') {
      stop();
      setActiveWordIndex(-1);
      return;
    }

    if (lastNarratedBlockRef.current === currentBlock.id) return;

    const narrated = speakText(readingTimeline.text, true);
    if (narrated) lastNarratedBlockRef.current = currentBlock.id;
  }, [currentBlock, stage, readingTimeline.text, speakText, stop]);

  useEffect(() => {
    if (!feedback || feedback.status !== 'incorrect') return;
    speakText(`${feedback.message}. ${feedback.explanation}`);
  }, [feedback, speakText]);

  function handleSelectModule(module: LessonModule) {
    const progress = moduleProgress[module.id];

    if (!progress?.unlocked) {
      const prerequisite = modules.find((item) => item.id === module.prerequisiteId);
      setBlockedMessage(`Complete ${prerequisite?.title ?? 'o módulo anterior'} primeiro para desbloquear.`);
      return;
    }

    setBlockedMessage(null);
    setUnlockMessage(null);
    setSelectedModuleId(module.id);
  }

  function getCurrentExerciseKey(): string {
    if (!currentBlock || !activeExercise) return '';
    return getExerciseKey(currentBlock.id, activeExercise.id);
  }

  function evaluateAnswer(correct: boolean) {
    if (!activeExercise || !currentBlock) return;

    const currentKey = getCurrentExerciseKey();
    const currentAttempt = attemptsByExercise[currentKey]?.attempts ?? 0;
    const attempts = currentAttempt + 1;
    const completed = correct || attempts >= 2;
    const score = scoreByAttempts(attempts, correct);

    setAttemptsByExercise((prev) => ({
      ...prev,
      [currentKey]: { attempts, completed, score },
    }));

    if (correct) {
      setFeedback({ status: 'correct', message: 'Resposta correta!', explanation: activeExercise.explanation });
      return;
    }

    if (attempts < 2) {
      setFeedback({
        status: 'incorrect',
        message: `Resposta correta: ${activeExercise.answer}`,
        explanation: activeExercise.explanation,
      });
      return;
    }

    setFeedback({
      status: 'incorrect',
      message: `Tentativa encerrada. Resposta correta: ${activeExercise.answer}`,
      explanation: activeExercise.explanation,
    });
  }

  function handleChoiceSubmit(answer: string) {
    if (!activeExercise) return;
    const correct = normalizeAnswer(answer) === normalizeAnswer(activeExercise.answer);
    evaluateAnswer(correct);
  }

  function moveToNextExercise() {
    setFeedback(null);
    setRetryExercise(null);

    if (!lesson) return;

    const isLastExercise = exerciseIndex >= exercisesForBlock.length - 1;
    const isLastBlock = blockIndex >= lesson.blocks.length - 1;

    if (!isLastExercise) {
      setExerciseIndex((prev) => prev + 1);
      return;
    }

    if (!isLastBlock) {
      setBlockIndex((prev) => prev + 1);
      setExerciseIndex(0);
      setStage('reading');
      setActiveWordIndex(-1);
      return;
    }

    setStage('completed');
  }

  const persistModuleResult = useCallback(async () => {
    if (!lesson || !selectedModule) return;

    const resultEntries: ExerciseResultRecord[] = Object.entries(attemptsByExercise)
      .filter(([, value]) => value.completed)
      .map(([key, value]) => {
        const [blockId, exerciseId] = key.split(':');
        const exercise = lesson.exercises.find((item) => item.id === exerciseId.replace('__retry', ''));

        return {
          exerciseId: `${blockId}:${exerciseId}`,
          type: exercise?.type ?? 'unknown',
          score: value.score,
          attempts: value.attempts,
        };
      });

    const total = resultEntries.reduce((acc, item) => acc + item.score, 0);
    const finalScore = resultEntries.length > 0 ? Math.round(total / resultEntries.length) : 0;

    setSavingProgress(true);
    setSavingError(null);

    try {
      await saveLessonProgress({ lesson, finalScore, exerciseResults: resultEntries });

      const currentProgress: ModuleProgressState = {
        unlocked: true,
        status: finalScore >= 60 ? 'completed' : 'available',
        score: finalScore,
      };

      setModuleProgress((prev) => ({
        ...prev,
        [selectedModule.id]: currentProgress,
      }));

      if (finalScore >= 60) {
        const nextModule = modules.find((module) => module.prerequisiteId === selectedModule.id);
        if (nextModule) {
          await unlockModule(nextModule.id, nextModule.title, nextModule.level);
          setModuleProgress((prev) => ({
            ...prev,
            [nextModule.id]: {
              unlocked: true,
              status: prev[nextModule.id]?.status === 'completed' ? 'completed' : 'available',
              score: prev[nextModule.id]?.score ?? null,
            },
          }));
          setUnlockMessage(`Módulo desbloqueado: ${nextModule.title}. Excelente progresso!`);
        } else {
          setUnlockMessage('Parabéns! Você concluiu todos os módulos do nível atual.');
        }
      } else {
        setUnlockMessage('Complete com score >= 60 para desbloquear o próximo módulo.');
      }
    } catch (err) {
      console.error('saveLessonProgress error:', err);
      setSavingError('Não foi possível salvar o progresso no momento.');
    } finally {
      setSavingProgress(false);
    }
  }, [attemptsByExercise, lesson, selectedModule, modules]);

  useEffect(() => {
    if (stage !== 'completed') return;

    stop();
    void persistModuleResult();
  }, [stage, persistModuleResult, stop]);

  const finishedScores = useMemo(() => {
    const records = Object.values(attemptsByExercise).filter((item) => item.completed);
    const total = records.reduce((acc, item) => acc + item.score, 0);
    const finalScore = records.length > 0 ? Math.round(total / records.length) : 0;

    return {
      finalScore,
      weakCount: records.filter((item) => item.score < 70).length,
    };
  }, [attemptsByExercise]);

  if (loadingCatalog) {
    return (
      <div className="min-h-dvh bg-neutral-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="font-body text-neutral-600">Carregando trilha de módulos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50 px-4 md:px-6 py-6">
      <div className="max-w-5xl mx-auto grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="p-4 md:p-5 h-fit lg:sticky lg:top-4">
          <div className="mb-3">
            <h2 className="font-display text-xl font-semibold text-neutral-900">Módulos {userLevel}</h2>
            <p className="font-body text-sm text-neutral-600">Desbloqueio progressivo por score mínimo de 60.</p>
          </div>

          <div className="space-y-2">
            {modules.map((module) => {
              const progress = moduleProgress[module.id];
              const locked = !progress?.unlocked;
              const selected = selectedModuleId === module.id;

              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleSelectModule(module)}
                  className={[
                    'w-full text-left rounded-xl border p-3 transition-all',
                    selected ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300',
                    locked ? 'opacity-75' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body text-sm font-semibold text-neutral-800">{module.order}. {module.title}</p>
                    <Icon name={locked ? 'lock' : 'lock_open'} size={20} className={locked ? 'text-neutral-400' : 'text-success'} />
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={progress?.score ?? 0} color={progress?.status === 'completed' ? 'success' : 'primary'} className="h-1" />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {progress?.status === 'completed'
                      ? `Concluído (${progress.score ?? 0}/100)`
                      : locked
                        ? 'Bloqueado'
                        : progress?.score
                          ? `Último score: ${progress.score}/100`
                          : 'Disponível'}
                  </p>
                </button>
              );
            })}
          </div>

          {blockedMessage && (
            <p className="mt-3 text-sm text-warning font-medium">{blockedMessage}</p>
          )}
        </Card>

        <div className="space-y-4">
          {unlockMessage && (
            <Card className="p-4 border border-success/20 bg-success-light animate-pulse">
              <p className="font-body text-sm font-semibold text-success">{unlockMessage}</p>
            </Card>
          )}

          {error && (
            <Card className="p-6 text-center">
              <p className="font-body text-neutral-700 mb-4">{error}</p>
              <Button onClick={() => void loadCatalog()}>
                <Icon name="refresh" size={20} />
                Tentar novamente
              </Button>
            </Card>
          )}

          {loadingLesson && (
            <Card className="p-6 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              <p className="font-body text-neutral-600">Gerando conteúdo do módulo…</p>
            </Card>
          )}

          {!loadingLesson && lesson && currentBlock && (
            <>
              <Card className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="info">{lesson.level}</Badge>
                  <Badge variant={lesson.cache.hit ? 'completed' : 'pending'}>{lesson.cache.hit ? 'Cache' : 'Gemini'}</Badge>
                  <Badge variant={audioUnavailable ? 'pending' : 'completed'}>
                    {audioUnavailable ? 'Áudio em fallback texto' : speaking ? 'IA lendo bloco' : 'Áudio disponível'}
                  </Badge>
                </div>
                <h1 className="font-display text-2xl text-neutral-900 font-bold">{lesson.title}</h1>
                <p className="font-body text-neutral-500 text-sm mt-1">{lesson.topic}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-primary-500">Progresso do módulo</span>
                    <span className="text-xs font-bold text-neutral-700">{Math.round(moduleProgressPercent)}%</span>
                  </div>
                  <ProgressBar value={moduleProgressPercent} color="primary" className="h-2" />
                </div>
              </Card>

              {stage === 'reading' && (
                <Card className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold text-neutral-900">Bloco {blockIndex + 1}: {currentBlock.title}</h2>
                    <span className="text-xs text-neutral-500">{currentBlock.durationMinutes} min</span>
                  </div>

                  <div className="prose prose-neutral max-w-none prose-p:font-body prose-li:font-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentBlock.contentHtml) }} />

                  {readingTimeline.words.length > 0 && (
                    <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="font-body text-xs uppercase tracking-wide text-neutral-500 mb-2">Acompanhamento da leitura</p>
                      <p className="font-body text-sm leading-7 text-neutral-700">
                        {readingTimeline.words.map((word, index) => (
                          <span key={`${word}-${index}`} className={activeWordIndex === index ? 'px-0.5 rounded bg-primary-100 text-primary-700' : 'px-0.5'}>{word} </span>
                        ))}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => speakText(readingTimeline.text, true)} disabled={audioUnavailable || !readingTimeline.text}>
                      <Icon name="volume_up" size={20} />
                      Ouvir bloco
                    </Button>
                    <Button onClick={() => { stop(); setStage('exercises'); setExerciseIndex(0); setRetryExercise(null); setFeedback(null); }}>
                      Iniciar exercícios do bloco
                      <Icon name="arrow_forward" size={20} />
                    </Button>
                  </div>
                </Card>
              )}

              {stage === 'exercises' && activeExercise && (
                <Card className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold text-neutral-900">Exercício {exerciseIndex + 1} de {exercisesForBlock.length}</h2>
                    <span className="text-xs text-neutral-500">Bloco {blockIndex + 1}</span>
                  </div>

                  {audioUnavailable && (
                    <div className="mb-4 rounded-xl border border-warning/30 bg-warning-light p-3">
                      <p className="font-body text-sm text-neutral-700">Áudio indisponível. Alternativa textual ativada automaticamente.</p>
                    </div>
                  )}

                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => speakText(getExerciseHint(activeExercise))} disabled={audioUnavailable}>
                      <Icon name="record_voice_over" size={20} />
                      Ouvir dica
                    </Button>
                    <Button variant="ghost" onClick={() => setFeedback({ status: 'correct', message: 'Dica textual', explanation: getExerciseHint(activeExercise) })}>
                      Ver dica em texto
                    </Button>
                  </div>

                  {activeExercise.type === 'flashcard' && <FlashCard exercise={activeExercise} onEvaluate={evaluateAnswer} />}
                  {activeExercise.type === 'multiple_choice' && <QuizMultipleChoice exercise={activeExercise} onSubmit={handleChoiceSubmit} />}
                  {activeExercise.type === 'fill_blank' && <QuizFillBlank exercise={activeExercise} onSubmit={handleChoiceSubmit} />}

                  {feedback && (
                    <div className={feedback.status === 'correct' ? 'mt-5 rounded-xl border border-success/20 bg-success-light p-4' : 'mt-5 rounded-xl border border-warning/30 bg-warning-light p-4'}>
                      <p className="font-body text-sm font-semibold text-neutral-900">{feedback.message}</p>
                      <p className="font-body text-sm text-neutral-700 mt-1">{feedback.explanation}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button variant="secondary" onClick={() => speakText(`${feedback.message}. ${feedback.explanation}`)} disabled={audioUnavailable}>
                          <Icon name="volume_up" size={20} />
                          Ouvir explicação
                        </Button>
                        {feedback.status === 'incorrect' && !retryExercise && (
                          <Button variant="secondary" onClick={() => setRetryExercise(createRetryExercise(activeExercise))}>Tentar exercício similar</Button>
                        )}
                        <Button onClick={moveToNextExercise}>Continuar</Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {stage === 'completed' && (
                <Card className="p-5 md:p-6" status={finishedScores.finalScore >= 60 ? 'success' : 'warning'}>
                  <h2 className="font-display text-2xl text-neutral-900 font-bold mb-2">Módulo concluído</h2>
                  <p className="font-body text-neutral-700">Score final: {finishedScores.finalScore}/100</p>
                  <p className="font-body text-neutral-600 text-sm mt-1">Exercícios para revisão no Schedule Adapter: {finishedScores.weakCount}</p>

                  {savingProgress && <p className="font-body text-sm text-neutral-500 mt-3">Salvando progresso…</p>}
                  {savingError && <p className="font-body text-sm text-error mt-3">{savingError}</p>}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button onClick={() => selectedModule && void loadLesson(selectedModule)}>
                      Refazer módulo
                      <Icon name="replay" size={20} />
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
