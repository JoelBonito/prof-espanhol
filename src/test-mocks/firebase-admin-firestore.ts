export const getFirestore = () => {
  throw new Error('Use injected mock db in tests');
};

export const FieldValue = {
  serverTimestamp: () => ({ _type: 'serverTimestamp' }),
  increment: (n: number) => ({ _type: 'increment', n }),
  arrayUnion: (...args: unknown[]) => ({ _type: 'arrayUnion', args }),
  arrayRemove: (...args: unknown[]) => ({ _type: 'arrayRemove', args }),
  delete: () => ({ _type: 'delete' }),
};

export type Firestore = unknown;
