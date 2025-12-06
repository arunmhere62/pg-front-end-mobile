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
import { awsS3ServiceBackend, S3Utils } from '../services/storage/awsS3ServiceBackend';
import { getFolderConfig, validateFileType, validateFileSize } from '../config/aws.config';
import { Ionicons } from '@expo/vector-icons';

interface AWSImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  disabled?: boolean;
  folder?: string; // S3 folder path
  category?: 'image' | 'document' | 'image-document'; // image-document allows both images and PDFs
  filePrefix?: string; // Prefix for uploaded files
}

export const AWSImageUpload: React.FC<AWSImageUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  label = 'Images',
  disabled = false,
  folder,
  category = 'image',
  filePrefix = 'tenant',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: boolean }>({});

  const folderConfig = getFolderConfig();

  // Get default folder based on category
  const getDefaultFolder = () => {
    if (folder) return folder;
    return category === 'image' ? folderConfig.tenants.images : folderConfig.tenants.documents;
  };

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

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.'
      );
      return false;
    }
    return true;
  };

  const validateFile = (asset: ImagePicker.ImagePickerAsset): boolean => {
    const mimeType = asset.mimeType || 'image/jpeg';
    
    // Custom validation for image-document category
    if (category === 'image-document') {
      // Allow both images and PDFs for ID documents
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf'
      ];
      
      if (!allowedTypes.includes(mimeType)) {
        Alert.alert(
          'Invalid File Type',
          'Please select an image (JPEG, PNG, GIF, WebP) or PDF file.'
        );
        return false;
      }
      
      // Use image size limit for images, document limit for PDFs
      if (asset.fileSize) {
        const isImage = mimeType.startsWith('image/');
        const maxSizeBytes = isImage ? 10 * 1024 * 1024 : 20 * 1024 * 1024; // 10MB for images, 20MB for PDFs
        
        if (asset.fileSize > maxSizeBytes) {
          const maxSize = isImage ? '10MB' : '20MB';
          Alert.alert(
            'File Too Large',
            `File size exceeds ${maxSize} limit.`
          );
          return false;
        }
      }
    } else {
      // Use standard validation for pure image or document categories
      const validationCategory = category === 'image' ? 'image' : 'document';
      
      if (!validateFileType(mimeType, validationCategory)) {
        Alert.alert(
          'Invalid File Type',
          `Please select a valid ${category} file.`
        );
        return false;
      }

      // Validate file size
      if (asset.fileSize && !validateFileSize(asset.fileSize, validationCategory)) {
        const maxSize = category === 'image' ? '10MB' : '20MB';
        Alert.alert(
          'File Too Large',
          `File size exceeds ${maxSize} limit.`
        );
        return false;
      }
    }

    return true;
  };

  const uploadToS3 = async (asset: ImagePicker.ImagePickerAsset, index: number): Promise<string | null> => {
    try {
      setUploadProgress(prev => ({ ...prev, [index]: true }));

      // Generate unique filename
      const extension = asset.uri.split('.').pop() || 'jpg';
      const fileName = S3Utils.generateUniqueFileName(`${filePrefix}.${extension}`, filePrefix);

      // Convert to base64 if needed
      let fileData = asset.base64;
      if (!fileData) {
        // If base64 is not available, we'll need to read the file
        // For now, we'll use the URI directly
        fileData = asset.uri;
      }

      // Create data URI if we have base64
      const dataUri = asset.base64 
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      // Upload to S3
      const result = await awsS3ServiceBackend.uploadImage(dataUri, {
        folder: getDefaultFolder(),
        fileName,
        isPublic: true,
      });

      if (result.success && result.url) {
        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('S3 upload error:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload image');
      return null;
    } finally {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
    }
  };

  const pickImages = async () => {
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
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const remainingSlots = maxImages - images.length;
        const assetsToProcess = result.assets.slice(0, remainingSlots);
        
        // Validate all files first
        const validAssets = assetsToProcess.filter(validateFile);
        
        if (validAssets.length === 0) {
          return;
        }

        // Upload all valid assets
        const uploadPromises = validAssets.map((asset, index) => uploadToS3(asset, index));
        const uploadResults = await Promise.all(uploadPromises);
        
        // Filter out failed uploads and add successful ones
        const successfulUploads = uploadResults.filter(url => url !== null) as string[];
        
        if (successfulUploads.length > 0) {
          onImagesChange([...images, ...successfulUploads]);
          
          if (successfulUploads.length < validAssets.length) {
            Alert.alert(
              'Partial Upload Success',
              `${successfulUploads.length} of ${validAssets.length} images uploaded successfully.`
            );
          }
        }

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            'Some Images Not Added',
            `Only ${remainingSlots} image(s) could be added due to the ${maxImages} image limit.`
          );
        }
      }
    } catch (error: any) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled) return;

    const hasPermission = await requestCameraPermissions();
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
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        if (!validateFile(asset)) {
          return;
        }

        const uploadedUrl = await uploadToS3(asset, 0);
        
        if (uploadedUrl) {
          onImagesChange([...images, uploadedUrl]);
        }
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    if (disabled) return;

    const imageUrl = images[index];
    
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Remove from local state - backend will handle S3 deletion
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
          onPress: pickImages,
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
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            
            {/* Upload Progress Indicator */}
            {uploadProgress[index] && (
              <View style={styles.progressOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.progressText}>Uploading...</Text>
              </View>
            )}
            
            {/* Remove Button */}
            {!disabled && !uploadProgress[index] && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="#fff" />
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
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : (
              <>
                <View style={styles.addIconContainer}>
                  <Ionicons name="camera" size={32} color={Theme.colors.primary} />
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
            📸 Tap to add {
              category === 'image' ? 'images' : 
              category === 'document' ? 'documents' : 
              'images or documents'
            }
          </Text>
          <Text style={styles.helpSubtext}>
            {category === 'image-document' 
              ? 'Supports images (JPEG, PNG, GIF, WebP) and PDF files • Max ' 
              : 'Files will be uploaded to AWS S3 • Max '
            }{maxImages} files
          </Text>
        </View>
      )}

      {/* Upload Status */}
      {Object.keys(uploadProgress).length > 0 && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
          <Text style={styles.statusText}>
            Uploading {Object.keys(uploadProgress).length} image(s)...
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
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: `${Theme.colors.primary}10`,
  },
  addIconContainer: {
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.primary,
    marginTop: 8,
  },
  helpContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: `${Theme.colors.primary}10`,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: `${Theme.colors.primary}10`,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    color: Theme.colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
});
