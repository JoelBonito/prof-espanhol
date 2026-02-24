export type LessonExerciseType = 'flashcard' | 'multiple_choice' | 'fill_blank';

export interface LessonBlock {
  id: string;
  title: string;
  durationMinutes: number;
  contentHtml: string;
  examples: string[];
}

export interface LessonExercise {
  id: string;
  type: LessonExerciseType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface LessonContent {
  moduleId: string;
  topic: string;
  level: string;
  title: string;
  estimatedMinutes: number;
  blocks: LessonBlock[];
  exercises: LessonExercise[];
  cache: {
    hit: boolean;
    expiresAt: string;
  };
}
