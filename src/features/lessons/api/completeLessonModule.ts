import { functions, httpsCallable } from '../../../lib/functions';

interface NextModuleInput {
  id: string;
  title: string;
  level: string;
}

export interface CompleteLessonExerciseInput {
  exerciseId: string;
  attempts: number;
  answer?: string;
}

export interface CompleteLessonModuleInput {
  moduleId: string;
  moduleTitle: string;
  level: string;
  totalBlocks: number;
  exerciseResults: CompleteLessonExerciseInput[];
  nextModule?: NextModuleInput;
}

export interface CompleteLessonModuleResult {
  ok: boolean;
  finalScore: number;
  unlockedNextModule: boolean;
  unlockedModuleId: string | null;
}

const completeLessonModuleFn = httpsCallable<
  CompleteLessonModuleInput,
  CompleteLessonModuleResult
>(functions, 'completeLessonModule');

export async function completeLessonModule(
  input: CompleteLessonModuleInput,
): Promise<CompleteLessonModuleResult> {
  const res = await completeLessonModuleFn(input);
  return res.data;
}
