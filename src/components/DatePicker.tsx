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
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        style={[
          styles.dateButton,
          error && styles.dateButtonError,
          disabled && styles.dateButtonDisabled,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
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
    fontSize: 20,
    marginRight: 10,
  },
  dateText: {
    fontSize: 14,
    color: Theme.colors.text.primary,
  },
  dateTextPlaceholder: {
    color: '#9CA3AF',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
