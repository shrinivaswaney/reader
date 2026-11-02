import { Manga } from '@/types/manga.types';
import { trending, newReleases, continueReading } from './dummyManga';

export type LibraryStatus = 'reading' | 'on_hold' | 'completed' | 'dropped' | 'plan_to_read' | 'unfollowed';

export type LibraryEntry = {
  manga: Manga;
  status: LibraryStatus;
  isFavorite: boolean;
  newChapters?: number; // unread chapters since last read — drives cover badges
};

// Built from the existing dummy pools so covers/titles stay consistent
// across screens. Swap for a real Supabase query against library_items
// once auth is wired in.
export const libraryEntries: LibraryEntry[] = [
  ...continueReading.map((m, i) => ({
    manga: m,
    status: 'reading' as LibraryStatus,
    isFavorite: i === 0,
    newChapters: i === 0 ? 3 : i === 1 ? 1 : 0,
  })),
  { manga: trending[0], status: 'plan_to_read', isFavorite: false },
  { manga: trending[1], status: 'completed', isFavorite: true },
  { manga: trending[2], status: 'on_hold', isFavorite: false, newChapters: 5 },
  { manga: trending[3], status: 'dropped', isFavorite: false },
  { manga: newReleases[0], status: 'plan_to_read', isFavorite: false },
  { manga: newReleases[1], status: 'reading', isFavorite: false, newChapters: 12 },
];

export const statusLabels: Record<LibraryStatus, string> = {
  reading: 'Reading',
  on_hold: 'On Hold',
  completed: 'Completed',
  dropped: 'Dropped',
  plan_to_read: 'Plan to Read',
  unfollowed: 'Unfollowed',
};