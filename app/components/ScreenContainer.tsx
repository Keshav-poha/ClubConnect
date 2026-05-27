import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

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

  return (
    <Container style={[styles.container, style]} {...props}>
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
});
