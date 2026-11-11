import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from './backup';
import type { Snapshot } from './types';

// Reject whole malformed backups before either platform's local store is touched.
describe('portable backups', () => {
  const snapshot: Snapshot = {
    items: [{ id: 'book-1', kind: 'book', title: 'Book', total: 200, progress: 20, status: 'in-progress', createdAt: '2026-11-01T10:00:00.000Z' }],
    events: [{ id: 'event-1', itemId: 'book-1', date: '2026-11-11', from: 0, to: 20, minutesSpent: 0 }],
  };

  it('round trips the versioned snapshot', () => {
    expect(parseBackup(createBackup(snapshot))).toEqual(snapshot);
  });

  it('rejects an event for a missing item', () => {
    const backup = createBackup(snapshot);
    backup.events[0].itemId = 'missing';
    expect(() => parseBackup(backup)).toThrow();
  });

  it('rejects an unsupported version', () => {
    expect(() => parseBackup({ ...createBackup(snapshot), formatVersion: 2 })).toThrow();
  });
});
