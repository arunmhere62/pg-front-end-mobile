/**
 * AWS S3 Service with Backend Integration
 * 
 * This service uploads to S3 via your backend API which handles:
 * - AWS authentication
 * - Presigned URL generation
 */

import axiosInstance from '../core/axiosInstance';
import { getS3Config } from '../../config/aws.config';

const s3Config = getS3Config();

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

class AWSS3ServiceBackend {
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = s3Config.bucketName;
    this.region = s3Config.region;
  }

  /**
   * Upload a file to S3 via backend API
   * @param file - File data (base64 string)
   * @param options - Upload options
   * @returns Promise<UploadResult>
   */
  async uploadFile(
    file: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const {
        folder = 'uploads',
        fileName = `file_${Date.now()}`,
        contentType = 'application/octet-stream',
        isPublic = true
      } = options;

      // Generate unique key
      const key = folder ? `${folder}/${fileName}` : fileName;

      // Prepare file data
      let fileData: string;
      let actualContentType = contentType;

      if (typeof file === 'string') {
        if (file.startsWith('data:')) {
          // Extract content type and base64 data
          const matches = file.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            actualContentType = matches[1];
            fileData = matches[2];
          } else {
            fileData = file.replace(/^data:.*,/, '');
          }
        } else {
          fileData = file;
        }
      } else {
        throw new Error('Only base64 strings are supported');
      }

      console.log('Uploading to S3 via backend:', { key, contentType: actualContentType });

      // Validate file size before uploading (max 5MB for safety)
      const maxSizeMB = 5;
      if (!S3Utils.validateFileSize(file, maxSizeMB)) {
        return {
          success: false,
          error: `File size exceeds ${maxSizeMB}MB limit. Please use a smaller image or reduce quality.`,
        };
      }

      // Upload via backend API
      const response = await axiosInstance.post('/s3/upload', {
        key,
        contentType: actualContentType,
        fileData,
        isPublic,
        bucket: this.bucketName,
      });

      if (response.data.success) {
        const url = response.data.url || this.getPublicUrl(key);
        console.log('S3 upload successful:', url);
        
        return {
          success: true,
          url,
          key,
        };
      } else {
        throw new Error(response.data.error || 'Backend upload failed');
      }
    } catch (error: any) {
      console.error('S3 Upload Error:', error);
      
      // Check if it's a network/backend error
      if (error.response) {
        return {
          success: false,
          error: `Backend error: ${error.response.data?.message || error.response.statusText}`,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error: Unable to reach backend',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Upload failed',
        };
      }
    }
  }

  /**
   * Upload multiple files to S3
   * @param files - Array of files with their options
   * @returns Promise<UploadResult[]>
   */
  async uploadMultipleFiles(
    files: Array<{ file: string; options?: UploadOptions }>
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(({ file, options }) =>
      this.uploadFile(file, options)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3 via backend
   * @param key - S3 object key
   * @returns Promise<DeleteResult>
   */
  async deleteFile(key: string): Promise<DeleteResult> {
    try {
      console.log('Deleting from S3 via backend:', key);
      
      const response = await axiosInstance.delete('/s3/delete', {
        data: { key, bucket: this.bucketName }
      });

      if (response.data.success) {
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Backend delete failed');
      }
    } catch (error: any) {
      console.error('S3 Delete Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Delete failed',
      };
    }
  }

  /**
   * Delete multiple files from S3
   * @param keys - Array of S3 object keys
   * @returns Promise<DeleteResult>
   */
  async deleteMultipleFiles(keys: string[]): Promise<DeleteResult> {
    try {
      console.log('Bulk deleting from S3 via backend:', keys);
      
      const response = await axiosInstance.delete('/s3/delete-multiple', {
        data: { keys, bucket: this.bucketName }
      });

      if (response.data.success) {
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Backend bulk delete failed');
      }
    } catch (error: any) {
      console.error('S3 Bulk Delete Error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Bulk delete failed',
      };
    }
  }

  /**
   * Generate a public URL for a file
   * @param key - S3 object key
   * @returns string
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Upload image with automatic content type detection
   * @param imageFile - Image file (base64 string)
   * @param options - Upload options
   * @returns Promise<UploadResult>
   */
  async uploadImage(
    imageFile: string,
    options: Omit<UploadOptions, 'contentType'> & { contentType?: string } = {}
  ): Promise<UploadResult> {
    let contentType = options.contentType;

    // Auto-detect content type for base64 images
    if (typeof imageFile === 'string' && imageFile.startsWith('data:')) {
      const mimeMatch = imageFile.match(/data:([^;]+);/);
      if (mimeMatch) {
        contentType = mimeMatch[1];
      }
    }

    return this.uploadFile(imageFile, {
      ...options,
      contentType: contentType || 'image/jpeg',
      folder: options.folder || 'images',
    });
  }

  /**
   * Upload document with automatic content type detection
   * @param documentFile - Document file (base64 string)
   * @param options - Upload options
   * @returns Promise<UploadResult>
   */
  async uploadDocument(
    documentFile: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    return this.uploadFile(documentFile, {
      ...options,
      contentType: options.contentType || 'application/pdf',
      folder: options.folder || 'documents',
    });
  }

  /**
   * Check if a file exists in S3 via backend
   * @param key - S3 object key
   * @returns Promise<boolean>
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/s3/exists', {
        params: { key, bucket: this.bucketName }
      });
      return response.data.exists || false;
    } catch (error: any) {
      console.error('S3 file exists check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const awsS3ServiceBackend = new AWSS3ServiceBackend();

// Export utility functions
export const S3Utils = {
  /**
   * Extract key from S3 URL
   * @param url - S3 URL
   * @returns string | null
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  },

  /**
   * Generate unique filename
   * @param originalName - Original filename
   * @param prefix - Optional prefix
   * @returns string
   */
  generateUniqueFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const uniqueName = `${baseName}_${timestamp}_${random}.${extension}`;
    return prefix ? `${prefix}_${uniqueName}` : uniqueName;
  },

  /**
   * Validate file size
   * @param file - File data (base64 string)
   * @param maxSizeMB - Maximum size in MB
   * @returns boolean
   */
  validateFileSize(file: string, maxSizeMB: number): boolean {
    let sizeInBytes: number;
    
    if (typeof file === 'string') {
      // Base64 string size estimation
      const base64Data = file.replace(/^data:.*,/, '');
      sizeInBytes = (base64Data.length * 3) / 4;
    } else {
      return false;
    }
    
    const maxSizeInBytes = maxSizeMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  },
};

export default awsS3ServiceBackend;
