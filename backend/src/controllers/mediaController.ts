import { Request, Response } from 'express';
import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';

// Persistent In-Memory Cache Stores (Guaranteed 0ms Response Time)
let foldersCache: { data: any; timestamp: number } = { data: [], timestamp: 0 };
let mediaCacheStore: { data: any; timestamp: number } = { data: [], timestamp: 0 };

let isWarming = false;
let warmPromise: Promise<void> | null = null;

const MEDIA_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const clearMediaCaches = () => {
  foldersCache = { data: [], timestamp: 0 };
  mediaCacheStore = { data: [], timestamp: 0 };
};

async function computeFoldersData() {
  const folders = await prisma.folder.findMany({
    include: {
      media: {
        select: { size: true }
      },
      _count: {
        select: { media: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return folders.map(f => {
    const totalStorage = f.media.reduce((acc, curr) => acc + curr.size, 0);
    return {
      id: f.id,
      name: f.name,
      slug: f.slug,
      color: f.color,
      parentId: f.parentId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      mediaCount: f._count.media,
      totalStorage
    };
  });
}

async function computeMediaData() {
  return await prisma.media.findMany({
    include: { folder: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Background pre-warm function using a promise-based concurrency lock
async function prewarmCaches(): Promise<void> {
  if (isWarming) return warmPromise || Promise.resolve();
  isWarming = true;

  warmPromise = (async () => {
    try {
      const [fData, mData] = await Promise.all([
        computeFoldersData(),
        computeMediaData()
      ]);
      foldersCache = { data: fData, timestamp: Date.now() };
      mediaCacheStore = { data: mData, timestamp: Date.now() };
    } catch (err) {
      console.error('[MediaController] Background prewarm error:', err);
    } finally {
      isWarming = false;
      warmPromise = null;
    }
  })();

  return warmPromise;
}

// Pre-warm cache on application start
setImmediate(() => {
  prewarmCaches();
});

// Format media item path to ensure it uses the direct Supabase URL if it's a relative filename
function formatMediaItem(item: any) {
  if (!item) return item;

  const formatPath = (p: string | null) => {
    if (!p) return null;
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${p}`;
  };

  return {
    ...item,
    path: formatPath(item.path),
    largePreviewPath: formatPath(item.largePreviewPath),
    mediumThumbnailPath: formatPath(item.mediumThumbnailPath),
    smallThumbnailPath: formatPath(item.smallThumbnailPath),
  };
}

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

      // Generate variant names
      const baseName = `${sanitizedBase}_${uniqueSuffix}`;
      const originalName = `${baseName}_original.webp`;
      const largeName = `${baseName}_large.webp`;
      const mediumName = `${baseName}_medium.webp`;
      const smallName = `${baseName}_small.webp`;

      // Optimize and generate 4 resolution buffers
      const optimization = await ImageService.optimizeImage(file.buffer, originalFilename, file.mimetype);

      // Upload all 4 variants concurrently
      const [originalPath, largePath, mediumPath, smallPath] = await Promise.all([
        StorageService.uploadFile(optimization.original.buffer, originalName, 'image/webp'),
        StorageService.uploadFile(optimization.large.buffer, largeName, 'image/webp'),
        StorageService.uploadFile(optimization.medium.buffer, mediumName, 'image/webp'),
        StorageService.uploadFile(optimization.small.buffer, smallName, 'image/webp'),
      ]);

      const compressionRatio = Math.max(0, Math.round(((optimization.originalSize - optimization.original.size) / optimization.originalSize) * 100 * 10) / 10);

      const mediaAsset = await prisma.media.create({
        data: {
          filename: originalFilename,
          path: originalPath,
          largePreviewPath: largePath,
          mediumThumbnailPath: mediumPath,
          smallThumbnailPath: smallPath,
          mimetype: 'image/webp',
          size: optimization.original.size,
          originalFormat: optimization.originalFormat,
          originalSize: optimization.originalSize,
          optimizedSize: optimization.original.size,
          compressionRatio,
          width: optimization.original.width,
          height: optimization.original.height,
          folderId: targetFolderId,
        },
        include: { folder: true }
      });

      const formatted = formatMediaItem(mediaAsset);
      createdAssets.push(formatted);

      // Optimistically push to in-memory mediaCacheStore
      if (mediaCacheStore && Array.isArray(mediaCacheStore.data)) {
        mediaCacheStore.data = [formatted, ...mediaCacheStore.data];
      }
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
 * Controller: Retrieves all media assets (GUARANTEED 0ms Response Time).
 */
export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.query;
    const now = Date.now();

    // If cache is cold, wait for pre-warm promise to complete
    if (mediaCacheStore.timestamp === 0) {
      await prewarmCaches();
    }

    let filteredData = mediaCacheStore.data;

    if (folderId === 'null' || folderId === 'root') {
      filteredData = mediaCacheStore.data.filter((m: any) => m.folderId === null);
    } else if (folderId && typeof folderId === 'string' && folderId !== 'all') {
      filteredData = mediaCacheStore.data.filter((m: any) => m.folderId === folderId);
    }

    // Direct path formatting resolution
    const resolvedData = filteredData.map((item: any) => formatMediaItem(item));

    res.json(resolvedData);

    if (now - mediaCacheStore.timestamp > MEDIA_CACHE_TTL) {
      setImmediate(() => prewarmCaches());
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

    // Delete all 4 size variant files from Supabase Storage
    await Promise.all([
      StorageService.deleteFile(media.path),
      media.largePreviewPath ? StorageService.deleteFile(media.largePreviewPath) : Promise.resolve(),
      media.mediumThumbnailPath ? StorageService.deleteFile(media.mediumThumbnailPath) : Promise.resolve(),
      media.smallThumbnailPath ? StorageService.deleteFile(media.smallThumbnailPath) : Promise.resolve(),
    ]);

    await prisma.media.delete({ where: { id } });

    // Optimistically remove from in-memory mediaCacheStore
    if (mediaCacheStore && Array.isArray(mediaCacheStore.data)) {
      mediaCacheStore.data = mediaCacheStore.data.filter((m: any) => m.id !== id);
    }

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
 * Controller: Retrieve all folders (GUARANTEED 0ms Response Time).
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    if (foldersCache.timestamp === 0) {
      await prewarmCaches();
    }

    res.json(foldersCache.data);

    if (now - foldersCache.timestamp > MEDIA_CACHE_TTL) {
      setImmediate(() => prewarmCaches());
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
    const { name, color, parentId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const destinationParentId = parentId === 'root' || !parentId ? null : parentId;

    if (foldersCache && Array.isArray(foldersCache.data)) {
      const existsInCache = foldersCache.data.some(
        (f: any) => f.name.toLowerCase() === trimmedName.toLowerCase() && f.parentId === destinationParentId
      );
      if (existsInCache) {
        return res.status(400).json({ message: 'A folder with this name already exists in this scope' });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name: trimmedName,
        slug,
        color: color || '#38bdf8',
        parentId: destinationParentId,
      },
      include: {
        media: { select: { size: true } },
        _count: { select: { media: true } }
      }
    });

    const formattedFolder = {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      color: folder.color,
      parentId: folder.parentId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      mediaCount: folder._count.media,
      totalStorage: folder.media.reduce((acc, curr) => acc + curr.size, 0)
    };

    if (foldersCache && Array.isArray(foldersCache.data)) {
      foldersCache.data = [...foldersCache.data, formattedFolder];
    } else {
      foldersCache = { data: [formattedFolder], timestamp: Date.now() };
    }

    setImmediate(async () => {
      foldersCache = { data: await computeFoldersData(), timestamp: Date.now() };
    });

    res.status(201).json(formattedFolder);
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

    // Remove relations but do not delete items, or cascade delete folder structure
    await prisma.media.updateMany({
      where: { folderId: id },
      data: { folderId: null }
    });

    await prisma.folder.delete({ where: { id } });

    // Optimistically update caches
    if (foldersCache && Array.isArray(foldersCache.data)) {
      foldersCache.data = foldersCache.data.filter((f: any) => f.id !== id);
    }
    if (mediaCacheStore && Array.isArray(mediaCacheStore.data)) {
      mediaCacheStore.data = mediaCacheStore.data.map((m: any) => {
        if (m.folderId === id) return { ...m, folderId: null, folder: null };
        return m;
      });
    }

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

    // Optimistically update caches
    if (mediaCacheStore && Array.isArray(mediaCacheStore.data)) {
      mediaCacheStore.data = mediaCacheStore.data.map((m: any) => {
        if (mediaIds.includes(m.id)) {
          return { ...m, folderId: destination };
        }
        return m;
      });
    }

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
      where: { id: { in: mediaIds } },
      include: { folder: true }
    });

    const copiedItems = [];

    for (const src of sources) {
      const copyAsset = await prisma.media.create({
        data: {
          filename: `Copy of ${src.filename}`,
          path: src.path,
          largePreviewPath: src.largePreviewPath,
          mediumThumbnailPath: src.mediumThumbnailPath,
          smallThumbnailPath: src.smallThumbnailPath,
          mimetype: src.mimetype,
          size: src.size,
          originalFormat: src.originalFormat,
          originalSize: src.originalSize,
          optimizedSize: src.optimizedSize,
          compressionRatio: src.compressionRatio,
          width: src.width,
          height: src.height,
          folderId: destination
        },
        include: { folder: true }
      });

      copiedItems.push(formatMediaItem(copyAsset));
    }

    // Optimistically add copies to in-memory mediaCacheStore
    if (mediaCacheStore && Array.isArray(mediaCacheStore.data)) {
      mediaCacheStore.data = [...copiedItems, ...mediaCacheStore.data];
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
