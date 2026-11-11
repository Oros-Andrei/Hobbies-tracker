import type { MediaItem, MediaKind, MediaStatus, ProgressEvent, Snapshot } from './types';

export const emptySnapshot = (): Snapshot => ({ items: [], events: [] });
export const localDateKey = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function isLocalDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDateKey(date) === value;
}

// Keep time numeric in storage and use one display rule in every screen.
export function formatDuration(minutes: number): string {
  const value = Math.max(0, Math.floor(minutes));
  return `${Math.floor(value / 60)}h ${String(value % 60).padStart(2, '0')}m`;
}

export function progressUnit(kind: MediaKind): string {
  return kind === 'book' ? 'pages' : kind === 'movie' ? 'minutes' : 'episodes';
}

export function addItem(snapshot: Snapshot, input: {
  kind: MediaKind; title: string; total: number; author?: string;
  status: MediaStatus; coverUrl?: string; openLibraryKey?: string;
  completionDate?: string; minutesSpent?: number;
}): Snapshot {
  if (!input.title.trim() || !Number.isInteger(input.total) || input.total < 1) throw new Error('Enter a title and a total greater than zero.');
  if (input.status === 'completed' && (!input.completionDate || !isLocalDateKey(input.completionDate))) throw new Error('Choose a valid completion date.');
  if (input.status === 'completed' && input.kind !== 'book' && (!Number.isInteger(input.minutesSpent) || (input.minutesSpent ?? -1) < 0)) throw new Error('Enter actual minutes watched.');
  const id = crypto.randomUUID();
  const item: MediaItem = {
    id, kind: input.kind, title: input.title.trim(), total: input.total,
    progress: input.status === 'completed' ? input.total : 0, status: input.status, createdAt: new Date().toISOString(),
    ...(input.author?.trim() ? { author: input.author.trim() } : {}),
    ...(input.coverUrl ? { coverUrl: input.coverUrl } : {}),
    ...(input.openLibraryKey ? { openLibraryKey: input.openLibraryKey } : {}),
    ...(input.status === 'completed' ? { completedAt: input.completionDate } : {}),
  };
  const events = input.status === 'completed' ? [...snapshot.events, {
    id: crypto.randomUUID(), itemId: id, date: input.completionDate!, from: 0, to: input.total,
    minutesSpent: input.kind === 'book' ? 0 : input.minutesSpent!,
  }] : snapshot.events;
  return { items: [...snapshot.items, item], events };
}

// Complete at the exact total and retain actual viewing minutes for statistics.
export function recordProgress(snapshot: Snapshot, itemId: string, to: number, date: string, minutesSpent: number): Snapshot {
  const item = snapshot.items.find(candidate => candidate.id === itemId);
  if (!item) throw new Error('This item is no longer available.');
  if (!isLocalDateKey(date)) throw new Error('Choose a valid date.');
  if (!Number.isInteger(to) || to < item.progress || to > item.total) throw new Error('Progress must be between the current value and the total.');
  if (!Number.isInteger(minutesSpent) || minutesSpent < 0 || (item.kind === 'book' && minutesSpent !== 0)) throw new Error('Enter valid minutes watched.');
  if (to === item.progress && minutesSpent === 0) throw new Error('Enter progress or time spent.');
  const event: ProgressEvent = { id: crypto.randomUUID(), itemId, date, from: item.progress, to, minutesSpent };
  const status: MediaStatus = to === item.total ? 'completed' : 'in-progress';
  return {
    items: snapshot.items.map(candidate => candidate.id === itemId ? {
      ...candidate, progress: to, status,
      ...(status === 'completed' ? { completedAt: date } : { completedAt: undefined }),
    } : candidate),
    events: [...snapshot.events, event],
  };
}

// Manual status changes preserve the user's existing progress and history.
export function setItemStatus(snapshot: Snapshot, itemId: string, status: Exclude<MediaStatus, 'completed'>): Snapshot {
  return { ...snapshot, items: snapshot.items.map(item => item.id === itemId ? {
    ...item, status, completedAt: undefined,
  } : item) };
}

// Editing metadata does not invent reading pages or watch time in the charts.
export function editItem(snapshot: Snapshot, itemId: string, changes: { title: string; author?: string; total: number }): Snapshot {
  if (!changes.title.trim() || !Number.isInteger(changes.total) || changes.total < 1) throw new Error('Enter a title and a total greater than zero.');
  return { ...snapshot, items: snapshot.items.map(item => {
    if (item.id !== itemId) return item;
    if (changes.total < item.progress) throw new Error('The total cannot be below current progress.');
    const completed = item.progress === changes.total;
    return { ...item, title: changes.title.trim(), total: changes.total,
      ...(item.kind === 'book' ? { author: changes.author?.trim() || undefined } : {}),
      status: completed ? 'completed' as const : item.status === 'completed' ? 'in-progress' as const : item.status,
      completedAt: completed ? item.completedAt ?? localDateKey() : undefined,
    };
  }) };
}

export function removeItem(snapshot: Snapshot, itemId: string): Snapshot {
  return { items: snapshot.items.filter(item => item.id !== itemId), events: snapshot.events.filter(event => event.itemId !== itemId) };
}
