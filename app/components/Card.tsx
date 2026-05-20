import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { globalStyles } from '@/styles/global';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <View style={[styles.card, globalStyles.cardSurface, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    overflow: 'hidden',
  },
});
