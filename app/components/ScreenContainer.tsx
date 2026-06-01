import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
}

export const ScreenContainer = ({
  children,
  useSafeArea = true,
  style,
  ...props
}: ScreenContainerProps) => {
  const Container = useSafeArea ? SafeAreaView : View;
  const { colors } = useTheme();
  const { isWideScreen } = useResponsive();

  return (
    <Container 
      style={[
        styles.container,
        { backgroundColor: colors.backgroundPrimary },
        isWideScreen && styles.containerWide,
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
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  containerWide: {
    paddingLeft: 112, // Accommodate the 80px sidebar + 32px margins
    paddingRight: 32, // Add some breathing room on the right for wide screens
  }
});
