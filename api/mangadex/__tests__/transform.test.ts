import { transformManga, transformChapter, transformMangaDetail } from '../transform';
import { MDManga, MDChapter } from '../mangadex.types';

const rawManga: MDManga = {
  id: 'md-1',
  type: 'manga',
  attributes: {
    title: { en: 'Blossom Days' },
    altTitles: [{ ja: 'ブルーム' }],
    description: { en: 'A story about flowers.' },
    status: 'ongoing',
    originalLanguage: 'ja',
    tags: [
      { id: 't1', attributes: { name: { en: 'Slice of Life' }, group: 'genre' } },
      { id: 't2', attributes: { name: { en: 'Cooking' }, group: 'theme' } }, // theme — must be filtered out
      { id: 't3', attributes: { name: { en: 'Romance' }, group: 'genre' } },
    ],
  },
  relationships: [
    { id: 'cov-1', type: 'cover_art', attributes: { fileName: 'abc.jpg' } },
    { id: 'auth-1', type: 'author' },
  ],
} as unknown as MDManga;

const rawChapter: MDChapter = {
  id: 'ch-9',
  type: 'chapter',
  attributes: {
    chapter: '9.5',
    title: 'Interlude',
    publishAt: '2026-01-01T00:00:00Z',
  },
} as unknown as MDChapter;

describe('transformManga', () => {
  it('maps id, title and cover URL from the cover_art relationship', () => {
    const m = transformManga(rawManga);
    expect(m.externalId).toBe('md-1');
    expect(m.title).toBe('Blossom Days');
    expect(m.coverUrl).toContain('/covers/md-1/abc.jpg');
    expect(m.type).toBe('manga');
  });

  it('derives manhwa/manhua type from original language', () => {
    expect(transformManga({ ...rawManga, attributes: { ...rawManga.attributes, originalLanguage: 'ko' } }).type).toBe('manhwa');
    expect(transformManga({ ...rawManga, attributes: { ...rawManga.attributes, originalLanguage: 'zh' } }).type).toBe('manhua');
  });

  it('keeps only genre-group tags, capped at five', () => {
    const m = transformManga(rawManga);
    expect(m.genres).toEqual(['Slice of Life', 'Romance']);
  });

  it('falls back to an alternate title when no localized title exists', () => {
    const m = transformManga({
      ...rawManga,
      attributes: { ...rawManga.attributes, title: {} },
    });
    expect(m.title).toBe('Untitled'); // altTitles has no `en` key either
  });
});

describe('transformChapter', () => {
  it('parses fractional chapter numbers and keeps publish date', () => {
    const c = transformChapter(rawChapter);
    expect(c.number).toBe(9.5);
    expect(c.releasedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('coerces missing chapter numbers to 0 rather than NaN', () => {
    const c = transformChapter({
      ...rawChapter,
      attributes: { ...rawChapter.attributes, chapter: null },
    } as unknown as MDChapter);
    expect(c.number).toBe(0);
  });
});

describe('transformMangaDetail', () => {
  it('combines base fields with synopsis, status and chapters', () => {
    const d = transformMangaDetail(rawManga, [rawChapter]);
    expect(d.synopsis).toBe('A story about flowers.');
    expect(d.status).toBe('ongoing');
    expect(d.chapters).toHaveLength(1);
    expect(d.platformLinks[0].url).toContain('mangadex.org/title/md-1');
  });

  it('maps cancelled status onto hiatus for UI purposes', () => {
    const d = transformMangaDetail(
      { ...rawManga, attributes: { ...rawManga.attributes, status: 'cancelled' } },
      []
    );
    expect(d.status).toBe('hiatus');
  });
});
