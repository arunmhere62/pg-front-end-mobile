import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchPGLocations, setSelectedPGLocation } from '../../store/slices/pgLocationSlice';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import { SlideBottomModal } from '../../components/SlideBottomModal';
import { ImageUploadS3 } from '../../components/ImageUploadS3';
import { getFolderConfig } from '../../config/aws.config';
import { showErrorAlert } from '../../utils/errorHandler';
import axiosInstance from '../../services/core/axiosInstance';

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
  const [submitting, setSubmitting] = useState(false);
  
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

  useEffect(() => {
    loadPGLocations();
    loadStates();
  }, []);

  const loadPGLocations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/pg-locations');
      if (response.data.success && Array.isArray(response.data.data)) {
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
      console.log('📍 Raw States Response:', response.data);
      
      if (response.data.success) {
        // Extract from nested structure: response.data.data.data
        let statesData: any[] = [];
        
        if (response.data.data && typeof response.data.data === 'object') {
          // Check if response.data.data has a data property (nested structure)
          if (Array.isArray(response.data.data.data)) {
            statesData = response.data.data.data;
          } else if (Array.isArray(response.data.data)) {
            statesData = response.data.data;
          }
        } else if (Array.isArray(response.data.data)) {
          statesData = response.data.data;
        }
        
        console.log('📍 States extracted:', statesData);
        setStates(statesData);
      }
    } catch (error) {
      console.error('Error loading states:', error);
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
      console.log('🏙️ Raw Cities Response:', response.data);
      
      if (response.data.success) {
        // Extract from nested structure: response.data.data.data
        let citiesData: any[] = [];
        
        if (response.data.data && typeof response.data.data === 'object') {
          // Check if response.data.data has a data property (nested structure)
          if (Array.isArray(response.data.data.data)) {
            citiesData = response.data.data.data;
          } else if (Array.isArray(response.data.data)) {
            citiesData = response.data.data;
          }
        } else if (Array.isArray(response.data.data)) {
          citiesData = response.data.data;
        }
        
        console.log('🏙️ Cities extracted:', citiesData);
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
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
              showErrorAlert(error, 'Delete Error');
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
          <AnimatedButton
            onPress={() => navigation.navigate('PGDetails', { pgId: pg.s_no })}
            style={{
              backgroundColor: '#F0F9FF',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="eye" size={18} color={Theme.colors.primary} />
          </AnimatedButton>
          <AnimatedButton
            onPress={() => openEditModal(pg)}
            style={{
              backgroundColor: '#EEF2FF',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="pencil" size={18} color={Theme.colors.primary} />
          </AnimatedButton>
          <AnimatedButton
            onPress={() => handleDelete(pg)}
            style={{
              backgroundColor: '#FEE2E2',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </AnimatedButton>
        </View>
      </View>
    </Card>
  );

  return (
    <>
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
        </View>
      </ScreenLayout>

      {/* Form Modal */}
      <SlideBottomModal
        visible={modalVisible}
        onClose={closeModal}
        title={editMode ? 'Edit PG Location' : 'Add PG Location'}
        subtitle={editMode ? selectedPG?.location_name : 'Create a new PG location'}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        submitLabel={editMode ? 'Update' : 'Create'}
        cancelLabel="Cancel"
        isLoading={submitting}
      >
        {/* Location Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
            Location Name <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            style={{
              backgroundColor: Theme.colors.light,
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
            placeholder="Enter PG location name"
            value={formData.locationName}
            onChangeText={(text) => setFormData({ ...formData, locationName: text })}
            editable={!submitting}
          />
        </View>

        {/* Address */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
            Address <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            style={{
              backgroundColor: Theme.colors.light,
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            placeholder="Enter complete address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
            editable={!submitting}
          />
        </View>

        {/* State */}
        <View style={{ marginBottom: 16 }}>
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
        </View>

        {/* City */}
        {formData.stateId && (
          <View style={{ marginBottom: 16 }}>
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
          </View>
        )}

        {/* Pincode */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 6 }}>
            Pincode
          </Text>
          <TextInput
            style={{
              backgroundColor: Theme.colors.light,
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
            placeholder="Enter pincode (optional)"
            value={formData.pincode}
            onChangeText={(text) => setFormData({ ...formData, pincode: text })}
            keyboardType="numeric"
            editable={!submitting}
          />
        </View>

        {/* Images */}
        <View style={{ marginBottom: 16 }}>
          <ImageUploadS3
            images={formData.images}
            onImagesChange={(images: string[]) => setFormData((prev) => ({ ...prev, images }))}
            maxImages={5}
            label="PG Location Images"
            disabled={submitting}
            folder={getFolderConfig().pgLocations?.images || 'pg-locations/images'}
            useS3={true}
            entityId={selectedPG?.s_no?.toString()}
            autoSave={false}
          />
        </View>
      </SlideBottomModal>
    </>
  );
};
