import { PALETTE } from '../theme/colors';

export const colors = {
  // Primary palette (Lavender, Lime, Red)
  primary: PALETTE.PRIMARY,
  primaryDark: PALETTE.PRIMARY_DARK,
  primaryLight: PALETTE.PRIMARY_LIGHT,
  primaryTint: PALETTE.PRIMARY_TINT,

  accent: PALETTE.ACCENT,
  accentDark: PALETTE.ACCENT_DARK,
  secondary: PALETTE.SECONDARY,
  secondaryLight: PALETTE.SECONDARY_LIGHT,

  // Compatibility aliases
  lavender: PALETTE.PRIMARY,
  lavenderDark: PALETTE.PRIMARY_DARK,
  lavenderLight: PALETTE.PRIMARY_LIGHT,
  lime: PALETTE.ACCENT,
  red: PALETTE.SECONDARY,
  peach: PALETTE.PEACH,
  mint: PALETTE.MINT,
  butter: PALETTE.BUTTER,

  // Legacy theme aliases mapped to modern brand palette
  sage: PALETTE.PRIMARY,
  sageDark: PALETTE.PRIMARY_DARK,
  sageLight: PALETTE.PRIMARY_LIGHT,
  cream: PALETTE.SURFACE_SECONDARY,
  creamLight: PALETTE.BACKGROUND,
  creamDark: PALETTE.SURFACE_TERTIARY,
  text: PALETTE.TEXT_PRIMARY,
  textLight: PALETTE.TEXT_MUTED,
  card: PALETTE.SURFACE,

  // Background & surfaces
  background: PALETTE.BACKGROUND,
  surface: PALETTE.SURFACE,
  surfaceSecondary: PALETTE.SURFACE_SECONDARY,
  surfaceTertiary: PALETTE.SURFACE_TERTIARY,
  white: PALETTE.SURFACE,

  // Semantic
  success: PALETTE.SUCCESS,
  warning: PALETTE.WARNING,
  error: PALETTE.ERROR,
  info: PALETTE.INFO,

  // Text
  textPrimary: PALETTE.TEXT_PRIMARY,
  textSecondary: PALETTE.TEXT_SECONDARY,
  textMuted: PALETTE.TEXT_MUTED,
  textInverse: PALETTE.TEXT_INVERSE,

  // Borders & dividers
  border: PALETTE.BORDER,
  borderLight: PALETTE.BORDER_LIGHT,
  divider: PALETTE.BORDER,

  // Shadows
  shadow: 'rgba(41, 36, 49, 0.08)',
  shadowMedium: 'rgba(41, 36, 49, 0.16)',
};
