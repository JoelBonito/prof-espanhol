import { describe, expect, it } from 'vitest';
import { getModulesByLevel } from '../lib/moduleCatalog';

describe('module catalog', () => {
  it('returns A1 catalog by default for unknown levels', () => {
    const modules = getModulesByLevel('C2');

    expect(modules).toHaveLength(5);
    expect(modules[0]?.id).toBe('a1-1');
  });

  it('normalizes level input to uppercase', () => {
    const lower = getModulesByLevel('a2');
    const upper = getModulesByLevel('A2');

    expect(lower).toEqual(upper);
    expect(lower[0]?.id).toBe('a2-1');
  });

  it('preserves prerequisite chain and ordering for a level', () => {
    const modules = getModulesByLevel('B1');

    expect(modules.map((module) => module.order)).toEqual([1, 2, 3, 4, 5]);
    expect(modules[0]?.prerequisiteId).toBeNull();
    expect(modules[1]?.prerequisiteId).toBe('b1-1');
    expect(modules[2]?.prerequisiteId).toBe('b1-2');
  });

  it('returns a shallow copy so callers cannot mutate source catalog', () => {
    const firstRead = getModulesByLevel('A1');
    firstRead.pop();

    const secondRead = getModulesByLevel('A1');
    expect(secondRead).toHaveLength(5);
  });
});
