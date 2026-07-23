import prisma from '../config/db';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PRIVATE' | 'HIDDEN';

export enum BlockType {
  PART = 'part',
  CHAPTER = 'chapter',
  HEADING = 'heading',
  SUBHEADING = 'subheading',
  PARAGRAPH = 'paragraph',
  IMAGE = 'image',
  GALLERY = 'gallery',
  TABLE = 'table',
  CODE = 'code',
  QUOTE = 'quote',
  TRANSLATION_QUOTE = 'translationQuote',
  DIVIDER = 'divider',
  CALLOUT = 'callout',
  BUTTON = 'button',
  VIDEO = 'video',
  FILE = 'file',
  CHECKLIST = 'checklist',
  TIMELINE = 'timeline',
  PERSONAL_TOUCH = 'personalTouch',
  RELATED_LINKS = 'relatedLinks',
  EMBED = 'embed',
  REFERENCE = 'reference',
  LIST = 'list',
  KEY_INSIGHT = 'keyInsight',
  SUMMARY = 'summary'
}

export interface BlockInput {
  id?: string;
  type: string;
  content: any; // Block specific data
  orderIndex: number;
  parentId?: string | null;
}

const generateId = () => 'cb' + Math.random().toString(36).substr(2, 9);

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface BlockNode {
  id: string;
  type: string;
  content: any;
  orderIndex: number;
  parentId: string | null;
  children: BlockNode[];
}

export function validateAndReindexHierarchy(blocks: BlockInput[]): BlockInput[] {
  // If there are no structural part blocks, treat it as legacy flat post
  const hasParts = blocks.some(b => b.type === BlockType.PART);
  if (!hasParts) {
    return blocks
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((block, idx) => ({
        ...block,
        id: block.id || generateId(),
        orderIndex: idx,
        parentId: null
      }));
  }

  // 1. Graph Validations
  const seenIds = new Set<string>();
  blocks.forEach(b => {
    if (!b.id) {
      throw new Error("Invalid Hierarchy: Block is missing an ID.");
    }
    const id = b.id as string;
    if (seenIds.has(id)) {
      throw new Error(`Invalid Hierarchy: Duplicate block ID detected: '${id}'.`);
    }
    seenIds.add(id);
  });

  const parentMap = new Map<string, string>(); // childId -> parentId
  blocks.forEach(b => {
    if (b.parentId) {
      const id = b.id as string;
      if (!seenIds.has(b.parentId)) {
        throw new Error(`Invalid Hierarchy: Block '${id}' refers to an unknown parent block '${b.parentId}'.`);
      }
      parentMap.set(id, b.parentId);
    }
  });

  // Cycle detection
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const detectCycle = (nodeId: string): boolean => {
    if (recStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    recStack.add(nodeId);
    const parentId = parentMap.get(nodeId);
    if (parentId && detectCycle(parentId)) return true;
    recStack.delete(nodeId);
    return false;
  };

  blocks.forEach(b => {
    visited.clear();
    recStack.clear();
    const id = b.id as string;
    if (detectCycle(id)) {
      throw new Error(`Invalid Hierarchy: A circular reference was detected starting from block '${id}'.`);
    }
  });

  // 2. Build the Node Map
  const nodeMap = new Map<string, BlockNode>();
  blocks.forEach(b => {
    const id = b.id as string;
    nodeMap.set(id, {
      id,
      type: b.type,
      content: b.content,
      orderIndex: b.orderIndex,
      parentId: b.parentId || null,
      children: []
    });
  });

  const rootNodes: BlockNode[] = [];
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);

  sortedNodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // 3. Preorder traversal reindexing
  const resultBlocks: BlockInput[] = [];
  let globalOrderIndex = 0;

  const processNodes = (nodes: BlockNode[], expectedType: string | null, parentNode: BlockNode | null) => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach(node => {
      if (expectedType && node.type !== expectedType) {
        throw new Error(`Invalid Hierarchy: Parent block of type '${parentNode?.type}' cannot contain child block of type '${node.type}'. Expected type: '${expectedType}'.`);
      }
      if (expectedType === null && node.type !== BlockType.PART) {
        throw new Error(`Invalid Hierarchy: Root-level blocks must be of type 'part'. Found block of type '${node.type}'.`);
      }

      let nextExpectedChild: string | null = null;
      if (node.type === BlockType.PART) nextExpectedChild = BlockType.CHAPTER;
      else if (node.type === BlockType.CHAPTER) nextExpectedChild = BlockType.HEADING;
      else if (node.type === BlockType.HEADING) nextExpectedChild = BlockType.SUBHEADING;
      else if (node.type === BlockType.SUBHEADING) {
        node.children.forEach(c => {
          if (c.type === BlockType.PART || c.type === BlockType.CHAPTER || c.type === BlockType.HEADING || c.type === BlockType.SUBHEADING) {
            throw new Error(`Invalid Hierarchy: Subheading block cannot contain nested structural block of type '${c.type}'.`);
          }
        });
      }

      // Generate stable slugs for structural blocks if missing
      if (node.type === BlockType.PART || node.type === BlockType.CHAPTER || node.type === BlockType.HEADING || node.type === BlockType.SUBHEADING) {
        const titleText = node.content.title || node.content.text || '';
        const cleanTitle = titleText.replace(/<[^>]*>/g, '').trim();
        if (cleanTitle && !node.content.slug) {
          node.content.slug = `${node.type}-${generateSlug(cleanTitle)}`;
        }
      }

      const currentOrder = globalOrderIndex++;
      resultBlocks.push({
        id: node.id,
        type: node.type as any,
        content: node.content,
        orderIndex: currentOrder,
        parentId: parentNode ? parentNode.id : null
      });

      if (node.type === BlockType.SUBHEADING) {
        node.children.sort((a, b) => a.orderIndex - b.orderIndex);
        node.children.forEach(child => {
          const childOrder = globalOrderIndex++;
          resultBlocks.push({
            id: child.id,
            type: child.type as any,
            content: child.content,
            orderIndex: childOrder,
            parentId: node.id
          });
        });
      } else if (nextExpectedChild) {
        processNodes(node.children, nextExpectedChild, node);
      }
    });
  };

  processNodes(rootNodes, null, null);

  if (resultBlocks.length !== blocks.length) {
    throw new Error(`Invalid Hierarchy: Emitted ${resultBlocks.length} blocks but received ${blocks.length} blocks. Some blocks may be disconnected or form cycles.`);
  }

  return resultBlocks;
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
  categoryIds?: string[];
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
  if (blocks && Array.isArray(blocks)) {
    blocks.forEach(block => {
      if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'summary') {
        const text = block.content.text || '';
        wordCount += text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
      }
    });
  }
  const readingTime = Math.ceil(wordCount / 200) || 1;
  return { wordCount, readingTime };
}

