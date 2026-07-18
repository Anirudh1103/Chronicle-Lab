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

export const togglePostVisibility = async (req: Request, res: Response) => {
  try {
    const post = await PostService.toggleVisibility(req.params.id);
    res.json(post);
  } catch (error) {
    console.error('Toggle Post Visibility Error:', error);
    res.status(500).json({ error: 'Failed to update post visibility' });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const posts = await PostService.getAllPosts(status === 'PUBLISHED');
    res.json(posts);
  } catch (error) {
    console.error('Get Posts Error:', error);
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

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await PostService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await PostService.deletePost(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostService.likePost(id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const dislikePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostService.dislikePost(id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to dislike post' });
  }
};

export const sharePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await PostService.sharePost(id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log share count' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { authorName, authorEmail, content } = req.body;
    if (!authorName || !authorEmail || !content) {
      res.status(400).json({ error: 'Name, email, and content are required' });
      return;
    }
    const comment = await PostService.addComment(postId, authorName, authorEmail, content);
    res.status(211).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit comment' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const comments = await PostService.getComments(postId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await PostService.getAllComments();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments database' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await PostService.deleteComment(id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export const toggleCommentVisibility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await PostService.toggleCommentVisibility(id);
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle comment visibility' });
  }
};

export const replyToComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const comment = await PostService.replyToComment(id, reply);
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reply to comment' });
  }
};
