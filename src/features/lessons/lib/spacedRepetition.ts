export const SM2_INTERVAL_HOURS = [1, 24, 72, 168, 720] as const;

export interface ReviewScheduleItem {
  exerciseId: string;
  step: number;
  intervalHours: number;
  nextReviewAt: string;
}

export function getNextStep(previousStep: number | undefined): number {
  if (typeof previousStep !== 'number' || Number.isNaN(previousStep)) {
    return 0;
  }

  return Math.min(previousStep + 1, SM2_INTERVAL_HOURS.length - 1);
}

export function buildReviewSchedule(
  weakExerciseIds: string[],
  previousSteps: Record<string, number>,
  now = new Date(),
): ReviewScheduleItem[] {
  return weakExerciseIds.map((exerciseId) => {
    const step = getNextStep(previousSteps[exerciseId]);
    const intervalHours = SM2_INTERVAL_HOURS[step];
    const nextReviewAt = new Date(now.getTime() + intervalHours * 60 * 60 * 1000).toISOString();

    return {
      exerciseId,
      step,
      intervalHours,
      nextReviewAt,
    };
  });
}
