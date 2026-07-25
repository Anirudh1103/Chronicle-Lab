import prisma from '../config/db';

export class TagService {
  static async getAllTags() {
    return await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createTag(name: string, slug: string) {
    return await prisma.tag.create({
      data: { name, slug }
    });
  }

  static async deleteTag(id: string) {
    return await prisma.tag.delete({
      where: { id }
    });
  }
}
