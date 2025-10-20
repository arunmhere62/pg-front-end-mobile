import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '../theme';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  label = 'Room Images',
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (images.length >= maxImages) {
      Alert.alert(
        'Maximum Images Reached',
        `You can only upload up to ${maxImages} images.`
      );
      return;
    }

    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => {
          // Convert to base64 data URI
          return asset.base64 
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri;
        });

        const remainingSlots = maxImages - images.length;
        const imagesToAdd = newImages.slice(0, remainingSlots);
        
        onImagesChange([...images, ...imagesToAdd]);

        if (newImages.length > remainingSlots) {
          Alert.alert(
            'Some Images Not Added',
            `Only ${remainingSlots} image(s) could be added due to the ${maxImages} image limit.`
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.'
      );
      return;
    }

    if (images.length >= maxImages) {
      Alert.alert(
        'Maximum Images Reached',
        `You can only upload up to ${maxImages} images.`
      );
      return;
    }

    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newImage = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (disabled) return;

    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtitle}>
        {images.length} / {maxImages} images
      </Text>

      {/* Image Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Existing Images */}
        {images.map((imageUri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {/* Remove Button */}
            {!disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Image Number Badge */}
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{index + 1}</Text>
            </View>
          </View>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && !disabled && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            ) : (
              <>
                <View style={styles.addIconContainer}>
                  <Text style={styles.addIcon}>📷</Text>
                </View>
                <Text style={styles.addButtonText}>Add Image</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Help Text */}
      {!disabled && images.length === 0 && (
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            📸 Tap to add room images
          </Text>
          <Text style={styles.helpSubtext}>
            You can add up to {maxImages} images
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 12,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Theme.colors.light,
    ...Theme.colors.shadows.small,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.colors.shadows.medium,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryLight,
  },
  addIconContainer: {
    marginBottom: 8,
  },
  addIcon: {
    fontSize: 32,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  helpContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.dark,
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
});
