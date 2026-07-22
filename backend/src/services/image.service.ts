import sharp, { Metadata, SharpOptions } from 'sharp';

export interface ImageVariant {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

export interface OptimizedImageResult {
  original: ImageVariant;
  large: ImageVariant;
  medium: ImageVariant;
  small: ImageVariant;
  originalFormat: string;
  originalSize: number;
}

export class ImageService {
  private static ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'image/gif',
    'image/heic',
  ]);

  private static ALLOWED_FORMATS = new Set([
    'jpeg',
    'jpg',
    'png',
    'webp',
    'avif',
    'bmp',
    'tiff',
    'gif',
    'heic',
  ]);

  /**
   * Generates 4 scaled WebP variants of the input image.
   * Max resolution: Original (4000px), Large (1600px), Medium (800px), Small (300px).
   *
   * @param inputBuffer - Raw image buffer
   * @param originalFilename - Name of the uploaded file
   * @param mimetype - Input MIME type
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    originalFilename: string,
    mimetype?: string
  ): Promise<OptimizedImageResult> {
    if (!inputBuffer || inputBuffer.length === 0) {
      throw new Error('Uploaded image is empty.');
    }

    // Determine format using sharp metadata
    let metadata: Metadata;
    try {
      metadata = await sharp(inputBuffer).metadata();
    } catch (err) {
      throw new Error('Failed to parse image file. File may be corrupted or in an unsupported format.');
    }

    const detectedFormat = (metadata.format || '').toLowerCase();
    const isMimeAllowed = mimetype ? this.ALLOWED_MIME_TYPES.has(mimetype.toLowerCase()) : false;
    const isFormatAllowed = this.ALLOWED_FORMATS.has(detectedFormat);

    if (!isMimeAllowed && !isFormatAllowed) {
      throw new Error(
        `Unsupported format (${mimetype || detectedFormat}). We support PNG, JPEG, JPG, WEBP, AVIF, BMP, TIFF, GIF, and HEIC.`
      );
    }

    const originalSize = inputBuffer.length;
    const originalFormat = (detectedFormat || mimetype?.split('/')[1] || 'IMAGE').toUpperCase();

    // Helper to generate a scaled variant
    const generateVariant = async (
      maxSize: number,
      quality: number,
      shouldResize: boolean = true,
      firstFrameOnly: boolean = false
    ): Promise<ImageVariant> => {
      const options: SharpOptions = {};
      if (firstFrameOnly && detectedFormat === 'gif') {
        options.page = 0; // Take first frame of GIF
      }

      let pipeline = sharp(inputBuffer, options).rotate(); // Auto-orient EXIF orientation

      if (shouldResize) {
        pipeline = pipeline.resize({
          width: maxSize,
          height: maxSize,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      pipeline = pipeline.webp({
        quality,
        effort: 2,
        smartSubsample: true,
      });

      const buffer = await pipeline.toBuffer();
      const meta = await sharp(buffer).metadata();

      return {
        buffer,
        width: meta.width || (shouldResize ? maxSize : (metadata.width || 0)),
        height: meta.height || (shouldResize ? maxSize : (metadata.height || 0)),
        size: buffer.length,
      };
    };

    // Generate variants concurrently
    const [original, large, medium, small] = await Promise.all([
      generateVariant(0, 88, false, true),   // Original WebP (NO RESIZE, 88% quality)
      generateVariant(1600, 85, true, true), // Large Preview
      generateVariant(800, 82, true, true),  // Medium Thumbnail
      generateVariant(300, 80, true, true),  // Small Thumbnail
    ]);

    return {
      original,
      large,
      medium,
      small,
      originalFormat,
      originalSize,
    };
  }
}
