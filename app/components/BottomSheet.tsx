import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet = ({ visible, onClose, children }: BottomSheetProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.content}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X color={colors.textPrimary} size={24} />
          </Pressable>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 24,
    minHeight: '50%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
});
