// Type of Manga
export type MangaType = 'manga' | 'manhwa' | 'manhua';

// Manga Details Cover
export type Manga = {
  id: string;
  title: string;
  coverUrl: string;
  type: MangaType;
  genres: string[];
  rating?: number;
  latestChapter?: number;
};

// Derived From
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
