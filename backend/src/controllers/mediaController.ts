import { Request, Response } from 'express';
import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';

/**
 * Controller: Handles image uploads from the Admin Panel / Media Library.
 * Automatically validates, converts to WebP, resizes (max 1920x1080), and compresses to 88% quality.
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log('[MediaController] Processing image upload:', {
      name: req.file.originalname,
      size: req.file.size,
      mime: req.file.mimetype,
    });

    // 1. Optimize image in memory (WebP, max 1920x1080, 88% quality)
    const optimized = await ImageService.optimizeImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2. Save optimized WebP to storage (Supabase or local fallback)
    const storedPath = await StorageService.uploadFile(
      optimized.buffer,
      optimized.filename,
      optimized.mimetype
    );

    // 3. Store optimization metrics in Prisma Media table
    const media = await prisma.media.create({
      data: {
        filename: req.file.originalname,
        path: storedPath,
        mimetype: optimized.mimetype,
        size: optimized.optimizedSize,
        originalFormat: optimized.originalFormat,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        compressionRatio: optimized.compressionRatio,
        width: optimized.width,
        height: optimized.height,
      },
    });

    console.log('[MediaController] Image successfully optimized and stored:', {
      id: media.id,
      path: media.path,
      savings: `${media.compressionRatio}%`,
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('[MediaController] Upload processing error:', error);
    res.status(500).json({
      message: 'Image optimization or upload failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Controller: Retrieves all media assets from database sorted by creation date.
 */
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media assets' });
  }
};

/**
 * Controller: Permanently deletes a media asset from storage and database.
 */
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from Supabase Storage and local disk
    await StorageService.deleteFile(media.path);

    // Delete database record
    await prisma.media.delete({ where: { id } });
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[MediaController] Delete media error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};
