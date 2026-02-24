import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { LessonContent } from './types';
import type { LessonModule } from './lib/moduleCatalog';
import { buildReviewSchedule, type ReviewScheduleItem } from './lib/spacedRepetition';

export interface ExerciseResultRecord {
  exerciseId: string;
  type: string;
  score: number;
  attempts: number;
}

interface SaveLessonProgressInput {
  lesson: LessonContent;
  finalScore: number;
  exerciseResults: ExerciseResultRecord[];
}

interface ExistingProgressData {
  reviewSchedule?: Array<{ exerciseId?: string; step?: number }>;
}

export interface ModuleProgressState {
  unlocked: boolean;
  status: 'locked' | 'available' | 'completed';
  score: number | null;
}

export async function loadUserLevel(): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) return 'A1';

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return (snap.data()?.level as string) ?? 'A1';
}

export async function loadModuleProgress(
  modules: LessonModule[],
): Promise<Record<string, ModuleProgressState>> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return modules.reduce<Record<string, ModuleProgressState>>((acc, module, index) => {
      acc[module.id] = {
        unlocked: index === 0,
        status: index === 0 ? 'available' : 'locked',
        score: null,
      };
      return acc;
    }, {});
  }

  const progressRef = collection(db, 'users', uid, 'lessonProgress');
  const snap = await getDocs(progressRef);

  const stored = new Map<
    string,
    {
      status?: string;
      score?: number | null;
      unlocked?: boolean;
    }
  >();

  snap.forEach((item) => {
    stored.set(item.id, item.data());
  });

  return modules.reduce<Record<string, ModuleProgressState>>((acc, module, index) => {
    const prerequisiteId = module.prerequisiteId;
    const prerequisite = prerequisiteId ? acc[prerequisiteId] : null;
    const docData = stored.get(module.id);
    const score = typeof docData?.score === 'number' ? docData.score : null;
    const completed = score !== null && score >= 60;
    const unlocked = index === 0 || prerequisite?.status === 'completed' || docData?.unlocked === true;

    acc[module.id] = {
      unlocked,
      status: completed ? 'completed' : unlocked ? 'available' : 'locked',
      score,
    };
    return acc;
  }, {});
}

export async function unlockModule(moduleId: string, moduleTitle: string, level: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const lessonRef = doc(db, 'users', uid, 'lessonProgress', moduleId);
  await setDoc(
    lessonRef,
    {
      moduleTitle,
      level,
      status: 'available',
      unlocked: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveLessonProgress({
  lesson,
  finalScore,
  exerciseResults,
}: SaveLessonProgressInput): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User must be authenticated to save lesson progress.');
  }

  const lessonRef = doc(db, 'users', uid, 'lessonProgress', lesson.moduleId);
  const snap = await getDoc(lessonRef);
  const existing = (snap.data() ?? {}) as ExistingProgressData;

  const previousSteps = (existing.reviewSchedule ?? []).reduce<Record<string, number>>((acc, item) => {
    if (item.exerciseId && typeof item.step === 'number') {
      acc[item.exerciseId] = item.step;
    }
    return acc;
  }, {});

  const weakExerciseIds = exerciseResults
    .filter((item) => item.score < 70)
    .map((item) => item.exerciseId);

  const reviewSchedule: ReviewScheduleItem[] = buildReviewSchedule(weakExerciseIds, previousSteps);

  await setDoc(
    lessonRef,
    {
      moduleTitle: lesson.title,
      level: lesson.level,
      status: 'completed',
      totalBlocks: lesson.blocks.length,
      currentBlock: lesson.blocks.length,
      score: finalScore,
      exerciseResults,
      weakExercises: weakExerciseIds,
      reviewSchedule,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
