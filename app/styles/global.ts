import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const useGlobalStyles = () => {
  const { colors, borderRadius } = useTheme();

  return StyleSheet.create({
    brutalistBorder: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
    },
    cardSurface: {
      backgroundColor: colors.backgroundCard,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 16,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    clayButton: {
      borderRadius: borderRadius.pill,
      borderWidth: 1.5,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 12,
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
};

// Temporary fallback for un-migrated components
export const globalStyles = StyleSheet.create({
  brutalistBorder: {},
  cardSurface: {},
  clayButton: {},
  centerContent: { alignItems: 'center', justifyContent: 'center' },
} as any);
