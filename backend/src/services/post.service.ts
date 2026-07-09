import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PRIVATE';

export interface BlockInput {
  id?: string;
  type: string;
  content: any; // Block specific data
  orderIndex: number;
}

export interface PostInput {
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  status?: PostStatus;
  featured?: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  authorId: string;
  categoryId?: string;
  tagIds?: string[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterImage?: string;
  schemaType?: string;
  robotsIndex?: boolean;

  blocks: BlockInput[];
}

function calculateStats(blocks: BlockInput[]) {
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

export class PostService {
  static async createPost(data: PostInput) {
    const { blocks, tagIds, ...postData } = data;
    const { wordCount, readingTime } = calculateStats(blocks);

    return await prisma.$transaction(async (tx) => {
      // 1. Create Post
      const post = await tx.post.create({
        data: {
          ...postData,
          wordCount,
          readingTime,
          tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined,
          blocks: {
            create: blocks.map(block => ({
              type: block.type,
              content: JSON.stringify(block.content),
              orderIndex: block.orderIndex,
            }))
          }
        },
        include: {
          blocks: true,
          tags: true,
          category: true,
          author: true
        }
      });

      // 2. Create Initial Revision
      await tx.revision.create({
        data: {
          postId: post.id,
          snapshot: JSON.stringify(post)
        }
      });

      return post;
    });
  }

  static async updatePost(postId: string, data: PostInput) {
    const { blocks, tagIds, ...postData } = data;
    const { wordCount, readingTime } = calculateStats(blocks);

    return await prisma.$transaction(async (tx) => {
      // 1. Update Post Metadata
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          ...postData,
          wordCount,
          readingTime,
          tags: tagIds ? { set: tagIds.map(id => ({ id })) } : undefined,
        }
      });

      // 2. Handle Blocks
      // For simplicity in this phase, we'll delete existing blocks and recreate them.
      // In a more optimized version, we would upsert and delete only the removed ones.
      await tx.block.deleteMany({ where: { postId } });

      if (blocks && blocks.length > 0) {
        await tx.block.createMany({
          data: blocks.map(block => ({
            postId,
            type: block.type,
            content: JSON.stringify(block.content),
            orderIndex: block.orderIndex,
          }))
        });
      }

      // 3. Create Revision
      const updatedPost = await tx.post.findUnique({
        where: { id: postId },
        include: { blocks: true, tags: true, category: true }
      });

      await tx.revision.create({
        data: {
          postId,
          snapshot: JSON.stringify(updatedPost)
        }
      });

      return updatedPost;
    });
  }

  static async getPostById(id: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        tags: true,
        category: true,
        author: { select: { name: true, email: true } }
      }
    });
  }

  static async getPostBySlug(slug: string) {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        tags: true,
        category: true,
        author: { select: { name: true, email: true } }
      }
    });
  }

  static async getAllPosts() {
    return await prisma.post.findMany({
      include: {
        category: true,
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