export class PostService {
  static async createPost(data: PostInput) {
    const { blocks, tagIds, categoryIds, ...postData } = data;
    const validatedBlocks = validateAndReindexHierarchy(blocks);
    const { wordCount, readingTime } = calculateStats(validatedBlocks);
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
          wordCount,
          readingTime,
          tags: tagIds && tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
          categories: categoryIds && categoryIds.length > 0 ? { connect: categoryIds.map(id => ({ id })) } : undefined,
          blocks: {
            create: validatedBlocks.map(block => ({
              id: block.id,
              type: block.type,
              content: JSON.stringify(block.content),
              orderIndex: block.orderIndex,
              parentId: block.parentId || null
            }))
          }
        },
        include: {
          blocks: true,
          tags: true,
          categories: true,
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
    }, { maxWait: 10000, timeout: 25000 });
  }

  static async updatePost(postId: string, data: PostInput) {
    const { blocks, tagIds, categoryIds, ...postData } = data;
    const blocksSupplied = Array.isArray(blocks);
    const validatedBlocks = blocksSupplied ? validateAndReindexHierarchy(blocks) : [];
    
    let statsUpdate = {};
    if (blocksSupplied) {
      const { wordCount, readingTime } = calculateStats(validatedBlocks);
      statsUpdate = { wordCount, readingTime };
    }
    
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
          ...statsUpdate,
          featuredOrder: data.featured ? featuredOrder : null,
          tags: tagIds ? { set: tagIds.map(id => ({ id })) } : undefined,
          categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
        }
      });

      // 2. Handle Blocks safely
      if (blocksSupplied) {
        await tx.block.deleteMany({ where: { postId } });
        if (validatedBlocks.length > 0) {
          await tx.block.createMany({
            data: validatedBlocks.map(block => ({
              id: block.id,
              postId,
              type: block.type,
              content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
              orderIndex: block.orderIndex,
              parentId: block.parentId || null
            }))
          });
        }
      }

      // 3. Create Revision
      const updatedPost = await tx.post.findUnique({
        where: { id: postId },
        include: { blocks: true, tags: true, categories: true }
      });

      await tx.revision.create({
        data: {
          postId,
          snapshot: JSON.stringify(updatedPost)
        }
      });

      return updatedPost;
    }, { maxWait: 10000, timeout: 25000 });
  }

  static async getPostById(id: string) {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        tags: true,
        categories: true,
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
      where: {
        slug,
        OR: [
          { status: 'PUBLISHED' },
          { status: 'published' }
        ]
      },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        tags: true,
        categories: true,
        author: { select: { name: true, email: true } }
      }
    });
  }

  static async getAllPosts(onlyPublished = false) {
    return await prisma.post.findMany({
      where: onlyPublished ? { status: 'PUBLISHED' } : {},
      include: {
        categories: true,
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
        categories: true,
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
