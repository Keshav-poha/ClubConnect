import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from './IconButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  style?: ViewStyle;
}

export const Header = ({ title, subtitle, rightElement, showBack, onBack, style }: HeaderProps) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showBack && (
        <IconButton Icon={ArrowLeft} onPress={handleBack} style={styles.backButton} />
      )}
      <View style={[styles.textContainer, showBack && styles.textContainerWithBack]}>
        <Text variant="h1">{title}</Text>
        {subtitle && (
          <Text variant="body" color="textMuted" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  textContainerWithBack: {
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  subtitle: {
    marginTop: 4,
  },
  rightElement: {
    marginLeft: 16,
  },
});
