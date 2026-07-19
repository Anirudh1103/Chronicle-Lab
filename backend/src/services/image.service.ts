import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';

export interface OptimizedImageResult {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  originalFormat: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number; // Percentage saved (e.g. 85.5)
  width: number;
  height: number;
}

export class ImageService {
  /**
   * Supported MIME types and image extensions.
   */
  private static ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
  ]);

  /**
   * Validates input image format, resizes to max 1920x1080 bounds (without enlarging),
   * and converts to high-quality WebP (88% quality).
   *
   * @param inputBuffer - Raw uncompressed/compressed image buffer
   * @param originalFilename - Name of the uploaded file for generating WebP names
   * @param mimetype - Input MIME type
   * @returns Optimized image buffer and metadata metrics
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    originalFilename: string,
    mimetype?: string
  ): Promise<OptimizedImageResult> {
    if (!inputBuffer || inputBuffer.length === 0) {
      throw new Error('Invalid or empty image buffer.');
    }

    const metadata = await sharp(inputBuffer).metadata();
    const detectedFormat = (metadata.format || '').toLowerCase();

    // Verify format against allowed MIME types / formats
    const isMimeAllowed = mimetype ? this.ALLOWED_MIME_TYPES.has(mimetype.toLowerCase()) : false;
    const isFormatAllowed = ['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(detectedFormat);

    if (!isMimeAllowed && !isFormatAllowed) {
      throw new Error(
        `Unsupported image format (${mimetype || detectedFormat}). Only JPG, JPEG, PNG, WEBP, and AVIF are allowed.`
      );
    }

    const originalSize = inputBuffer.length;
    const originalFormatStr = (detectedFormat || mimetype?.split('/')[1] || 'IMAGE').toUpperCase();

    // High quality WebP conversion & proportional resize (max 1920x1080, never enlarge)
    const pipeline = sharp(inputBuffer)
      .rotate() // Auto-orient EXIF orientation
      .resize({
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 88,
        effort: 4, // Optimal balance between speed and compression
        smartSubsample: true,
      });

    const optimizedBuffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    const optimizedSize = optimizedBuffer.length;
    
    // Calculate percentage saved: e.g., 4.2MB -> 420KB = 90% saved
    let compressionRatio = 0;
    if (originalSize > 0) {
      const rawSavings = ((originalSize - optimizedSize) / originalSize) * 100;
      compressionRatio = Math.max(0, Math.round(rawSavings * 10) / 10);
    }

    // Generate unique WebP filename: cover_1745678123_a9b8c.webp
    const sanitizeBasename = path
      .parse(originalFilename)
      .name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    const timeHash = Date.now();
    const randomHash = crypto.randomBytes(4).toString('hex');
    const filename = `${sanitizeBasename || 'media'}_${timeHash}_${randomHash}.webp`;

    return {
      buffer: optimizedBuffer,
      filename,
      mimetype: 'image/webp',
      originalFormat: originalFormatStr,
      originalSize,
      optimizedSize,
      compressionRatio,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
    };
  }
}
