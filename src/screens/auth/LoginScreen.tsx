import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { KeyboardAvoidingWrapper } from '../../components/KeyboardAvoidingWrapper';
import { Theme } from '../../theme';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    try {
      await dispatch(sendOtp(phone)).unwrap();
      Alert.alert('Success', 'OTP sent successfully to your phone number');
      navigation.navigate('OTPVerification', { phone });
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to send OTP');
    }
  };

  return (
    <KeyboardAvoidingWrapper
      style={{ backgroundColor: Theme.colors.background.primary }}
      contentContainerStyle={{ 
        justifyContent: 'center', 
        padding: Theme.spacing.lg 
      }}
    >
      <View style={{ marginBottom: Theme.spacing.xl }}>
        <Text style={{ 
          fontSize: Theme.typography.fontSize['4xl'], 
          fontWeight: Theme.typography.fontWeight.bold, 
          color: Theme.colors.primary, 
          textAlign: 'center', 
          marginBottom: Theme.spacing.sm 
        }}>
          PG Management
        </Text>
        <Text style={{ 
          fontSize: Theme.typography.fontSize.base, 
          color: Theme.colors.text.secondary, 
          textAlign: 'center' 
        }}>
          Login to manage your PG operations
        </Text>
      </View>

      <Card className="mb-6 shadow-none">
        <Text className="text-2xl font-semibold text-dark mb-6">Login</Text>
        
        <Input
          label="Phone Number"
          placeholder="Enter your 10-digit phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setPhoneError('');
          }}
          keyboardType="phone-pad"
          maxLength={10}
          error={phoneError}
        />

        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          loading={loading}
          variant="primary"
          size="md"
        />
        
        <Text className='mt-6' style={{ 
          fontSize: Theme.typography.fontSize.sm, 
          color: Theme.colors.text.secondary, 
          textAlign: 'center', 
          marginBottom: Theme.spacing.md 
        }}>
          You will receive a 6-digit OTP on your registered phone number
        </Text>

        <View style={{ marginTop: Theme.spacing.lg }}>
          <Button
            title="Create New Account"
            onPress={() => navigation.navigate('Signup')}
            variant="outline"
            size='md'
          />
        </View>
      </Card>
    </KeyboardAvoidingWrapper>
  );
};
