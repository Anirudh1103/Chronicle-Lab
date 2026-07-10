import { Request, Response } from 'express';
import { PostService, PostInput } from '../services/post.service';

export const createPost = async (req: Request, res: Response) => {
  try {
    const postData: PostInput = req.body;
    const post = await PostService.createPost(postData);
    res.status(201).json(post);
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postData: PostInput = req.body;
    const post = await PostService.updatePost(id, postData);
    res.json(post);
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await PostService.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await PostService.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostService.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const searchPosts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (typeof q !== 'string') return res.json([]);
    const posts = await PostService.searchPosts(q);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search posts' });
  }
};

export const reactToPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    if (!['Historic', 'Brilliant', 'Insightful'].includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    const post = await PostService.reactToPost(id, type);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to react to post' });
  }
};
