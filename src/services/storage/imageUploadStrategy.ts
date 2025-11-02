/**
 * Image Upload Strategy Pattern
 * 
 * High-level design for reliable image uploads with:
 * - Multiple upload strategies (S3, Backend, Local fallback)
 * - Automatic retry mechanism
 * - Queue-based upload system
 * - Progress tracking
 * - Error recovery
 */

export interface UploadStrategy {
  name: string;
  upload(file: string, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<boolean>;
  isAvailable(): Promise<boolean>;
}

export interface UploadOptions {
  folder: string;
  fileName: string;
  contentType?: string;
  entityType?: 'room' | 'tenant' | 'bed' | 'employee' | 'visitor' | 'expense';
  entityId?: string;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  strategy?: string;
  error?: string;
}

export interface QueuedUpload {
  id: string;
  file: string;
  options: UploadOptions;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  retries: number;
  result?: UploadResult;
  error?: string;
  timestamp: number;
}

/**
 * Upload Strategy Manager
 * Manages multiple upload strategies with automatic fallback
 */
export class UploadStrategyManager {
  private strategies: UploadStrategy[] = [];
  private queue: Map<string, QueuedUpload> = new Map();
  private isProcessing = false;

  constructor(strategies: UploadStrategy[]) {
    this.strategies = strategies;
  }

  /**
   * Add upload to queue
   */
  async queueUpload(file: string, options: UploadOptions): Promise<string> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedUpload: QueuedUpload = {
      id: uploadId,
      file,
      options,
      status: 'pending',
      progress: 0,
      retries: 0,
      timestamp: Date.now(),
    };

    this.queue.set(uploadId, queuedUpload);
    
    // Start processing queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return uploadId;
  }

  /**
   * Process upload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      for (const [uploadId, queuedUpload] of this.queue.entries()) {
        if (queuedUpload.status === 'pending') {
          await this.processUpload(uploadId, queuedUpload);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single upload with fallback strategies
   */
  private async processUpload(uploadId: string, queuedUpload: QueuedUpload): Promise<void> {
    const maxRetries = queuedUpload.options.maxRetries || 3;
    
    queuedUpload.status = 'uploading';
    this.queue.set(uploadId, queuedUpload);

    for (const strategy of this.strategies) {
      try {
        // Check if strategy is available
        const isAvailable = await strategy.isAvailable();
        if (!isAvailable) {
          console.log(`Strategy ${strategy.name} not available, trying next...`);
          continue;
        }

        console.log(`Attempting upload with strategy: ${strategy.name}`);
        
        // Attempt upload
        const result = await strategy.upload(queuedUpload.file, {
          ...queuedUpload.options,
          onProgress: (progress) => {
            queuedUpload.progress = progress;
            this.queue.set(uploadId, queuedUpload);
            queuedUpload.options.onProgress?.(progress);
          },
        });

        if (result.success) {
          queuedUpload.status = 'completed';
          queuedUpload.result = { ...result, strategy: strategy.name };
          queuedUpload.progress = 100;
          this.queue.set(uploadId, queuedUpload);
          console.log(`Upload successful with strategy: ${strategy.name}`);
          return;
        }
      } catch (error: any) {
        console.error(`Strategy ${strategy.name} failed:`, error.message);
        queuedUpload.error = error.message;
      }
    }

    // All strategies failed
    if (queuedUpload.retries < maxRetries) {
      queuedUpload.retries++;
      queuedUpload.status = 'pending';
      console.log(`Retrying upload (${queuedUpload.retries}/${maxRetries})...`);
      setTimeout(() => this.processUpload(uploadId, queuedUpload), 2000 * queuedUpload.retries);
    } else {
      queuedUpload.status = 'failed';
      queuedUpload.error = 'All upload strategies failed after retries';
      this.queue.set(uploadId, queuedUpload);
      console.error('Upload failed after all retries');
    }
  }

  /**
   * Get upload status
   */
  getUploadStatus(uploadId: string): QueuedUpload | undefined {
    return this.queue.get(uploadId);
  }

  /**
   * Wait for upload to complete
   */
  async waitForUpload(uploadId: string, timeoutMs: number = 30000): Promise<UploadResult> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const upload = this.queue.get(uploadId);
        
        if (!upload) {
          reject(new Error('Upload not found'));
          return;
        }

        if (upload.status === 'completed' && upload.result) {
          resolve(upload.result);
          return;
        }

        if (upload.status === 'failed') {
          reject(new Error(upload.error || 'Upload failed'));
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Upload timeout'));
          return;
        }

        setTimeout(checkStatus, 500);
      };

      checkStatus();
    });
  }

  /**
   * Clear completed uploads from queue
   */
  clearCompleted(): void {
    for (const [uploadId, upload] of this.queue.entries()) {
      if (upload.status === 'completed' || upload.status === 'failed') {
        this.queue.delete(uploadId);
      }
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const stats = {
      total: this.queue.size,
      pending: 0,
      uploading: 0,
      completed: 0,
      failed: 0,
    };

    for (const upload of this.queue.values()) {
      stats[upload.status]++;
    }

    return stats;
  }
}

export default UploadStrategyManager;
