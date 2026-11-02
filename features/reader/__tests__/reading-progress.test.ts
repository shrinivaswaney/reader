import {
  normalizeReadingProgress,
  sortedHistory,
  upsertProgress,
  READING_HISTORY_CAP,
  type ReadingProgressEntry,
} from '../reading-progress';

function entry(mangaId: string, updatedAt: string): ReadingProgressEntry {
  return {
    mangaId,
    title: `Title ${mangaId}`,
    coverUrl: `https://example.com/${mangaId}.jpg`,
    chapterId: `ch-${mangaId}`,
    lastChapter: 1,
    lastPage: 0,
    totalPagesInChapter: 20,
    updatedAt,
  };
}

describe('normalizeReadingProgress', () => {
  it('returns an empty map for null/undefined/non-object input', () => {
    expect(normalizeReadingProgress(null)).toEqual({});
    expect(normalizeReadingProgress(undefined)).toEqual({});
    expect(normalizeReadingProgress('nope')).toEqual({});
    expect(normalizeReadingProgress(42)).toEqual({});
  });

  it('drops invalid entries and coerces bad fields to safe defaults', () => {
    const result = normalizeReadingProgress({
      good: { mangaId: 'good', title: 'Ok', coverUrl: 'c', chapterId: 'x', lastChapter: 3, lastPage: 2, totalPagesInChapter: 30, updatedAt: '2026-01-02T00:00:00.000Z' },
      junk: 'not-an-object',
      nullish: null,
      partial: { lastPage: -5, lastChapter: 'NaN-ish', updatedAt: 99 },
    });
    expect(Object.keys(result)).toEqual(['good', 'partial']);
    expect(result.partial.title).toBe('Untitled');
    expect(result.partial.lastPage).toBe(0);
    expect(result.partial.totalPagesInChapter).toBe(0);
  });
});

describe('upsertProgress', () => {
  const base = { a: entry('a', '2026-01-01T00:00:00.000Z') };

  it('adds new entries and replaces existing ones for the same manga', () => {
    let map = upsertProgress(base, entry('b', '2026-01-02T00:00:00.000Z'));
    expect(map.b).toBeDefined();
    map = upsertProgress(map, { ...entry('a', '2026-01-03T00:00:00.000Z'), lastPage: 9 });
    expect(Object.keys(map)).toHaveLength(2);
    expect(map.a.lastPage).toBe(9);
  });

  it(`caps history at ${READING_HISTORY_CAP} entries, evicting the stalest`, () => {
    let map = {};
    for (let i = 0; i < READING_HISTORY_CAP + 3; i++) {
      const day = String(i + 1).padStart(2, '0');
      map = upsertProgress(map, entry(`m${i}`, `2026-01-${day}T00:00:00.000Z`));
    }
    const keys = Object.keys(map);
    expect(keys).toHaveLength(READING_HISTORY_CAP);
    // The three oldest (m0, m1, m2) were evicted.
    expect(keys).not.toContain('m0');
    expect(keys).not.toContain('m1');
    expect(keys).not.toContain('m2');
  });

  it('does not mutate the input map', () => {
    const before = JSON.stringify(base);
    upsertProgress(base, entry('b', '2026-01-05T00:00:00.000Z'));
    expect(JSON.stringify(base)).toBe(before);
  });
});

describe('sortedHistory', () => {
  it('sorts newest first regardless of insertion order', () => {
    const history = sortedHistory({
      old: entry('old', '2026-01-01T00:00:00.000Z'),
      new: entry('new', '2026-03-01T00:00:00.000Z'),
      mid: entry('mid', '2026-02-01T00:00:00.000Z'),
    });
    expect(history.map((e) => e.mangaId)).toEqual(['new', 'mid', 'old']);
  });
});
