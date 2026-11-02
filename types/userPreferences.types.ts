import { Manga } from './manga.types';
import { MangaDemographic, ContentRating } from './mangaTag.types';

// User's Progress with Manga Chapters
export type ContinueReading = Manga & {
  lastChapter: number;
  lastPage: number;
  totalPagesInChapter: number;
};

export enum MangaGenre {
  Shonen,
  Shojo,
  Seinen,
  Josei,
  Kodomo,
}

// Per-user content filtering — mirrors MangaDex's own client defaults.
// New accounts should default to maxContentRating: 'safe' and the
// DEFAULT_EXCLUDED_TAG_IDS from src/constants/mangaTags.ts.
export type ContentPreferences = {
  maxContentRating: ContentRating;
  excludedTagIds: string[];
  preferredDemographics?: MangaDemographic[];
};
