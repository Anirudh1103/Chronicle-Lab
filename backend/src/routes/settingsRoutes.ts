import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all quotes
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quotes' });
  }
});

// Public: Get site config
router.get('/config', async (req, res) => {
  try {
    const config = await prisma.siteConfig.findMany();
    const configMap = config.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(configMap);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch config' });
  }
});

// Admin: Add quote
router.post('/quotes', protect, admin, async (req, res) => {
  try {
    const { text, author, category } = req.body;
    const quote = await prisma.quote.create({
      data: { text, author, category }
    });
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quote' });
  }
});

// Admin: Delete quote
router.delete('/quotes/:id', protect, admin, async (req, res) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quote' });
  }
});

// Admin: Update config
router.post('/config', protect, admin, async (req, res) => {
  try {
    const configs = req.body; // Expecting { key: value, ... }
    for (const [key, value] of Object.entries(configs)) {
      await prisma.siteConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    res.json({ message: 'Config updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update config' });
  }
});

export default router;
