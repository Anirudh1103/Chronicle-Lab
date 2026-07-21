import prisma from './config/db';
import fs from 'fs';
import path from 'path';

async function check() {
  const posts = await prisma.post.findMany();
  console.log('=== TOTAL POSTS IN DB:', posts.length);
  for (const p of posts) {
    console.log('\nPost Title:', p.title);
    console.log('  coverImage value in DB:', JSON.stringify(p.coverImage));
    if (p.coverImage) {
      const filename = p.coverImage.split('/uploads/').pop()?.split('/').pop() || p.coverImage;
      const fullPath = path.join(__dirname, '../uploads', filename);
      console.log('  Extracted filename:', filename);
      console.log('  File exists in backend/uploads/?', fs.existsSync(fullPath));
    }
  }

  console.log('\n=== ALL FILES IN BACKEND/UPLOADS ===');
  const uploadFiles = fs.readdirSync(path.join(__dirname, '../uploads'));
  console.log(uploadFiles);
}

check()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
