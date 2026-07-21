import prisma from './config/db';
import fs from 'fs';
import path from 'path';

async function auditMedia() {
  console.log('=== 1. FETCHING ALL POSTS & BLOCKS FROM DATABASE ===');
  const posts = await prisma.post.findMany({
    include: { blocks: true }
  });

  const usedFilenames = new Set<string>();

  const extractFilename = (urlStr: string | null | undefined): string | null => {
    if (!urlStr) return null;
    let filename = urlStr;
    if (filename.includes('/uploads/')) {
      filename = filename.split('/uploads/').pop() || filename;
    }
    if (filename.includes('/')) {
      filename = filename.split('/').pop() || filename;
    }
    // Remove query params if any
    filename = filename.split('?')[0];
    return filename;
  };

  posts.forEach((post) => {
    console.log(`\nPost: "${post.title}" (ID: ${post.id})`);
    
    // Check cover image
    const coverFn = extractFilename(post.coverImage);
    if (coverFn) {
      console.log(`  Cover Image: ${coverFn}`);
      usedFilenames.add(coverFn);
    }
    
    // Check ogImage and twitterImage
    const ogFn = extractFilename(post.ogImage);
    if (ogFn) usedFilenames.add(ogFn);
    const twFn = extractFilename(post.twitterImage);
    if (twFn) usedFilenames.add(twFn);

    // Check blocks
    post.blocks.forEach((block) => {
      if (block.type === 'image') {
        try {
          const parsed = JSON.parse(block.content);
          const blockUrl = parsed.url || parsed.src || parsed.path;
          const blockFn = extractFilename(blockUrl);
          if (blockFn) {
            console.log(`  Block Image (type=${block.type}): ${blockFn}`);
            usedFilenames.add(blockFn);
          }
        } catch {
          const blockFn = extractFilename(block.content);
          if (blockFn) {
            console.log(`  Block Raw Content Image: ${blockFn}`);
            usedFilenames.add(blockFn);
          }
        }
      }
    });
  });

  console.log(`\nTOTAL USED IMAGE FILENAMES IN BLOG POSTS: ${usedFilenames.size}`);
  console.log(Array.from(usedFilenames));

  console.log('\n=== 2. FETCHING MEDIA TABLE RECORDS ===');
  const mediaRecords = await prisma.media.findMany();
  console.log(`Total Media DB Records: ${mediaRecords.length}`);

  const unusedMediaRecords: typeof mediaRecords = [];
  mediaRecords.forEach((m) => {
    const fn = extractFilename(m.path) || extractFilename(m.filename);
    if (!fn || !usedFilenames.has(fn)) {
      unusedMediaRecords.push(m);
    }
  });

  console.log(`Unused Media Records in DB: ${unusedMediaRecords.length}`);
  unusedMediaRecords.forEach((m) => {
    console.log(`  - DB ID: ${m.id} | filename: ${m.filename} | path: ${m.path}`);
  });

  console.log('\n=== 3. INSPECTING BACKEND/UPLOADS FOLDER ===');
  const uploadsDir = path.join(__dirname, '../uploads');
  const diskFiles = fs.readdirSync(uploadsDir);
  console.log(`Total files in backend/uploads: ${diskFiles.length}`);

  const unusedDiskFiles: string[] = [];
  diskFiles.forEach((f) => {
    // Skip scripts or .ts files if any
    if (f.endsWith('.ts')) return;
    
    let isUsed = false;
    usedFilenames.forEach((usedFn) => {
      if (f === usedFn || f.toLowerCase().includes(usedFn.toLowerCase()) || usedFn.toLowerCase().includes(f.toLowerCase())) {
        isUsed = true;
      }
    });

    if (!isUsed) {
      unusedDiskFiles.push(f);
    }
  });

  console.log(`Unused Files on Disk: ${unusedDiskFiles.length}`);
  unusedDiskFiles.forEach((f) => {
    const fullPath = path.join(uploadsDir, f);
    const stats = fs.statSync(fullPath);
    console.log(`  - File: ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  });

  return {
    usedFilenames: Array.from(usedFilenames),
    unusedMediaRecords,
    unusedDiskFiles
  };
}

auditMedia().then((res) => {
  console.log('\nAudit complete.');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
