import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  static async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createCategory(name: string, slug: string) {
    return await prisma.category.create({
      data: { name, slug }
    });
  }

  static async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  }
}
