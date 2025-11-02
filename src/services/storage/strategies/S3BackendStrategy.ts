/**
 * S3 Backend Upload Strategy
 * Uploads images to S3 via backend API
 */

import axiosInstance from '../../core/axiosInstance';
import { getS3Config } from '../../../config/aws.config';
import { UploadStrategy, UploadOptions, UploadResult } from '../imageUploadStrategy';

export class S3BackendStrategy implements UploadStrategy {
  name = 'S3Backend';
  private bucketName: string;
  private region: string;

  constructor() {
    const s3Config = getS3Config();
    this.bucketName = s3Config.bucketName;
    this.region = s3Config.region;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if bucket name is configured
      if (!this.bucketName || this.bucketName.trim() === '') {
        console.warn('S3 bucket name not configured');
        return false;
      }

      // Ping backend S3 endpoint to check availability
      const response = await axiosInstance.get('/s3/health', { timeout: 3000 });
      return response.data.available === true;
    } catch (error) {
      console.warn('S3 backend not available:', error);
      return false;
    }
  }

  async upload(file: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const { folder, fileName, contentType = 'image/jpeg' } = options;
      
      // Generate unique key
      const key = `${folder}/${fileName}`;

      // Prepare file data
      let fileData: string;
      let actualContentType = contentType;

      if (file.startsWith('data:')) {
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

      console.log(`[S3Backend] Uploading: ${key}`);
      options.onProgress?.(10);

      // Upload via backend API
      const response = await axiosInstance.post('/s3/upload', {
        key,
        contentType: actualContentType,
        fileData,
        isPublic: true,
        bucket: this.bucketName,
      }, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 90) / progressEvent.total) + 10;
            options.onProgress?.(progress);
          }
        },
      });

      options.onProgress?.(100);

      if (response.data.success) {
        const url = response.data.url || this.getPublicUrl(key);
        console.log(`[S3Backend] Upload successful: ${url}`);
        
        return {
          success: true,
          url,
          key,
        };
      } else {
        throw new Error(response.data.error || 'Backend upload failed');
      }
    } catch (error: any) {
      console.error('[S3Backend] Upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'S3 upload failed',
      };
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      console.log(`[S3Backend] Deleting: ${key}`);
      
      const response = await axiosInstance.delete('/s3/delete', {
        data: { key, bucket: this.bucketName }
      });

      return response.data.success === true;
    } catch (error: any) {
      console.error('[S3Backend] Delete error:', error);
      return false;
    }
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
