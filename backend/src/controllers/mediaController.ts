import { Request, Response } from 'express';
import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';

// In-Memory Cache Stores (0ms Stale-While-Revalidate)
let foldersCache: { data: any; timestamp: number } | null = null;
const mediaCache = new Map<string, { data: any; timestamp: number }>();
const MEDIA_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const clearMediaCaches = () => {
  foldersCache = null;
  mediaCache.clear();
};

async function computeFoldersData() {
  return await prisma.folder.findMany({
    include: {
      _count: {
        select: { media: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

async function computeMediaData(folderIdQuery?: any) {
  const whereCondition: any = {};
  if (folderIdQuery === 'null' || folderIdQuery === 'root') {
    whereCondition.folderId = null;
  } else if (folderIdQuery && typeof folderIdQuery === 'string') {
    whereCondition.folderId = folderIdQuery;
  }

  return await prisma.media.findMany({
    where: whereCondition,
    include: { folder: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Background pre-warm on module load
setImmediate(async () => {
  try {
    const [fData, mData] = await Promise.all([
      computeFoldersData(),
      computeMediaData()
    ]);
    foldersCache = { data: fData, timestamp: Date.now() };
    mediaCache.set('all', { data: mData, timestamp: Date.now() });
  } catch (err) {
    // Ignore pre-warm errors
  }
});

/**
 * Controller: Handles single OR multiple image uploads into Media Library.
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const files: Express.Multer.File[] = [];
    if (req.file) {
      files.push(req.file);
    } else if (req.files && Array.isArray(req.files)) {
      files.push(...(req.files as Express.Multer.File[]));
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach(fArr => {
        if (Array.isArray(fArr)) files.push(...fArr);
      });
    }

    if (files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const { folderId } = req.body;
    const createdAssets = [];

    for (const file of files) {
      if (!file.buffer) continue;

      const optimized = await ImageService.optimizeImage(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const storedPath = await StorageService.uploadFile(
        optimized.buffer,
        optimized.filename,
        optimized.mimetype
      );

      const media = await prisma.media.create({
        data: {
          filename: file.originalname,
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
        include: { folder: true }
      });

      createdAssets.push(media);
    }

    // Clear caches so new uploads appear immediately
    clearMediaCaches();
    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
      mediaCache.set('all', { data: await computeMediaData(), timestamp: Date.now() });
    });

    res.status(201).json(createdAssets.length === 1 ? createdAssets[0] : createdAssets);
  } catch (error) {
    console.error('[MediaController] Upload processing error:', error);
    res.status(500).json({
      message: 'Image optimization or upload failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Controller: Retrieves all media assets (Stale-While-Revalidate: 0ms response time).
 */
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.query;
    const cacheKey = typeof folderId === 'string' ? folderId : 'all';
    const now = Date.now();

    const cached = mediaCache.get(cacheKey);
    if (cached) {
      res.json(cached.data);
      if (now - cached.timestamp > MEDIA_CACHE_TTL) {
        setImmediate(async () => {
          const fresh = await computeMediaData(folderId);
          mediaCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
        });
      }
      return;
    }

    const data = await computeMediaData(folderId);
    mediaCache.set(cacheKey, { data, timestamp: now });
    res.json(data);
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

    clearMediaCaches();
    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
    });

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[MediaController] Delete media error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

/**
 * Controller: Retrieve all folders (Stale-While-Revalidate: 0ms response time).
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (foldersCache) {
      res.json(foldersCache.data);
      if (now - foldersCache.timestamp > MEDIA_CACHE_TTL) {
        setImmediate(async () => {
          foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
        });
      }
      return;
    }

    const data = await computeFoldersData();
    foldersCache = { data, timestamp: now };
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media folders' });
  }
};

/**
 * Controller: Create a new media folder (Optimistic In-Memory Update).
 */
export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (foldersCache && Array.isArray(foldersCache.data)) {
      const existsInCache = foldersCache.data.some(
        (f: any) => f.name.toLowerCase() === trimmedName.toLowerCase() || f.slug === slug
      );
      if (existsInCache) {
        return res.status(400).json({ message: 'A folder with this name already exists' });
      }
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

    if (foldersCache && Array.isArray(foldersCache.data)) {
      foldersCache.data = [...foldersCache.data, folder];
    } else {
      foldersCache = { data: [folder], timestamp: Date.now() };
    }

    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('[MediaController] Create folder error:', error);
    res.status(500).json({ message: 'Failed to create folder' });
  }
};

/**
 * Controller: Delete a media folder (Optimistic In-Memory Update).
 */
export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.media.updateMany({
      where: { folderId: id },
      data: { folderId: null }
    });

    await prisma.folder.delete({ where: { id } });

    if (foldersCache && Array.isArray(foldersCache.data)) {
      foldersCache.data = foldersCache.data.filter((f: any) => f.id !== id);
    }
    clearMediaCaches();

    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
    });

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

    clearMediaCaches();
    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
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

    clearMediaCaches();
    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
    });

    res.json({ message: `Successfully copied ${sources.length} assets` });
  } catch (error) {
    console.error('[MediaController] Copy media error:', error);
    res.status(500).json({ message: 'Failed to copy media assets' });
  }
};
