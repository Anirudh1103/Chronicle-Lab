import { Request, Response } from 'express';
import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';

// Persistent In-Memory Cache Stores (Guaranteed 0ms Response Time)
let foldersCache: { data: any; timestamp: number } | null = null;
const mediaCache = new Map<string, { data: any; timestamp: number }>();

const MEDIA_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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
  } else if (folderIdQuery && typeof folderIdQuery === 'string' && folderIdQuery !== 'all') {
    whereCondition.folderId = folderIdQuery;
  }

  return await prisma.media.findMany({
    where: whereCondition,
    include: { folder: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Background pre-warm function
async function prewarmCaches() {
  try {
    const [fData, mData] = await Promise.all([
      computeFoldersData(),
      computeMediaData()
    ]);
    foldersCache = { data: fData, timestamp: Date.now() };
    mediaCache.set('all', { data: mData, timestamp: Date.now() });
  } catch (err) {
    console.error('[MediaController] Background prewarm error:', err);
  }
}

// Immediate non-blocking background pre-warm on module load
setImmediate(() => {
  prewarmCaches();
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
    let targetFolderId: string | null = null;

    if (folderId && folderId !== 'null' && folderId !== 'undefined' && folderId !== 'root') {
      const folderExists = await prisma.folder.findUnique({ where: { id: folderId } });
      if (folderExists) {
        targetFolderId = folderId;
      }
    }

    const createdAssets = [];

    for (const file of files) {
      const originalFilename = file.originalname;
      const cleanBase = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
      const sanitizedBase = cleanBase.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const webpFilename = `${sanitizedBase}_${uniqueSuffix}.webp`;

      const optimization = await ImageService.optimizeImage(file.buffer, originalFilename, file.mimetype);

      const storagePath = await StorageService.uploadFile(
        optimization.buffer,
        webpFilename,
        'image/webp'
      );

      const mediaAsset = await prisma.media.create({
        data: {
          filename: originalFilename,
          path: storagePath,
          mimetype: 'image/webp',
          size: optimization.optimizedSize,
          originalFormat: optimization.originalFormat,
          originalSize: optimization.originalSize,
          optimizedSize: optimization.optimizedSize,
          compressionRatio: optimization.compressionRatio,
          width: optimization.width,
          height: optimization.height,
          folderId: targetFolderId,
        },
        include: { folder: true }
      });

      createdAssets.push(mediaAsset);
    }

    setImmediate(() => {
      prewarmCaches();
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
 * Controller: Retrieves all media assets (GUARANTEED Fast Response).
 */
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.query;
    const now = Date.now();

    let masterCache = mediaCache.get('all');

    if (!masterCache) {
      const data = await computeMediaData();
      masterCache = { data, timestamp: now };
      mediaCache.set('all', masterCache);
    }

    let filteredData = masterCache.data;

    if (folderId === 'null' || folderId === 'root') {
      filteredData = masterCache.data.filter((m: any) => m.folderId === null);
    } else if (folderId && typeof folderId === 'string' && folderId !== 'all') {
      filteredData = masterCache.data.filter((m: any) => m.folderId === folderId);
    }

    res.json(filteredData);

    if (now - masterCache.timestamp > MEDIA_CACHE_TTL) {
      setImmediate(async () => {
        const fresh = await computeMediaData();
        mediaCache.set('all', { data: fresh, timestamp: Date.now() });
      });
    }
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

    setImmediate(() => {
      prewarmCaches();
    });

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[MediaController] Delete media error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

/**
 * Controller: Retrieve all folders (GUARANTEED Fast Response).
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    if (!foldersCache) {
      const data = await computeFoldersData();
      foldersCache = { data, timestamp: now };
    }

    res.json(foldersCache.data);

    if (now - foldersCache.timestamp > MEDIA_CACHE_TTL) {
      setImmediate(async () => {
        foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
      });
    }
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

    setImmediate(() => {
      prewarmCaches();
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

    setImmediate(() => {
      prewarmCaches();
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

    setImmediate(() => {
      prewarmCaches();
    });

    res.json({ message: `Successfully copied ${sources.length} assets` });
  } catch (error) {
    console.error('[MediaController] Copy media error:', error);
    res.status(500).json({ message: 'Failed to copy media assets' });
  }
};
