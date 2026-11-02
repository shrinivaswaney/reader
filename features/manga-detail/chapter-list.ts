// Pure chapter-list math — no React, fully unit-testable.

export const CHAPTER_PREVIEW_COUNT = 5;

export type SortDirection = 'asc' | 'desc';

type NumberedChapter = { number: number };

/** Keeps chapters whose number contains the typed digits (e.g. "12" hits 12, 120, 1.2? no — 12, 120, 12.5). */
export function filterByChapterNumber<T extends NumberedChapter>(chapters: T[], rawQuery: string): T[] {
  const q = rawQuery.trim();
  if (!q) return chapters;
  return chapters.filter((c) => String(c.number).includes(q));
}

/** Stable value sort; API feeds are newest-first, so 'desc' preserves that by default. */
export function sortChapters<T extends NumberedChapter>(chapters: T[], dir: SortDirection): T[] {
  return [...chapters].sort((a, b) => (dir === 'asc' ? a.number - b.number : b.number - a.number));
}
