/**
 * Solace AI - Border Radius Tokens
 *
 * Soft, organic, calming curves.
 */

export const RADIUS = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 9999,
  full: 9999,
} as const;

export type RadiusScale = typeof RADIUS;
