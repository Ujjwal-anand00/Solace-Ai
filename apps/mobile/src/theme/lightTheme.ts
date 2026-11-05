import { PALETTE } from './colors';
import { TYPOGRAPHY_SCALE } from './typography';
import { SPACING, LAYOUT } from './spacing';
import { RADIUS } from './radius';
import { SHADOWS_LIGHT } from './shadows';
import { ViewStyle } from 'react-native';

export interface ThemeColors {
  [key: string]: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryTint: string;

  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  lavender: string;
  lavenderText: string;
  peach: string;
  peachText: string;
  mint: string;
  mintText: string;
  butter: string;
  butterText: string;

  border: string;
  borderLight: string;
  borderStrong: string;

  success: string;
  successLight: string;
  successText: string;

  warning: string;
  warningLight: string;
  warningText: string;

  error: string;
  errorLight: string;
  errorText: string;

  info: string;
  infoLight: string;
  infoText: string;

  overlay: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof TYPOGRAPHY_SCALE;
  spacing: typeof SPACING;
  layout: typeof LAYOUT;
  radius: typeof RADIUS;
  shadows: Record<string, ViewStyle>;
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: PALETTE.PRIMARY,
    primaryDark: PALETTE.PRIMARY_DARK,
    primaryLight: PALETTE.PRIMARY_LIGHT,
    primaryTint: PALETTE.PRIMARY_TINT,

    background: PALETTE.BACKGROUND,
    surface: PALETTE.SURFACE,
    surfaceSecondary: PALETTE.SURFACE_SECONDARY,
    surfaceTertiary: PALETTE.SURFACE_TERTIARY,

    textPrimary: PALETTE.TEXT_PRIMARY,
    textSecondary: PALETTE.TEXT_SECONDARY,
    textMuted: PALETTE.TEXT_MUTED,
    textInverse: PALETTE.TEXT_INVERSE,

    lavender: PALETTE.LAVENDER,
    lavenderText: PALETTE.LAVENDER_TEXT,
    peach: PALETTE.PEACH,
    peachText: PALETTE.PEACH_TEXT,
    mint: PALETTE.MINT,
    mintText: PALETTE.MINT_TEXT,
    butter: PALETTE.BUTTER,
    butterText: PALETTE.BUTTER_TEXT,

    border: PALETTE.BORDER,
    borderLight: PALETTE.BORDER_LIGHT,
    borderStrong: PALETTE.BORDER_STRONG,

    success: PALETTE.SUCCESS,
    successLight: PALETTE.SUCCESS_LIGHT,
    successText: PALETTE.SUCCESS_TEXT,

    warning: PALETTE.WARNING,
    warningLight: PALETTE.WARNING_LIGHT,
    warningText: PALETTE.WARNING_TEXT,

    error: PALETTE.ERROR,
    errorLight: PALETTE.ERROR_LIGHT,
    errorText: PALETTE.ERROR_TEXT,

    info: PALETTE.INFO,
    infoLight: PALETTE.INFO_LIGHT,
    infoText: PALETTE.INFO_TEXT,

    overlay: PALETTE.OVERLAY_LIGHT,
  },
  typography: TYPOGRAPHY_SCALE,
  spacing: SPACING,
  layout: LAYOUT,
  radius: RADIUS,
  shadows: SHADOWS_LIGHT,
};
