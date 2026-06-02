import { useStore } from '@/store';
import { lightColors, darkColors, typography, borderRadius } from '@/theme';

export const useTheme = () => {
  const themeMode = useStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    themeMode,
    isDark,
    colors,
    typography,
    borderRadius,
  };
};
