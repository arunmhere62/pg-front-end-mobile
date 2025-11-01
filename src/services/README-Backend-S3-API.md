# Backend S3 API Endpoints

To enable real S3 uploads without base64 fallback, you need to implement these API endpoints in your backend.

## Required Backend Endpoints

### 1. Upload File to S3
**POST** `/api/s3/upload`

```json
{
  "key": "rooms/images/room_123_image_1699123456789_abc123.jpg",
  "contentType": "image/jpeg",
  "fileData": "base64-encoded-file-data",
  "isPublic": true,
  "bucket": "indianpgmanagement-app-s3"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://indianpgmanagement-app-s3.s3.ap-south-1.amazonaws.com/rooms/images/...",
  "key": "rooms/images/room_123_image_1699123456789_abc123.jpg"
}
```

### 2. Delete File from S3
**DELETE** `/api/s3/delete`

```json
{
  "key": "rooms/images/room_123_image_1699123456789_abc123.jpg",
  "bucket": "indianpgmanagement-app-s3"
}
```

**Response:**
```json
{
  "success": true
}
```

### 3. Delete Multiple Files
**DELETE** `/api/s3/delete-multiple`

```json
{
  "keys": ["rooms/images/file1.jpg", "rooms/images/file2.jpg"],
  "bucket": "indianpgmanagement-app-s3"
}
```

**Response:**
```json
{
  "success": true
}
```

### 4. Check File Exists (Optional)
**GET** `/api/s3/exists?key=rooms/images/file.jpg&bucket=indianpgmanagement-app-s3`

**Response:**
```json
{
  "exists": true
}
```

## Backend Implementation Example (Node.js/Express)

```javascript
const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();

// Configure AWS
AWS.config.update({
  accessKeyId: 'AKIA5QELDK32OFK7YBRL',
  secretAccessKey: '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',
  region: 'ap-south-1'
});

const s3 = new AWS.S3();

// Upload file to S3
router.post('/upload', async (req, res) => {
  try {
    const { key, contentType, fileData, isPublic, bucket } = req.body;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    const params = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private'
    };
    
    const result = await s3.upload(params).promise();
    
    res.json({
      success: true,
      url: result.Location,
      key: result.Key
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete file from S3
router.delete('/delete', async (req, res) => {
  try {
    const { key, bucket } = req.body;
    
    const params = {
      Bucket: bucket,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    res.json({ success: true });
  } catch (error) {
    console.error('S3 delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete multiple files
router.delete('/delete-multiple', async (req, res) => {
  try {
    const { keys, bucket } = req.body;
    
    const params = {
      Bucket: bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key }))
      }
    };
    
    await s3.deleteObjects(params).promise();
    
    res.json({ success: true });
  } catch (error) {
    console.error('S3 bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if file exists
router.get('/exists', async (req, res) => {
  try {
    const { key, bucket } = req.query;
    
    const params = {
      Bucket: bucket,
      Key: key
    };
    
    await s3.headObject(params).promise();
    res.json({ exists: true });
  } catch (error) {
    if (error.code === 'NotFound') {
      res.json({ exists: false });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

module.exports = router;
```

## Frontend Usage

Once you implement the backend endpoints, the frontend will:

1. ✅ **Upload images to S3** via your backend
2. ✅ **Display existing base64 images** (backward compatibility)
3. ✅ **Never create new base64 images** (S3 only)
4. ✅ **Show proper error messages** if upload fails
5. ✅ **Delete S3 images** when removed

## Current Status

- ✅ Frontend updated to use backend S3 service
- ✅ Base64 fallback removed for new uploads
- ✅ Existing base64 images still display
- ⏳ Backend API endpoints need implementation

## Testing

After implementing the backend:

1. **Upload new image** → Should go to S3
2. **View existing base64 images** → Should display normally
3. **Delete S3 image** → Should remove from S3
4. **Upload failure** → Should show error (no base64 fallback)

This ensures no new base64 images are created while maintaining compatibility with existing ones!
