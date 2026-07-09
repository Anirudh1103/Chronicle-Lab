import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateStats(blocks: any[]) {
  let wordCount = 0;
  blocks.forEach(block => {
    if (block.type === 'paragraph' || block.type === 'heading') {
      const text = block.content.text || '';
      wordCount += text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    }
  });
  const readingTime = Math.ceil(wordCount / 200) || 1;
  return { wordCount, readingTime };
}

async function main() {
  const anirudh = await prisma.user.upsert({
    where: { email: 'anirudh@chroniclelab.com' },
    update: {},
    create: {
      email: 'anirudh@chroniclelab.com',
      password: 'password123',
      name: 'Anirudh CM',
      role: 'ADMIN',
    },
  });

  const tech = await prisma.category.upsert({ where: { slug: 'technology' }, update: {}, create: { name: 'Technology', slug: 'technology' } });
  const history = await prisma.category.upsert({ where: { slug: 'history' }, update: {}, create: { name: 'History', slug: 'history' } });
  const security = await prisma.category.upsert({ where: { slug: 'security' }, update: {}, create: { name: 'Security', slug: 'security' } });

  await prisma.block.deleteMany({});
  await prisma.post.deleteMany({});

  const postTemplates = [
    {
      title: 'Decoding Operation Sindhoor',
      subtitle: 'Inside the Indian Army\'s counter-terror strategy in Kashmir.',
      slug: 'decoding-operation-sindhoor',
      excerpt: 'A deep dive into one of the most successful counter-insurgency operations.',
      status: 'PUBLISHED',
      featured: true,
      categoryId: history.id,
      blocks: [
        { type: 'heading', content: { level: 1, text: 'Operation Sindhoor: A Strategic Masterclass' }, orderIndex: 1 },
        { type: 'paragraph', content: { text: 'In the late 90s, the Indian Army faced a significant challenge in the remote valleys. Operation Sindhoor wasn\'t just about tactical superiority; it was about intelligence and winning the hearts of the locals.' }, orderIndex: 2 },
        { type: 'image', content: { url: 'https://images.unsplash.com/photo-1590001158193-79013018e75e?q=80&w=2070&auto=format&fit=crop', alt: 'Indian Army', caption: 'Forces on the move.', alignment: 'center' }, orderIndex: 3 },
      ]
    },
    {
      title: 'OWASP Top 10 Vulnerabilities: A Modern Guide',
      subtitle: 'Understanding critical web risks in 2024.',
      slug: 'owasp-top-10-2024',
      excerpt: 'Everything a developer needs to know about securing their code.',
      status: 'PUBLISHED',
      featured: true,
      categoryId: security.id,
      blocks: [
        { type: 'heading', content: { level: 1, text: 'Why OWASP Matters' }, orderIndex: 1 },
        { type: 'paragraph', content: { text: 'Security is no longer an afterthought. With the rise of data breaches, understanding the OWASP Top 10 is mandatory for every full-stack engineer.' }, orderIndex: 2 },
        { type: 'code', content: { language: 'sql', filename: 'vulnerable.sql', code: "SELECT * FROM users WHERE id = 'user_input';" }, orderIndex: 3 },
      ]
    },
    {
        title: 'The 1975 Indian Emergency',
        subtitle: '21 Months of Darkness in Indian Democracy.',
        slug: 'indian-emergency-1975',
        excerpt: 'Exploring the political climate and lasting impact of the 1975 Emergency.',
        status: 'PUBLISHED',
        featured: false,
        categoryId: history.id,
        blocks: [
          { type: 'heading', content: { level: 1, text: 'The Midnight Declaration' }, orderIndex: 1 },
          { type: 'paragraph', content: { text: 'On June 25, 1975, the President of India issued a proclamation of internal emergency.' }, orderIndex: 2 },
        ]
      },
      {
        title: 'Mastering the Samsung S9 Ultra Ecosystem',
        subtitle: 'How a tablet became my primary workstation.',
        slug: 'samsung-s9-ultra-review',
        excerpt: 'Deep dive into the productivity features of the S9 Ultra.',
        status: 'PUBLISHED',
        featured: false,
        categoryId: tech.id,
        blocks: [
          { type: 'heading', content: { level: 1, text: 'More than just a Tablet' }, orderIndex: 1 },
          { type: 'paragraph', content: { text: 'With the S9 Ultra, Samsung has bridged the gap between mobile portability and laptop power.' }, orderIndex: 2 },
        ]
      }
  ];

  for (const p of postTemplates) {
    const { blocks, ...postData } = p;
    const { wordCount, readingTime } = calculateStats(blocks);
    await prisma.post.create({
      data: {
        ...postData,
        wordCount,
        readingTime,
        authorId: anirudh.id,
        blocks: {
          create: blocks.map(b => ({
            type: b.type,
            content: JSON.stringify(b.content),
            orderIndex: b.orderIndex
          }))
        }
      }
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
