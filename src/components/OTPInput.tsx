import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Theme } from '../theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 4, 
  value, 
  onChangeText,
  error = false,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      // Handle backspace
      const newValue = value.padEnd(length, '').split('');
      newValue[index] = '';
      onChangeText(newValue.join('').trimEnd());
      
      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      // Single digit entered
      const newValue = value.padEnd(length, '').split('');
      newValue[index] = numericText;
      const finalValue = newValue.join('').trimEnd();
      onChangeText(finalValue);
      
      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length > 1) {
      // Handle paste - distribute digits across inputs
      const digits = numericText.slice(0, length).split('');
      const newValue = value.padEnd(length, '').split('');
      
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValue[index + i] = digit;
        }
      });
      
      const finalValue = newValue.join('').trimEnd();
      onChangeText(finalValue);
      
      // Focus last filled input or last input
      const lastIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getBoxStyle = (index: number) => {
    const isFocused = focusedIndex === index;
    const isFilled = !!value[index];
    
    return [
      styles.box,
      isFocused && styles.boxFocused,
      isFilled && styles.boxFilled,
      error && styles.boxError,
    ];
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={getBoxStyle(index)}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          selectTextOnFocus
          textAlign="center"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    backgroundColor: Theme.colors.canvas,
  },
  boxFocused: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  boxFilled: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.withOpacity(Theme.colors.primary, 0.05),
  },
  boxError: {
    borderColor: Theme.colors.danger,
  },
});
