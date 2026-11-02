export type ReadingDirection = 'vertical' | 'rtl';
export type TapZoneLayout = 'standard' | 'left-handed';
export type OrientationLockPref = 'system' | 'portrait' | 'landscape';
export type NotchBehavior = 'cutout' | 'extend';

// Profile-level reading preferences. Persisted app-wide; the reader consumes
// these live. (In-reader quick tweaks like margin/dim stay in ReaderSettings —
// those are per-session surface controls, not preferences.)
export type ReadingPreferences = {
  // Layout & Reading Direction
  direction: ReadingDirection;      // vertical continuous vs right-to-left paginated
  splitSpreads: boolean;            // slice wide print spreads into stacked halves

  // Touch & Navigation
  tapZones: TapZoneLayout;          // which side advances the page
  volumeKeyNavigation: boolean;     // stored but inactive — needs a native module
  orientationLock: OrientationLockPref;

  // Screen & Display
  amoledMode: boolean;              // true blacks in dark mode
  notchBehavior: NotchBehavior;     // artwork under the camera cutout or clipped
};

export const defaultReadingPreferences: ReadingPreferences = {
  direction: 'vertical',
  splitSpreads: false,
  tapZones: 'standard',
  volumeKeyNavigation: false,
  orientationLock: 'system',
  amoledMode: false,
  notchBehavior: 'cutout',
};

const DIRECTIONS: ReadingDirection[] = ['vertical', 'rtl'];
const TAP_ZONES: TapZoneLayout[] = ['standard', 'left-handed'];
const ORIENTATION_LOCKS: OrientationLockPref[] = ['system', 'portrait', 'landscape'];
const NOTCH_BEHAVIORS: NotchBehavior[] = ['cutout', 'extend'];

function pick<T extends string>(allowed: T[], value: unknown, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

// Merges whatever is on disk over the defaults, discarding unknown values so
// a schema change or corrupt entry can never produce an invalid preference.
export function normalizeReadingPreferences(raw: Partial<ReadingPreferences> | null | undefined): ReadingPreferences {
  const d = defaultReadingPreferences;
  if (!raw) return { ...d };
  return {
    direction: pick(DIRECTIONS, raw.direction, d.direction),
    splitSpreads: typeof raw.splitSpreads === 'boolean' ? raw.splitSpreads : d.splitSpreads,
    tapZones: pick(TAP_ZONES, raw.tapZones, d.tapZones),
    volumeKeyNavigation:
      typeof raw.volumeKeyNavigation === 'boolean' ? raw.volumeKeyNavigation : d.volumeKeyNavigation,
    orientationLock: pick(ORIENTATION_LOCKS, raw.orientationLock, d.orientationLock),
    amoledMode: typeof raw.amoledMode === 'boolean' ? raw.amoledMode : d.amoledMode,
    notchBehavior: pick(NOTCH_BEHAVIORS, raw.notchBehavior, d.notchBehavior),
  };
}
