import { StyleSheet, Platform } from 'react-native';
import { colors, borderRadius } from '@/theme';

export const globalStyles = StyleSheet.create({
  brutalistBorder: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  cardSurface: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  clayButton: {
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
