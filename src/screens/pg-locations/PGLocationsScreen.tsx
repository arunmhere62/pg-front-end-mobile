import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPGLocations, setSelectedPGLocation } from '../../store/slices/pgLocationSlice';
import { Theme } from '../../theme';

// Try to import expo-image-picker, fallback if not installed
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  console.log('expo-image-picker not installed');
}
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import axiosInstance from '../../services/axiosInstance';

interface PGLocationsScreenProps {
  navigation: any;
}

interface PGLocation {
  s_no: number;
  location_name: string;
  address: string;
  pincode?: string;
  status: 'ACTIVE' | 'INACTIVE';
  images?: string[] | null;
  city_id?: number;
  state_id?: number;
  city?: {
    s_no: number;
    name: string;
    state_code?: string;
  };
  state?: {
    s_no: number;
    name: string;
    iso_code?: string;
  };
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

interface FormData {
  locationName: string;
  address: string;
  pincode: string;
  stateId: number | null;
  cityId: number | null;
  images: string[];
}

export const PGLocationsScreen: React.FC<PGLocationsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const [pgLocations, setPgLocations] = useState<PGLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PGLocation | null>(null);

  // Helper function to pick image from gallery
  const pickImageFromGallery = async () => {
    // Check if ImagePicker is available
    if (!ImagePicker) {
      Alert.alert(
        'Package Not Installed',
        'Please install expo-image-picker:\n\nnpx expo install expo-image-picker',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3, // Reduced quality to avoid "Request Entity Too Large" error
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get base64 string
        if (asset.base64) {
          const base64String = `data:image/jpeg;base64,${asset.base64}`;
          setFormData({
            ...formData,
            images: [...formData.images, base64String],
          });
          Alert.alert('Success', 'Image added successfully!');
        } else {
          Alert.alert('Error', 'Failed to convert image to base64');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    locationName: '',
    address: '',
    pincode: '',
    stateId: null,
    cityId: null,
    images: [],
  });

  // Dropdown data
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPGLocations();
    loadStates();
  }, []);

