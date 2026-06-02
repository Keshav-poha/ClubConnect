import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

interface ClaySwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ClaySwitch: React.FC<ClaySwitchProps> = ({ value, onValueChange, disabled }) => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const offset = useSharedValue(value ? 24 : 4);

  useEffect(() => {
    offset.value = withSpring(value ? 24 : 4, {
      mass: 0.5,
      damping: 15,
      stiffness: 150,
    });
  }, [value, offset]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.container, disabled && { opacity: 0.5 }]}
    >
      <View
        style={[
          styles.track,
          globalStyles.clayCardPressed,
          { backgroundColor: value ? colors.accentCyan : colors.backgroundPrimary },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            globalStyles.clayButton,
            { backgroundColor: colors.backgroundCard },
            animatedCircleStyle,
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    left: 0,
  },
});
