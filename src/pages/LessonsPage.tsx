import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { sanitizeHtml } from '../lib/utils';
import { generateLesson } from '../features/lessons/api/generateLesson';
import { CompletedStageCard } from '../features/lessons/components/CompletedStageCard';
import { ExerciseStageCard } from '../features/lessons/components/ExerciseStageCard';
import { LessonSummaryCard } from '../features/lessons/components/LessonSummaryCard';
import { ModuleHeader } from '../features/lessons/components/ModuleHeader';
import { ReadingStageCard } from '../features/lessons/components/ReadingStageCard';
import { useHighlightSync } from '../features/lessons/hooks/useHighlightSync';
import { useLessonVoice } from '../features/lessons/hooks/useLessonVoice';
import { getModulesByLevel, type LessonModule } from '../features/lessons/lib/moduleCatalog';
import {
  loadModuleProgress,
  loadUserLevel,
  saveLessonProgress,
  type ExerciseResultRecord,
  type ModuleProgressState,
} from '../features/lessons/persistence';
import type { LessonContent, LessonExercise } from '../features/lessons/types';

type Stage = 'reading' | 'exercises' | 'completed';

interface ExerciseAttemptState {
  attempts: number;
  completed: boolean;
  score: number;
  userAnswer?: string;
}

interface CatalogCacheState {
  userLevel: string;
  modules: LessonModule[];
  moduleProgress: Record<string, ModuleProgressState>;
  selectedModuleId: string | null;
}

const CATALOG_KEY = 'espanhol_catalog';
const LESSON_KEY_PREFIX = 'espanhol_lesson_';

function readSession<T>(key: string): T | null {
  try { return JSON.parse(sessionStorage.getItem(key) ?? 'null') as T; } catch { return null; }
}
function writeSession(key: string, value: unknown): void {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full */ }
}

let catalogCache: CatalogCacheState | null = readSession<CatalogCacheState>(CATALOG_KEY);
const lessonCache = new Map<string, LessonContent>();


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


function getExerciseHint(exercise: LessonExercise): string {
  if (exercise.type === 'flashcard') {
    return 'Ouça a pergunta e repita em voz alta para fixar o vocabulário.';
  }
  if (exercise.type === 'fill_blank') {
    return 'Prestá atención al contexto de la frase antes de completar el espacio.';
  }
  return 'Compará as alternativas e eliminá primeiro as opções claramente incorretas.';
}

