import prisma from './config/db';

const MAPPINGS: Record<string, string> = {
  '1784032338629-775352657.png': '17_century_map_1784481102730_dbd93e43.webp',
  '1784076555072-210619669.jpg': 'shivneri_fort_1784481103179_02b3733f.webp',
  '1784351696200-120413398.jpg': 'torna_fort_1784481103905_45a7ef13.webp',
  '1784376307166-477408433.jpg': 'raigad_fort_1784481104504_7eb28b84.webp',
  '1784376470909-620174138.jpg': 'pratapgad_1784481105924_cc63ef2a.webp',
  '1784376668580-450669717.jpg': 'lal_mahal_1784481106694_4a9969ef.webp',
  '1784376817056-741442360.jpg': 'agra_fort_1784481107552_bb8bc2d0.webp',
  '1784377032474-126111738.jpg': 'raigat_1784481108306_5586bb57.webp',
  '1784377796063-658854986.jpg': 'sindhudurg_1784481109049_8778504e.webp',
  '1784377903753-88547542.jpg': 'maratha_navy_ships_1784481109481_6221b72a.webp',
  '1784378140725-689784176.jpg': 'shri_chhatrapati_sambhaji_maha_1784481110103_a78393b7.webp',
  '1784378228152-612658290.jpg': 'ref_1784481110874_8e1cf226.webp',
};

async function fix() {
  const posts = await prisma.post.findMany({
    include: { blocks: true }
  });

  for (const post of posts) {
    // 1. Fix Cover Image URL
    let coverImage = post.coverImage;
    if (coverImage) {
      // Extract filename from URL
      const filename = coverImage.split('/uploads/').pop()?.split('/').pop();
      if (filename) {
        coverImage = filename;
      }
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { coverImage }
    });

    // 2. Fix Image Blocks
    for (const block of post.blocks) {
      if (block.type === 'image') {
        let content: any = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
        if (content && content.url) {
          const oldFile = content.url.split('/uploads/').pop()?.split('/').pop();
          if (oldFile && MAPPINGS[oldFile]) {
            content.url = MAPPINGS[oldFile];
            console.log(`Updated block ${block.id}: ${oldFile} -> ${MAPPINGS[oldFile]}`);
            await prisma.block.update({
              where: { id: block.id },
              data: { content: JSON.stringify(content) }
            });
          } else if (oldFile) {
            content.url = oldFile;
            await prisma.block.update({
              where: { id: block.id },
              data: { content: JSON.stringify(content) }
            });
          }
        }
      }
    }
  }

  console.log('Successfully updated post image URLs in database!');
}

fix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
