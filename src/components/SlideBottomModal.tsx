import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../theme';

export interface SlideBottomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const SlideBottomModal: React.FC<SlideBottomModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
}) => {
  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  const handleCancel = async () => {
    if (onCancel) {
      await onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: Theme.colors.canvas,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                  {title}
                </Text>
                {subtitle && (
                  <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 4 }}>
                    {subtitle}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} disabled={isLoading}>
                <Text style={{ fontSize: 24, color: Theme.colors.text.primary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
                backgroundColor: Theme.colors.canvas,
              }}
            >
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: Theme.colors.light,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
              {onSubmit && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: Theme.colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                      {submitLabel}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
