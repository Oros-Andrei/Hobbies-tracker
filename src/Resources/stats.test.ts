import { describe, expect, it } from 'vitest';
import { categoryStats, monthlyActivity } from './stats';
import type { Snapshot } from './types';

// Charts must count dated activity without mixing page and minute units.
describe('statistics', () => {
  const snapshot: Snapshot = {
    items: [
      { id: 'b', kind: 'book', title: 'Book', total: 300, progress: 80, status: 'in-progress', createdAt: '2026-10-01T00:00:00.000Z' },
      { id: 'm', kind: 'movie', title: 'Movie', total: 120, progress: 120, status: 'completed', completedAt: '2026-11-02', createdAt: '2026-10-01T00:00:00.000Z' },
    ],
    events: [
      { id: 'e1', itemId: 'b', date: '2026-10-15', from: 0, to: 50, minutesSpent: 0 },
      { id: 'e2', itemId: 'b', date: '2026-11-02', from: 50, to: 80, minutesSpent: 0 },
      { id: 'e3', itemId: 'm', date: '2026-11-02', from: 0, to: 120, minutesSpent: 145 },
    ],
  };

  it('reports pages, completed movies and actual time', () => {
    expect(categoryStats(snapshot, 'book')).toMatchObject({ pages: 80, minutes: 0 });
    expect(categoryStats(snapshot, 'movie')).toMatchObject({ completed: 1, minutes: 145 });
  });

  it('places updates in their local calendar months', () => {
    const books = monthlyActivity(snapshot, 'book', new Date(2026, 10, 11));
    expect(books.slice(-2)).toEqual([{ month: '2026-10', value: 50 }, { month: '2026-11', value: 30 }]);
    expect(monthlyActivity(snapshot, 'movie', new Date(2026, 10, 11)).at(-1)?.value).toBe(145);
  });
});
