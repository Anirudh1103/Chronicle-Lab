/**
 * Client-Side Image Processing & WebP Conversion Pipeline
 */
export class UploadService {
  /**
   * Resizes and converts a standard image file to an optimized WebP blob client-side.
   * Preserves exact original aspect ratio, capping max resolution at 4000px.
   *
   * @param file - Input browser File object
   * @param quality - Compression quality (0 to 1)
   */
  static async convertToWebP(file: File, quality = 0.88): Promise<Blob> {
    const isWebP = file.type === 'image/webp';
    const isGif = file.type === 'image/gif';
    const isHeic = file.name.toLowerCase().endsWith('.heic');

    // Canvas rendering only supports browser-native formats (not HEIC directly)
    if (isHeic) {
      return file; // Pass HEIC directly to backend processing
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 4000;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Downscale if exceeds 4000px
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context not available');
          }

          ctx.drawImage(img, 0, 0, width, height);

          // WebP canvas encoding
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas WebP encoding failed'));
              }
            },
            'image/webp',
            quality
          );
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image file source into canvas'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}
