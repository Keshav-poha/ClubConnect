import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Check, AlertCircle, Info } from 'lucide-react-native';
import { Text } from './Text';
import { colors } from '@/theme';
import { globalStyles } from '@/styles/global';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
}

export const Toast = ({ message, type = 'info', visible, onHide }: ToastProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, slideAnim, onHide]);

  if (!visible) return null;

  const Icon = type === 'success' ? Check : type === 'error' ? AlertCircle : Info;
  const iconColor = type === 'success' ? colors.accentGreen : type === 'error' ? '#FF4444' : colors.accentCyan;

  return (
    <Animated.View style={[styles.container, globalStyles.brutalistBorder, { transform: [{ translateY: slideAnim }] }]}>
      <Icon color={iconColor} size={20} />
      <Text variant="bodyMedium" style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.backgroundCard,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  text: {
    flex: 1,
  },
});
