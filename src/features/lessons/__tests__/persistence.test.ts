import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonModule } from '../lib/moduleCatalog';
import type { LessonContent } from '../types';

const {
  mockAuth,
  mockDb,
  docMock,
  collectionMock,
  getDocMock,
  getDocsMock,
  setDocMock,
  serverTimestampMock,
} = vi.hoisted(() => ({
  mockAuth: {
    currentUser: null as { uid: string } | null,
  },
  mockDb: {},
  docMock: vi.fn((_db: unknown, ...segments: string[]) => segments.join('/')),
  collectionMock: vi.fn((_db: unknown, ...segments: string[]) => segments.join('/')),
  getDocMock: vi.fn(),
  getDocsMock: vi.fn(),
  setDocMock: vi.fn(),
  serverTimestampMock: vi.fn(() => '__server_timestamp__'),
}));

vi.mock('../../lib/firebase', () => ({
  auth: mockAuth,
  db: mockDb,
}));

vi.mock('../../../lib/firebase', () => ({
  auth: mockAuth,
  db: mockDb,
}));

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  doc: docMock,
  getDoc: getDocMock,
  getDocs: getDocsMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

import {
  loadModuleProgress,
  loadUserLevel,
  saveLessonProgress,
  unlockModule,
} from '../persistence';

function buildDocsSnapshot(records: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    forEach: (cb: (item: { id: string; data: () => Record<string, unknown> }) => void) => {
      records.forEach((record) => cb({ id: record.id, data: () => record.data }));
    },
  };
}

const modules: LessonModule[] = [
  { id: 'a1-1', level: 'A1', title: 'M1', topic: 't1', prerequisiteId: null, order: 1 },
  { id: 'a1-2', level: 'A1', title: 'M2', topic: 't2', prerequisiteId: 'a1-1', order: 2 },
  { id: 'a1-3', level: 'A1', title: 'M3', topic: 't3', prerequisiteId: 'a1-2', order: 3 },
];

const lessonFixture: LessonContent = {
  moduleId: 'a1-1',
  topic: 'Saludos',
  level: 'A1',
  title: 'Saudações',
  estimatedMinutes: 20,
  blocks: [
    { id: 'b1', title: 'Bloco 1', durationMinutes: 4, contentHtml: '<p>x</p>', examples: [] },
    { id: 'b2', title: 'Bloco 2', durationMinutes: 4, contentHtml: '<p>y</p>', examples: [] },
  ],
  exercises: [
    {
      id: 'ex-1',
      type: 'flashcard',
      question: 'Q1',
      answer: 'A1',
      explanation: 'E1',
    },
  ],
  cache: {
    hit: false,
    expiresAt: '2026-02-24T00:00:00.000Z',
  },
};

describe('lesson persistence', () => {
  beforeEach(() => {
    mockAuth.currentUser = null;
    docMock.mockReset();
    collectionMock.mockReset();
    getDocMock.mockReset();
    getDocsMock.mockReset();
    setDocMock.mockReset();
    serverTimestampMock.mockClear();
  });

  it('returns A1 when user is not authenticated', async () => {
    const level = await loadUserLevel();
    expect(level).toBe('A1');
    expect(getDocMock).not.toHaveBeenCalled();
  });

  it('loads user level from firestore', async () => {
    mockAuth.currentUser = { uid: 'u-1' };
    getDocMock.mockResolvedValue({ data: () => ({ level: 'B1' }) });

    const level = await loadUserLevel();

    expect(level).toBe('B1');
    expect(docMock).toHaveBeenCalledWith(mockDb, 'users', 'u-1');
  });

  it('computes unlock flow and completion status using score >= 60', async () => {
    mockAuth.currentUser = { uid: 'u-1' };
    getDocsMock.mockResolvedValue(
      buildDocsSnapshot([
        { id: 'a1-1', data: { score: 60 } },
        { id: 'a1-3', data: { score: 55, unlocked: true } },
      ]),
    );

    const progress = await loadModuleProgress(modules);

    expect(progress['a1-1']).toEqual({ unlocked: true, status: 'completed', score: 60 });
    expect(progress['a1-2']).toEqual({ unlocked: true, status: 'available', score: null });
    expect(progress['a1-3']).toEqual({ unlocked: true, status: 'available', score: 55 });
  });

  it('returns first module available and others locked without auth', async () => {
    const progress = await loadModuleProgress(modules);

    expect(progress['a1-1']).toEqual({ unlocked: true, status: 'available', score: null });
    expect(progress['a1-2']).toEqual({ unlocked: false, status: 'locked', score: null });
    expect(progress['a1-3']).toEqual({ unlocked: false, status: 'locked', score: null });
  });

  it('writes unlock payload to lessonProgress with merge', async () => {
    mockAuth.currentUser = { uid: 'u-1' };

    await unlockModule('a1-2', 'M2', 'A1');

    expect(docMock).toHaveBeenCalledWith(mockDb, 'users', 'u-1', 'lessonProgress', 'a1-2');
    expect(setDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock).toHaveBeenCalledWith(
      'users/u-1/lessonProgress/a1-2',
      expect.objectContaining({
        moduleTitle: 'M2',
        level: 'A1',
        status: 'available',
        unlocked: true,
        updatedAt: '__server_timestamp__',
      }),
      { merge: true },
    );
  });

  it('throws when saving lesson progress without authenticated user', async () => {
    await expect(
      saveLessonProgress({
        lesson: lessonFixture,
        finalScore: 80,
        exerciseResults: [],
      }),
    ).rejects.toThrow('User must be authenticated');
  });

  it('saves score, weak exercises and review schedule', async () => {
    mockAuth.currentUser = { uid: 'u-1' };
    getDocMock.mockResolvedValue({
      data: () => ({
        reviewSchedule: [{ exerciseId: 'ex-1', step: 1 }],
      }),
    });

    await saveLessonProgress({
      lesson: lessonFixture,
      finalScore: 72,
      exerciseResults: [
        { exerciseId: 'ex-1', type: 'flashcard', score: 65, attempts: 2 },
        { exerciseId: 'ex-2', type: 'fill_blank', score: 40, attempts: 2 },
        { exerciseId: 'ex-3', type: 'multiple_choice', score: 100, attempts: 1 },
      ],
    });

    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, payload, options] = setDocMock.mock.calls[0] as [string, Record<string, unknown>, { merge: boolean }];

    expect(options).toEqual({ merge: true });
    expect(payload.score).toBe(72);
    expect(payload.status).toBe('completed');
    expect(payload.weakExercises).toEqual(['ex-1', 'ex-2']);
    expect(payload.exerciseResults).toHaveLength(3);

    const reviewSchedule = payload.reviewSchedule as Array<{ exerciseId: string; step: number }>;
    expect(reviewSchedule).toHaveLength(2);
    expect(reviewSchedule.find((item) => item.exerciseId === 'ex-1')?.step).toBe(2);
    expect(reviewSchedule.find((item) => item.exerciseId === 'ex-2')?.step).toBe(0);
  });
});
