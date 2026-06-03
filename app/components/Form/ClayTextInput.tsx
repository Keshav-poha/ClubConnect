import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { typography } from '@/theme';

interface ClayTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const ClayTextInput: React.FC<ClayTextInputProps> = ({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          globalStyles.clayCardPressed,
          styles.inputContainer,
          isFocused && { borderColor: colors.accentCyan, borderWidth: 2 },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary, fontFamily: typography.body.fontFamily },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
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
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: 24,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
