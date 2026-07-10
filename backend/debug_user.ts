import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debug() {
  const email = 'anirudh@chroniclelab.com';
  const password = 'password123';

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('User NOT FOUND');
    return;
  }

  console.log('User found:', user.email);
  console.log('User role:', user.role);
  console.log('Stored Hashed Password:', user.password);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match test:', isMatch);
}

debug().finally(() => prisma.$disconnect());
