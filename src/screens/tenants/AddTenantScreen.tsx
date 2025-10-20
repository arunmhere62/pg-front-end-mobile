import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createTenant } from '../../store/slices/tenantSlice';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import api from '../../services/api';

interface AddTenantScreenProps {
  navigation: any;
  route?: any;
}

interface OptionType {
  label: string;
  value: string;
}

interface StateData {
  s_no: number;
  name: string;
  iso_code: string;
}

interface CityData {
  s_no: number;
  name: string;
}

export const AddTenantScreen: React.FC<AddTenantScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [roomList, setRoomList] = useState<OptionType[]>([]);
  const [bedsList, setBedsList] = useState<OptionType[]>([]);
  const [statesList, setStatesList] = useState<OptionType[]>([]);
  const [citiesList, setCitiesList] = useState<OptionType[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);

  // Dropdown visibility
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showBedDropdown, setShowBedDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone_no: '',
    whatsapp_number: '',
    email: '',
    occupation: '',
    tenant_address: '',
    room_id: '',
    room_label: '',
    bed_id: '',
    bed_label: '',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: '',
    city_id: '',
    city_label: '',
    state_id: '',
    state_label: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone_no.trim()) {
      newErrors.phone_no = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_no.trim())) {
      newErrors.phone_no = 'Phone number must be 10 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.check_in_date) {
      newErrors.check_in_date = 'Check-in date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    if (!selectedPGLocationId) {
      Alert.alert('Error', 'Please select a PG location first');
      return;
    }

    try {
      setLoading(true);

      const tenantData = {
        name: formData.name.trim(),
        phone_no: formData.phone_no.trim(),
        whatsapp_number: formData.whatsapp_number.trim() || formData.phone_no.trim(),
        email: formData.email.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        tenant_address: formData.tenant_address.trim() || undefined,
        pg_id: selectedPGLocationId,
        room_id: formData.room_id ? parseInt(formData.room_id) : undefined,
        bed_id: formData.bed_id ? parseInt(formData.bed_id) : undefined,
        check_in_date: formData.check_in_date,
        city_id: formData.city_id ? parseInt(formData.city_id) : undefined,
        state_id: formData.state_id ? parseInt(formData.state_id) : undefined,
        status: 'ACTIVE' as const,
      };

      await dispatch(
        createTenant({
          data: tenantData,
          headers: {
            pg_id: selectedPGLocationId,
            organization_id: user?.organization_id,
            user_id: user?.s_no,
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Tenant created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Add New Tenant"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Personal Information */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Theme.colors.text.primary,
                marginBottom: 16,
              }}
            >
              👤 Personal Information
            </Text>

            {/* Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Full Name <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Enter full name"
                style={{
                  borderWidth: 1,
                  borderColor: errors.name ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.name && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.name}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Phone Number <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={formData.phone_no}
                onChangeText={(value) => updateField('phone_no', value)}
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
                style={{
                  borderWidth: 1,
                  borderColor: errors.phone_no ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.phone_no && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.phone_no}</Text>
              )}
            </View>

            {/* WhatsApp Number */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                WhatsApp Number
              </Text>
              <TextInput
                value={formData.whatsapp_number}
                onChangeText={(value) => updateField('whatsapp_number', value)}
                placeholder="Enter WhatsApp number (optional)"
                keyboardType="phone-pad"
                maxLength={10}
                style={{
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                Leave empty to use phone number
              </Text>
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Email Address
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Enter email address (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: errors.email ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.email && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.email}</Text>
              )}
            </View>

            {/* Occupation */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Occupation
              </Text>
              <TextInput
                value={formData.occupation}
                onChangeText={(value) => updateField('occupation', value)}
                placeholder="Enter occupation (optional)"
                style={{
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
            </View>
          </Card>

          {/* Address Information */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Theme.colors.text.primary,
                marginBottom: 16,
              }}
            >
              📍 Address Information
            </Text>

            {/* Address */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Address
              </Text>
              <TextInput
                value={formData.tenant_address}
                onChangeText={(value) => updateField('tenant_address', value)}
                placeholder="Enter full address (optional)"
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </Card>

          {/* Accommodation Details */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Theme.colors.text.primary,
                marginBottom: 16,
              }}
            >
              🏠 Accommodation Details
            </Text>

            {/* Room ID */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Room ID
              </Text>
              <TextInput
                value={formData.room_id}
                onChangeText={(value) => updateField('room_id', value)}
                placeholder="Enter room ID (optional)"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
            </View>

            {/* Bed ID */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Bed ID
              </Text>
              <TextInput
                value={formData.bed_id}
                onChangeText={(value) => updateField('bed_id', value)}
                placeholder="Enter bed ID (optional)"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
            </View>

            {/* Check-in Date */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                Check-in Date <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={formData.check_in_date}
                onChangeText={(value) => updateField('check_in_date', value)}
                placeholder="YYYY-MM-DD"
                style={{
                  borderWidth: 1,
                  borderColor: errors.check_in_date ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.check_in_date && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.check_in_date}</Text>
              )}
            </View>
          </Card>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9CA3AF' : Theme.colors.primary,
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Create Tenant</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
