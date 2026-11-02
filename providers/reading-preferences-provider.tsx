import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultReadingPreferences,
  normalizeReadingPreferences,
  ReadingPreferences,
} from '@/features/reader/reading-preferences';

const STORAGE_KEY = 'reading.preferences.v1';

type ReadingPreferencesContextValue = {
  prefs: ReadingPreferences;
  update: (patch: Partial<ReadingPreferences>) => void;
};

const ReadingPreferencesContext = createContext<ReadingPreferencesContextValue | undefined>(undefined);

async function loadPrefs(): Promise<ReadingPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return normalizeReadingPreferences(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...defaultReadingPreferences };
  }
}

export function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ReadingPreferences>(defaultReadingPreferences);

  useEffect(() => {
    let cancelled = false;
    loadPrefs().then((p) => {
      if (!cancelled) setPrefs(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<ReadingPreferences>) => {
    setPrefs((prev) => {
      const next = normalizeReadingPreferences({ ...prev, ...patch });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const value = useMemo(() => ({ prefs, update }), [prefs]);

  return (
    <ReadingPreferencesContext.Provider value={value}>
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export function useReadingPreferences(): ReadingPreferencesContextValue {
  const ctx = useContext(ReadingPreferencesContext);
  if (!ctx) {
    throw new Error('useReadingPreferences must be used inside <ReadingPreferencesProvider>');
  }
  return ctx;
}
