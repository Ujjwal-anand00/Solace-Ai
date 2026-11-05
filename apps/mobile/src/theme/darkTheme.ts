import { DARK_PALETTE } from './colors';
import { TYPOGRAPHY_SCALE } from './typography';
import { SPACING, LAYOUT } from './spacing';
import { RADIUS } from './radius';
import { SHADOWS_DARK } from './shadows';
import { Theme } from './lightTheme';

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: DARK_PALETTE.PRIMARY,
    primaryDark: DARK_PALETTE.PRIMARY_DARK,
    primaryLight: DARK_PALETTE.PRIMARY_LIGHT,
    primaryTint: DARK_PALETTE.PRIMARY_TINT,

    background: DARK_PALETTE.BACKGROUND,
    surface: DARK_PALETTE.SURFACE,
    surfaceSecondary: DARK_PALETTE.SURFACE_SECONDARY,
    surfaceTertiary: DARK_PALETTE.SURFACE_TERTIARY,

    textPrimary: DARK_PALETTE.TEXT_PRIMARY,
    textSecondary: DARK_PALETTE.TEXT_SECONDARY,
    textMuted: DARK_PALETTE.TEXT_MUTED,
    textInverse: DARK_PALETTE.TEXT_INVERSE,

    lavender: DARK_PALETTE.LAVENDER,
    lavenderText: DARK_PALETTE.LAVENDER_TEXT,
    peach: DARK_PALETTE.PEACH,
    peachText: DARK_PALETTE.PEACH_TEXT,
    mint: DARK_PALETTE.MINT,
    mintText: DARK_PALETTE.MINT_TEXT,
    butter: DARK_PALETTE.BUTTER,
    butterText: DARK_PALETTE.BUTTER_TEXT,

    border: DARK_PALETTE.BORDER,
    borderLight: DARK_PALETTE.BORDER_LIGHT,
    borderStrong: DARK_PALETTE.BORDER_STRONG,

    success: DARK_PALETTE.SUCCESS,
    successLight: DARK_PALETTE.SUCCESS_LIGHT,
    successText: DARK_PALETTE.SUCCESS_TEXT,

    warning: DARK_PALETTE.WARNING,
    warningLight: DARK_PALETTE.WARNING_LIGHT,
    warningText: DARK_PALETTE.WARNING_TEXT,

    error: DARK_PALETTE.ERROR,
    errorLight: DARK_PALETTE.ERROR_LIGHT,
    errorText: DARK_PALETTE.ERROR_TEXT,

    info: DARK_PALETTE.INFO,
    infoLight: DARK_PALETTE.INFO_LIGHT,
    infoText: DARK_PALETTE.INFO_TEXT,

    overlay: DARK_PALETTE.OVERLAY_DARK,
  },
  typography: TYPOGRAPHY_SCALE,
  spacing: SPACING,
  layout: LAYOUT,
  radius: RADIUS,
  shadows: SHADOWS_DARK,
};
