import { Platform } from 'react-native';

const sansBold = Platform.select({
  ios: 'HelveticaNeue-Bold',
  android: 'Inter_700Bold',
  default: 'System',
});

const sansMedium = Platform.select({
  ios: 'HelveticaNeue-Medium',
  android: 'Inter_600SemiBold',
  default: 'System',
});

const sansRegular = Platform.select({
  ios: 'Helvetica',
  android: 'Inter_400Regular',
  default: 'System',
});

const monoFont = Platform.select({
  ios: 'Courier New',
  android: 'JetBrainsMono_400Regular',
  default: 'monospace',
});

export const colors = {
  backgroundPrimary: '#0f111a',
  backgroundCard: '#1a1d2e',
  textPrimary: '#F0F2FA',
  textMuted: '#8b92b0',
  accentCyan: '#00EEFF',
  accentGreen: '#CCFF00',
  border: 'rgba(255, 255, 255, 0.08)',
};

export const typography = {
  h1: { fontFamily: sansBold, fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontFamily: sansBold, fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  h3: { fontFamily: sansMedium, fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  body: { fontFamily: sansRegular, fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontFamily: sansMedium, fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontFamily: sansRegular, fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  mono: { fontFamily: monoFont, fontSize: 12, lineHeight: 16 },
};

export const borderRadius = {
  sm: 8,
  md: 20,
  lg: 28,
  pill: 9999,
};

