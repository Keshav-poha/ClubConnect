import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Text } from './Text';
import { BrutalistSwitch } from './BrutalistSwitch';
import { colors } from '@/theme';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showDivider?: boolean;
  danger?: boolean;
}

export const SettingsRow = ({
  icon: Icon,
  label,
  value,
  isSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  showDivider = true,
  danger = false,
}: SettingsRowProps) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Icon color={danger ? '#FF4444' : colors.textPrimary} size={20} />
        <Text variant="body" color={danger ? 'textPrimary' : 'textPrimary'} style={[styles.label, danger && { color: '#FF4444' }]}>
          {label}
        </Text>
      </View>
      <View style={styles.rightContent}>
        {isSwitch ? (
          <BrutalistSwitch
            value={!!switchValue}
            onValueChange={onSwitchChange || (() => {})}
          />
        ) : (
          <>
            {value && <Text variant="body" color="textMuted" style={styles.value}>{value}</Text>}
            <ChevronRight color={colors.textMuted} size={20} />
          </>
        )}
      </View>
    </View>
  );

  return (
    <>
      {isSwitch ? (
        <View style={styles.wrapper}>{content}</View>
      ) : (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
          {content}
        </Pressable>
      )}
      {showDivider && <View style={styles.divider} />}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
});
