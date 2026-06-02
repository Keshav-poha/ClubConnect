import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { Check } from 'lucide-react-native';

interface ClayCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export const ClayCheckbox: React.FC<ClayCheckboxProps> = ({ 
  label, 
  checked, 
  onChange,
  error 
}) => {
  const { colors } = useTheme();
  const { typography } = require('@/theme');
  const globalStyles = useGlobalStyles();

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.row}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[
          checked ? globalStyles.clayCardPressed : globalStyles.clayButton,
          styles.checkbox,
          checked && { backgroundColor: colors.accentCyan }
        ]}>
          {checked && <Check size={16} color={colors.backgroundPrimary} strokeWidth={3} />}
        </View>
        <Text style={[
          styles.label, 
          { color: colors.textPrimary, fontFamily: typography.bodyMedium.fontFamily }
        ]}>
          {label}
        </Text>
      </Pressable>
      
      {error && (
        <Text style={[styles.error, { color: '#E11D48', fontFamily: typography.body.fontFamily }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 36,
  }
});
