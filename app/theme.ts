import { Platform } from 'react-native';

const sansBold = 'Poppins_700Bold';
const sansMedium = 'Poppins_600SemiBold';
const sansRegular = 'Montserrat_400Regular';
const sansSemiBold = 'Montserrat_600SemiBold';
const monoFont = 'JetBrainsMono_400Regular';

export const lightColors = {
  backgroundPrimary: '#F4F7FA', // Soft off-white
  backgroundCard: '#FFFFFF',
  textPrimary: '#1C398E',
  textMuted: '#64748B',
  accentCyan: '#3B82F6', // Primary Blue
  accentGreen: '#16A34A',
  border: 'rgba(0, 0, 0, 0.06)',
  shadow: 'rgba(59, 130, 246, 0.15)', // Blue tinted shadow
};

export const darkColors = {
  backgroundPrimary: '#0f111a',
  backgroundCard: '#1a1d2e',
  textPrimary: '#F0F2FA',
  textMuted: '#8b92b0',
  accentCyan: '#3B82F6', // Primary Blue for consistency
  accentGreen: '#16A34A',
  border: 'rgba(255, 255, 255, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

// Default export for statically defined styles (will migrate to hook)
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
  sm: 8,
  md: 20,
  lg: 28,
  pill: 9999,
};

