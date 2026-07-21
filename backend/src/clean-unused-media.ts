import prisma from './config/db';
import fs from 'fs';
import path from 'path';

async function cleanUnusedMedia() {
  console.log('=== STARTING MEDIA CLEANUP ===');

  const unusedMediaIds = [
    'cmrkbc29s0003p3y117qgqocv',
    'cmrkbhnbb0004p3y1af6a3vxc',
    'cmrkmht1i0056p3y17urblvlw',
    'cmrqbkyie00gpjk7el8wqc7ld'
  ];

  console.log(`Deleting ${unusedMediaIds.length} unused Media records from PostgreSQL...`);
  const deleteResult = await prisma.media.deleteMany({
    where: { id: { in: unusedMediaIds } }
  });
  console.log('PostgreSQL Media records deleted:', deleteResult.count);

  const unusedDiskFiles = [
    '1783761780353-329751475.png',
    '1783761838858-434066521.jpg',
    '1783765227193-602993135.jpeg',
    '1783765375558-60928485.jpeg',
    '1783765493857-975880878.png',
    '1783790003283-985513692.jpeg',
    '1783790123762-831173994.jpeg',
    '1783790231699-492817204.png',
    '1783790608300-108818698.jpeg',
    '1783790614391-490786599.jpeg',
    '1783790620671-259700792.jpeg',
    '1783945620926-952919512.png',
    '1783947063812-189845016.png',
    '17th_century_map_1784481102032_003bcbf4.webp',
    'raigad_fort_1784481105103_6a0e0c1d.webp',
    'scsm_1784481101043_0906ecdf.webp',
    'scsm_1784481101626_40498779.webp'
  ];

  console.log(`Deleting ${unusedDiskFiles.length} unused files from backend/uploads...`);
  let deletedCount = 0;
  const uploadsDir = path.join(__dirname, '../uploads');

  for (const file of unusedDiskFiles) {
    const filePath = path.join(uploadsDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`  - Deleted: ${file}`);
    }
  }

  console.log(`Cleanup complete! Successfully deleted ${deletedCount} unreferenced files.`);
}

cleanUnusedMedia()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
