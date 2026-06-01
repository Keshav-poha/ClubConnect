import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const useGlobalStyles = () => {
  const { colors, borderRadius } = useTheme();

  return StyleSheet.create({
    clayCard: {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.md,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderTopColor: colors.clayHighlight,
      borderLeftColor: colors.clayHighlight,
      borderBottomColor: colors.clayShadow,
      borderRightColor: colors.clayShadow,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 6, height: 10 },
          shadowOpacity: 1,
          shadowRadius: 16,
        },
        android: {
          elevation: 6,
        },
        web: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 6, height: 10 },
          shadowOpacity: 1,
          shadowRadius: 16,
        },
      }),
    },
    clayCardPressed: {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.md,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderTopColor: colors.clayShadow,
      borderLeftColor: colors.clayShadow,
      borderBottomColor: colors.clayHighlight,
      borderRightColor: colors.clayHighlight,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
        web: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
        },
      }),
    },
    clayButton: {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.sm,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderTopColor: colors.clayHighlight,
      borderLeftColor: colors.clayHighlight,
      borderBottomColor: colors.clayShadow,
      borderRightColor: colors.clayShadow,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 10,
        },
        android: {
          elevation: 4,
        },
        web: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 10,
        },
      }),
    },
    clayButtonPressed: {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.sm,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderTopColor: colors.clayShadow,
      borderLeftColor: colors.clayShadow,
      borderBottomColor: colors.clayHighlight,
      borderRightColor: colors.clayHighlight,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.9,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
        web: {
          shadowColor: colors.shadowOuter,
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.9,
          shadowRadius: 4,
        },
      }),
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
