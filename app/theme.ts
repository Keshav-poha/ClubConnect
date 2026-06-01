import { Platform } from 'react-native';

const sansBold = 'Poppins_700Bold';
const sansMedium = 'Poppins_600SemiBold';
const sansRegular = 'Montserrat_400Regular';
const sansSemiBold = 'Montserrat_600SemiBold';
const monoFont = 'JetBrainsMono_400Regular';

export const lightColors = {
  backgroundPrimary: '#f5f7fb', // --bg-canvas
  backgroundCard: '#ffffff', // --element-bg
  textPrimary: '#1e293b', // --text-main
  textMuted: '#64748b', // --text-muted
  accentCyan: '#6366f1', // --primary-accent (Indigo)
  accentGreen: '#16A34A',
  border: 'rgba(0, 0, 0, 0.04)', // subtle outline if needed
  shadowOuter: 'rgba(166, 180, 200, 0.4)', // --clay-shadow-outer
  clayHighlight: 'rgba(255, 255, 255, 0.9)', // top-left inset
  clayShadow: 'rgba(0, 0, 0, 0.08)', // bottom-right inset
};

export const darkColors = {
  backgroundPrimary: '#0f172a', // --bg-canvas
  backgroundCard: '#1e293b', // --element-bg
  textPrimary: '#f8fafc', // --text-main
  textMuted: '#94a3b8', // --text-muted
  accentCyan: '#818cf8', // --primary-accent (Indigo 400)
  accentGreen: '#16A34A',
  border: 'rgba(255, 255, 255, 0.02)', // subtle outline if needed
  shadowOuter: 'rgba(0, 0, 0, 0.4)', // --clay-shadow-outer
  clayHighlight: 'rgba(255, 255, 255, 0.05)', // top-left inset
  clayShadow: 'rgba(0, 0, 0, 0.4)', // bottom-right inset
};

export const colors = lightColors;

export const typography = {
  h1: { fontFamily: sansBold, fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontFamily: sansBold, fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h3: { fontFamily: sansMedium, fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  body: { fontFamily: sansRegular, fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontFamily: sansSemiBold, fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontFamily: sansRegular, fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  mono: { fontFamily: monoFont, fontSize: 12, lineHeight: 16 },
};

export const borderRadius = {
  sm: 16, // buttons
  md: 24, // cards
  lg: 32, // larger cards/modals
  pill: 9999,
};