  const loadPGLocations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/pg-locations');
      if (response.data.success) {
        setPgLocations(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load PG locations');
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const response = await axiosInstance.get('/location/states', {
        params: { countryCode: 'IN' },
      });
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateCode: string) => {
    setLoadingCities(true);
    try {
      const response = await axiosInstance.get('/location/cities', {
        params: { stateCode },
      });
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (stateId: number) => {
    const selectedState = states.find(s => s.s_no === stateId);
    if (selectedState) {
      setFormData({ ...formData, stateId, cityId: null });
      setCities([]);
      loadCities(selectedState.iso_code);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPGLocations();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedPG(null);
    setFormData({
      locationName: '',
      address: '',
      pincode: '',
      stateId: null,
      cityId: null,
      images: [],
    });
    setCities([]);
    setModalVisible(true);
  };

  const openEditModal = (pg: PGLocation) => {
    setEditMode(true);
    setSelectedPG(pg);
    setFormData({
      locationName: pg.location_name,
      address: pg.address,
      pincode: pg.pincode || '',
      stateId: pg.state_id || null,
      cityId: pg.city_id || null,
      images: pg.images || [],
    });
    
    // Load cities for the selected state
    if (pg.state?.iso_code) {
      loadCities(pg.state.iso_code);
    }
    
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      locationName: '',
      address: '',
      pincode: '',
      stateId: null,
      cityId: null,
      images: [],
    });
    setCities([]);
  };

  const validateForm = () => {
    if (!formData.locationName.trim()) {
      Alert.alert('Error', 'Please enter PG location name');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter address');
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        locationName: formData.locationName,
        address: formData.address,
        stateId: formData.stateId!,
        cityId: formData.cityId!,
        images: formData.images,
      };

      // Only include pincode if it has a value
      if (formData.pincode && formData.pincode.trim()) {
        payload.pincode = formData.pincode.trim();
      }

      if (editMode && selectedPG) {
        // Update
        const response = await axiosInstance.put(
          `/pg-locations/${selectedPG.s_no}`,
          payload
        );
        if (response.data.success) {
          Alert.alert('Success', 'PG location updated successfully');
          loadPGLocations();
          // Refresh Redux store for PG location selector
          dispatch(fetchPGLocations());
          closeModal();
        }
      } else {
        // Create
        const response = await axiosInstance.post('/pg-locations', payload);
        if (response.data.success) {
          Alert.alert('Success', 'PG location created successfully');
          loadPGLocations();
          // Refresh Redux store for PG location selector
          dispatch(fetchPGLocations());
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('PG Location save error:', error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to save PG location';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (pg: PGLocation) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${pg.location_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axiosInstance.delete(
                `/pg-locations/${pg.s_no}`
              );
              if (response.data.success) {
                // Check if deleted PG was the selected one
                const wasSelected = selectedPGLocationId === pg.s_no;
                
                // Refresh Redux store first and wait for it
                const result = await dispatch(fetchPGLocations());
                
                // Refresh local state
                await loadPGLocations();
                
                // If deleted PG was selected, the Redux slice will auto-select another one
                // But we can also explicitly handle it here for immediate feedback
                if (wasSelected && result.payload) {
                  const updatedLocations = result.payload as PGLocation[];
                  if (updatedLocations.length > 0) {
                    // Select the first available PG
                    dispatch(setSelectedPGLocation(updatedLocations[0].s_no));
                  } else {
                    // No PG locations left
                    dispatch(setSelectedPGLocation(null));
                  }
                }
                
                Alert.alert('Success', 'PG location deleted successfully');
              }
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const renderPGCard = (pg: PGLocation) => (
    <Card key={pg.s_no} className="mb-4">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {pg.location_name}
          </Text>
          <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 8 }}>
            {pg.address}
          </Text>
          
          {pg.city && pg.state && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
                📍 {pg.city.name}, {pg.state.name}
              </Text>
              {pg.pincode && (
                <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginLeft: 8 }}>
                  • {pg.pincode}
                </Text>
              )}
            </View>
          )}

          {/* Images Preview */}
          {pg.images && pg.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {pg.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                />
              ))}
            </ScrollView>
          )}

          <View
            style={{
              backgroundColor: pg.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              alignSelf: 'flex-start',
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: 'bold',
                color: pg.status === 'ACTIVE' ? '#059669' : '#DC2626',
              }}
            >
              {pg.status}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => openEditModal(pg)}
            style={{
              backgroundColor: '#EEF2FF',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(pg)}
            style={{
              backgroundColor: '#FEE2E2',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '90%',
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: Theme.colors.text.primary }}>
                {editMode ? 'Edit PG Location' : 'Add PG Location'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={{ fontSize: 24, color: Theme.colors.text.secondary }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              style={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
              PG Location Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                fontSize: 15,
              }}
              placeholder="Enter PG location name"
              value={formData.locationName}
              onChangeText={(text) => setFormData({ ...formData, locationName: text })}
            />

            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
              Address *
            </Text>
            <TextInput
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                fontSize: 15,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Enter complete address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
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
                onSelect={(item) => setFormData({ ...formData, cityId: item.id })}
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
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: '#E5E7EB',
                fontSize: 15,
              }}
              placeholder="Enter pincode"
              value={formData.pincode}
              onChangeText={(text) => setFormData({ ...formData, pincode: text })}
              keyboardType="numeric"
            />

            {/* Image Upload Section */}
            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4, marginLeft: 4 }}>
              Images (Base64)
            </Text>
            <View style={{ marginBottom: 16 }}>
              {formData.images.map((image, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                    backgroundColor: '#F3F4F6',
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  {image.startsWith('data:image') && (
                    <Image
                      source={{ uri: image }}
                      style={{ width: 50, height: 50, borderRadius: 4, marginRight: 8 }}
                    />
                  )}
                  <Text style={{ flex: 1, fontSize: 12, color: Theme.colors.text.secondary }} numberOfLines={1}>
                    Image {index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData({ ...formData, images: newImages });
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#EEF2FF',
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: Theme.colors.primary,
                  borderStyle: 'dashed',
                }}
                onPress={async () => {
                  Alert.alert(
                    'Add Image',
                    'Choose an option:',
                    [
                      {
                        text: '📷 Pick from Gallery',
                        onPress: pickImageFromGallery,
                      },
                      {
                        text: 'Paste Base64',
                        onPress: () => {
                          Alert.prompt(
                            'Paste Base64 Image',
                            'Paste base64 string (data:image/...)',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Add',
                                onPress: (imageString?: string) => {
                                  if (imageString && imageString.trim()) {
                                    setFormData({
                                      ...formData,
                                      images: [...formData.images, imageString.trim()],
                                    });
                                    Alert.alert('Success', 'Image added!');
                                  }
                                },
                              },
                            ],
                            'plain-text'
                          );
                        },
                      },
                      {
                        text: 'Paste Image URL',
                        onPress: () => {
                          Alert.prompt(
                            'Paste Image URL',
                            'Paste image URL (https://...)',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Add',
                                onPress: (imageUrl?: string) => {
                                  if (imageUrl && imageUrl.trim()) {
                                    setFormData({
                                      ...formData,
                                      images: [...formData.images, imageUrl.trim()],
                                    });
                                    Alert.alert('Success', 'Image URL added!');
                                  }
                                },
                              },
                            ],
                            'plain-text'
                          );
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={{ color: Theme.colors.primary, fontWeight: 'bold', fontSize: 14 }}>
                  📷 Upload Image from Device
                </Text>
              </TouchableOpacity>
              
              <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, marginTop: 4, textAlign: 'center' }}>
                Select image file from your device (JPG, PNG, etc.)
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: Theme.colors.primary,
              }}
              onPress={closeModal}
            >
              <Text style={{ color: Theme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Theme.colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  {editMode ? 'Update' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader 
        title="PG Locations" 
        subtitle="Manage your PG locations"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ flex: 1, backgroundColor: Theme.colors.light }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
              <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
                Loading PG locations...
              </Text>
            </View>
          ) : pgLocations.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🏢</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Theme.colors.text.primary, marginBottom: 8 }}>
                No PG Locations Yet
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                Add your first PG location to get started
              </Text>
            </View>
          ) : (
            pgLocations.map(renderPGCard)
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 90,
            right: 20,
            backgroundColor: Theme.colors.primary,
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={openCreateModal}
        >
          <Text style={{ fontSize: 32, color: 'white', lineHeight: 32 }}>+</Text>
        </TouchableOpacity>

        {renderModal()}
      </View>
    </ScreenLayout>
  );
};
