import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../theme';
import axiosInstance from '../../services/core/axiosInstance';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import { Button } from '../../components/Button';

interface SignupScreenProps {
  navigation: any;
}

interface FormData {
  // Organization & User Info
  organizationName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // PG Location Info
  pgName: string;
  pgAddress: string;
  pgPincode: string;
  
  // Location IDs
  countryCode: string;
  stateId: number | null;
  cityId: number | null;
}

interface Country {
  s_no: number;
  name: string;
  iso_code: string;
}

interface State {
  s_no: number;
  name: string;
  iso_code: string;
}

interface City {
  s_no: number;
  name: string;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    pgName: '',
    pgAddress: '',
    pgPincode: '',
    countryCode: 'IN', // Default to India
    stateId: null,
    cityId: null,
  });

  // Dropdown data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.countryCode) {
      fetchStates(formData.countryCode);
    }
  }, [formData.countryCode]);

  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get('/location/countries');
      if (response.data.success) {
        setCountries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryCode: string) => {
    setLoadingStates(true);
    try {
      const response = await axiosInstance.get('/location/states', {
        params: { countryCode },
      });
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateCode: string) => {
    setLoadingCities(true);
    try {
      const response = await axiosInstance.get('/location/cities', {
        params: { stateCode },
      });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (stateId: number) => {
    const selectedState = states.find(s => s.s_no === stateId);
    if (selectedState) {
      setFormData({ ...formData, stateId, cityId: null });
      setCities([]);
      fetchCities(selectedState.iso_code);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep1 = () => {
    if (!formData.organizationName.trim()) {
      Alert.alert('Error', 'Please enter organization name');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.pgName.trim()) {
      Alert.alert('Error', 'Please enter PG name');
      return false;
    }
    if (!formData.pgAddress.trim()) {
      Alert.alert('Error', 'Please enter PG address');
      return false;
    }
    if (!formData.stateId) {
      Alert.alert('Error', 'Please select a state');
      return false;
    }
    if (!formData.cityId) {
      Alert.alert('Error', 'Please select a city');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const signupData = {
        organizationName: formData.organizationName,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        pgName: formData.pgName,
        pgAddress: formData.pgAddress,
        stateId: formData.stateId!,
        cityId: formData.cityId!,
        pgPincode: formData.pgPincode,
      };

      const response = await axiosInstance.post('/auth/signup', signupData);

      if (response.data.success) {
        Alert.alert(
          'Success',
          'Account created successfully! Please wait for admin approval.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentStep >= 1 ? Theme.colors.primary : Theme.colors.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: currentStep >= 1 ? 'white' : Theme.colors.text.secondary, fontWeight: 'bold' }}>
            1
          </Text>
        </View>
        <View
          style={{
            width: 60,
            height: 2,
            backgroundColor: currentStep >= 2 ? Theme.colors.primary : Theme.colors.light,
          }}
        />
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentStep >= 2 ? Theme.colors.primary : Theme.colors.light,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: currentStep >= 2 ? 'white' : Theme.colors.text.secondary, fontWeight: 'bold' }}>
            2
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: Theme.colors.text.primary, marginBottom: 8 }}>
        Account Information
      </Text>
      <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 24 }}>
        Let's start with your basic details
      </Text>

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Organization Name *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter organization name"
        value={formData.organizationName}
        onChangeText={(text) => updateFormData('organizationName', text)}
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Your Name *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter your full name"
        value={formData.name}
        onChangeText={(text) => updateFormData('name', text)}
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Email Address *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter email address"
        value={formData.email}
        onChangeText={(text) => updateFormData('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Phone Number
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter phone number"
        value={formData.phone}
        onChangeText={(text) => updateFormData('phone', text)}
        keyboardType="phone-pad"
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Password *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter password (min 6 characters)"
        value={formData.password}
        onChangeText={(text) => updateFormData('password', text)}
        secureTextEntry
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Confirm Password *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Re-enter password"
        value={formData.confirmPassword}
        onChangeText={(text) => updateFormData('confirmPassword', text)}
        secureTextEntry
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: Theme.colors.text.primary, marginBottom: 8 }}>
        PG Location Details
      </Text>
      <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 24 }}>
        Tell us about your PG location
      </Text>

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        PG Name *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter PG name"
        value={formData.pgName}
        onChangeText={(text) => updateFormData('pgName', text)}
      />

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        PG Address *
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          minHeight: 80,
        }}
        placeholder="Enter complete address"
        value={formData.pgAddress}
        onChangeText={(text) => updateFormData('pgAddress', text)}
        multiline
        numberOfLines={3}
      />

      <SearchableDropdown
        label="State"
        placeholder="Select a state"
        items={states.map(state => ({
          id: state.s_no,
          label: state.name,
          value: state.iso_code,
        }))}
        selectedValue={formData.stateId}
        onSelect={(item) => handleStateChange(item.id)}
        loading={loadingStates}
        required
      />

      {formData.stateId && (
        <SearchableDropdown
          label="City"
          placeholder="Select a city"
          items={cities.map(city => ({
            id: city.s_no,
            label: city.name,
            value: city.s_no,
          }))}
          selectedValue={formData.cityId}
          onSelect={(item) => updateFormData('cityId', item.id)}
          loading={loadingCities}
          required
        />
      )}

      <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
        Pincode
      </Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#E5E7EB',
        }}
        placeholder="Enter pincode"
        value={formData.pgPincode}
        onChangeText={(text) => updateFormData('pgPincode', text)}
        keyboardType="numeric"
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{ flex: 1, backgroundColor: Theme.colors.background.secondary }}>
            <ScrollView 
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {renderStepIndicator()}
              {currentStep === 1 ? renderStep1() : renderStep2()}
            </ScrollView>

          {/* Bottom Action Buttons */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            {currentStep > 1 && (
              <View style={{ flex: 1 }}>
                <Button
                  title="Back"
                  onPress={handleBack}
                  variant="outline"
                  size="lg"
                />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Button
                title={currentStep === 1 ? 'Next' : 'Create Account'}
                onPress={currentStep === 1 ? handleNext : handleSubmit}
                loading={loading}
                variant="primary"
                size="lg"
              />
            </View>
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={{ position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center' }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: Theme.colors.text.secondary }}>
              Already have an account?{' '}
              <Text style={{ color: Theme.colors.primary, fontWeight: 'bold' }}>Login</Text>
            </Text>
          </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};
