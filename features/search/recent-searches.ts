// Recent search terms — pure list math + a self-contained persistence hook.
// Pure helpers are import-free so jest stays fast (same split as
// reading-progress.ts); only the hook touches AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const SEARCH_RECENT_KEY = 'search.recent.v1';
export const SEARCH_RECENT_CAP = 10;

/** Dedupes case-insensitively, keeps the newest term's casing, caps length. */
export function pushRecentSearch(list: string[], rawTerm: string, cap: number = SEARCH_RECENT_CAP): string[] {
  const term = rawTerm.trim();
  if (!term) return list;
  const rest = list.filter((t) => t.toLowerCase() !== term.toLowerCase());
  return [term, ...rest].slice(0, cap);
}

export function removeRecentSearch(list: string[], term: string): string[] {
  return list.filter((t) => t !== term);
}

function normalizeRecentSearches(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => t.trim())
    .slice(0, SEARCH_RECENT_CAP);
}

/**
 * Persisted recent-search list for this screen. Loads once on mount and
 * writes through on every change; safe to use in a single screen instance.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SEARCH_RECENT_KEY);
        if (!cancelled) setRecents(normalizeRecentSearches(raw ? JSON.parse(raw) : []));
      } catch {
        if (!cancelled) setRecents([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void AsyncStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(recents)).catch(() => {});
  }, [recents, ready]);

  const add = useCallback((term: string) => setRecents((prev) => pushRecentSearch(prev, term)), []);
  const remove = useCallback((term: string) => setRecents((prev) => removeRecentSearch(prev, term)), []);
  const clearAll = useCallback(() => setRecents([]), []);

  return { recents, add, remove, clearAll };
}
