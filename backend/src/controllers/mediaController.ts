import { Request, Response } from 'express';
import prisma from '../config/db';
import fs from 'fs';
import path from 'path';



export const uploadMedia = async (req: Request, res: Response) => {
  try {
    console.log('Upload Request Received:', { file: req.file?.originalname, size: req.file?.size });
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const media = await prisma.media.create({
      data: {
        filename: req.file.originalname,
        path: req.file.filename, // Store just the generated filename
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({ message: 'Upload failed', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id } });
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};
