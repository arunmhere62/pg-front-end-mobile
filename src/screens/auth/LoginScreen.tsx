import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
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
    <View style={{ flex: 1, backgroundColor: Theme.colors.statusBar }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Theme.spacing.lg }}>
          <View style={{ marginBottom: Theme.spacing.xl }}>
            <Text style={{ fontSize: Theme.typography.fontSize['4xl'], fontWeight: Theme.typography.fontWeight.bold, color: Theme.colors.text.inverse, textAlign: 'center', marginBottom: Theme.spacing.sm }}>
              PG Management
            </Text>
            <Text style={{ fontSize: Theme.typography.fontSize.base, color: Theme.withOpacity(Theme.colors.text.inverse, 0.8), textAlign: 'center' }}>
              Login to manage your PG operations
            </Text>
          </View>

          <Card className="mb-6">
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
              className="mt-4"
            />
          </Card>

          <Text className="text-sm text-gray-900 text-center mb-4">
            You will receive a 6-digit OTP on your registered phone number
          </Text>

          <View style={{ marginTop: Theme.spacing.lg }}>
            <Button
              title="Create New Account"
              onPress={() => navigation.navigate('Signup')}
              variant="secondary"
            />
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};
