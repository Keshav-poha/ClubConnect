import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useGlobalStyles } from '@/styles/global';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  const globalStyles = useGlobalStyles();
  
  return (
    <View style={[styles.card, globalStyles.clayCard, style]} {...props}>
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
