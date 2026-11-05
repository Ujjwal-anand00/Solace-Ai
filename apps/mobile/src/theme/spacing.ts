/**
 * Solace AI - Spacing Scale and Layout Tokens
 *
 * Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56
 */

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 56,
} as const;

export const LAYOUT = {
  // Screen padding
  screenHorizontal: 20,
  screenVertical: 16,

  // Section spacing
  sectionSpacing: 24,
  sectionSpacingLarge: 32,

  // Card padding
  cardPaddingSm: 12,
  cardPadding: 16,
  cardPaddingLg: 20,

  // Component spacing
  componentSpacing: 12,
  itemGap: 8,

  // Heights
  headerHeight: 56,
  tabBarHeight: 64,

  // Button heights (accessible min touch targets 44pt)
  buttonHeightSm: 36,
  buttonHeightMd: 46,
  buttonHeightLg: 54,
  buttonHeightXl: 58,

  // Input heights
  inputHeightSm: 40,
  inputHeightMd: 48,
  inputHeightLg: 54,

  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 28,
  iconXl: 32,
} as const;

export type SpacingScale = typeof SPACING;
export type LayoutTokens = typeof LAYOUT;
