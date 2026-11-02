import { useCallback, useState } from 'react';

export type FitMode = 'width' | 'height';
export type TapMode = 'single' | 'double';

export type ReaderSettings = {
  margin: number;        // px gap between pages — functional
  fitMode: FitMode;       // functional — controls image sizing
  dimPercent: number;     // 0-100 — functional, overlay darkening
  tapMode: TapMode;       // functional — single vs double tap to toggle controls
  grayscale: boolean;     // NOT YET FUNCTIONAL — tracked for a future image-filter pass
  showProgressBar: boolean; // functional — toggles the top progress line
};

export const defaultReaderSettings: ReaderSettings = {
  margin: 0,
  fitMode: 'width',
  dimPercent: 0,
  tapMode: 'single',
  grayscale: false,
  showProgressBar: true,
};

const MARGIN_MIN = 0;
const MARGIN_MAX = 40;
const MARGIN_STEP = 4;

export function clampMargin(value: number): number {
  return Math.min(MARGIN_MAX, Math.max(MARGIN_MIN, value));
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(defaultReaderSettings);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const stepMargin = useCallback((direction: 1 | -1) => {
    setSettings((s) => ({ ...s, margin: clampMargin(s.margin + direction * MARGIN_STEP) }));
  }, []);

  const resetMargin = useCallback(() => {
    setSettings((s) => ({ ...s, margin: MARGIN_MIN }));
  }, []);

  return { settings, updateSettings, stepMargin, resetMargin } as const;
}
