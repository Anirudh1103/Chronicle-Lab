import { PrismaClient } from '@prisma/client';
import { createProfiledPrismaClient } from '../services/db-profiler';

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export const prisma = createProfiledPrismaClient(basePrisma);

export default prisma as unknown as PrismaClient;
