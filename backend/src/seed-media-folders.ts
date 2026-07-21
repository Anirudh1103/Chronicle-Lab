import prisma from './config/db';

async function seedFolders() {
  console.log('=== SEEDING MEDIA FOLDERS ===');

  const folder1 = await prisma.folder.upsert({
    where: { name: 'Shri Chhatrapati Shivaji Maharaj' },
    update: {},
    create: {
      name: 'Shri Chhatrapati Shivaji Maharaj',
      slug: 'shri-chhatrapati-shivaji-maharaj',
      color: '#38bdf8'
    }
  });

  const folder2 = await prisma.folder.upsert({
    where: { name: 'Decoding Operation Sindhoor' },
    update: {},
    create: {
      name: 'Decoding Operation Sindhoor',
      slug: 'decoding-operation-sindhoor',
      color: '#06b6d4'
    }
  });

  console.log('Folders created/verified:');
  console.log(' - Folder 1:', folder1.name, '(ID:', folder1.id, ')');
  console.log(' - Folder 2:', folder2.name, '(ID:', folder2.id, ')');

  // Assign images for Shri Chhatrapati Shivaji Maharaj
  const shivajiMediaResult = await prisma.media.updateMany({
    where: {
      OR: [
        { filename: { contains: 'SCSM' } },
        { path: { contains: 'scsm' } },
        { path: { contains: 'shivneri' } },
        { path: { contains: 'torna' } },
        { path: { contains: 'raigad' } },
        { path: { contains: 'pratapgad' } },
        { path: { contains: 'lal_mahal' } },
        { path: { contains: 'maratha' } },
        { path: { contains: 'agra' } },
        { path: { contains: 'raigat' } },
        { path: { contains: 'sindhudurg' } },
        { path: { contains: 'sambhaji' } },
        { path: { contains: '17_century' } },
        { path: { contains: 'ref_' } }
      ]
    },
    data: {
      folderId: folder1.id
    }
  });
  console.log(`Assigned ${shivajiMediaResult.count} assets to "Shri Chhatrapati Shivaji Maharaj" folder.`);

  // Assign images for Decoding Operation Sindhoor
  const sindhoorMediaResult = await prisma.media.updateMany({
    where: {
      OR: [
        { filename: { contains: 'Cover-Image' } },
        { path: { contains: 'cover_image_' } }
      ]
    },
    data: {
      folderId: folder2.id
    }
  });
  console.log(`Assigned ${sindhoorMediaResult.count} assets to "Decoding Operation Sindhoor" folder.`);
}

seedFolders().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
