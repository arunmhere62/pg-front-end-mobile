import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Theme } from '../theme';

export interface Option {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

export interface OptionSelectorProps {
  label: string;
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  description?: string;
  error?: string;
}

/**
 * Reusable Option Selector Component
 * Used for selecting between multiple options (e.g., PG Type, Gender)
 * Displays options as horizontal buttons with icons
 */
export const OptionSelector: React.FC<OptionSelectorProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  required = false,
  disabled = false,
  containerStyle,
  description,
  error,
}) => {
  return (
    <View style={containerStyle}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
        {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>

      {description && (
        <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, marginBottom: 12 }}>
          {description}
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: selectedValue === option.value ? Theme.colors.primary : '#E5E7EB',
              backgroundColor: selectedValue === option.value ? '#EFF6FF' : 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            disabled={disabled}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: selectedValue === option.value ? Theme.colors.primary : Theme.colors.text.secondary,
              }}
            >
              {option.icon && `${option.icon} `}
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};
