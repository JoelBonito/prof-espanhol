import { functions, httpsCallable } from '../../../lib/functions';
import type { LessonContent } from '../types';

interface GenerateLessonInput {
  moduleId: string;
  topic: string;
}

const generateLessonFn = httpsCallable<GenerateLessonInput, LessonContent>(
  functions,
  'generateLesson',
);

export async function generateLesson(input: GenerateLessonInput): Promise<LessonContent> {
  const res = await generateLessonFn(input);
  return res.data;
}
