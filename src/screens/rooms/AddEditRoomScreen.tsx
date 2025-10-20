import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createRoom, updateRoom, getRoomById } from '../../services/roomService';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';

interface AddEditRoomScreenProps {
  navigation: any;
  route?: any;
}

export const AddEditRoomScreen: React.FC<AddEditRoomScreenProps> = ({ navigation, route }) => {
  const roomId = route?.params?.roomId;
  const isEditMode = !!roomId;

  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    room_no: '',
    rent_price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadRoomData();
    }
  }, [roomId]);

  const loadRoomData = async () => {
    if (!roomId) return;

    try {
      setLoadingData(true);
      const response = await getRoomById(roomId, {
        pg_id: selectedPGLocationId || undefined,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });

      setFormData({
        room_no: response.data.room_no,
        rent_price: response.data.rent_price?.toString() || '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load room data');
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.room_no.trim()) {
      newErrors.room_no = 'Room number is required';
    }

    if (formData.rent_price && isNaN(Number(formData.rent_price))) {
      newErrors.rent_price = 'Rent price must be a valid number';
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

      const roomData = {
        pg_id: selectedPGLocationId,
        room_no: formData.room_no.trim(),
        rent_price: formData.rent_price ? parseFloat(formData.rent_price) : undefined,
      };

      if (isEditMode) {
        await updateRoom(roomId, roomData, {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        });
        Alert.alert('Success', 'Room updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createRoom(roomData, {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        });
        Alert.alert('Success', 'Room created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'create'} room`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ScreenLayout>
        <ScreenHeader
          title={isEditMode ? 'Edit Room' : 'Add Room'}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
            Loading room data...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScreenHeader
        title={isEditMode ? 'Edit Room' : 'Add New Room'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Room Information Card */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: Theme.colors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 24 }}>🏠</Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: Theme.colors.text.primary,
                }}
              >
                Room Details
              </Text>
            </View>

            {/* Room Number */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: Theme.colors.text.primary,
                  marginBottom: 6,
                }}
              >
                Room Number <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                value={formData.room_no}
                onChangeText={(value) => updateField('room_no', value)}
                placeholder="e.g., 101, A1, Ground-1"
                style={{
                  borderWidth: 1,
                  borderColor: errors.room_no ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.room_no && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  {errors.room_no}
                </Text>
              )}
              <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                Enter a unique identifier for this room
              </Text>
            </View>

            {/* Rent Price */}
            <View style={{ marginBottom: 0 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: Theme.colors.text.primary,
                  marginBottom: 6,
                }}
              >
                Monthly Rent (₹)
              </Text>
              <TextInput
                value={formData.rent_price}
                onChangeText={(value) => updateField('rent_price', value)}
                placeholder="e.g., 5000"
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: errors.rent_price ? '#EF4444' : Theme.colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  backgroundColor: '#fff',
                }}
              />
              {errors.rent_price && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  {errors.rent_price}
                </Text>
              )}
              <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                Optional: Set the monthly rent for this room
              </Text>
            </View>
          </Card>

          {/* Info Card */}
          <Card
            style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: '#EFF6FF',
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#1E40AF',
                    marginBottom: 4,
                  }}
                >
                  Quick Tip
                </Text>
                <Text style={{ fontSize: 12, color: '#1E3A8A', lineHeight: 18 }}>
                  After creating a room, you can add beds to it from the room details screen.
                  Each bed can be assigned to a tenant.
                </Text>
              </View>
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {isEditMode ? '💾 Update Room' : '➕ Create Room'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
