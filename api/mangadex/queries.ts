import { useQuery } from '@tanstack/react-query';
import { searchManga, getPopularManga, getRecentManga, getMangaDetail, getChapterImageUrls } from './endpoints';

// List data changes slowly — keep it warm to avoid flash-of-spinner on tab
// revisits. Chapter at-home page URLs are only valid ~15 min, so match that.
const LIST_STALE_TIME_MS = 10 * 60 * 1000;
const CHAPTER_PAGES_STALE_TIME_MS = 10 * 60 * 1000;

export function useSearchManga(query: string) {
  return useQuery({
    queryKey: ['mangadex', 'search', query],
    queryFn: () => searchManga(query),
    enabled: query.trim().length > 0,
  });
}

export function usePopularManga() {
  return useQuery({
    queryKey: ['mangadex', 'popular'],
    queryFn: getPopularManga,
    staleTime: LIST_STALE_TIME_MS,
  });
}

export function useRecentManga() {
  return useQuery({
    queryKey: ['mangadex', 'recent'],
    queryFn: getRecentManga,
    staleTime: LIST_STALE_TIME_MS,
  });
}

export function useMangaDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['mangadex', 'manga', id],
    queryFn: () => getMangaDetail(id!),
    enabled: !!id,
  });
}

export function useChapterImages(chapterId: string | undefined) {
  return useQuery({
    queryKey: ['mangadex', 'chapter-pages', chapterId],
    queryFn: () => getChapterImageUrls(chapterId!),
    enabled: !!chapterId,
    staleTime: CHAPTER_PAGES_STALE_TIME_MS,
    retry: 1,
  });
}
