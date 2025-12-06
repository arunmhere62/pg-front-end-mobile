/**
 * Image Compression Utility
 * Automatically compresses images to reduce file size before upload
 */

/**
 * Compress image using canvas
 * @param base64Image - Base64 encoded image string
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param maxHeight - Maximum height in pixels (default: 1200)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns Promise<string> - Compressed base64 image
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        console.log('Image compressed:', {
          original: base64Image.length,
          compressed: compressedBase64.length,
          reduction: `${Math.round(((base64Image.length - compressedBase64.length) / base64Image.length) * 100)}%`,
          originalDimensions: `${img.width}x${img.height}`,
          compressedDimensions: `${width}x${height}`,
        });
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Compress image with automatic quality adjustment
 * Keeps reducing quality until file size is acceptable
 * @param base64Image - Base64 encoded image string
 * @param maxSizeMB - Maximum acceptable file size in MB (default: 5)
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param maxHeight - Maximum height in pixels (default: 1200)
 * @returns Promise<string> - Compressed base64 image
 */
export async function compressImageToSize(
  base64Image: string,
  maxSizeMB: number = 5,
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<string> {
  let quality = 0.85;
  let compressed = base64Image;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Estimate size from base64 string
  const estimateSize = (base64: string) => {
    return (base64.replace(/^data:.*,/, '').length * 3) / 4;
  };
  
  // First pass: resize dimensions
  compressed = await compressImage(base64Image, maxWidth, maxHeight, quality);
  
  // Second pass: reduce quality if still too large
  while (estimateSize(compressed) > maxSizeBytes && quality > 0.3) {
    quality -= 0.1;
    console.log(`Reducing quality to ${quality} to meet size requirements...`);
    compressed = await compressImage(base64Image, maxWidth, maxHeight, quality);
  }
  
  const finalSize = estimateSize(compressed);
  console.log('Final compressed image size:', {
    sizeBytes: finalSize,
    sizeMB: (finalSize / (1024 * 1024)).toFixed(2),
    quality: quality,
  });
  
  return compressed;
}
