import { describe, expect, it } from 'vitest';
import { addItem, emptySnapshot, formatDuration, recordProgress } from './mediaLogic';

// Completion and time formatting protect the most visible progress rules.
describe('media progress', () => {
  it('marks a movie completed at its runtime and keeps actual watch minutes', () => {
    const first = addItem(emptySnapshot(), { kind: 'movie', title: 'Example', total: 120, status: 'planned' });
    const id = first.items[0].id;
    const halfway = recordProgress(first, id, 45, '2026-11-10', 52);
    const finished = recordProgress(halfway, id, 120, '2026-11-11', 80);
    expect(halfway.items[0].status).toBe('in-progress');
    expect(finished.items[0]).toMatchObject({ progress: 120, status: 'completed', completedAt: '2026-11-11' });
    expect(finished.events.map(event => event.minutesSpent)).toEqual([52, 80]);
    expect(formatDuration(145)).toBe('2h 25m');
  });

  it('rejects impossible progress dates and values', () => {
    const first = addItem(emptySnapshot(), { kind: 'book', title: 'Example', total: 100, status: 'planned' });
    const id = first.items[0].id;
    expect(() => recordProgress(first, id, 10, '2026-02-30', 0)).toThrow();
    expect(() => recordProgress(first, id, 101, '2026-11-11', 0)).toThrow();
  });

  it('records a previously completed book when added directly', () => {
    const saved = addItem(emptySnapshot(), { kind: 'book', title: 'Finished book', total: 220, status: 'completed', completionDate: '2026-10-02' });
    expect(saved.items[0]).toMatchObject({ status: 'completed', progress: 220, completedAt: '2026-10-02' });
    expect(saved.events[0]).toMatchObject({ from: 0, to: 220, minutesSpent: 0 });
  });
});
