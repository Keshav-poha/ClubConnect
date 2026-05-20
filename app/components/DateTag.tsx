import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Text } from './Text';
import { colors } from '@/theme';

interface DateTagProps {
  date: string;
  style?: ViewStyle;
}

export const DateTag = ({ date, style }: DateTagProps) => {
  return (
    <View style={[styles.container, style]}>
      <Calendar color={colors.textMuted} size={14} style={styles.icon} />
      <Text variant="mono" color="textPrimary" style={styles.text}>
        {date}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
  },
});
