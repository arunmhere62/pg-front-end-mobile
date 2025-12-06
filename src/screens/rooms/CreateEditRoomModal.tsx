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
import { getRoomById, updateRoom, createRoom, Room } from '../../services/rooms/roomService';
import { Theme } from '../../theme';
import { ImageUploadS3 } from '../../components/ImageUploadS3';
import { getFolderConfig } from '../../config/aws.config';

interface RoomModalProps {
  visible: boolean;
  roomId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
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
    images: [] as string[],
  });
  const [originalImages, setOriginalImages] = useState<string[]>([]); // Track original images for cleanup
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

      const roomImages = response.data.images || [];
      setFormData({
        room_no: response.data.room_no,
        images: roomImages,
      });
      setOriginalImages([...roomImages]); // Store original images for comparison
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load room data');
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: string): void => {
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

    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.room_no.trim() || formData.room_no.trim() === 'RM') {
      newErrors.room_no = 'Room number is required (e.g., RM101, RM-A1)';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save images to database when they change
  const handleAutoSaveImages = async (images: string[]): Promise<void> => {
    if (!roomId || !selectedPGLocationId) {
      throw new Error('Room ID or PG Location ID not available');
    }

    const roomData = {
      pg_id: selectedPGLocationId,
      room_no: formData.room_no.trim(),
      images: images, // Always send the images array, even if empty
    };

    await updateRoom(roomId, roomData, {
      pg_id: selectedPGLocationId,
      organization_id: user?.organization_id,
      user_id: user?.s_no,
    });
  };


  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    if (!selectedPGLocationId) {
      Alert.alert('Error', 'Invalid PG location');
      return;
    }

    try {
      setLoading(true);

      const roomData = {
        pg_id: selectedPGLocationId,
        room_no: formData.room_no.trim(),
        images: formData.images, // Always send the images array, even if empty
      };

      if (roomId) {
        await updateRoom(roomId, roomData, {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        });
        Alert.alert('Success', 'Room updated successfully');
      } else {
        await createRoom(roomData, {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        });
        Alert.alert('Success', 'Room created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      
      if (errorMessage) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (): Promise<void> => {
    setFormData({
      room_no: 'RM',
      images: [],
    });
    setOriginalImages([]);
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
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%',
              flex: 1,
              flexDirection: 'column',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 20,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{ flex: 1, flexDirection: 'column' }}
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
                  {roomId ? 'Edit Room' : 'Add Room'}
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
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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

                {/* Room Images */}
                <View style={{ marginBottom: 16 }}>
                  <ImageUploadS3
                    images={formData.images}
                    onImagesChange={(images: string[]) => setFormData((prev) => ({ ...prev, images }))}
                    maxImages={5}
                    label="Room Images"
                    disabled={loading}
                    folder={getFolderConfig().rooms.images}
                    useS3={true}
                    entityId={roomId?.toString()}
                    autoSave={false} // Disable auto-save - only update on manual save
                    onAutoSave={handleAutoSaveImages}
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
                      {roomId ? 'Update Room' : 'Create Room'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Export aliases for backward compatibility
export const EditRoomModal = RoomModal;
export const RoomFormModal = RoomModal;
