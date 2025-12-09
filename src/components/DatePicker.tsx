import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Theme } from '../theme';

interface DatePickerProps {
  label: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Select date';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // For Android, immediately apply the date
        const isoDate = selectedDate.toISOString().split('T')[0];
        onChange(isoDate);
      }
    }
  };

  const handleConfirm = () => {
    const isoDate = tempDate.toISOString().split('T')[0];
    onChange(isoDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value ? new Date(value) : new Date());
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Date Display Button */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          style={[
            styles.dateButton,
            error && styles.dateButtonError,
            disabled && styles.dateButtonDisabled,
            { flex: 1 },
          ]}
        >
          <View style={styles.dateContent}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text
              style={[
                styles.dateText,
                !value && styles.dateTextPlaceholder,
                disabled && styles.dateTextDisabled,
              ]}
            >
              {formatDate(value)}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Clear Button - Only show if date is selected */}
        {value && !disabled && (
          <TouchableOpacity
            onPress={() => onChange('')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#FEE2E2',
              borderWidth: 1,
              borderColor: '#FECACA',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, color: '#DC2626', fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Date Picker Modal (iOS) */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.confirmButton}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* iOS Date Picker */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={Theme.colors.text.primary}
              />
            </View>
          </View>
        </Modal>
      ) : (
        // Android Date Picker
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    marginBottom: 4,
    marginLeft: 2,
  },
  required: {
    color: '#EF4444',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
    minHeight: 30,
  },
  dateButtonError: {
    borderColor: '#EF4444',
  },
  dateButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dateText: {
    fontSize: 13,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },
  dateTextPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  dateTextDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
});
