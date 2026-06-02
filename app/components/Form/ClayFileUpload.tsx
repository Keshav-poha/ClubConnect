import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { UploadCloud, File as FileIcon } from 'lucide-react-native';

interface ClayFileUploadProps {
  label?: string;
  value: string | null;
  onChange: (fileName: string) => void;
  error?: string;
}

export const ClayFileUpload: React.FC<ClayFileUploadProps> = ({ 
  label, 
  value, 
  onChange, 
  error 
}) => {
  const { colors } = useTheme();
  const { typography } = require('@/theme');
  const globalStyles = useGlobalStyles();

  // Simulate file picking for now
  const handlePickFile = () => {
    // In a real app, you would use expo-document-picker here
    const fakeFileName = `document_${Math.floor(Math.random() * 1000)}.pdf`;
    onChange(fakeFileName);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily }]}>
          {label}
        </Text>
      )}
      
      <Pressable 
        style={[
          globalStyles.clayCardPressed, 
          styles.dropzone,
          { borderStyle: 'dashed' }
        ]}
        onPress={handlePickFile}
      >
        {value ? (
          <View style={styles.content}>
            <FileIcon size={32} color={colors.accentCyan} />
            <Text style={[styles.fileName, { color: colors.textPrimary, fontFamily: typography.bodyMedium.fontFamily }]}>
              {value}
            </Text>
            <Text style={[styles.changeText, { color: '#D97706', fontFamily: typography.body.fontFamily }]}>
              Tap to change
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <UploadCloud size={32} color={colors.textMuted} />
            <Text style={[styles.placeholder, { color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily }]}>
              Tap to upload a file
            </Text>
            <Text style={[styles.hint, { color: colors.textMuted, fontFamily: typography.body.fontFamily }]}>
              PDF, DOCX, JPG up to 10MB
            </Text>
          </View>
        )}
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
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropzone: {
    padding: 24,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 16,
    marginTop: 8,
  },
  changeText: {
    fontSize: 12,
  },
  placeholder: {
    fontSize: 16,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  }
});
