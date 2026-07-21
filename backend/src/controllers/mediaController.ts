import { Request, Response } from 'express';
import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';

/**
 * Controller: Handles image uploads into Media Library (with optional folderId).
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const { folderId } = req.body;

    console.log('[MediaController] Processing image upload:', {
      name: req.file.originalname,
      size: req.file.size,
      mime: req.file.mimetype,
      folderId: folderId || 'root'
    });

    // 1. Optimize image in memory (WebP, max 1920x1080, 82% quality)
    const optimized = await ImageService.optimizeImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2. Save optimized WebP to storage
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
        folderId: folderId || null,
      },
      include: {
        folder: true
      }
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
 * Controller: Retrieves all media assets (with optional folderId filtering).
 */
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.query;

    const whereCondition: any = {};
    if (folderId === 'null' || folderId === 'root') {
      whereCondition.folderId = null;
    } else if (folderId && typeof folderId === 'string') {
      whereCondition.folderId = folderId;
    }

    const media = await prisma.media.findMany({
      where: whereCondition,
      include: { folder: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media assets' });
  }
};

/**
 * Controller: Permanently deletes a media asset.
 */
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    await StorageService.deleteFile(media.path);
    await prisma.media.delete({ where: { id } });
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[MediaController] Delete media error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

/**
 * Controller: Retrieve all folders with media counts.
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        _count: {
          select: { media: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media folders' });
  }
};

/**
 * Controller: Create a new media folder.
 */
export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.folder.findFirst({
      where: { OR: [{ name: trimmedName }, { slug }] }
    });

    if (existing) {
      return res.status(400).json({ message: 'A folder with this name already exists' });
    }

    const folder = await prisma.folder.create({
      data: {
        name: trimmedName,
        slug,
        color: color || '#38bdf8'
      },
      include: {
        _count: { select: { media: true } }
      }
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('[MediaController] Create folder error:', error);
    res.status(500).json({ message: 'Failed to create folder' });
  }
};

/**
 * Controller: Delete a media folder (un-assigns media items to root).
 */
export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Set folderId to null for all media in this folder
    await prisma.media.updateMany({
      where: { folderId: id },
      data: { folderId: null }
    });

    await prisma.folder.delete({ where: { id } });
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('[MediaController] Delete folder error:', error);
    res.status(500).json({ message: 'Failed to delete folder' });
  }
};

/**
 * Controller: Move media files into a target folder (or root).
 */
export const moveMedia = async (req: Request, res: Response) => {
  try {
    const { mediaIds, targetFolderId } = req.body;
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ message: 'mediaIds array is required' });
    }

    const destination = targetFolderId === 'root' || !targetFolderId ? null : targetFolderId;

    await prisma.media.updateMany({
      where: { id: { in: mediaIds } },
      data: { folderId: destination }
    });

    res.json({ message: `Successfully moved ${mediaIds.length} assets` });
  } catch (error) {
    console.error('[MediaController] Move media error:', error);
    res.status(500).json({ message: 'Failed to move media assets' });
  }
};

/**
 * Controller: Copy media files into a target folder.
 */
export const copyMedia = async (req: Request, res: Response) => {
  try {
    const { mediaIds, targetFolderId } = req.body;
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ message: 'mediaIds array is required' });
    }

    const destination = targetFolderId === 'root' || !targetFolderId ? null : targetFolderId;

    const sources = await prisma.media.findMany({
      where: { id: { in: mediaIds } }
    });

    for (const src of sources) {
      await prisma.media.create({
        data: {
          filename: `Copy of ${src.filename}`,
          path: src.path,
          mimetype: src.mimetype,
          size: src.size,
          originalFormat: src.originalFormat,
          originalSize: src.originalSize,
          optimizedSize: src.optimizedSize,
          compressionRatio: src.compressionRatio,
          width: src.width,
          height: src.height,
          folderId: destination
        }
      });
    }

    res.json({ message: `Successfully copied ${sources.length} assets` });
  } catch (error) {
    console.error('[MediaController] Copy media error:', error);
    res.status(500).json({ message: 'Failed to copy media assets' });
  }
};