export default function LessonsPage() {
  const [userLevel, setUserLevel] = useState(catalogCache?.userLevel ?? 'A1');
  const [modules, setModules] = useState<LessonModule[]>(catalogCache?.modules ?? []);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgressState>>(catalogCache?.moduleProgress ?? {});
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(catalogCache?.selectedModuleId ?? null);

  const [lesson, setLesson] = useState<LessonContent | null>(
    catalogCache?.selectedModuleId ? lessonCache.get(catalogCache.selectedModuleId) ?? null : null,
  );
  const [loadingCatalog, setLoadingCatalog] = useState(!catalogCache);
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

  const [microphoneBlocked, setMicrophoneBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  const [savingProgress, setSavingProgress] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  const { supported: voiceSupported, speaking, speak, stop } = useLessonVoice();

  const currentBlock = lesson?.blocks[blockIndex] ?? null;
  const exercisesForBlock = useMemo(() => {
    if (!lesson) return [];
    return getExercisesForBlock(lesson.exercises, blockIndex);
  }, [lesson, blockIndex]);

  const activeExercise = retryExercise ?? exercisesForBlock[exerciseIndex] ?? null;

  const readingText = useMemo(() => {
    if (!currentBlock) return '';
    return stripHtmlToText(currentBlock.contentHtml);
  }, [currentBlock]);

  const { containerRef: highlightRef, onBoundary: highlightOnBoundary, reset: resetHighlight } = useHighlightSync(readingText);

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
    (text: string) => {
      if (!text.trim()) return false;
      return speak(text);
    },
    [speak],
  );

  const speakReading = useCallback(() => {
    if (!readingText.trim()) return;
    resetHighlight();
    speak(readingText, {
      onBoundary: highlightOnBoundary,
      onEnd: resetHighlight,
    });
  }, [readingText, speak, highlightOnBoundary, resetHighlight]);

  const stopReading = useCallback(() => {
    stop();
    resetHighlight();
  }, [stop, resetHighlight]);

  const resetLessonSession = useCallback(() => {
    setStage('reading');
    setBlockIndex(0);
    setExerciseIndex(0);
    setRetryExercise(null);
    setAttemptsByExercise({});
    setFeedback(null);
    setSavingError(null);
    stop();
    resetHighlight();
  }, [stop, resetHighlight]);

  const loadCatalog = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoadingCatalog(true);
    }
    setError(null);

    try {
      const level = await loadUserLevel();
      const levelModules = getModulesByLevel(level);
      const progress = await loadModuleProgress(levelModules);

      setUserLevel(level);
      setModules(levelModules);
      setModuleProgress(progress);

      const firstAvailable = levelModules.find((module) => progress[module.id]?.unlocked) ?? levelModules[0] ?? null;
      const nextSelectedModuleId = firstAvailable?.id ?? null;
      setSelectedModuleId((prev) => prev ?? nextSelectedModuleId);

      catalogCache = {
        userLevel: level,
        modules: levelModules,
        moduleProgress: progress,
        selectedModuleId: nextSelectedModuleId,
      };
      writeSession(CATALOG_KEY, catalogCache);
    } catch (err) {
      console.error('loadCatalog error:', err);
      setError('Não foi possível carregar os módulos.');
    } finally {
      if (showLoader) {
        setLoadingCatalog(false);
      }
    }
  }, []);

  const loadLesson = useCallback(
    async (module: LessonModule) => {
      const cachedLesson = lessonCache.get(module.id) ?? readSession<LessonContent>(`${LESSON_KEY_PREFIX}${module.id}`);
      if (cachedLesson) {
        if (!lessonCache.has(module.id)) lessonCache.set(module.id, cachedLesson);
        setLesson(cachedLesson);
        setLoadingLesson(false);
        resetLessonSession();
        return;
      }

      setLoadingLesson(true);
      setError(null);

      try {
        const data = await generateLesson({
          moduleId: module.id,
          topic: module.topic,
        });

        lessonCache.set(module.id, data);
        writeSession(`${LESSON_KEY_PREFIX}${module.id}`, data);
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
    void loadCatalog(!catalogCache);
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
    }
  }, [currentBlock, stage, stop]);

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
    if (catalogCache) {
      catalogCache = {
        ...catalogCache,
        selectedModuleId: module.id,
      };
    }
  }

  function getCurrentExerciseKey(): string {
    if (!currentBlock || !activeExercise) return '';
    return getExerciseKey(currentBlock.id, activeExercise.id);
  }

  function evaluateAnswer(correct: boolean, answer?: string) {
    if (!activeExercise || !currentBlock) return;

    const currentKey = getCurrentExerciseKey();
    const currentAttempt = attemptsByExercise[currentKey]?.attempts ?? 0;
    const attempts = currentAttempt + 1;
    const completed = correct || attempts >= 2;
    const score = scoreByAttempts(attempts, correct);

    setAttemptsByExercise((prev) => ({
      ...prev,
      [currentKey]: { attempts, completed, score, userAnswer: answer },
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
    evaluateAnswer(correct, answer);
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
      resetHighlight();
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
          userAnswer: value.userAnswer,
        };
      });

    setSavingProgress(true);
    setSavingError(null);

    try {
      const nextModule = modules.find((module) => module.prerequisiteId === selectedModule.id);
      const persisted = await saveLessonProgress({
        lesson,
        exerciseResults: resultEntries,
        nextModule,
      });
      const finalScore = persisted.finalScore;

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
        if (nextModule) {
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
      <div className="min-h-dvh bg-app-bg px-4 md:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
          <div className="h-28 rounded-2xl bg-white/5 border border-white/10" />
          <div className="h-96 rounded-2xl bg-white/5 border border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-app-bg px-4 md:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <ModuleHeader
          userLevel={userLevel}
          modules={modules}
          moduleProgress={moduleProgress}
          selectedModuleId={selectedModuleId}
          blockedMessage={blockedMessage}
          onSelectModule={handleSelectModule}
        />

        <div className="space-y-4">
          <div aria-live="polite" aria-atomic="true">
            {unlockMessage && (
              <Card className="p-4 border border-success/20 bg-success-light animate-pulse">
                <p className="font-body text-sm font-semibold text-success">{unlockMessage}</p>
              </Card>
            )}
          </div>

          {error && (
            <Card className="p-6 text-center">
              <p className="font-body text-text-secondary mb-4">{error}</p>
              <Button onClick={() => void loadCatalog()}>
                <Icon name="refresh" size={20} />
                Tentar novamente
              </Button>
            </Card>
          )}

          {loadingLesson && (
            <Card className="p-6 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              <p className="font-body text-text-secondary">Gerando conteúdo do módulo…</p>
            </Card>
          )}

          {!loadingLesson && lesson && currentBlock && (
            <>
              <LessonSummaryCard
                lesson={lesson}
                audioUnavailable={audioUnavailable}
                speaking={speaking}
                moduleProgressPercent={moduleProgressPercent}
              />

              {stage === 'reading' && (
                <ReadingStageCard
                  blockIndex={blockIndex}
                  currentBlock={currentBlock}
                  audioUnavailable={audioUnavailable}
                  selectedModuleId={selectedModuleId}
                  speaking={speaking}
                  hasReadingText={readingText.length > 0}
                  highlightRef={highlightRef}
                  onSpeakBlock={speakReading}
                  onStopReading={stopReading}
                  onStartExercises={() => {
                    stopReading();
                    setStage('exercises');
                    setExerciseIndex(0);
                    setRetryExercise(null);
                    setFeedback(null);
                  }}
                />
              )}

              {stage === 'exercises' && activeExercise && (
                <ExerciseStageCard
                  exerciseIndex={exerciseIndex}
                  exercisesForBlockLength={exercisesForBlock.length}
                  blockIndex={blockIndex}
                  activeExercise={activeExercise}
                  audioUnavailable={audioUnavailable}
                  selectedModuleId={selectedModuleId}
                  feedback={feedback}
                  retryExercise={retryExercise}
                  onPlayHint={() => speakText(getExerciseHint(activeExercise))}
                  onShowTextHint={() =>
                    setFeedback({ status: 'incorrect', message: 'Dica textual', explanation: getExerciseHint(activeExercise) })
                  }
                  onEvaluate={evaluateAnswer}
                  onChoiceSubmit={handleChoiceSubmit}
                  onSpeakFeedback={() => speakText(`${feedback?.message ?? ''}. ${feedback?.explanation ?? ''}`)}
                  onRetrySimilar={() => setRetryExercise(createRetryExercise(activeExercise))}
                  onContinue={moveToNextExercise}
                />
              )}

              {stage === 'completed' && (
                <CompletedStageCard
                  finalScore={finishedScores.finalScore}
                  weakCount={finishedScores.weakCount}
                  savingProgress={savingProgress}
                  savingError={savingError}
                  onRetryModule={() => selectedModule && void loadLesson(selectedModule)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
