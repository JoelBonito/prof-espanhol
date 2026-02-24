import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpsError } from 'firebase-functions/v2/https';

type DocData = Record<string, unknown>;

const store = new Map<string, DocData>();

function clone<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return value;
  }
}

function createDocRef(path: string) {
  return {
    path,
    async get() {
      const data = store.get(path);
      return {
        exists: !!data,
        data: () => (data ? clone(data) : undefined),
      };
    },
  };
}

function deepMerge(target: DocData, source: DocData): DocData {
  const out: DocData = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === 'object' &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key] as DocData, value as DocData);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function applySet(path: string, data: DocData, merge: boolean) {
  const current = store.get(path) ?? {};
  store.set(path, merge ? deepMerge(current, data) : clone(data));
}

const firestoreMock = {
  doc: vi.fn((path: string) => createDocRef(path)),
  batch: vi.fn(() => {
    const ops: Array<{ path: string; data: DocData; merge: boolean }> = [];
    return {
      set: (ref: { path: string }, data: DocData, options?: { merge?: boolean }) => {
        ops.push({ path: ref.path, data, merge: !!options?.merge });
      },
      commit: async () => {
        for (const op of ops) {
          applySet(op.path, op.data, op.merge);
        }
      },
    };
  }),
};

vi.mock('../functions/src/middleware/appcheck.js', () => ({
  requireAppCheck: vi.fn(),
}));

vi.mock('../functions/src/middleware/validate.js', () => ({
  validateInput: (schema: { parse: (data: unknown) => unknown }, data: unknown) => schema.parse(data),
}));

import { completeLessonModuleHandler } from '../functions/src/completeLessonModule';

describe('completeLessonModule callable', () => {
  beforeEach(() => {
    store.clear();
    firestoreMock.doc.mockClear();
    firestoreMock.batch.mockClear();
  });

  it('rejects when lesson cache is missing/invalid', async () => {
    await expect(
      completeLessonModuleHandler({
        app: {},
        auth: { uid: 'u-1' },
        data: {
          moduleId: 'a1-1',
          moduleTitle: 'M1',
          level: 'A1',
          totalBlocks: 2,
          exerciseResults: [{ exerciseId: 'b1:ex-1', attempts: 1, answer: 'hola' }],
        },
      } as never, { db: firestoreMock as never }),
    ).rejects.toMatchObject<HttpsError>({
      code: 'failed-precondition',
    });
  });

  it('rejects when exercise does not belong to cached lesson', async () => {
    store.set('lessons/u-1/cache/a1-1', {
      lesson: {
        exercises: [{ id: 'ex-allowed', type: 'fill_blank', answer: 'hola' }],
      },
    });

    await expect(
      completeLessonModuleHandler({
        app: {},
        auth: { uid: 'u-1' },
        data: {
          moduleId: 'a1-1',
          moduleTitle: 'M1',
          level: 'A1',
          totalBlocks: 2,
          exerciseResults: [{ exerciseId: 'b1:ex-other', attempts: 1, answer: 'hola' }],
        },
      } as never, { db: firestoreMock as never }),
    ).rejects.toMatchObject<HttpsError>({
      code: 'invalid-argument',
    });
  });

  it('normalizes answers server-side and unlocks next module only with objective score >= 60', async () => {
    store.set('lessons/u-1/cache/a1-1', {
      lesson: {
        exercises: [
          { id: 'ex-fill', type: 'fill_blank', answer: 'Canción' },
          { id: 'ex-choice', type: 'multiple_choice', answer: 'Sí' },
          { id: 'ex-flash', type: 'flashcard', answer: 'irrelevant' },
        ],
      },
    });

    const result = await completeLessonModuleHandler({
      app: {},
      auth: { uid: 'u-1' },
      data: {
        moduleId: 'a1-1',
        moduleTitle: 'M1',
        level: 'A1',
        totalBlocks: 2,
        exerciseResults: [
          { exerciseId: 'block:ex-fill', attempts: 1, answer: 'cancion' }, // correct after accent normalization
          { exerciseId: 'block:ex-choice', attempts: 2, answer: 'nao' }, // wrong
          { exerciseId: 'block:ex-flash', attempts: 1, answer: 'qualquer' }, // ignored in score
        ],
        nextModule: { id: 'a1-2', title: 'M2', level: 'A1' },
      },
    } as never, { db: firestoreMock as never });

    expect(result).toMatchObject({
      ok: true,
      finalScore: 70, // (100 + 40) / 2 objective exercises
      unlockedNextModule: true,
      unlockedModuleId: 'a1-2',
    });

    const progress = store.get('users/u-1/lessonProgress/a1-1');
    expect(progress?.score).toBe(70);
    expect(progress?.weakExercises).toEqual(['ex-choice']);

    const next = store.get('users/u-1/lessonProgress/a1-2');
    expect(next?.unlocked).toBe(true);
  });
});
