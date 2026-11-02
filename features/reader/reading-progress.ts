// Pure reading-history math — no React, no storage imports, fully
// unit-testable (same split as scroll-progress.ts / rtl-pagination.ts).
// Storage I/O lives in providers/reading-progress-provider.tsx.

export const READING_PROGRESS_KEY = 'reading.progress.v1';
export const READING_HISTORY_CAP = 20;

export type ReadingProgressEntry = {
  mangaId: string;
  title: string;
  coverUrl: string;
  chapterId: string;
  lastChapter: number;
  lastPage: number;
  totalPagesInChapter: number;
  updatedAt: string; // ISO date — drives recency sort + cap eviction
};

export type ReadingProgressMap = Record<string, ReadingProgressEntry>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function asInt(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/** Sanitizes untrusted JSON from AsyncStorage into a valid map. */
export function normalizeReadingProgress(raw: unknown): ReadingProgressMap {
  if (raw === null || typeof raw !== 'object') return {};
  const result: ReadingProgressMap = {};
  for (const [mangaId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as Record<string, unknown>;
    const id = asString(v.mangaId, mangaId);
    if (!id) continue;
    result[mangaId] = {
      mangaId: id,
      title: asString(v.title, 'Untitled'),
      coverUrl: asString(v.coverUrl),
      chapterId: asString(v.chapterId),
      lastChapter: asInt(v.lastChapter, 1),
      lastPage: asInt(v.lastPage, 0),
      totalPagesInChapter: asInt(v.totalPagesInChapter, 0),
      updatedAt: asString(
        v.updatedAt,
        typeof v.updatedAt === 'string' ? v.updatedAt : new Date(0).toISOString()
      ),
    };
  }
  return result;
}

/** Pure upsert + cap: newest entry wins per manga, oldest entries evicted. */
export function upsertProgress(
  map: ReadingProgressMap,
  entry: ReadingProgressEntry,
  cap: number = READING_HISTORY_CAP
): ReadingProgressMap {
  const next: ReadingProgressMap = { ...map, [entry.mangaId]: entry };
  const overflow = Object.keys(next).length - cap;
  if (overflow <= 0) return next;
  const stalest = Object.values(next)
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, overflow);
  for (const s of stalest) delete next[s.mangaId];
  return next;
}

/** Recency-sorted history, newest first (what the Continue Reading rail shows). */
export function sortedHistory(map: ReadingProgressMap): ReadingProgressEntry[] {
  return Object.values(map).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
