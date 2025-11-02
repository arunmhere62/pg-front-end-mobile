import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ImageUpload } from '../../components/ImageUpload';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import axiosInstance from '../../services/core/axiosInstance';
import employeeService, { UserGender } from '../../services/employees/employeeService';
import { CONTENT_COLOR } from '@/constant';

interface AddEmployeeScreenProps {
  navigation: any;
  route?: any;
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

interface RoleData {
  s_no: number;
  role_name: string;
}

interface PGLocationData {
  s_no: number;
  location_name: string;
}

export const AddEmployeeScreen: React.FC<AddEmployeeScreenProps> = ({ navigation, route }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  // Check if we're in edit mode
  const employeeId = route?.params?.employeeId;
  const isEditMode = !!employeeId;

  // Dropdown data
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [pgLocations, setPGLocations] = useState<PGLocationData[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: null as number | null,
    pg_id: null as number | null,
    gender: '' as UserGender | '',
    address: '',
    city_id: null as number | null,
    state_id: null as number | null,
    pincode: '',
    country: 'India',
  });

  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [proofDocuments, setProofDocuments] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPGLocations, setLoadingPGLocations] = useState(false);

  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode && employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchStates();
    fetchRoles();
    fetchPGLocations();
  }, []);

  // Fetch cities when state is selected
  useEffect(() => {
    if (formData.state_id) {
      const selectedState = stateData.find(s => s.s_no === formData.state_id);
      if (selectedState) {
        fetchCities(selectedState.iso_code);
      }
    } else {
      setCityData([]);
      setFormData(prev => ({ ...prev, city_id: null }));
    }
  }, [formData.state_id, stateData]);

  const fetchEmployeeData = async () => {
    try {
      setInitialLoading(true);
      const response = await employeeService.getEmployeeById(employeeId);
      const employee = response.data;
      
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '', // Don't populate password in edit mode
        phone: employee.phone || '',
        role_id: employee.role_id || null,
        pg_id: employee.pg_id || null,
        gender: employee.gender || '',
        address: employee.address || '',
        city_id: employee.city_id || null,
        state_id: employee.state_id || null,
        pincode: employee.pincode || '',
        country: employee.country || 'India',
      });
      
      if (employee.profile_images) {
        setProfileImages(Array.isArray(employee.profile_images) ? employee.profile_images : 
          typeof employee.profile_images === 'string' ? JSON.parse(employee.profile_images) : []);
      }
      if (employee.proof_documents) {
        setProofDocuments(Array.isArray(employee.proof_documents) ? employee.proof_documents : 
          typeof employee.proof_documents === 'string' ? JSON.parse(employee.proof_documents) : []);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load employee data');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await axiosInstance.get('/location/states', {
        params: { countryCode: 'IN' },
      });
      if (response.data.success) {
        setStateData(response.data.data);
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
        setCityData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      console.log('🔄 Fetching roles from /auth/roles');
      const response = await axiosInstance.get('/auth/roles');
      console.log('✅ Roles response:', response.data);
      
      if (response.data.success) {
        setRoleData(response.data.data);
        console.log('📋 Roles loaded:', response.data.data.length);
      }
    } catch (error: any) {
      console.error('❌ Error fetching roles:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchPGLocations = async () => {
    setLoadingPGLocations(true);
    try {
      const response = await axiosInstance.get('/pg-locations');
      if (response.data.success) {
        setPGLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching PG locations:', error);
    } finally {
      setLoadingPGLocations(false);
    }
  };

  const updateField = (field: string, value: any) => {
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

    if (!isEditMode) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      setLoading(true);

      const employeeData: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        role_id: formData.role_id!,
        pg_id: formData.pg_id || undefined,
        gender: formData.gender || undefined,
        address: formData.address.trim() || undefined,
        city_id: formData.city_id || undefined,
        state_id: formData.state_id || undefined,
        pincode: formData.pincode.trim() || undefined,
        country: formData.country.trim() || undefined,
        profile_images: profileImages.length > 0 ? profileImages : undefined,
        proof_documents: proofDocuments.length > 0 ? proofDocuments : undefined,
      };

      if (isEditMode) {
        // Update existing employee
        await employeeService.updateEmployee(employeeId, employeeData);
        Alert.alert('Success', 'Employee updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Create new employee
        employeeData.email = formData.email.trim();
        employeeData.password = formData.password.trim();
        
        await employeeService.createEmployee(employeeData);
        Alert.alert('Success', 'Employee created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ScreenLayout backgroundColor={Theme.colors.background.blue}>
        <ScreenHeader
          title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          backgroundColor={Theme.colors.background.blue}
          syncMobileHeaderBg={true}
        />
        <View style={{ flex: 1, backgroundColor: CONTENT_COLOR, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>Loading employee data...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />

      <View style={{ flex: 1, backgroundColor: CONTENT_COLOR }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ padding: 16 }}>
              {/* Personal Information */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
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

                {/* Email (only in create mode) */}
                {!isEditMode && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                      Email Address <Text style={{ color: '#EF4444' }}>*</Text>
                    </Text>
                    <TextInput
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      placeholder="Enter email address"
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
                )}

                {/* Password (only in create mode) */}
                {!isEditMode && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                      Password <Text style={{ color: '#EF4444' }}>*</Text>
                    </Text>
                    <TextInput
                      value={formData.password}
                      onChangeText={(value) => updateField('password', value)}
                      placeholder="Enter password (min 6 characters)"
                      secureTextEntry
                      style={{
                        borderWidth: 1,
                        borderColor: errors.password ? '#EF4444' : Theme.colors.border,
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 14,
                        backgroundColor: '#fff',
                      }}
                    />
                    {errors.password && (
                      <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.password}</Text>
                    )}
                  </View>
                )}

                {/* Phone Number */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                    Phone Number
                  </Text>
                  <TextInput
                    value={formData.phone}
                    onChangeText={(value) => updateField('phone', value)}
                    placeholder="Enter 10-digit phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={{
                      borderWidth: 1,
                      borderColor: errors.phone ? '#EF4444' : Theme.colors.border,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 14,
                      backgroundColor: '#fff',
                    }}
                  />
                  {errors.phone && (
                    <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{errors.phone}</Text>
                  )}
                </View>

                {/* Gender */}
                <SearchableDropdown
                  label="Gender"
                  placeholder="Select gender"
                  items={[
                    { id: 1, label: 'Male', value: 'MALE' },
                    { id: 2, label: 'Female', value: 'FEMALE' },
                  ]}
                  selectedValue={formData.gender === 'MALE' ? 1 : formData.gender === 'FEMALE' ? 2 : null}
                  onSelect={(item) => updateField('gender', item.value as UserGender)}
                  required={false}
                />
              </Card>

              {/* Work Information */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
                  💼 Work Information
                </Text>

                {/* Role */}
                <SearchableDropdown
                  label="Role"
                  placeholder="Select a role"
                  items={roleData.map(role => ({
                    id: role.s_no,
                    label: role.role_name,
                    value: role.s_no,
                  }))}
                  selectedValue={formData.role_id}
                  onSelect={(item) => updateField('role_id', item.id)}
                  loading={loadingRoles}
                  error={errors.role_id}
                  required={true}
                />

                {/* PG Location */}
                <SearchableDropdown
                  label="PG Location"
                  placeholder="Select a PG location"
                  items={pgLocations.map(pg => ({
                    id: pg.s_no,
                    label: pg.location_name,
                    value: pg.s_no,
                  }))}
                  selectedValue={formData.pg_id}
                  onSelect={(item) => updateField('pg_id', item.id)}
                  loading={loadingPGLocations}
                  required={false}
                />
              </Card>

              {/* Address Information */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
                  📍 Address Information
                </Text>

                {/* State Select */}
                <SearchableDropdown
                  label="State"
                  placeholder="Select a state"
                  items={stateData.map(state => ({
                    id: state.s_no,
                    label: state.name,
                    value: state.iso_code,
                  }))}
                  selectedValue={formData.state_id}
                  onSelect={(item) => setFormData(prev => ({ ...prev, state_id: item.id }))}
                  loading={loadingStates}
                  required={false}
                />

                {/* City Select */}
                <SearchableDropdown
                  label="City"
                  placeholder="Select a city"
                  items={cityData.map(city => ({
                    id: city.s_no,
                    label: city.name,
                    value: city.s_no,
                  }))}
                  selectedValue={formData.city_id}
                  onSelect={(item) => setFormData(prev => ({ ...prev, city_id: item.id }))}
                  loading={loadingCities}
                  disabled={!formData.state_id}
                  required={false}
                />

                {/* Address */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                    Address
                  </Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(value) => updateField('address', value)}
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

                {/* Pincode */}
                <View style={{ marginBottom: 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
                    Pincode
                  </Text>
                  <TextInput
                    value={formData.pincode}
                    onChangeText={(value) => updateField('pincode', value)}
                    placeholder="Enter pincode (optional)"
                    keyboardType="number-pad"
                    maxLength={6}
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

              {/* Profile Images */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
                  📷 Profile Images
                </Text>
                <ImageUpload
                  images={profileImages}
                  onImagesChange={setProfileImages}
                  maxImages={3}
                  label="Profile Photos"
                />
              </Card>

              {/* Proof Documents */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
                  📄 Proof Documents
                </Text>
                <ImageUpload
                  images={proofDocuments}
                  onImagesChange={setProofDocuments}
                  maxImages={5}
                  label="ID Proof / Documents"
                />
                <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginTop: 8 }}>
                  Upload Aadhaar, PAN, Driving License, or other ID proofs
                </Text>
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
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                    {isEditMode ? 'Update Employee' : 'Create Employee'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenLayout>
  );
};
