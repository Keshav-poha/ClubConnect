import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { ChevronDown, X } from 'lucide-react-native';

interface ClayDropdownProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
}

export const ClayDropdown: React.FC<ClayDropdownProps> = ({ 
  label, 
  value, 
  options, 
  onChange, 
  error,
  placeholder = "Select an option" 
}) => {
  const { colors, borderRadius } = useTheme();
  const { typography } = require('@/theme');
  const globalStyles = useGlobalStyles();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily }]}>
          {label}
        </Text>
      )}
      
      <Pressable 
        style={[globalStyles.clayButton, styles.inputContainer]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[
          styles.inputText, 
          { 
            color: value ? colors.textPrimary : colors.textMuted, 
            fontFamily: typography.body.fontFamily 
          }
        ]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={colors.textMuted} />
      </Pressable>

      {error && (
        <Text style={[styles.error, { color: '#E11D48', fontFamily: typography.body.fontFamily }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[
            globalStyles.clayCard, 
            styles.modalContent, 
            { backgroundColor: colors.backgroundPrimary }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.h3.fontFamily }]}>
                {label || placeholder}
              </Text>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    value === item && { backgroundColor: colors.border }
                  ]}
                  onPress={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: value === item ? colors.accentCyan : colors.textPrimary,
                      fontFamily: value === item ? typography.bodyMedium.fontFamily : typography.body.fontFamily 
                    }
                  ]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    fontSize: 16,
  }
});
