import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { amoledColors, palettes, ThemeColors, ThemeScheme } from '@/constants/theme';
import { useReadingPreferences } from '@/providers/reading-preferences-provider';

export type ThemePreference = ThemeScheme | 'system';

const STORAGE_KEY = 'theme.preference.v1';

type ThemeContextValue = {
  colors: ThemeColors;
  scheme: ThemeScheme;          // what's actually applied
  preference: ThemePreference;  // what the user picked ('system' follows OS)
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

async function loadPreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw === 'light' || raw === 'dark' ? raw : 'system';
  } catch {
    return 'system';
  }
}

// Default: follow the OS. A manual choice made in Profile overrides it and
// persists across launches.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const readingPrefs = useReadingPreferences();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;
    loadPreference().then((p) => {
      if (!cancelled) setPreferenceState(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  };

  const scheme: ThemeScheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  // AMOLED mode swaps the dark palette for true blacks. Light mode ignores it.
  const base = palettes[scheme];
  const colors = scheme === 'dark' && readingPrefs.prefs.amoledMode ? amoledColors : base;

  const value = useMemo(
    () => ({ colors, scheme, preference, setPreference }),
    [colors, scheme, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
