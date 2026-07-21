import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import prisma from './config/db';

async function convert() {
  const uploadsDir = path.join(__dirname, '../uploads');
  const sourceFile = path.join(uploadsDir, '1783945620926-952919512.png');
  const targetFile = path.join(uploadsDir, 'cover_image_1784490447768_200d98b9.webp');

  console.log('Converting source cover image:', sourceFile);
  await sharp(sourceFile)
    .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 2 })
    .toFile(targetFile);

  console.log('Successfully generated WebP cover image:', targetFile);

  // Update DB coverImage field for Decoding Operation Sindhoor
  const post = await prisma.post.findFirst({ where: { title: { contains: 'Sindhoor' } } });
  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { coverImage: 'cover_image_1784490447768_200d98b9.webp' }
    });
    console.log('Post coverImage updated in database to cover_image_1784490447768_200d98b9.webp!');
  }
}

convert().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
