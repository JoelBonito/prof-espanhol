import { functions, httpsCallable } from '../../../lib/functions';

interface CompleteHomeworkInput {
  homeworkId: string;
  score: number;
}

interface CompleteHomeworkResponse {
  ok: boolean;
  status: 'pending' | 'completed';
  accepted: boolean;
  creditApplied?: number;
}

const completeHomeworkFn = httpsCallable<CompleteHomeworkInput, CompleteHomeworkResponse>(
  functions,
  'completeHomework',
);

export async function completeHomework(input: CompleteHomeworkInput): Promise<CompleteHomeworkResponse> {
  const response = await completeHomeworkFn(input);
  return response.data;
}

