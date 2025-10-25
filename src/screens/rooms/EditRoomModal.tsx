import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
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
import { getRoomById, updateRoom, Room } from '../../services/roomService';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ImageUpload } from '../../components/ImageUpload';

interface EditRoomModalProps {
  visible: boolean;
  roomId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({
  visible,
  roomId,
  onClose,
  onSuccess,
}) => {
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    room_no: 'RM',
    rent_price: '',
    images: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && roomId) {
      loadRoomData();
    }
  }, [visible, roomId]);

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
        images: response.data.images || [],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load room data');
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: string) => {
    // Special handling for room_no to maintain RM prefix
    if (field === 'room_no') {
      // If user tries to delete RM prefix, restore it
      if (!value.startsWith('RM')) {
        value = 'RM' + value.replace(/^RM/i, '');
      }
      // Ensure RM is uppercase
      if (value.length >= 2) {
        value = 'RM' + value.substring(2);
      }
    }

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

    if (!formData.room_no.trim() || formData.room_no.trim() === 'RM') {
      newErrors.room_no = 'Room number is required (e.g., RM101, RM-A1)';
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

    if (!selectedPGLocationId || !roomId) {
      Alert.alert('Error', 'Invalid room or PG location');
      return;
    }

    try {
      setLoading(true);

      const roomData = {
        pg_id: selectedPGLocationId,
        room_no: formData.room_no.trim(),
        rent_price: formData.rent_price ? parseFloat(formData.rent_price) : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
      };

      await updateRoom(roomId, roomData, {
        pg_id: selectedPGLocationId,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });

      Alert.alert('Success', 'Room updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      room_no: 'RM',
      rent_price: '',
      images: [],
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 20,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: Theme.colors.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🏠</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: Theme.colors.text.primary }}>
                  Edit Room
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: Theme.colors.text.secondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            {loadingData ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
                  Loading room data...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: '75%' }}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        backgroundColor: Theme.colors.primary + '15',
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        borderWidth: 1,
                        borderColor: errors.room_no ? '#EF4444' : '#E5E7EB',
                        borderRightWidth: 0,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary }}>
                        RM
                      </Text>
                    </View>
                    <TextInput
                      value={formData.room_no.substring(2)}
                      onChangeText={(value) => updateField('room_no', 'RM' + value)}
                      placeholder="101, A1, Ground-1"
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: errors.room_no ? '#EF4444' : '#E5E7EB',
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        borderLeftWidth: 0,
                        padding: 12,
                        fontSize: 14,
                        backgroundColor: '#fff',
                      }}
                    />
                  </View>
                  {errors.room_no && (
                    <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                      {errors.room_no}
                    </Text>
                  )}
                  <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                    Room number will be: {formData.room_no || 'RM___'}
                  </Text>
                </View>

                {/* Rent Price */}
                <View style={{ marginBottom: 16 }}>
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
                      borderColor: errors.rent_price ? '#EF4444' : '#E5E7EB',
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

                {/* Room Images */}
                <View style={{ marginBottom: 16 }}>
                  <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
                    maxImages={5}
                    label="Room Images"
                    disabled={loading}
                  />
                </View>

                {/* Info Card */}
                <View
                  style={{
                    padding: 12,
                    backgroundColor: '#EFF6FF',
                    borderLeftWidth: 3,
                    borderLeftColor: '#3B82F6',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <View  style={{ flexDirection: 'row', alignItems: 'flex-start'  }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>💡</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#1E40AF',
                          marginBottom: 2,
                        }}
                      >
                        Quick Tip
                      </Text>
                      <Text style={{ fontSize: 11, color: '#1E3A8A', lineHeight: 16 }}>
                        You can manage beds for this room from the room details screen.
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Modal Footer */}
            {!loadingData && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: '#F3F4F6',
                }}
              >
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: Theme.colors.text.secondary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: Theme.colors.primary,
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>
                      Update Room
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
