import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { getCachedUserDoc } from '../../lib/userCache';
import { completeLessonModule } from './api/completeLessonModule';
import type { CompleteLessonModuleResult } from './api/completeLessonModule';
import type { LessonContent } from './types';
import type { LessonModule } from './lib/moduleCatalog';

export interface ExerciseResultRecord {
  exerciseId: string;
  type: string;
  score: number;
  attempts: number;
  userAnswer?: string;
}

interface SaveLessonProgressInput {
  lesson: LessonContent;
  exerciseResults: ExerciseResultRecord[];
  nextModule?: LessonModule;
}

export interface ModuleProgressState {
  unlocked: boolean;
  status: 'locked' | 'available' | 'completed';
  score: number | null;
}

export async function loadUserLevel(): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) return 'A1';

  const data = await getCachedUserDoc();
  return (data.level as string) ?? 'A1';
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

export async function saveLessonProgress({
  lesson,
  exerciseResults,
  nextModule,
}: SaveLessonProgressInput): Promise<CompleteLessonModuleResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User must be authenticated to save lesson progress.');
  }

  return completeLessonModule({
    moduleId: lesson.moduleId,
    moduleTitle: lesson.title,
    level: lesson.level,
    totalBlocks: lesson.blocks.length,
    exerciseResults: exerciseResults.map((item) => ({
      exerciseId: item.exerciseId,
      attempts: item.attempts,
      answer: item.userAnswer,
    })),
    nextModule: nextModule
      ? {
          id: nextModule.id,
          title: nextModule.title,
          level: nextModule.level,
        }
      : undefined,
  });
}
