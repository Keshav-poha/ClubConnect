import React from 'react';
import { View, ViewProps, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  hasSidebar?: boolean;
}

export const ScreenContainer = ({
  children,
  useSafeArea = true,
  hasSidebar = false,
  style,
  ...props
}: ScreenContainerProps) => {
  const Container = useSafeArea ? SafeAreaView : View;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Container 
      style={[
        styles.container, 
        isDesktop && hasSidebar && styles.desktopContainer,
        style
      ]} 
      {...props}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  desktopContainer: {
    paddingLeft: 80, // Leave room for the left sidebar on desktop
    maxWidth: 1080,  // Offset the 80px padding to keep content area at max 1000px
  },
});
