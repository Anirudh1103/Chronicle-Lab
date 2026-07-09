import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, slug, content, coverImage, authorId, categoryId, tags } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        subtitle,
        slug,
        content,
        coverImage,
        author: { connect: { id: authorId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        // tags: { connect: tags.map((id: string) => ({ id })) } // Simplified for now
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        category: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};
