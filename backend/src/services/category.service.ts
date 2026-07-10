import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  static async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }
}
