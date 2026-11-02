import {
  searchMangaRaw,
  getPopularMangaRaw,
  getRecentMangaRaw,
  getMangaByIdRaw,
  getMangaFeedRaw,
  getAtHomeServerRaw,
} from './client';
import { transformManga, transformMangaDetail } from './transform';
import { Manga, MangaDetail } from '@/types/manga.types';

export async function searchManga(title: string): Promise<Manga[]> {
  if (!title.trim()) return [];
  const res = await searchMangaRaw(title);
  return res.data.map(transformManga);
}

export async function getPopularManga(): Promise<Manga[]> {
  const res = await getPopularMangaRaw();
  return res.data.map(transformManga);
}

export async function getRecentManga(): Promise<Manga[]> {
  const res = await getRecentMangaRaw();
  return res.data.map(transformManga);
}

export async function getMangaDetail(id: string): Promise<MangaDetail> {
  const [mangaRes, feedRes] = await Promise.all([getMangaByIdRaw(id), getMangaFeedRaw(id)]);
  return transformMangaDetail(mangaRes.data, feedRes.data);
}

export type ReaderPage = { id: string; uri: string };

export async function getChapterImageUrls(chapterId: string): Promise<ReaderPage[]> {
  const res = await getAtHomeServerRaw(chapterId);
  return res.chapter.data.map((fileName, i) => ({
    id: `${chapterId}-p${i}`,
    uri: `${res.baseUrl}/data/${res.chapter.hash}/${fileName}`,
  }));
}