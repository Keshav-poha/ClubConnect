import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

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

  return (
    <Container 
      style={[
        styles.container,
        { backgroundColor: colors.backgroundPrimary },
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
    maxWidth: 1000,
    alignSelf: 'center',
  },
});
