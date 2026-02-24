import { describe, expect, it } from 'vitest';
import { buildReviewSchedule, getNextStep, SM2_INTERVAL_HOURS } from '../lib/spacedRepetition';

describe('spaced repetition helper', () => {
  it('starts at step 0 when there is no previous history', () => {
    expect(getNextStep(undefined)).toBe(0);
  });

  it('increments until the max configured step', () => {
    expect(getNextStep(0)).toBe(1);
    expect(getNextStep(3)).toBe(4);
    expect(getNextStep(4)).toBe(4);
  });

  it('starts from step 0 for invalid previous values', () => {
    expect(getNextStep(Number.NaN)).toBe(0);
    expect(getNextStep(-1)).toBe(0);
  });

  it('builds schedule using canonical intervals', () => {
    const now = new Date('2026-02-24T00:00:00.000Z');
    const schedule = buildReviewSchedule(['ex-1', 'ex-2'], { 'ex-1': 1 }, now);

    expect(schedule[0]?.step).toBe(2);
    expect(schedule[0]?.intervalHours).toBe(SM2_INTERVAL_HOURS[2]);
    expect(schedule[1]?.step).toBe(0);
    expect(schedule[1]?.intervalHours).toBe(SM2_INTERVAL_HOURS[0]);
  });

  it('returns empty schedule when there are no weak exercises', () => {
    const schedule = buildReviewSchedule([], {}, new Date('2026-02-24T00:00:00.000Z'));
    expect(schedule).toEqual([]);
  });

  it('caps next step at max interval when previous step is already max', () => {
    const now = new Date('2026-02-24T00:00:00.000Z');
    const schedule = buildReviewSchedule(['ex-1'], { 'ex-1': SM2_INTERVAL_HOURS.length - 1 }, now);

    expect(schedule[0]?.step).toBe(SM2_INTERVAL_HOURS.length - 1);
    expect(schedule[0]?.intervalHours).toBe(SM2_INTERVAL_HOURS[SM2_INTERVAL_HOURS.length - 1]);
  });
});
