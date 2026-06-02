import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Define breakpoint for wide screens (tablets, desktop web)
  const isWideScreen = width > 768;

  // Calculate dynamic grid columns
  let numColumns = 1;
  if (width > 1200) {
    numColumns = 3;
  } else if (width > 768) {
    numColumns = 2;
  }

  return {
    width,
    height,
    isWideScreen,
    numColumns,
  };
};
