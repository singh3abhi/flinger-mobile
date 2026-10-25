/**
 * Design tokens: Theme v0.2 "Cream and ember" (docs/03-design-system.md §1.5).
 * Components use these, never raw hex values or font sizes.
 */
export const colors = {
  accent: '#E4572E', // buttons, hearts, badges, progress. Always with ink text.
  accentInk: '#B8431F', // orange as small text/icons on light backgrounds
  accentTint: '#FFE4D6',
  accentTintInk: '#7A2E14',
  accentOnDark: '#FFC9B3', // small accent text on photos and dark backgrounds
  ink: '#1A1A1A',
  cream: '#FFF3EA', // onboarding backgrounds
  page: '#FFFBF8', // app background
  surface: '#F6EEE8',
  line: '#EFE3DA',
  track: '#F0DDD0',
  control: '#8F7F72', // field borders, off switches (3.8:1)
  text2: '#3A3A40',
  text3: '#4A4A52',
  muted: '#5C5C63',
  danger: '#B3261E',
  success: '#1B6B3A',
  verified: '#1D5FD1',
  white: '#FFFFFF',
  scrim: 'rgba(0,0,0,0.55)',
} as const;

/** Font family names registered in the root layout (assets/fonts/inter). */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 44, lineHeight: 46, letterSpacing: -0.8 },
  title: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 37, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  headline: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  bodyLg: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
  small: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;

export const radius = { thumb: 10, control: 14, card: 18, sheet: 24, pill: 999 } as const;

/** Minimum touch target (points). */
export const HIT = 44;
