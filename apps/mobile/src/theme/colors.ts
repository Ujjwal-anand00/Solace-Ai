/**
 * Solace AI - Color Palette
 *
 * Centralized, calm, natural color tokens as specified:
 * - Primary Sage palette
 * - Warm natural backgrounds
 * - Muted natural text tones
 * - Soft pastel accents (Lavender, Peach, Mint, Butter)
 * - Accessible functional tones
 */

export const PALETTE = {
  // Primary Palette (Sage Greens)
  PRIMARY: '#829B83',
  PRIMARY_DARK: '#536B58',
  PRIMARY_LIGHT: '#AFC5B0',
  PRIMARY_TINT: '#E8EFE8',

  // Light Backgrounds & Surfaces (Warm Linen & Cream)
  BACKGROUND: '#F8F6EF',
  SURFACE: '#FFFFFF',
  SURFACE_SECONDARY: '#F0F1E9',
  SURFACE_TERTIARY: '#E7E9DF',

  // Text Colors
  TEXT_PRIMARY: '#303A34',
  TEXT_SECONDARY: '#737D75',
  TEXT_MUTED: '#A0A79F',
  TEXT_INVERSE: '#FFFFFF',

  // Accent Colors (Calm & Organic Pastels)
  LAVENDER: '#E9E2F5',
  LAVENDER_TEXT: '#5B4E7A',
  PEACH: '#F5DFD2',
  PEACH_TEXT: '#804D36',
  MINT: '#DCE9DD',
  MINT_TEXT: '#446849',
  BUTTER: '#F5EDCF',
  BUTTER_TEXT: '#6B5A24',

  // Borders & Dividers
  BORDER: '#E3E5DC',
  BORDER_LIGHT: '#EDEDE6',
  BORDER_STRONG: '#C8CCC0',

  // Functional Colors (Accessible, Soft, Non-Harsh)
  SUCCESS: '#4E7F57',
  SUCCESS_LIGHT: '#E2EFE4',
  SUCCESS_TEXT: '#23522C',

  WARNING: '#C27424',
  WARNING_LIGHT: '#FBECD9',
  WARNING_TEXT: '#6E3E0C',

  ERROR: '#C74B4B',
  ERROR_LIGHT: '#FCEBEB',
  ERROR_TEXT: '#6E1D1D',

  INFO: '#4E738B',
  INFO_LIGHT: '#E3EDF3',
  INFO_TEXT: '#214358',

  // Overlay / Translucency
  OVERLAY_LIGHT: 'rgba(48, 58, 52, 0.35)',
  OVERLAY_DARK: 'rgba(10, 15, 12, 0.65)',
} as const;

export const DARK_PALETTE = {
  // Primary Palette in Dark Mode (Illuminated Sage)
  PRIMARY: '#9BB49C',
  PRIMARY_DARK: '#738C74',
  PRIMARY_LIGHT: '#B9CCBA',
  PRIMARY_TINT: '#233025',

  // Dark Backgrounds & Surfaces (Deep Forest Midnight)
  BACKGROUND: '#131814',
  SURFACE: '#1B221D',
  SURFACE_SECONDARY: '#242D26',
  SURFACE_TERTIARY: '#2E3830',

  // Text Colors in Dark Mode
  TEXT_PRIMARY: '#F0F4F1',
  TEXT_SECONDARY: '#A8B3AA',
  TEXT_MUTED: '#6F7B71',
  TEXT_INVERSE: '#131814',

  // Accent Colors (Subdued Luminous Pastels)
  LAVENDER: '#2E273A',
  LAVENDER_TEXT: '#D9D0ED',
  PEACH: '#3B2A22',
  PEACH_TEXT: '#F7CEBE',
  MINT: '#233326',
  MINT_TEXT: '#C3E3C6',
  BUTTER: '#342F1E',
  BUTTER_TEXT: '#F3E5B5',

  // Borders & Dividers
  BORDER: '#2B352E',
  BORDER_LIGHT: '#232B25',
  BORDER_STRONG: '#3F4D43',

  // Functional Colors (Accessible for Dark Mode)
  SUCCESS: '#6FA378',
  SUCCESS_LIGHT: '#1B2D20',
  SUCCESS_TEXT: '#CBE5D0',

  WARNING: '#DFA04E',
  WARNING_LIGHT: '#342617',
  WARNING_TEXT: '#F7DCB5',

  ERROR: '#E26D6D',
  ERROR_LIGHT: '#381C1C',
  ERROR_TEXT: '#FAD0D0',

  INFO: '#6D9BB5',
  INFO_LIGHT: '#1B2730',
  INFO_TEXT: '#CCE2EF',

  // Overlay
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.55)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.8)',
} as const;

export type ColorPalette = typeof PALETTE;
