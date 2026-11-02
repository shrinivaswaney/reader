import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  normalizeReadingProgress,
  READING_PROGRESS_KEY,
  sortedHistory,
  upsertProgress,
  type ReadingProgressEntry,
  type ReadingProgressMap,
} from '@/features/reader/reading-progress';

type ReadingProgressContextValue = {
  /** Recency-sorted history, newest first. Empty until something is read. */
  entries: ReadingProgressEntry[];
  ready: boolean;
  upsert: (entry: ReadingProgressEntry) => void;
};

const ReadingProgressContext = createContext<ReadingProgressContextValue | null>(null);

export function ReadingProgressProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<ReadingProgressMap>({});
  const [ready, setReady] = useState(false);

  // Hydrate once on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(READING_PROGRESS_KEY);
        if (!cancelled) setMap(normalizeReadingProgress(raw ? JSON.parse(raw) : {}));
      } catch {
        // Corrupt or unreadable store — start from an empty history.
        if (!cancelled) setMap({});
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ReadingProgressContextValue>(
    () => ({
      entries: sortedHistory(map),
      ready,
      upsert: (entry) =>
        setMap((prev) => {
          const next = upsertProgress(prev, entry);
          // Fire-and-forget write; failures are non-fatal (in-memory stays correct).
          void AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        }),
    }),
    [map, ready]
  );

  return <ReadingProgressContext.Provider value={value}>{children}</ReadingProgressContext.Provider>;
}

export function useReadingProgress(): ReadingProgressContextValue {
  const ctx = useContext(ReadingProgressContext);
  if (!ctx) throw new Error('useReadingProgress must be used within ReadingProgressProvider');
  return ctx;
}
