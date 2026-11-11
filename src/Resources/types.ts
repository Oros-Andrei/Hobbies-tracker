export type MediaKind = 'book' | 'movie' | 'series' | 'anime' | 'animation';
export type MediaStatus = 'planned' | 'in-progress' | 'completed' | 'dropped';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  author?: string;
  total: number;
  progress: number;
  status: MediaStatus;
  coverUrl?: string;
  openLibraryKey?: string;
  createdAt: string;
  completedAt?: string;
}

// A dated change keeps charts based on activity rather than today's totals.
export interface ProgressEvent {
  id: string;
  itemId: string;
  date: string;
  from: number;
  to: number;
  minutesSpent: number;
}

export interface Snapshot {
  items: MediaItem[];
  events: ProgressEvent[];
}

export const MEDIA_KINDS: MediaKind[] = ['book', 'movie', 'series', 'anime', 'animation'];
export const MEDIA_STATUSES: MediaStatus[] = ['planned', 'in-progress', 'completed', 'dropped'];

export const KIND_LABELS: Record<MediaKind, string> = {
  book: 'Books', movie: 'Movies', series: 'Series', anime: 'Anime', animation: 'Animation',
};

export const KIND_SINGULAR: Record<MediaKind, string> = {
  book: 'Book', movie: 'Movie', series: 'Series', anime: 'Anime', animation: 'Animation',
};

export const STATUS_LABELS: Record<MediaStatus, string> = {
  planned: 'Planned', 'in-progress': 'In progress', completed: 'Completed', dropped: 'Dropped',
};
