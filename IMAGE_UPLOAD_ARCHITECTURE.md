# Image Upload Architecture - High-Level Design

## 🎯 Overview

This document describes the robust, production-ready image upload system with automatic fallback mechanisms and queue-based processing.

## 🏗️ Architecture Pattern: Strategy Pattern with Queue

```
┌─────────────────────────────────────────────────────────────┐
│                    ImageUploadService                        │
│                   (High-Level API)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              UploadStrategyManager                           │
│              (Queue + Retry Logic)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ S3Backend    │   │ DirectBackend│   │ LocalCache   │
│ Strategy     │   │ Strategy     │   │ Strategy     │
│ (Primary)    │   │ (Fallback)   │   │ (Last Resort)│
└──────────────┘   └──────────────┘   └──────────────┘
```

## 🔄 Upload Flow

### 1. **User Uploads Image**
```typescript
const result = await imageUploadService.uploadImage(base64Image, {
  folder: 'rooms/images',
  entityType: 'room',
  entityId: '123',
  onProgress: (progress) => console.log(progress),
});
```

### 2. **Strategy Manager Processes**
- Adds upload to queue
- Tries strategies in order:
  1. **S3Backend** (if AWS configured)
  2. **DirectBackend** (if S3 fails)
  3. **LocalCache** (if all fail)

### 3. **Automatic Retry**
- Each strategy retries up to 3 times
- Exponential backoff between retries
- Falls back to next strategy if all retries fail

### 4. **Progress Tracking**
- Real-time progress updates (0-100%)
- Queue statistics available
- Upload status monitoring

## 📁 File Structure

```
src/services/storage/
├── imageUploadService.ts          # Main service (use this)
├── imageUploadStrategy.ts         # Strategy pattern interfaces
├── awsS3ServiceBackend.ts         # Legacy S3 service (kept for compatibility)
├── strategies/
│   ├── S3BackendStrategy.ts       # S3 via backend API
│   ├── DirectBackendStrategy.ts   # Direct backend storage
│   └── LocalCacheStrategy.ts      # Local AsyncStorage fallback
```

## 🚀 Usage Examples

### Basic Upload
```typescript
import { imageUploadService } from '@/services/storage/imageUploadService';

const result = await imageUploadService.uploadImage(base64Image, {
  folder: 'rooms/images',
  entityType: 'room',
  entityId: roomId?.toString(),
});

if (result.success) {
  console.log('Uploaded:', result.url);
  // Save result.url to database
} else {
  console.error('Upload failed:', result.error);
}
```

### Upload with Progress
```typescript
const result = await imageUploadService.uploadImage(base64Image, {
  folder: 'rooms/images',
  entityType: 'room',
  entityId: roomId?.toString(),
  onProgress: (progress) => {
    setUploadProgress(progress);
  },
});
```

### Multiple Images
```typescript
const results = await imageUploadService.uploadMultipleImages([
  { file: image1, options: { folder: 'rooms/images', entityType: 'room', entityId: '1' } },
  { file: image2, options: { folder: 'rooms/images', entityType: 'room', entityId: '1' } },
]);
```

### Delete Image
```typescript
const success = await imageUploadService.deleteImage(imageUrl);
```

### Queue Statistics
```typescript
const stats = imageUploadService.getQueueStats();
console.log('Pending:', stats.pending);
console.log('Uploading:', stats.uploading);
console.log('Completed:', stats.completed);
console.log('Failed:', stats.failed);
```

## ⚙️ Configuration

### 1. Environment Variables (.env)

```env
# Backend API
API_BASE_URL=http://localhost:3000/api/v1

# AWS S3 (Optional - for S3 uploads)
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 2. Strategy Behavior

**If AWS is NOT configured:**
- S3Backend strategy will be skipped (isAvailable() returns false)
- Automatically falls back to DirectBackend
- No errors thrown, seamless fallback

**If Backend is DOWN:**
- DirectBackend strategy will fail
- Falls back to LocalCache (stores in AsyncStorage)
- Images sync to backend when it comes back online

## 🔧 Backend API Requirements

### S3 Upload Endpoint
```
POST /api/v1/s3/upload
Body: {
  key: string,
  contentType: string,
  fileData: string (base64),
  isPublic: boolean,
  bucket: string
}
Response: {
  success: boolean,
  url: string,
  error?: string
}
```

### S3 Delete Endpoint
```
DELETE /api/v1/s3/delete
Body: {
  key: string,
  bucket: string
}
Response: {
  success: boolean,
  error?: string
}
```

### S3 Health Check
```
GET /api/v1/s3/health
Response: {
  available: boolean
}
```

### Direct Backend Upload (Fallback)
```
POST /api/v1/uploads/image
Body: {
  file: string (base64),
  folder: string,
  fileName: string,
  contentType: string,
  entityType?: string,
  entityId?: string
}
Response: {
  success: boolean,
  url: string,
  key: string,
  error?: string
}
```

### Direct Backend Delete
```
DELETE /api/v1/uploads/image
Body: {
  key: string
}
Response: {
  success: boolean,
  error?: string
}
```

## 🛡️ Error Handling

### Strategy-Level Errors
- Each strategy catches its own errors
- Returns `{ success: false, error: string }`
- Manager tries next strategy automatically

### Retry Logic
- Max 3 retries per strategy
- 2 second delay between retries (exponential)
- Falls back to next strategy after max retries

### User-Facing Errors
```typescript
const result = await imageUploadService.uploadImage(...);

