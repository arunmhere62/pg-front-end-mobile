# ✅ S3 Image Upload Integration for Beds

## Summary

Successfully integrated S3 image upload functionality for bed add and edit screens, matching the implementation used in room screens.

## Changes Made

### 1. **Updated BedFormModal Component** (`src/components/BedFormModal.tsx`)

#### Imports Updated:
```typescript
// OLD
import { ImageUpload } from './ImageUpload';

// NEW
import { ImageUploadS3 } from './ImageUploadS3';
import { getFolderConfig } from '../config/aws.config';
import { awsS3ServiceBackend as awsS3Service, S3Utils } from '../services/awsS3ServiceBackend';
```

#### Added Image Tracking:
```typescript
const [originalImages, setOriginalImages] = useState<string[]>([]); // Track original images for cleanup
```

#### Updated Image Loading (Edit Mode):
```typescript
// Store original images for comparison when editing
if (bed) {
  const bedImages = bed.images || [];
  setFormData({
    bed_no: bed.bed_no,
    images: bedImages,
  });
  setOriginalImages([...bedImages]); // Store original images for comparison
}
```

#### Updated ImageUpload Component:
```typescript
// OLD
<ImageUpload
  images={formData.images}
  onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
  maxImages={3}
  label="Bed Images (Optional)"
  disabled={loading}
/>

// NEW
<ImageUploadS3
  images={formData.images}
  onImagesChange={(images: string[]) => setFormData((prev) => ({ ...prev, images }))}
  maxImages={3}
  label="Bed Images (Optional)"
  disabled={loading}
  folder={getFolderConfig().beds.images}
  useS3={true}
  entityId={bed?.s_no?.toString()}
/>
```

### 2. **Updated AWS Config** (`src/config/aws.config.ts`)

Added beds folder configuration:

```typescript
FOLDERS: {
  // ... existing folders
  rooms: {
    images: 'rooms/images',
  },
  beds: {
    images: 'beds/images',  // ✅ NEW
  },
  visitors: {
    images: 'visitors/images',
    documents: 'visitors/documents',
  },
  // ... rest of folders
}
```

## Features

### S3 Upload Capabilities:
✅ **Direct S3 Upload** - Images uploaded directly to AWS S3  
✅ **Folder Organization** - Bed images stored in `beds/images/` folder  
✅ **Entity Tracking** - Images tagged with bed ID for organization  
✅ **Max 3 Images** - Limit of 3 images per bed  
✅ **Image Compression** - Automatic compression before upload  
✅ **Progress Tracking** - Upload progress indicators  
✅ **Error Handling** - Proper error messages for failed uploads  

### Image Management:
✅ **Add Images** - Upload new bed images when creating a bed  
✅ **Edit Images** - Update bed images when editing  
✅ **Delete Images** - Remove images from S3 when deleted  
✅ **Preview Images** - View uploaded images before saving  
✅ **Original Tracking** - Track original images for cleanup on edit  

## S3 Folder Structure

```
indianpgmanagement/
├── beds/
│   └── images/
│       ├── bed-{id}-1.jpg
│       ├── bed-{id}-2.jpg
│       └── bed-{id}-3.jpg
├── rooms/
│   └── images/
│       └── room-{id}-*.jpg
└── ... other folders
```

## Usage

### Adding a New Bed with Images:
1. Open bed form modal
2. Enter bed number (e.g., BED1, BED2)
3. Click "Add Images" button
4. Select up to 3 images
5. Images are automatically uploaded to S3
6. Click "Create" to save bed with image URLs

### Editing Bed Images:
1. Open bed edit modal
2. Existing images are loaded from S3
3. Add new images or remove existing ones
4. Changes are synced with S3
5. Click "Update" to save changes

## Technical Details

### Props Passed to ImageUploadS3:
- **images**: Array of image URLs (from S3)
- **onImagesChange**: Callback when images change
- **maxImages**: Maximum number of images (3 for beds)
- **label**: Display label ("Bed Images (Optional)")
- **disabled**: Disable during loading
- **folder**: S3 folder path (`beds/images`)
- **useS3**: Enable S3 upload (true)
- **entityId**: Bed ID for tracking

### Image Cleanup:
- Original images are tracked in `originalImages` state
- When editing, removed images can be cleaned up from S3
- New images are uploaded to S3
- Image URLs are stored in the database

## Consistency with Room Implementation

The bed S3 integration now matches the room implementation:

| Feature | Rooms | Beds |
|---------|-------|------|
| Component | ImageUploadS3 ✅ | ImageUploadS3 ✅ |
| S3 Folder | `rooms/images` | `beds/images` |
| Max Images | 5 | 3 |
| Entity Tracking | ✅ | ✅ |
| Original Image Tracking | ✅ | ✅ |
| Direct S3 Upload | ✅ | ✅ |

## Testing Checklist

- [ ] Create new bed with images
- [ ] Create new bed without images
- [ ] Edit bed and add images
- [ ] Edit bed and remove images
- [ ] Edit bed and replace images
- [ ] Verify images appear in S3 bucket
- [ ] Verify images display correctly in UI
- [ ] Test image upload progress
- [ ] Test image upload errors
- [ ] Test max image limit (3)
- [ ] Verify image compression works
- [ ] Test on different image formats (JPG, PNG, etc.)

## Benefits

1. ✅ **Scalability** - Images stored in cloud, not on server
2. ✅ **Performance** - Fast CDN delivery of images
3. ✅ **Reliability** - AWS S3 99.999999999% durability
4. ✅ **Cost-Effective** - Pay only for storage used
5. ✅ **Consistency** - Same implementation as rooms
6. ✅ **Organization** - Structured folder hierarchy
7. ✅ **Maintenance** - Easy to manage and backup

## Notes

- The old `ImageUpload` component is no longer used for beds
- All bed images are now stored in AWS S3
- Image URLs are stored in the database
- The implementation matches the room screen pattern
- The `originalImages` state helps track changes for cleanup
