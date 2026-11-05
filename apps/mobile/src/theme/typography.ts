import { Platform, TextStyle } from 'react-native';

/**
 * Solace AI Typography Tokens
 *
 * Preferred:
 * - Manrope for headings and key UI titles.
 * - DM Sans for body reading text.
 * Fallback: System sans-serif font stack.
 */

export const FONT_FAMILIES = {
  heading: Platform.select({
    ios: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    android: 'Manrope, Roboto, "Helvetica Neue", sans-serif',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  body: Platform.select({
    ios: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    android: 'DM Sans, Roboto, "Helvetica Neue", sans-serif',
    default: 'DM Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  mono: Platform.select({
    ios: 'Menlo, Courier, monospace',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
  fontFamily?: string;
}

export const TYPOGRAPHY_SCALE: Record<string, TypographyToken> = {
  displayLarge: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.8,
    fontFamily: FONT_FAMILIES.heading,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.6,
    fontFamily: FONT_FAMILIES.heading,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.4,
    fontFamily: FONT_FAMILIES.heading,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: -0.3,
    fontFamily: FONT_FAMILIES.heading,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: -0.2,
    fontFamily: FONT_FAMILIES.heading,
  },
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
    fontFamily: FONT_FAMILIES.body,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0,
    fontFamily: FONT_FAMILIES.body,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.1,
    fontFamily: FONT_FAMILIES.body,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.2,
    fontFamily: FONT_FAMILIES.body,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.3,
    fontFamily: FONT_FAMILIES.heading,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.2,
    fontFamily: FONT_FAMILIES.heading,
  },
};

export type TypographyVariant = keyof typeof TYPOGRAPHY_SCALE;
