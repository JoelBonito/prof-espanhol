export class HttpsError extends Error {
  code: string;
  constructor(code: string, message = '') {
    super(message);
    this.code = code;
    this.name = 'HttpsError';
  }
}

export const onCall = (optionsOrFn: unknown, fn?: unknown) => fn ?? optionsOrFn;

export type CallableRequest<T = unknown> = {
  auth?: { uid: string };
  app?: unknown;
  data: T;
};
