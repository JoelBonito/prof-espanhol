// Shared TypeScript types (client + Cloud Functions via zod schemas)

export type SpanishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  phone?: string;
  bio?: string;
  level: SpanishLevel | null;
  xp: number;
  streak: number;
  lastActiveAt: string; // ISO date string
  createdAt: string; // ISO date string
  diagnosticCompletedAt: string | null;
}

export interface ApiError {
  code: string;
  message: string;
}

// Utility type for async states
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
