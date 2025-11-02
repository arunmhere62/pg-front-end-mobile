/**
 * Storage Services - Unified Exports
 * 
 * Use imageUploadService for all new implementations
 * Legacy services kept for backward compatibility
 */

// New Strategy-Based Service (Recommended)
export { imageUploadService, type ImageUploadOptions } from './imageUploadService';
export { UploadStrategyManager, type UploadStrategy, type UploadOptions, type UploadResult, type QueuedUpload } from './imageUploadStrategy';

// Strategies
export { S3BackendStrategy } from './strategies/S3BackendStrategy';
export { DirectBackendStrategy } from './strategies/DirectBackendStrategy';
export { LocalCacheStrategy } from './strategies/LocalCacheStrategy';

// Legacy Service (Backward Compatibility)
export { awsS3ServiceBackend, S3Utils, type UploadResult as S3UploadResult, type DeleteResult as S3DeleteResult } from './awsS3ServiceBackend';

// Default export
export { imageUploadService as default } from './imageUploadService';
