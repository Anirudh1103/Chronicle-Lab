import prisma from './config/db';

async function check() {
  const media = await prisma.media.findMany();
  console.log('=== ALL MEDIA ITEMS IN DATABASE ===');
  for (const m of media) {
    console.log(`Original: ${m.filename} -> Path: ${m.path}`);
  }

  const post = await prisma.post.findFirst({
    where: { title: { contains: 'Sindhoor' } },
    include: { blocks: true }
  });

  console.log('\n=== SINDHOOR POST DETAILS ===');
  console.log('Title:', post?.title);
  console.log('Current CoverImage:', post?.coverImage);
  for (const b of post?.blocks || []) {
    if (b.type === 'image') {
      console.log('  Image Block content:', b.content);
    }
  }
}

check().then(() => process.exit(0));
