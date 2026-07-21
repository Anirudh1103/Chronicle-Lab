import prisma from './config/db';

async function fix() {
  const posts = await prisma.post.findMany({ where: { title: { contains: 'Sindhoor' } } });
  for (const post of posts) {
    console.log('Updating post:', post.title);
    await prisma.post.update({
      where: { id: post.id },
      data: {
        coverImage: 'ref_1784481110874_8e1cf226.webp'
      }
    });
  }
  console.log('Cover image updated for Decoding Operation Sindhoor!');
}

fix()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
