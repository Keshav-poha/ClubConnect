import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Define breakpoint for wide screens (tablets, desktop web)
  const isWideScreen = width > 768;

  // Calculate dynamic grid columns
  const numColumns = useMemo(() => {
    if (width > 1200) {
      return 3;
    } else if (width > 768) {
      return 2;
    }
    return 1;
  }, [width]);

  return {
    width,
    height,
    isWideScreen,
    numColumns,
  };
};
