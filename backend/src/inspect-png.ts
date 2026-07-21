import sharp from 'sharp';
import path from 'path';

async function check() {
  const files = [
    '1783945620926-952919512.png',
    '1783947063812-189845016.png',
    '1783761780353-329751475.png'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '../uploads', f);
    const meta = await sharp(fullPath).metadata();
    console.log(`File: ${f} | width: ${meta.width} | height: ${meta.height} | format: ${meta.format}`);
  }
}

check().then(() => process.exit(0));
