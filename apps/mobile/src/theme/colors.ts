/**
 * Solace AI - Modern Brand Color Palette
 *
 * Core Brand Colors:
 * - Primary Lavender: #CBB3E8
 * - Neon Lime (Accent): #D4FF3F
 * - Bold Red (Emphasis): #E34234
 *
 * Supporting Accessible Neutrals (Light & Dark)
 */

export const PALETTE = {
  // Brand Triad
  PRIMARY: '#CBB3E8',          // Primary Lavender
  PRIMARY_DARK: '#9678BD',     // Deep Lavender Purple
  PRIMARY_LIGHT: '#E8DDF5',    // Soft Lavender Tint
  PRIMARY_TINT: '#F0EAF7',     // Ultra-light Lavender Surface

  ACCENT: '#D4FF3F',           // Neon Lime (High-priority CTAs & active states)
  ACCENT_DARK: '#A7CE16',      // Deep Lime
  ACCENT_LIGHT: '#F4FFC2',     // Soft Lime Glow
  ACCENT_TEXT: '#292431',      // Dark contrast text for Lime backgrounds

  SECONDARY: '#E34234',        // Bold Red (Emphasis & special highlights)
  SECONDARY_DARK: '#B8281C',   // Deep Crimson
  SECONDARY_LIGHT: '#F8D8D4',  // Soft Coral Red Tint
  SECONDARY_TEXT: '#FFFFFF',   // High-contrast text for Red

  // Light Backgrounds & Surfaces
  BACKGROUND: '#F8F6FA',       // Modern cool-tinted neutral
  SURFACE: '#FFFFFF',          // Pure clean card surface
  SURFACE_SECONDARY: '#F0EAF7',// Lavender-tinted surface
  SURFACE_TERTIARY: '#E7DFED', // Structural surface

  // Text Colors (High Contrast AAA)
  TEXT_PRIMARY: '#292431',     // Deep Obsidian Purple
  TEXT_SECONDARY: '#716B78',   // Muted Charcoal
  TEXT_MUTED: '#A39BA9',       // Subtle Grey Purple
  TEXT_INVERSE: '#FFFFFF',     // Clean White

  // Supporting Functional & Semantic Tones
  BORDER: '#E7DFED',
  BORDER_LIGHT: '#F2ECF7',
  BORDER_STRONG: '#CBB3E8',

  SUCCESS: '#41865B',
  SUCCESS_LIGHT: '#E5F4EC',
  SUCCESS_TEXT: '#225836',

  WARNING: '#D99A36',
  WARNING_LIGHT: '#FDF2E2',
  WARNING_TEXT: '#7A4F0F',

  ERROR: '#E34234',
  ERROR_LIGHT: '#F8D8D4',
  ERROR_TEXT: '#8F1D14',

  INFO: '#6C7CE0',
  INFO_LIGHT: '#ECEFFE',
  INFO_TEXT: '#2F3C9E',

  // Mood & Activity Accent Pastels
  LAVENDER: '#CBB3E8',
  LAVENDER_TEXT: '#4E3875',
  LIME: '#D4FF3F',
  LIME_TEXT: '#292431',
  RED: '#E34234',
  RED_TEXT: '#FFFFFF',
  PEACH: '#F5D5C6',
  PEACH_TEXT: '#7E3B20',
  MINT: '#D2F0E0',
  MINT_TEXT: '#1F613B',
  BUTTER: '#FDF1C7',
  BUTTER_TEXT: '#705915',

  // Overlays
  OVERLAY_LIGHT: 'rgba(41, 36, 49, 0.45)',
  OVERLAY_DARK: 'rgba(25, 21, 31, 0.75)',
} as const;

export const DARK_PALETTE = {
  // Brand Triad in Dark Mode
  PRIMARY: '#CBB3E8',          // Radiant Lavender
  PRIMARY_DARK: '#9678BD',     // Rich Deep Purple
  PRIMARY_LIGHT: '#E8DDF5',    // Luminous Lavender
  PRIMARY_TINT: '#30273A',     // Dark Lavender Tint

  ACCENT: '#D4FF3F',           // Electric Neon Lime
  ACCENT_DARK: '#A7CE16',      // Focused Lime
  ACCENT_LIGHT: '#2C380C',     // Dark Lime Surface
  ACCENT_TEXT: '#292431',      // Dark contrast text

  SECONDARY: '#E34234',        // Vibrant Crimson Red
  SECONDARY_DARK: '#991B1B',   // Deep Burgundy
  SECONDARY_LIGHT: '#54201E',  // Dark Red Surface
  SECONDARY_TEXT: '#FFFFFF',

  // Dark Backgrounds & Surfaces
  BACKGROUND: '#19151F',       // Deep Velvet Night
  SURFACE: '#241E2C',          // Raised Charcoal Purple
  SURFACE_SECONDARY: '#30273A',// Illuminated Surface
  SURFACE_TERTIARY: '#3D3249', // Border Surface

  // Text Colors in Dark Mode
  TEXT_PRIMARY: '#F8F5FC',     // Crisp Pearlescent White
  TEXT_SECONDARY: '#C4BACD',   // Soft Muted Lavender
  TEXT_MUTED: '#80738C',       // Subdued Ash
  TEXT_INVERSE: '#19151F',

  // Supporting Functional Tones
  BORDER: '#42384D',
  BORDER_LIGHT: '#342B3E',
  BORDER_STRONG: '#635473',

  SUCCESS: '#4E9F6E',
  SUCCESS_LIGHT: '#1B3426',
  SUCCESS_TEXT: '#A3E2BB',

  WARNING: '#E5AC48',
  WARNING_LIGHT: '#3B2C15',
  WARNING_TEXT: '#FAD692',

  ERROR: '#E34234',
  ERROR_LIGHT: '#421B19',
  ERROR_TEXT: '#F8B4AF',

  INFO: '#8392EC',
  INFO_LIGHT: '#252B4D',
  INFO_TEXT: '#D0D6FA',

  // Mood & Activity Accent Pastels
  LAVENDER: '#352945',
  LAVENDER_TEXT: '#E8DDF5',
  LIME: '#2E3D0D',
  LIME_TEXT: '#D4FF3F',
  RED: '#4A1D1B',
  RED_TEXT: '#FCA5A5',
  PEACH: '#3E251C',
  PEACH_TEXT: '#FCD7C8',
  MINT: '#1E3628',
  MINT_TEXT: '#BCE8CE',
  BUTTER: '#3B3319',
  BUTTER_TEXT: '#FDEBB3',

  // Overlays
  OVERLAY_LIGHT: 'rgba(25, 21, 31, 0.65)',
  OVERLAY_DARK: 'rgba(10, 8, 14, 0.85)',
} as const;
