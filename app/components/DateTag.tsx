import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Text } from './Text';
import { colors } from '@/theme';

interface DateTagProps {
  date: string;
  style?: ViewStyle;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

export const DateTag = ({ date, style }: DateTagProps) => {
  return (
    <View style={[styles.container, style]}>
      <Calendar color={colors.textMuted} size={14} style={styles.icon} />
      <Text variant="mono" color="textPrimary" style={styles.text}>
        {formatDate(date)}
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
    flexShrink: 1,
    maxWidth: '100%',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
  },
});
