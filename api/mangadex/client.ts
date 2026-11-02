import {
  MDMangaListResponse,
  MDMangaResponse,
  MDChapterFeedResponse,
  MDAtHomeResponse,
} from './mangadex.types';

const BASE_URL = 'https://api.mangadex.org';
const REQUEST_TIMEOUT_MS = 15_000;

// Default content rating excludes erotica/pornographic — this app ships with
// general-audience content only by default. Revisit if/when an explicit
// user-controlled "mature content" setting is built.
const DEFAULT_CONTENT_RATING = ['safe', 'suggestive'];

type QueryParams = Record<string, string | number | boolean | readonly string[] | undefined>;

// One error type for every MangaDex failure — callers (and react-query
// retries) can branch on status instead of parsing message strings.
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string) {
    super(`MangaDex request failed (${status}): ${path}`);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

async function mdFetch<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, String(v)));
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      throw new ApiError(res.status, url.pathname);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function searchMangaRaw(title: string, limit = 20) {
  return mdFetch<MDMangaListResponse>('/manga', {
    title,
    limit,
    'includes[]': 'cover_art',
    'contentRating[]': DEFAULT_CONTENT_RATING,
  });
}

export function getPopularMangaRaw(limit = 10) {
  return mdFetch<MDMangaListResponse>('/manga', {
    limit,
    'includes[]': 'cover_art',
    'contentRating[]': DEFAULT_CONTENT_RATING,
    'order[followedCount]': 'desc',
    hasAvailableChapters: true,
  });
}

export function getRecentMangaRaw(limit = 10) {
  return mdFetch<MDMangaListResponse>('/manga', {
    limit,
    'includes[]': 'cover_art',
    'contentRating[]': DEFAULT_CONTENT_RATING,
    'order[createdAt]': 'desc',
    hasAvailableChapters: true,
  });
}

export function getMangaByIdRaw(id: string) {
  return mdFetch<MDMangaResponse>(`/manga/${id}`, {
    'includes[]': 'cover_art',
  });
}

export function getMangaFeedRaw(id: string, limit = 100) {
  return mdFetch<MDChapterFeedResponse>(`/manga/${id}/feed`, {
    limit,
    'translatedLanguage[]': 'en',
    'order[chapter]': 'desc',
    'contentRating[]': DEFAULT_CONTENT_RATING,
  });
}

// IMPORTANT: the returned baseUrl is time-limited (~15 min) and
// geographically optimized per MangaDex's docs — always fetch fresh
// immediately before displaying a chapter, never cache/hardcode it.
export function getAtHomeServerRaw(chapterId: string) {
  return mdFetch<MDAtHomeResponse>(`/at-home/server/${chapterId}`);
}

export function coverUrl(mangaId: string, fileName: string, size: '256' | '512' | 'full' = '512') {
  const suffix = size === 'full' ? '' : `.${size}.jpg`;
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}${suffix}`;
}
