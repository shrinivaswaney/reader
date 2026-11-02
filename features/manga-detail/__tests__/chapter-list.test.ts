import { CHAPTER_PREVIEW_COUNT, filterByChapterNumber, sortChapters } from '../chapter-list';

const chapters = [
  { id: 'a', number: 12 },
  { id: 'b', number: 3.5 },
  { id: 'c', number: 120 },
  { id: 'd', number: 7 },
];

describe('filterByChapterNumber', () => {
  it('returns the full list for empty/blank queries', () => {
    expect(filterByChapterNumber(chapters, '')).toBe(chapters);
    expect(filterByChapterNumber(chapters, '   ')).toBe(chapters);
  });

  it('matches numbers containing the typed digits', () => {
    expect(filterByChapterNumber(chapters, '12').map((c) => c.id)).toEqual(['a', 'c']);
    expect(filterByChapterNumber(chapters, '.5').map((c) => c.id)).toEqual(['b']);
    expect(filterByChapterNumber(chapters, '9')).toEqual([]);
  });

  it('does not mutate the input', () => {
    const before = JSON.stringify(chapters);
    filterByChapterNumber(chapters, '1');
    expect(JSON.stringify(chapters)).toBe(before);
  });
});

describe('sortChapters', () => {
  it('sorts descending by default semantics (newest first)', () => {
    expect(sortChapters(chapters, 'desc').map((c) => c.number)).toEqual([120, 12, 7, 3.5]);
  });

  it('sorts ascending on demand (oldest first)', () => {
    expect(sortChapters(chapters, 'asc').map((c) => c.number)).toEqual([3.5, 7, 12, 120]);
  });

  it('returns a new array rather than sorting in place', () => {
    const before = JSON.stringify(chapters);
    sortChapters(chapters, 'asc');
    expect(JSON.stringify(chapters)).toBe(before);
  });
});

describe('CHAPTER_PREVIEW_COUNT', () => {
  it('is the preview cap used by the detail screen', () => {
    expect(CHAPTER_PREVIEW_COUNT).toBe(5);
  });
});
