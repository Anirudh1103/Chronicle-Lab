import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('KeepMeSecret@04', 10);

  // 1. Create Admin User
  const anirudh = await prisma.user.upsert({
    where: { email: 'cmanirudh03@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Anirudh CM'
    },
    create: {
      email: 'cmanirudh03@gmail.com',
      password: hashedPassword,
      name: 'Anirudh CM',
      role: 'ADMIN',
    },
  });

  console.log('Admin user verified:', anirudh.email);

  // 2. Create Initial Categories
  const categories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'History', slug: 'history' },
    { name: 'CyberSecurity', slug: 'cybersecurity' },
    { name: 'Military', slug: 'military' },
    { name: 'Intelligence', slug: 'intelligence' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  // 3. Clean up any existing data (Optional, be careful with production)
  // await prisma.block.deleteMany({});
  // await prisma.post.deleteMany({});
  // await prisma.quote.deleteMany({});

  // 4. Add your previous quotes
  const quotes = [
    { text: "Sura so pehchaniye, jo lade deen ke hait, purja purja kat mare, kab hu na chhadai kheit", author: "Bhagat Kabir Ji", category: "Indian Army" },
    { text: "Freedom is a boon, which everyone has the right to receive.", author: "Shri Chhatrapati Shivaji Maharaj", category: "History" },
    { text: "Even if everyone holds a sword, it is willpower that establishes a kingdom.", author: "Shri Chhatrapati Shivaji Maharaj", category: "History" },
    { text: "Self-confidence gives strength, strength gives knowledge, knowledge gives stability, and stability leads to victory.", author: "Shri Chhatrapati Shivaji Maharaj", category: "History" },
    { text: "Creating Swarajya from nothing was difficult; preserving the Swarajya that was built is even more difficult.", author: "Shri Chhatrapati Sambhaji Mahraj", category: "History" },
    { text: "Those who bow only before their motherland never have to bow before anyone else.", author: "Shri Chhatrapati Sambhaji Mahraj", category: "History" },
    { text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.", author: "Field Marshal SHFJ Manekshaw", category: "Indian Army" },
    { text: "Professional knowledge and professional competence are the main attributes of leadership.", author: "Field Marshal SHFJ Manekshaw", category: "Indian Army" },
    { text: "A \"Yes man\" is a dangerous man. He is a menace... he can never become a leader nor can he ever be respected.", author: "Field Marshal SHFJ Manekshaw", category: "Indian Army" },
    { text: "Yeh Dil Maange More!", author: "Captain Vikram Batra", category: "Indian Army" },
    { text: "Either I will come back after hoisting the Tricolour, or I will come back wrapped in it.", author: "Captain Vikram Batra", category: "Indian Army" },
    { text: "A soldier is a soldier, he doesn't belong to any state or any religion.", author: "Field Marshal K. M. Cariappa", category: "Indian Army" },
    { text: "A soldier should be above politics. He is there to defend the country.", author: "Field Marshal K. M. Cariappa", category: "Indian Army" },
    { text: "I shall not withdraw an inch but will fight to our last man and our last round.", author: "Major Shaitan Singh", category: "Indian Army" },
    { text: "Tell the world that Shaitan Singh did his duty.", author: "Major Shaitan Singh", category: "Indian Army" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Tech" },
    { text: "Technology is best when it brings people together.", author: "Matt Mullenweg", category: "Tech" },
    { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "Finance" },
    { text: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.", author: "Warren Buffett", category: "Finance" }
  ];

  for (const q of quotes) {
    await prisma.quote.create({
      data: q
    });
  }

  console.log('Seed completed successfully. Admin created and quotes ported.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
