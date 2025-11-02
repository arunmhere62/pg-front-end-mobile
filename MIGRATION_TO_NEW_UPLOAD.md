# Migration Guide: New Image Upload Service

## Quick Fix for Current S3 Error

The error you're seeing:
```
ERROR S3 Upload Error: [Error: Expected uri parameter to have length >= 1, but found "" for params.Bucket]
```

**Root Cause:** AWS_S3_BUCKET_NAME is not configured in `.env`

## Immediate Solution (2 Options)

### Option 1: Configure AWS S3 (If you have S3)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your AWS credentials to `.env`:
   ```env
   API_BASE_URL=http://localhost:3000/api/v1
   
   AWS_S3_BUCKET_NAME=your-bucket-name
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. Restart the app:
   ```bash
   npm start -- --clear
   ```

### Option 2: Use New Upload Service (Recommended)

The new service automatically falls back to backend storage if S3 is not configured.

#### Step 1: Update ImageUploadS3 Component

**File:** `src/components/ImageUploadS3.tsx`

**Find this import:**
```typescript
import { awsS3ServiceBackend as awsS3Service } from '../services/storage/awsS3ServiceBackend';
```

**Replace with:**
```typescript
import { imageUploadService } from '../services/storage/imageUploadService';
```

**Find the upload logic (around line 150-200):**
```typescript
const result = await awsS3Service.uploadImage(base64, {
  folder: folder,
  fileName: uniqueFileName,
});
```

**Replace with:**
```typescript
const result = await imageUploadService.uploadImage(base64, {
  folder: folder,
  fileName: uniqueFileName,
  entityType: entityType,
  entityId: entityId,
  onProgress: (progress) => {
    // Update progress state
    setUploadProgress(prev => ({
      ...prev,
      [index]: progress
    }));
  },
});
```

**Find the delete logic:**
```typescript
await awsS3Service.deleteFile(key);
```

**Replace with:**
```typescript
await imageUploadService.deleteImage(imageUrl);
```

#### Step 2: Update EditRoomModal (Already Good!)

Your `EditRoomModal.tsx` is already using the right pattern. Just ensure it imports from the new service:

```typescript
import { imageUploadService } from '@/services/storage/imageUploadService';
```

#### Step 3: Test the Changes

1. **Clear cache and restart:**
   ```bash
   npm start -- --clear
   ```

2. **Test upload flow:**
   - Go to Rooms screen
   - Click "Add Room" or "Edit Room"
   - Try uploading an image
   - Check console logs for strategy being used:
     ```
     [S3Backend] not available, trying next...
     [DirectBackend] Uploading: rooms/images/room_123.jpg
     [DirectBackend] Upload successful
     ```

## Benefits of New Service

### Before (Old awsS3ServiceBackend)
- ❌ Fails immediately if S3 not configured
- ❌ No retry mechanism
- ❌ No fallback options
- ❌ Hard to debug

### After (New imageUploadService)
- ✅ Automatic fallback to backend storage
- ✅ 3 retry attempts per strategy
- ✅ Queue-based processing
- ✅ Progress tracking
- ✅ Better error messages
- ✅ Works even if S3 is down

## Backend Requirements

### For S3 Strategy (Optional)
```typescript
// POST /api/v1/s3/upload
{
  key: string,
  contentType: string,
  fileData: string, // base64
  isPublic: boolean,
  bucket: string
}
```

### For Direct Backend Strategy (Fallback)
```typescript
// POST /api/v1/uploads/image
{
  file: string, // base64
  folder: string,
  fileName: string,
  contentType: string,
  entityType?: string,
  entityId?: string
}
```

**Note:** If your backend doesn't have `/uploads/image`, you need to create it OR configure S3.

## Testing Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Configure AWS credentials (or leave empty for fallback)
- [ ] Update ImageUploadS3 component imports
- [ ] Clear cache: `npm start -- --clear`
- [ ] Test room image upload
- [ ] Test tenant image upload
- [ ] Check console logs for strategy used
- [ ] Verify images are saved correctly
- [ ] Test image deletion

## Rollback Plan

If something breaks, you can quickly rollback:

1. Revert ImageUploadS3 component to use old service:
   ```typescript
   import { awsS3ServiceBackend as awsS3Service } from '../services/storage/awsS3ServiceBackend';
   ```

2. Configure S3 in `.env` (required for old service)

3. Restart app

## Support

For detailed documentation, see:
- `IMAGE_UPLOAD_ARCHITECTURE.md` - Full architecture guide
- `src/services/storage/imageUploadService.ts` - Service implementation
- Console logs - All strategies log their actions

## Summary

**Quick Fix:** Just add AWS credentials to `.env` OR use the new imageUploadService which handles fallbacks automatically.

**Recommended:** Migrate to new service for better reliability and user experience.