if (!result.success) {
  // Show user-friendly error
  Alert.alert('Upload Failed', result.error || 'Please try again');
}
```

## 📊 Monitoring & Debugging

### Enable Debug Logs
All strategies log to console:
```
[S3Backend] Uploading: rooms/images/room_123_1234567890_abc123.jpg
[S3Backend] Upload successful: https://bucket.s3.amazonaws.com/...
```

### Check Queue Status
```typescript
const stats = imageUploadService.getQueueStats();
console.log('Queue stats:', stats);
```

### Clear Completed Uploads
```typescript
imageUploadService.clearCompletedUploads();
```

## 🔒 Security Best Practices

1. **Never expose AWS credentials in frontend**
   - Use backend proxy for S3 uploads
   - Backend handles authentication

2. **Validate file types and sizes**
   ```typescript
   const isValid = imageUploadService.validateImageSize(file, 10); // 10MB max
   ```

3. **Use presigned URLs for sensitive content**
   - Backend generates presigned URLs
   - Frontend uploads directly to S3

4. **Implement rate limiting**
   - Backend should rate-limit upload endpoints
   - Prevent abuse

## 🚨 Common Issues & Solutions

### Issue: "Expected uri parameter to have length >= 1, but found "" for params.Bucket"
**Cause:** AWS_S3_BUCKET_NAME not set in .env
**Solution:** 
- Add bucket name to .env, OR
- Let it fallback to DirectBackend (no action needed)

### Issue: Upload stuck in "uploading" status
**Cause:** Backend not responding
**Solution:**
- Check backend is running
- Verify API_BASE_URL in .env
- Check network connectivity

### Issue: Images not appearing after upload
**Cause:** URL not saved to database
**Solution:**
```typescript
const result = await imageUploadService.uploadImage(...);
if (result.success) {
  // IMPORTANT: Save result.url to your database
  await updateRoom(roomId, { images: [...existingImages, result.url] });
}
```

## 🎯 Migration from Old System

### Before (Direct S3 Service)
```typescript
import { awsS3ServiceBackend } from '@/services/storage/awsS3ServiceBackend';

const result = await awsS3ServiceBackend.uploadImage(file, {
  folder: 'rooms/images',
  fileName: 'room_123.jpg',
});
```

### After (New Strategy System)
```typescript
import { imageUploadService } from '@/services/storage/imageUploadService';

const result = await imageUploadService.uploadImage(file, {
  folder: 'rooms/images',
  entityType: 'room',
  entityId: '123',
});
```

**Benefits:**
- ✅ Automatic fallback if S3 fails
- ✅ Queue-based processing
- ✅ Retry mechanism
- ✅ Progress tracking
- ✅ Better error handling

## 📈 Performance Optimization

1. **Batch Uploads**
   ```typescript
   const results = await imageUploadService.uploadMultipleImages([...]);
   ```

2. **Clear Old Cache**
   ```typescript
   // Automatically clears cache older than 7 days on init
   // Manual clear:
   await localCacheStrategy.clearOldCache(7 * 24 * 60 * 60 * 1000);
   ```

3. **Compress Images Before Upload**
   ```typescript
   // Use expo-image-manipulator or similar
   const compressed = await ImageManipulator.manipulateAsync(
     uri,
     [{ resize: { width: 1024 } }],
     { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
   );
   ```

## 🔮 Future Enhancements

- [ ] Background upload queue (persist across app restarts)
- [ ] Image compression before upload
- [ ] Thumbnail generation
- [ ] CDN integration
- [ ] Upload analytics
- [ ] Batch delete optimization
- [ ] Offline-first sync mechanism

## 📝 Summary

This architecture provides:
- ✅ **Reliability**: Multiple fallback strategies
- ✅ **Resilience**: Automatic retry mechanism
- ✅ **Flexibility**: Easy to add new strategies
- ✅ **Monitoring**: Queue statistics and progress tracking
- ✅ **User Experience**: Seamless uploads with progress feedback
- ✅ **Production-Ready**: Error handling and logging

Use `imageUploadService` for all image uploads in your app!
