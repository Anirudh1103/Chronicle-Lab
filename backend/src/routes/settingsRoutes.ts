import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, admin } from '../security/middleware/auth.middleware';

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

function normalizeQuoteText(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

// Admin: Add quote
router.post('/quotes', protect, admin, async (req, res) => {
  try {
    const { text, translation, meaning, author, category } = req.body;
    if (!text || !author) {
      return res.status(400).json({ message: 'Text and author are required.' });
    }

    const normalized = normalizeQuoteText(text);

    // Case-insensitive duplicate check
    const existing = await prisma.quote.findFirst({
      where: {
        text: {
          equals: normalized,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'This quote already exists.' });
    }

    const quote = await prisma.quote.create({
      data: { text: normalized, translation, meaning, author, category }
    });
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quote' });
  }
});

// Admin: Update quote
router.put('/quotes/:id', protect, admin, async (req, res) => {
  try {
    const { text, translation, meaning, author, category } = req.body;
    if (!text || !author) {
      return res.status(400).json({ message: 'Text and author are required.' });
    }

    const normalized = normalizeQuoteText(text);

    // Case-insensitive duplicate check (excluding the current quote)
    const existing = await prisma.quote.findFirst({
      where: {
        text: {
          equals: normalized,
          mode: 'insensitive'
        },
        id: {
          not: req.params.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'This quote already exists.' });
    }

    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: { text: normalized, translation, meaning, author, category }
    });
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quote' });
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
