/**
 * Local Cache Strategy
 * Stores images locally as a last resort fallback
 * Images are kept as base64 in memory/AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UploadStrategy, UploadOptions, UploadResult } from '../imageUploadStrategy';

export class LocalCacheStrategy implements UploadStrategy {
  name = 'LocalCache';
  private readonly STORAGE_PREFIX = '@image_cache_';
  private readonly MAX_CACHE_SIZE_MB = 50;

  async isAvailable(): Promise<boolean> {
    // Local cache is always available
    return true;
  }

  async upload(file: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const { folder, fileName } = options;
      const key = `${folder}/${fileName}`;
      const storageKey = `${this.STORAGE_PREFIX}${key}`;

      console.log(`[LocalCache] Storing locally: ${key}`);
      options.onProgress?.(30);

      // Check cache size before storing
      const canStore = await this.checkCacheSize(file);
      if (!canStore) {
        throw new Error('Cache size limit exceeded');
      }

      options.onProgress?.(60);

      // Store in AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        file,
        key,
        timestamp: Date.now(),
        metadata: {
          folder,
          fileName,
          contentType: options.contentType,
        },
      }));

      options.onProgress?.(100);

      console.log(`[LocalCache] Stored successfully: ${key}`);

      // Return a local reference URL
      return {
        success: true,
        url: `local://${key}`,
        key,
      };
    } catch (error: any) {
      console.error('[LocalCache] Store error:', error);
      return {
        success: false,
        error: error.message || 'Local cache storage failed',
      };
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      await AsyncStorage.removeItem(storageKey);
      console.log(`[LocalCache] Deleted: ${key}`);
      return true;
    } catch (error: any) {
      console.error('[LocalCache] Delete error:', error);
      return false;
    }
  }

  /**
   * Retrieve locally cached image
   */
  async retrieve(key: string): Promise<string | null> {
    try {
      const storageKey = `${this.STORAGE_PREFIX}${key}`;
      const data = await AsyncStorage.getItem(storageKey);
      
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.file;
      }
      
      return null;
    } catch (error) {
      console.error('[LocalCache] Retrieve error:', error);
      return null;
    }
  }

  /**
   * Check if cache size is within limits
   */
  private async checkCacheSize(newFile: string): Promise<boolean> {
    try {
      // Estimate new file size
      const newFileSizeMB = (newFile.length * 3 / 4) / (1024 * 1024);
      
      // Get all cached items
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(this.STORAGE_PREFIX));
      
      let totalSizeMB = 0;
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSizeMB += (data.length * 3 / 4) / (1024 * 1024);
        }
      }

      return (totalSizeMB + newFileSizeMB) <= this.MAX_CACHE_SIZE_MB;
    } catch (error) {
      console.error('[LocalCache] Cache size check error:', error);
      return true; // Allow storage on error
    }
  }

  /**
   * Clear old cached items
   */
  async clearOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(this.STORAGE_PREFIX));
      const now = Date.now();

      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (now - parsed.timestamp > maxAgeMs) {
            await AsyncStorage.removeItem(key);
            console.log(`[LocalCache] Cleared old cache: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('[LocalCache] Clear old cache error:', error);
    }
  }
}
