/**
 * Unified Image Upload Service
 * 
 * High-level service that manages image uploads with:
 * - Automatic strategy selection (S3 → Direct Backend → Local Cache)
 * - Queue-based upload system
 * - Retry mechanism
 * - Progress tracking
 * - Error recovery
 * 
 * Usage:
 * ```typescript
 * const result = await imageUploadService.uploadImage(base64Image, {
 *   folder: 'rooms/images',
 *   entityType: 'room',
 *   entityId: '123',
 * });
 * ```
 */

import { UploadStrategyManager, UploadOptions, UploadResult } from './imageUploadStrategy';
import { S3BackendStrategy } from './strategies/S3BackendStrategy';
import { DirectBackendStrategy } from './strategies/DirectBackendStrategy';
import { LocalCacheStrategy } from './strategies/LocalCacheStrategy';
import { S3Utils } from './awsS3ServiceBackend';

export interface ImageUploadOptions {
  folder: string;
  entityType?: 'room' | 'tenant' | 'bed' | 'employee' | 'visitor' | 'expense';
  entityId?: string;
  fileName?: string;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
}

class ImageUploadService {
  private strategyManager: UploadStrategyManager;
  private localCacheStrategy: LocalCacheStrategy;

  constructor() {
    // Initialize strategies in priority order
    const strategies = [
      new S3BackendStrategy(),      // Primary: S3 via backend
      new DirectBackendStrategy(),  // Fallback: Direct backend storage
      new LocalCacheStrategy(),     // Last resort: Local cache
    ];

    this.strategyManager = new UploadStrategyManager(strategies);
    this.localCacheStrategy = new LocalCacheStrategy();

    // Clear old cache on initialization
    this.localCacheStrategy.clearOldCache();
  }

  /**
   * Upload a single image
   */
  async uploadImage(
    imageFile: string,
    options: ImageUploadOptions
  ): Promise<UploadResult> {
    try {
      // Validate image
      if (!imageFile || imageFile.trim() === '') {
        throw new Error('Image file is required');
      }

      // Validate folder
      if (!options.folder || options.folder.trim() === '') {
        throw new Error('Folder path is required');
      }

      // Generate unique filename if not provided
      const fileName = options.fileName || this.generateFileName(options.entityType, options.entityId);

      // Detect content type
      const contentType = this.detectContentType(imageFile);

      // Prepare upload options
      const uploadOptions: UploadOptions = {
        folder: options.folder,
        fileName,
        contentType,
        entityType: options.entityType,
        entityId: options.entityId,
        maxRetries: options.maxRetries || 3,
        onProgress: options.onProgress,
      };

      console.log('Starting image upload:', uploadOptions);

      // Queue upload
      const uploadId = await this.strategyManager.queueUpload(imageFile, uploadOptions);

      // Wait for upload to complete
      const result = await this.strategyManager.waitForUpload(uploadId, 60000);

      console.log('Image upload completed:', result);

      return result;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Image upload failed',
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    images: Array<{ file: string; options: ImageUploadOptions }>
  ): Promise<UploadResult[]> {
    const uploadPromises = images.map(({ file, options }) =>
      this.uploadImage(file, options)
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image
   */
  async deleteImage(url: string): Promise<boolean> {
    try {
      if (!url || url.trim() === '') {
        return false;
      }

      // Extract key from URL
      const key = S3Utils.extractKeyFromUrl(url);
      if (!key) {
        console.warn('Could not extract key from URL:', url);
        return false;
      }

      console.log('Deleting image:', key);

      // Try to delete from strategies that support it
      const directStrategy = new DirectBackendStrategy();
      const localStrategy = new LocalCacheStrategy();

      const deletePromises = [];
      
      if (directStrategy.delete) {
        deletePromises.push(directStrategy.delete(key));
      }
      if (localStrategy.delete) {
        deletePromises.push(localStrategy.delete(key));
      }

      if (deletePromises.length === 0) {
        console.log('No deletion strategies available');
        return true; // Consider it success if no deletion needed
      }

      const results = await Promise.allSettled(deletePromises);

      // Return true if at least one deletion succeeded
      return results.some(r => r.status === 'fulfilled' && r.value === true);
    } catch (error: any) {
      console.error('Image deletion failed:', error);
      return false;
    }
  }

  /**
   * Delete multiple images
   */
  async deleteMultipleImages(urls: string[]): Promise<boolean[]> {
    const deletePromises = urls.map(url => this.deleteImage(url));
    return Promise.all(deletePromises);
  }

  /**
   * Get upload queue statistics
   */
  getQueueStats() {
    return this.strategyManager.getQueueStats();
  }

  /**
   * Clear completed uploads from queue
   */
  clearCompletedUploads() {
    this.strategyManager.clearCompleted();
  }

  /**
   * Generate unique filename
   */
  private generateFileName(entityType?: string, entityId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    let prefix = entityType || 'image';
    if (entityId) {
      prefix = `${prefix}_${entityId}`;
    }

    return `${prefix}_${timestamp}_${random}.jpg`;
  }

  /**
   * Detect content type from base64 string
   */
  private detectContentType(file: string): string {
    if (file.startsWith('data:')) {
      const match = file.match(/data:([^;]+);/);
      if (match) {
        return match[1];
      }
    }
    return 'image/jpeg'; // Default
  }

  /**
   * Validate image size
   */
  validateImageSize(file: string, maxSizeMB: number = 10): boolean {
    return S3Utils.validateFileSize(file, maxSizeMB);
  }

  /**
   * Retrieve locally cached image (if using local cache)
   */
  async retrieveLocalImage(url: string): Promise<string | null> {
    if (url.startsWith('local://')) {
      const key = url.replace('local://', '');
      return this.localCacheStrategy.retrieve(key);
    }
    return null;
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;
