// Shape for manga as displayed in the UI (search results, discover feed, etc).
// This mirrors what MangaDex/AniList responses will eventually provide —
// kept separate from database.types.ts, which describes YOUR stored data
// (library_items, reading_progress), not the external catalog.

export type MangaType = 'manga' | 'manhwa' | 'manhua';

export type Manga = {
  externalId: string; // MangaDex manga id, once wired to the real API
  title: string;
  coverUrl: string;
  type: MangaType;
  genres: string[];
  rating?: number; // 0–10, optional — not every source has one
  latestChapter?: number;
};

export type ContinueReadingItem = Manga & {
  lastChapter: number;
  lastPage: number;
  totalPagesInChapter: number; // used to compute the progress ring
};

export type PlatformLink = {
  platformName: string;
  url: string;
  kind: 'read' | 'watch';
  isOfficial: boolean; // surfaced in UI — never present unofficial sources as equivalent
};

export type Chapter = {
  id: string;
  number: number;
  title?: string;
  releasedAt: string; // ISO date
  isRead: boolean;
};

export type MangaDetail = Manga & {
  synopsis: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  chapters: Chapter[];
  platformLinks: PlatformLink[];
};