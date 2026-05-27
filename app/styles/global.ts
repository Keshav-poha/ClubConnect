import { StyleSheet } from 'react-native';
import { colors, borderRadius } from '@/theme';

export const globalStyles = StyleSheet.create({
  brutalistBorder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md, // Rounded corners
  },
  cardSurface: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
