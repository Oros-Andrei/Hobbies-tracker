import type { MediaKind, Snapshot } from './types';

export interface CategoryStats { completed: number; minutes: number; pages: number }
export interface ChartPoint { month: string; value: number }

// Activity events distinguish pages read and minutes spent from item metadata.
export function categoryStats(snapshot: Snapshot, kind: MediaKind): CategoryStats {
  const ids = new Set(snapshot.items.filter(item => item.kind === kind).map(item => item.id));
  const events = snapshot.events.filter(event => ids.has(event.itemId));
  return {
    completed: snapshot.items.filter(item => item.kind === kind && item.status === 'completed').length,
    minutes: events.reduce((sum, event) => sum + event.minutesSpent, 0),
    pages: kind === 'book' ? events.reduce((sum, event) => sum + Math.max(0, event.to - event.from), 0) : 0,
  };
}

// Use local calendar months so the last twelve bars match the user's dates.
export function monthlyActivity(snapshot: Snapshot, kind: MediaKind, today = new Date()): ChartPoint[] {
  const ids = new Set(snapshot.items.filter(item => item.kind === kind).map(item => item.id));
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 11 + index, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const value = snapshot.events.filter(event => ids.has(event.itemId) && event.date.startsWith(month))
      .reduce((sum, event) => sum + (kind === 'book' ? Math.max(0, event.to - event.from) : event.minutesSpent), 0);
    return { month, value };
  });
}
