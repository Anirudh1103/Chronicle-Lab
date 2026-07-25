import { Request, Response } from 'express';
import { TagService } from '../services/tag.service';

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await TagService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Get Tags Error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof slug !== 'string' || !slug.trim()) {
      res.status(400).json({ error: 'name and slug are required' });
      return;
    }
    const tag = await TagService.createTag(name, slug);
    res.status(201).json(tag);
  } catch (error: any) {
    console.error('Create Tag Error:', error);
    if (error.code === 'P2002') {
       res.status(400).json({ error: 'Tag name or slug already exists' });
    } else {
       res.status(500).json({ error: 'Failed to create tag' });
    }
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    await TagService.deleteTag(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (error: any) {
    console.error('Delete Tag Error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
