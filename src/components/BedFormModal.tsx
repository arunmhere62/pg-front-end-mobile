import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Theme } from '../theme';
import { ImageUploadS3 } from './ImageUploadS3';
import { getFolderConfig } from '../config/aws.config';
import { awsS3ServiceBackend as awsS3Service, S3Utils } from '../services/awsS3ServiceBackend';
import { createBed, updateBed, Bed } from '../services/bedService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BedFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomId: number;
  roomNo: string;
  bed?: Bed | null;
  pgId?: number;
  organizationId?: number;
  userId?: number;
}

export const BedFormModal: React.FC<BedFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  roomId,
  roomNo,
  bed,
  pgId,
  organizationId,
  userId,
}) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bed_no: 'BED',
    images: [] as string[],
  });
  const [originalImages, setOriginalImages] = useState<string[]>([]); // Track original images for cleanup
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!bed;

  useEffect(() => {
    if (visible) {
      // Load bed data if editing
      if (bed) {
        const bedImages = bed.images || [];
        setFormData({
          bed_no: bed.bed_no,
          images: bedImages,
        });
        setOriginalImages([...bedImages]); // Store original images for comparison
      } else {
        // Reset form for new bed
        setFormData({
          bed_no: 'BED',
          images: [],
        });
      }
      setErrors({});
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, bed]);

  const updateField = (field: string, value: string) => {
    // Special handling for bed_no to maintain BED prefix and only allow numbers
    if (field === 'bed_no') {
      // Remove non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      value = 'BED' + numericValue;
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

    if (!formData.bed_no.trim() || formData.bed_no.trim() === 'BED') {
      newErrors.bed_no = 'Bed number is required (e.g., BED1, BED2)';
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

      const bedData = {
        room_id: roomId,
        bed_no: formData.bed_no.trim(),
        pg_id: pgId,
        images: formData.images.length > 0 ? formData.images : undefined,
      };

      if (isEditMode && bed) {
        await updateBed(bed.s_no, bedData, {
          pg_id: pgId,
          organization_id: organizationId,
          user_id: userId,
        });
        Alert.alert('Success', 'Bed updated successfully');
      } else {
        await createBed(bedData, {
          pg_id: pgId,
          organization_id: organizationId,
          user_id: userId,
        });
        Alert.alert('Success', 'Bed created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      // Extract error message from various possible formats
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} bed`;
      
      if (error?.response?.data?.message) {
        // API error message (most common)
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        // Alternative error format
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        // JavaScript error message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // String error
        errorMessage = error;
      }
      
      // Log error for debugging (only in development)
      if (__DEV__) {
        console.log('❌ Bed creation/update failed:', {
          status: error?.response?.status,
          message: errorMessage,
          bedNumber: formData.bed_no,
          roomId: roomId,
        });
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          {/* Bottom Sheet */}
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: SCREEN_HEIGHT * 0.9,
                  ...Theme.colors.shadows.large,
                }}
              >
                {/* Handle Bar */}
                <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      backgroundColor: Theme.colors.border,
                      borderRadius: 2,
                    }}
                  />
                </View>

                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: Theme.colors.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                      {isEditMode ? '✏️ Edit Bed' : 'Add New Bed'}
                    </Text>
                    <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                      Room {roomNo}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={loading}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: Theme.colors.light,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: Theme.colors.text.secondary }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Content */}
                <ScrollView
                  style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
                  contentContainerStyle={{ padding: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Bed Number */}
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: Theme.colors.text.primary,
                        marginBottom: 8,
                      }}
                    >
                      Bed Number <Text style={{ color: Theme.colors.danger }}>*</Text>
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
                          borderColor: errors.bed_no ? Theme.colors.danger : Theme.colors.border,
                          borderRightWidth: 0,
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary }}>
                          BED
                        </Text>
                      </View>
                      <TextInput
                        value={formData.bed_no.substring(3)}
                        onChangeText={(value) => updateField('bed_no', value)}
                        placeholder="1, 2, 101"
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: errors.bed_no ? Theme.colors.danger : Theme.colors.border,
                          borderTopRightRadius: 8,
                          borderBottomRightRadius: 8,
                          borderLeftWidth: 0,
                          padding: 12,
                          fontSize: 14,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    {errors.bed_no && (
                      <Text style={{ fontSize: 11, color: Theme.colors.danger, marginTop: 4 }}>
                        {errors.bed_no}
                      </Text>
                    )}
                    <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                      Bed number will be: {formData.bed_no || 'BED___'}
                    </Text>
                  </View>

                  {/* Bed Images */}
                  <View style={{ marginBottom: 20 }}>
                    <ImageUploadS3
                      images={formData.images}
                      onImagesChange={(images: string[]) => setFormData((prev) => ({ ...prev, images }))}
                      maxImages={3}
                      label="Bed Images (Optional)"
                      disabled={loading}
                      folder={getFolderConfig().beds.images}
                      useS3={true}
                      entityId={bed?.s_no?.toString()}
                    />
                  </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    padding: 20,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={loading}
                    style={{
                      flex: 1,
                      backgroundColor: Theme.colors.light,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: Theme.colors.text.primary, fontWeight: '600', fontSize: 16 }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1,
                      backgroundColor: loading ? '#9CA3AF' : Theme.colors.primary,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                        {isEditMode ? 'Update' : 'Create'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
