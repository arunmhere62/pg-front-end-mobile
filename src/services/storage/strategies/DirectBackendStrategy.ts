/**
 * Direct Backend Upload Strategy
 * Uploads images directly to backend (backend stores in filesystem or database)
 * This is a fallback when S3 is not available
 */

import axiosInstance from '../../core/axiosInstance';
import { UploadStrategy, UploadOptions, UploadResult } from '../imageUploadStrategy';

export class DirectBackendStrategy implements UploadStrategy {
  name = 'DirectBackend';

  async isAvailable(): Promise<boolean> {
    try {
      // Check if backend upload endpoint is available
      const response = await axiosInstance.get('/uploads/health', { timeout: 3000 });
      return response.data.available === true;
    } catch (error) {
      // If health check fails, assume it's available (backend might not have health endpoint)
      console.warn('Direct backend health check failed, assuming available');
      return true;
    }
  }

  async upload(file: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const { folder, fileName, contentType = 'image/jpeg', entityType, entityId } = options;

      console.log(`[DirectBackend] Uploading: ${folder}/${fileName}`);
      options.onProgress?.(10);

      // Upload directly to backend
      const response = await axiosInstance.post('/uploads/image', {
        file,
        folder,
        fileName,
        contentType,
        entityType,
        entityId,
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
        const url = response.data.url;
        const key = response.data.key || `${folder}/${fileName}`;
        
        console.log(`[DirectBackend] Upload successful: ${url}`);
        
        return {
          success: true,
          url,
          key,
        };
      } else {
        throw new Error(response.data.error || 'Backend upload failed');
      }
    } catch (error: any) {
      console.error('[DirectBackend] Upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Direct backend upload failed',
      };
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      console.log(`[DirectBackend] Deleting: ${key}`);
      
      const response = await axiosInstance.delete('/uploads/image', {
        data: { key }
      });

      return response.data.success === true;
    } catch (error: any) {
      console.error('[DirectBackend] Delete error:', error);
      return false;
    }
  }
}
