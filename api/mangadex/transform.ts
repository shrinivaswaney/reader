import { MDManga, MDChapter } from './mangadex.types';
import { coverUrl } from './client';
import { Manga, MangaDetail, Chapter, MangaType } from '@/types/manga.types';

function pickTitle(attrs: MDManga['attributes']): string {
  return attrs.title.en ?? Object.values(attrs.title)[0] ?? attrs.altTitles.find((t) => t.en)?.en ?? 'Untitled';
}

function pickDescription(attrs: MDManga['attributes']): string {
  return attrs.description.en ?? Object.values(attrs.description)[0] ?? 'No synopsis available.';
}

function mangaTypeFromLanguage(lang: string): MangaType {
  if (lang === 'ko') return 'manhwa';
  if (lang === 'zh' || lang === 'zh-hk') return 'manhua';
  return 'manga'; // ja and anything else defaults to manga
}

function mangaStatus(status: MDManga['attributes']['status']): MangaDetail['status'] {
  if (status === 'completed') return 'completed';
  if (status === 'hiatus' || status === 'cancelled') return 'hiatus'; // no direct "cancelled" concept in our UI yet
  return 'ongoing';
}

function findCoverFileName(manga: MDManga): string | undefined {
  const cover = manga.relationships.find((r): r is MDManga['relationships'][number] & { type: 'cover_art' } => r.type === 'cover_art');
  return cover && 'attributes' in cover ? (cover as any).attributes.fileName : undefined;
}

export function transformManga(raw: MDManga): Manga {
  const fileName = findCoverFileName(raw);
  return {
    externalId: raw.id,
    title: pickTitle(raw.attributes),
    coverUrl: fileName ? coverUrl(raw.id, fileName) : `https://picsum.photos/seed/${raw.id}/400/600`,
    type: mangaTypeFromLanguage(raw.attributes.originalLanguage),
    genres: raw.attributes.tags
      .filter((t) => t.attributes.group === 'genre')
      .map((t) => t.attributes.name.en)
      .filter(Boolean)
      .slice(0, 5),
    // MangaDex doesn't return a simple 0–10 rating on this endpoint — would
    // need a separate /statistics/manga call. Left undefined rather than faked.
    rating: undefined,
  };
}

export function transformChapter(raw: MDChapter): Chapter {
  const num = raw.attributes.chapter ? parseFloat(raw.attributes.chapter) : 0;
  return {
    id: raw.id,
    number: Number.isFinite(num) ? num : 0,
    title: raw.attributes.title ?? undefined,
    releasedAt: raw.attributes.publishAt,
    isRead: false, // no auth/reading-history yet — always false until wired to Supabase
  };
}

export function transformMangaDetail(raw: MDManga, chapters: MDChapter[]): MangaDetail {
  const base = transformManga(raw);
  return {
    ...base,
    synopsis: pickDescription(raw.attributes),
    status: mangaStatus(raw.attributes.status),
    chapters: chapters.map(transformChapter),
    // Real "available on" platform links require a separate legitimate-source
    // mapping (see earlier discussion) — MangaDex itself is always one.
    platformLinks: [
      { platformName: 'MangaDex', url: `https://mangadex.org/title/${raw.id}`, kind: 'read', isOfficial: true },
    ],
  };
}