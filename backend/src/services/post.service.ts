import prisma from '../config/db';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PRIVATE' | 'HIDDEN';

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
  summary?: string;
  summaryTitle?: string;
  status?: PostStatus;
  featured?: boolean;
  featuredOrder?: number | null;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  authorId: string;
  categoryId?: string;
  tagIds?: string[];
  completionQuote?: string;
  completionQuoteAuthor?: string;

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
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'summary') {
      const text = block.content.text || '';
      wordCount += text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    }
  });
  const readingTime = Math.ceil(wordCount / 200) || 1;
  return { wordCount, readingTime };
}

export class PostService {
  static async createPost(data: PostInput) {
    const { blocks, tagIds, categoryId, ...postData } = data;
    const { wordCount, readingTime } = calculateStats(blocks);
    const featuredOrder = data.featuredOrder ? parseInt(data.featuredOrder as any, 10) : null;

    return await prisma.$transaction(async (tx) => {
      if (data.featured && featuredOrder && featuredOrder >= 1) {
        await tx.post.updateMany({
          where: {
            featured: true,
            featuredOrder: { gte: featuredOrder }
          },
          data: {
            featuredOrder: { increment: 1 }
          }
        });
      }

      // 1. Create Post
      const post = await tx.post.create({
        data: {
          ...postData,
          featuredOrder,
          categoryId: categoryId || null,
          wordCount,
          readingTime,
          tags: tagIds && tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
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
    const { blocks, tagIds, categoryId, ...postData } = data;
    const { wordCount, readingTime } = calculateStats(blocks);
    const featuredOrder = data.featuredOrder ? parseInt(data.featuredOrder as any, 10) : null;

    return await prisma.$transaction(async (tx) => {
      if (data.featured && featuredOrder && featuredOrder >= 1) {
        await tx.post.updateMany({
          where: {
            id: { not: postId },
            featured: true,
            featuredOrder: { gte: featuredOrder }
          },
          data: {
            featuredOrder: { increment: 1 }
          }
        });
      }

      // 1. Update Post Metadata
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          ...postData,
          featuredOrder: data.featured ? featuredOrder : null,
          categoryId: categoryId || null,
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

  static async toggleVisibility(id: string) {
    const post = await prisma.post.findUnique({ where: { id }, select: { status: true } });
    if (!post) throw new Error('Post not found');

    return prisma.post.update({
      where: { id },
      data: { status: post.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN' }
    });
  }

  static async getPostBySlug(slug: string) {
    return await prisma.post.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        tags: true,
        category: true,
        author: { select: { name: true, email: true } }
      }
    });
  }

  static async getAllPosts(onlyPublished = false) {
    return await prisma.post.findMany({
      where: onlyPublished ? { status: 'PUBLISHED' } : {},
      include: {
        category: true,
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getStats() {
    const [totalPosts, totalViews, comments, subscribers] = await Promise.all([
      prisma.post.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.feedback.count(),
      prisma.subscriber.count(),
    ]);

    return [
      { label: 'Total Posts', value: totalPosts.toString(), change: '+0%' },
      { label: 'Total Views', value: (totalViews._sum.views || 0).toString(), change: '+0%' },
      { label: 'Feedback', value: comments.toString(), change: '+0%' },
      { label: 'Subscribers', value: subscribers.toString(), change: '+0%' },
    ];
  }

  static async searchPosts(query: string) {
    return await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { subtitle: { contains: query } },
          { excerpt: { contains: query } },
          { summary: { contains: query } },
          { blocks: { some: { content: { contains: query } } } }
        ],
        status: 'PUBLISHED'
      },
      include: {
        category: true,
        author: { select: { name: true } }
      },
      take: 10
    });
  }

  static async reactToPost(postId: string, type: 'Historic' | 'Brilliant' | 'Insightful') {
    const field = `reaction${type}` as 'reactionHistoric' | 'reactionBrilliant' | 'reactionInsightful';
    return await prisma.post.update({
      where: { id: postId },
      data: {
        [field]: { increment: 1 }
      }
    });
  }

  static async likePost(postId: string) {
    return await prisma.post.update({
      where: { id: postId },
      data: {
        likes: { increment: 1 }
      }
    });
  }

  static async dislikePost(postId: string) {
    return await prisma.post.update({
      where: { id: postId },
      data: {
        dislikes: { increment: 1 }
      }
    });
  }

  static async sharePost(postId: string) {
    return await prisma.post.update({
      where: { id: postId },
      data: {
        shares: { increment: 1 }
      }
    });
  }

  static async deletePost(id: string) {
    return await prisma.post.delete({
      where: { id }
    });
  }

  static async addComment(postId: string, authorName: string, authorEmail: string, content: string) {
    return await prisma.comment.create({
      data: {
        postId,
        authorName,
        authorEmail,
        content
      }
    });
  }

  static async getComments(postId: string) {
    return await prisma.comment.findMany({
      where: { postId, isHidden: false },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAllComments() {
    return await prisma.comment.findMany({
      include: {
        post: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async toggleCommentVisibility(id: string) {
    const comment = await prisma.comment.findUnique({
      where: { id }
    });
    if (!comment) throw new Error('Comment not found');
    return await prisma.comment.update({
      where: { id },
      data: { isHidden: !comment.isHidden }
    });
  }

  static async replyToComment(id: string, reply: string) {
    return await prisma.comment.update({
      where: { id },
      data: { adminReply: reply }
    });
  }

  static async deleteComment(id: string) {
    return await prisma.comment.delete({
      where: { id }
    });
  }
}
