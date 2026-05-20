import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const globalStyles = StyleSheet.create({
  brutalistBorder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0, // Sharp corners
  },
  cardSurface: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
