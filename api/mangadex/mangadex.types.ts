// Minimal typing for the MangaDex API responses we actually consume.
// Not exhaustive — MangaDex's schema has far more fields than we use.

export type MDLocalizedString = Record<string, string>; // e.g. { en: "Title", ja: "タイトル" }

export type MDTag = {
  id: string;
  attributes: {
    name: MDLocalizedString;
    group: 'genre' | 'theme' | 'format' | 'content';
  };
};

export type MDCoverArt = {
  id: string;
  type: 'cover_art';
  attributes: { fileName: string };
};

export type MDMangaAttributes = {
  title: MDLocalizedString;
  altTitles: MDLocalizedString[];
  description: MDLocalizedString;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  originalLanguage: string;
  tags: MDTag[];
};

export type MDManga = {
  id: string;
  type: 'manga';
  attributes: MDMangaAttributes;
  relationships: (MDCoverArt | { id: string; type: string })[];
};

export type MDMangaListResponse = {
  result: 'ok' | 'error';
  data: MDManga[];
  total: number;
};

export type MDMangaResponse = {
  result: 'ok' | 'error';
  data: MDManga;
};

export type MDChapterAttributes = {
  chapter: string | null; // e.g. "12", "12.5", null for oneshots
  title: string | null;
  translatedLanguage: string;
  publishAt: string;
  pages: number;
};

export type MDChapter = {
  id: string;
  type: 'chapter';
  attributes: MDChapterAttributes;
};

export type MDChapterFeedResponse = {
  result: 'ok' | 'error';
  data: MDChapter[];
  total: number;
};

export type MDAtHomeResponse = {
  result: 'ok' | 'error';
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];      // full-quality filenames
    dataSaver: string[]; // compressed filenames
  };
};