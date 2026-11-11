import { isLocalDateKey } from './mediaLogic';
import { MEDIA_KINDS, MEDIA_STATUSES, type MediaItem, type ProgressEvent, type Snapshot } from './types';

export interface HobbiesBackup extends Snapshot {
  app: 'hobbies-tracker';
  formatVersion: 1;
  exportedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isDate = (value: unknown): value is string => typeof value === 'string' && isLocalDateKey(value);

// Validate the entire snapshot before an import can replace saved data.
export function parseSnapshot(value: unknown): Snapshot {
  if (!isRecord(value) || !Array.isArray(value.items) || !Array.isArray(value.events)) throw new Error('The backup has no valid items and progress history.');
  const itemIds = new Set<string>();
  const items: MediaItem[] = value.items.map((raw: unknown) => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id || itemIds.has(raw.id) ||
      !MEDIA_KINDS.includes(raw.kind as MediaItem['kind']) || typeof raw.title !== 'string' || !raw.title.trim() ||
      !Number.isInteger(raw.total) || (raw.total as number) < 1 || !Number.isInteger(raw.progress) ||
      (raw.progress as number) < 0 || (raw.progress as number) > (raw.total as number) ||
      !MEDIA_STATUSES.includes(raw.status as MediaItem['status']) || typeof raw.createdAt !== 'string' ||
      Number.isNaN(Date.parse(raw.createdAt)) ||
      (raw.author !== undefined && typeof raw.author !== 'string') ||
      (raw.coverUrl !== undefined && (typeof raw.coverUrl !== 'string' || !/^https:\/\/covers\.openlibrary\.org\//.test(raw.coverUrl))) ||
      (raw.openLibraryKey !== undefined && typeof raw.openLibraryKey !== 'string') ||
      (raw.completedAt !== undefined && !isDate(raw.completedAt)) ||
      (raw.status === 'completed' && ((raw.progress as number) !== (raw.total as number) || !isDate(raw.completedAt)))) {
      throw new Error('The backup contains an invalid item.');
    }
    itemIds.add(raw.id);
    return raw as unknown as MediaItem;
  });
  const eventIds = new Set<string>();
  const events: ProgressEvent[] = value.events.map((raw: unknown) => {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id || eventIds.has(raw.id) ||
      typeof raw.itemId !== 'string' || !itemIds.has(raw.itemId) || !isDate(raw.date) ||
      !Number.isInteger(raw.from) || !Number.isInteger(raw.to) || (raw.from as number) < 0 ||
      (raw.to as number) < (raw.from as number) || !Number.isInteger(raw.minutesSpent) || (raw.minutesSpent as number) < 0) {
      throw new Error('The backup contains an invalid progress entry.');
    }
    const item = items.find(candidate => candidate.id === raw.itemId)!;
    if ((raw.to as number) > item.total || (item.kind === 'book' && raw.minutesSpent !== 0)) throw new Error('The backup contains invalid progress totals.');
    eventIds.add(raw.id);
    return raw as unknown as ProgressEvent;
  });
  return { items, events };
}

export function parseBackup(value: unknown): Snapshot {
  if (!isRecord(value) || value.app !== 'hobbies-tracker' || value.formatVersion !== 1 ||
    typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) {
    throw new Error('This is not a supported Hobbies Tracker backup.');
  }
  return parseSnapshot(value);
}

// Export a portable format independent of browser IndexedDB and Android SQLite.
export function createBackup(snapshot: Snapshot): HobbiesBackup {
  const parsed = parseSnapshot(snapshot);
  return { app: 'hobbies-tracker', formatVersion: 1, exportedAt: new Date().toISOString(), ...parsed };
}
