import prisma from '../config/db';
import { ImageService } from '../services/image.service';
import { StorageService } from '../services/storage.service';
import fs from 'fs';
import path from 'path';

/**
 * Migration Script: Scans all existing Media records, Post cover/social images,
 * and Block contents to convert raw legacy images into WebP format.
 * Updates all database references and safely purges original files.
 */
async function runMigration() {
  console.log('====================================================');
  console.log('Chronicle Lab - Resumable WebP Image Migration Utility');
  console.log('====================================================\n');

  const uploadDir = path.join(process.cwd(), 'uploads');
  const mediaRecords = await prisma.media.findMany();
  console.log(`[Migration] Found ${mediaRecords.length} Media records in database.`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let totalBytesSaved = 0;

  for (const media of mediaRecords) {
    const filename = media.path;
    
    // Skip if already in WebP format
    if (filename.toLowerCase().endsWith('.webp')) {
      console.log(`[Skip] Already WebP: ${filename}`);
      totalSkipped++;
      continue;
    }

    console.log(`\n[Processing] Migrating legacy image: ${filename}`);
    let inputBuffer: Buffer | null = null;
    const localPath = path.join(uploadDir, filename);

    try {
      if (fs.existsSync(localPath)) {
        inputBuffer = await fs.promises.readFile(localPath);
      } else if (filename.startsWith('http://') || filename.startsWith('https://')) {
        const response = await fetch(filename);
        if (response.ok) {
          const arrayBuf = await response.arrayBuffer();
          inputBuffer = Buffer.from(arrayBuf);
        }
      }

      if (!inputBuffer || inputBuffer.length === 0) {
        console.warn(`[Warning] Could not locate source image file for: ${filename}. Skipping.`);
        totalErrors++;
        continue;
      }

      // 1. Convert to optimized WebP
      const optimized = await ImageService.optimizeImage(inputBuffer, media.filename, media.mimetype);

      // Generate unique filenames for each size variant
      const sanitizeBasename = path
        .parse(media.filename)
        .name.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 30);
      const timeHash = Date.now();
      const baseName = `${sanitizeBasename || 'media'}_${timeHash}`;
      const originalName = `${baseName}_original.webp`;
      const largeName = `${baseName}_large.webp`;
      const mediumName = `${baseName}_medium.webp`;
      const smallName = `${baseName}_small.webp`;

      // 2. Upload WebP variants to storage
      const [originalPath, largePath, mediumPath, smallPath] = await Promise.all([
        StorageService.uploadFile(optimized.original.buffer, originalName, 'image/webp'),
        StorageService.uploadFile(optimized.large.buffer, largeName, 'image/webp'),
        StorageService.uploadFile(optimized.medium.buffer, mediumName, 'image/webp'),
        StorageService.uploadFile(optimized.small.buffer, smallName, 'image/webp'),
      ]);

      const compressionRatio = Math.max(0, Math.round(((optimized.originalSize - optimized.original.size) / optimized.originalSize) * 100 * 10) / 10);

      // 3. Update Media record in database
      await prisma.media.update({
        where: { id: media.id },
        data: {
          path: originalPath,
          largePreviewPath: largePath,
          mediumThumbnailPath: mediumPath,
          smallThumbnailPath: smallPath,
          mimetype: 'image/webp',
          size: optimized.original.size,
          originalFormat: optimized.originalFormat,
          originalSize: optimized.originalSize,
          optimizedSize: optimized.original.size,
          compressionRatio,
          width: optimized.original.width,
          height: optimized.original.height,
        },
      });

      // 4. Update Post references (coverImage, ogImage, twitterImage)
      const oldPathPattern = filename;
      const postsToUpdate = await prisma.post.findMany({
        where: {
          OR: [
            { coverImage: { contains: oldPathPattern } },
            { ogImage: { contains: oldPathPattern } },
            { twitterImage: { contains: oldPathPattern } },
          ],
        },
      });

      for (const post of postsToUpdate) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            coverImage: post.coverImage ? post.coverImage.replace(oldPathPattern, originalPath) : null,
            ogImage: post.ogImage ? post.ogImage.replace(oldPathPattern, originalPath) : null,
            twitterImage: post.twitterImage ? post.twitterImage.replace(oldPathPattern, originalPath) : null,
          },
        });
      }

      // 5. Update Block content references
      const blocksToUpdate = await prisma.block.findMany({
        where: {
          content: { contains: oldPathPattern },
        },
      });

      for (const block of blocksToUpdate) {
        const updatedContent = block.content.replace(new RegExp(oldPathPattern, 'g'), originalPath);
        await prisma.block.update({
          where: { id: block.id },
          data: { content: updatedContent },
        });
      }

      // 6. Delete old legacy file only after successful DB update
      if (fs.existsSync(localPath)) {
        try {
          await fs.promises.unlink(localPath);
          console.log(`[Cleaned] Safely purged old raw file: ${filename}`);
        } catch (e) {
          // Ignore deletion error if already missing
        }
      }

      const bytesSaved = Math.max(0, optimized.originalSize - optimized.original.size);
      totalBytesSaved += bytesSaved;
      totalProcessed++;
      console.log(`[Success] Migrated -> ${originalPath} (Saved ${compressionRatio}%)`);
    } catch (err) {
      console.error(`[Error] Failed to migrate image ${filename}:`, err);
      totalErrors++;
    }
  }

  console.log('\n====================================================');
  console.log('Migration Completed Summary:');
  console.log(`- Total Processed: ${totalProcessed}`);
  console.log(`- Already WebP (Skipped): ${totalSkipped}`);
  console.log(`- Errors: ${totalErrors}`);
  console.log(`- Total Disk Space Saved: ${(totalBytesSaved / (1024 * 1024)).toFixed(2)} MB`);
  console.log('====================================================');
}

runMigration()
  .catch((err) => console.error('[Fatal Error] Migration failed:', err))
  .finally(() => prisma.$disconnect());
