# Image Picker Setup Instructions

## Installation Required

To enable native image picking from gallery/files, you need to install `expo-image-picker`:

```bash
cd front-end
npx expo install expo-image-picker
```

## Features After Installation

Once installed, users will be able to:

### ✅ Pick from Gallery
- Tap "📷 Upload Image from Device"
- Select "📷 Pick from Gallery"
- Choose image from photo library
- Image automatically converts to base64
- Preview appears in the form

### ✅ Paste Base64
- Manually paste base64 string
- Format: `data:image/png;base64,...`

### ✅ Paste Image URL
- Paste image URL
- Format: `https://example.com/image.jpg`

## How It Works

### 1. Permission Request
```typescript
const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
```
- Asks user for photo library access
- Required on iOS and Android

### 2. Launch Image Picker
```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.7,
  base64: true,
});
```

### 3. Convert to Base64
```typescript
const base64String = `data:image/jpeg;base64,${asset.base64}`;
```

### 4. Add to Form
```typescript
setFormData({
  ...formData,
  images: [...formData.images, base64String],
});
```

## Configuration

### Image Picker Options
- **mediaTypes**: Images only
- **allowsEditing**: Yes (crop/rotate)
- **aspect**: 4:3 ratio
- **quality**: 0.7 (70% quality for smaller file size)
- **base64**: true (get base64 string)

### Quality Settings
- **0.7 (70%)**: Good balance between quality and size
- Adjust if needed:
  - **0.5**: Smaller files, lower quality
  - **1.0**: Best quality, larger files

## Platform Support

### iOS
- ✅ Photo Library access
- ✅ Crop/Edit support
- ✅ Base64 conversion

### Android
- ✅ Gallery access
- ✅ Crop/Edit support
- ✅ Base64 conversion

## Permissions

### iOS (ios/Info.plist)
Already configured in Expo:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Allow access to select images for PG locations</string>
```

### Android (android/app/src/main/AndroidManifest.xml)
Already configured in Expo:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## Usage Flow

```
1. User taps "📷 Upload Image from Device"
   ↓
2. Alert shows 3 options:
   - 📷 Pick from Gallery
   - Paste Base64
   - Paste Image URL
   ↓
3. User selects "📷 Pick from Gallery"
   ↓
4. Permission request (first time only)
   ↓
5. Native image picker opens
   ↓
6. User selects image
   ↓
7. Optional: Crop/Edit image
   ↓
8. Image converts to base64
   ↓
9. Preview appears in form
   ↓
10. Submit form → Image saved to database
```

## File Size Considerations

### Base64 Size
- Base64 is ~33% larger than original
- Example: 100KB image → ~133KB base64

### Recommendations
- Use quality: 0.7 for balance
- Limit image dimensions if needed
- Consider compression for large images

### Database Storage
- Images stored as JSON array in PostgreSQL
- Each image is a base64 string
- Multiple images per PG location supported

## Troubleshooting

### "Cannot find module 'expo-image-picker'"
**Solution**: Run installation command
```bash
npx expo install expo-image-picker
```

### "Permission denied"
**Solution**: User needs to grant permission
- iOS: Settings → App → Photos → Allow
- Android: Settings → Apps → App → Permissions → Storage

### "Image too large"
**Solution**: Reduce quality
```typescript
quality: 0.5,  // Lower quality
```

### "Base64 not generated"
**Solution**: Ensure base64 option is true
```typescript
base64: true,
```

## Alternative: Camera

To also allow taking photos with camera:

```typescript
const takePicture = async () => {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
  if (permissionResult.granted === false) {
    Alert.alert('Permission Required', 'Please allow camera access');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
    base64: true,
  });

  // Same processing as gallery...
};
```

Add to Alert options:
```typescript
{
  text: '📸 Take Photo',
  onPress: takePicture,
},
```

## Current Fallback

Until package is installed, users can:
- ✅ Paste Base64 strings
- ✅ Paste Image URLs

Both work without the package!

## After Installation

Run the app:
```bash
npx expo start
```

The image picker will work natively on both iOS and Android! 📷
