import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
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
    <View style={[styles.outerWrapper, { backgroundColor: colors.backgroundPrimary }]}>
      <Container
        style={[styles.innerContainer, isWideScreen && styles.innerContainerWide, style]}
        {...props}
      >
        {children}
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        transition: 'background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    ...Platform.select({
      web: {
        transition: 'background-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
  },
  innerContainerWide: {
    paddingLeft: 112, // Accommodate the 80px sidebar + 32px margins
    paddingRight: 32, // Add some breathing room on the right for wide screens
  },
});
