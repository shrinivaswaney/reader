// Blossom Reader — design tokens
// Palette: black + vivid blue (dark), white + blue (light), true-black AMOLED
// variant, with iOS-flavored semantic tokens (fill, scrim, danger, HUD glass).
// Pick a scheme via ThemeProvider (see providers/theme-provider.tsx).

const darkPalette = {
  // Backgrounds — black with a faint blue cast, layered via MD3 steps
  bg: '#04060B',
  surface: '#0A0F1A',        // surface-container-low — cards
  surfaceRaised: '#121927',  // surface-container-high — raised/modal
  hairline: '#1C2637',       // surface-container-highest — subtle borders

  // Text
  text: '#DCE7FF',        // on-surface
  textMuted: '#8FA3C8',   // on-surface-variant
  textFaint: '#5E7093',   // outline
  fill: 'rgba(120, 120, 128, 0.24)', // iOS systemFill — search fields, pressed rows

  // Accent — vivid blue primary, the one place color gets bold
  accent: '#4D8DFF',           // primary-container
  accentMuted: '#1D4ED8',      // pressed/filled states (e.g. switch tracks)
  accentSoft: 'rgba(77, 141, 255, 0.16)',

  // Secondary highlight — cyan, used for ratings/positive emphasis
  highlight: '#22D3EE',

  // Reader HUD chrome — translucent glass panels that float over pages
  overlayPanel: 'rgba(8, 13, 24, 0.85)',
  overlayBorder: 'rgba(148, 180, 255, 0.14)',

  // Semantics — iOS systemRed family
  danger: '#FF453A',

  // Modal scrims — black translucent is correct in BOTH schemes (like iOS)
  scrim: 'rgba(0, 0, 0, 0.6)',

  // Status (maps to library_status enum)
  statusReading: '#4D8DFF',      // primary-container
  statusOnHold: '#FBBF24',       // amber — paused
  statusCompleted: '#34D399',    // emerald — done
  statusDropped: '#F87171',      // error red
  statusPlanToRead: '#5E7093',   // outline
  statusUnfollowed: '#2A3648',   // outline-variant
};

const lightPalette = {
  // White base, blue-tinted layering
  bg: '#FFFFFF',
  surface: '#F3F6FD',
  surfaceRaised: '#E7EDFA',
  hairline: '#DCE4F5',
  fill: 'rgba(120, 120, 128, 0.12)',

  text: '#0E1626',
  textMuted: '#45526B',
  textFaint: '#8593AC',

  accent: '#2563EB',          // deepened for contrast on white surfaces
  accentMuted: '#1E40AF',
  accentSoft: 'rgba(37, 99, 235, 0.09)',

  highlight: '#0891B2',

  overlayPanel: 'rgba(255, 255, 255, 0.88)',
  overlayBorder: 'rgba(20, 40, 90, 0.12)',

  danger: '#FF3B30',

  scrim: 'rgba(0, 0, 0, 0.45)',

  statusReading: '#2563EB',
  statusOnHold: '#B45309',
  statusCompleted: '#059669',
  statusDropped: '#DC2626',
  statusPlanToRead: '#8593AC',
  statusUnfollowed: '#C7D0E0',
};

// Widened to `string` so both palettes satisfy one shape.
export type ThemeColors = { [K in keyof typeof darkPalette]: string };

export const darkColors: ThemeColors = darkPalette;
export const lightColors: ThemeColors = lightPalette;

// True-black variant of the dark palette — used when the reader preference
// "AMOLED mode" is on: pure black turns pixels fully off on OLED screens.
export const amoledColors: ThemeColors = {
  ...darkColors,
  bg: '#000000',
  surface: '#05080F',
  surfaceRaised: '#0B1220',
  hairline: '#141D30',
  fill: 'rgba(120, 120, 128, 0.20)',
  overlayPanel: 'rgba(0, 0, 0, 0.85)',
};

export type ThemeScheme = 'light' | 'dark';
export const palettes: Record<ThemeScheme, ThemeColors> = { light: lightColors, dark: darkColors };

// Kept for non-React contexts that genuinely can't hook (error screens,
// native-intent code). UI components must use useTheme() instead so they
// re-render when the scheme changes.
export const colors: ThemeColors = darkColors;

export const type = {
  // Display — Apple Dynamic Type scale
  title1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4 },   // Large Title / Title 1
  displayLg: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.3 }, // hero titles
  displayMd: { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0 },    // Title 3 / card headers
  headline: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },  // Headline — emphasized rows
  // Body
  bodyLg: { fontSize: 18, fontWeight: '400' as const, letterSpacing: 0 },
  body: { fontSize: 16, fontWeight: '400' as const, letterSpacing: 0 },
  // Utility — captions, badges, meta
  caption: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0 },      // Footnote
  micro: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.6 },     // label-sm, uppercase badges
} as const;

export const space = {
  xxs: 2,
  xs: 4,
  sm: 12,
  md: 24,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const radius = {
  sm: 4,
  smMd: 6,
  md: 8,
  lg: 12,
  xl: 14,
  pill: 9999,
} as const;

// Shared component-level constants — not theme-dependent, but used across
// multiple files so a single source of truth prevents drift.
export const ICON_BUTTON = 40;       // 40×40 tap target (Apple HIG minimum)
export const BADGE_SIZE = 20;
export const BADGE_FONT_SIZE = 11;
export const INLINE_INPUT_HEIGHT = 34;
