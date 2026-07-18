import { Router } from 'express';
import prisma from '../config/db';
import { protect, admin } from '../security/middleware/auth.middleware';
import { glossaryTermSchema } from '../security/validation/validation.helper';

const router = Router();


/**
 * Public endpoint: Retrieve all dynamic glossary terms sorted alphabetically.
 */
router.get('/', async (req, res) => {
  try {
    const terms = await prisma.glossaryTerm.findMany({
      orderBy: { term: 'asc' }
    });
    res.json(terms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch glossary terms' });
  }
});

function normalizeTerm(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Admin endpoint: Create or update a glossary definition.
 */
router.post('/', protect, admin, async (req, res) => {
  try {
    const { id, term, definition, category } = req.body;

    // Validate core fields
    glossaryTermSchema.parse({ term, definition, category });

    const normalizedTerm = normalizeTerm(term);

    // Case-insensitive duplicate check
    const existing = await prisma.glossaryTerm.findFirst({
      where: {
        term: {
          equals: normalizedTerm,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      if (!id || existing.id !== id) {
        return res.status(400).json({ message: 'This glossary term already exists.' });
      }
    }

    const result = await prisma.glossaryTerm.upsert({
      where: id ? { id } : { term: normalizedTerm },
      update: { term: normalizedTerm, definition, category },
      create: { term: normalizedTerm, definition, category }
    });
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Glossary save error:', error);
    res.status(400).json({ message: 'Invalid glossary term details. Term must be unique.' });
  }
});

/**
 * Admin endpoint: Remove a definition key from the global dictionary.
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await prisma.glossaryTerm.delete({ where: { id: req.params.id } });
    res.json({ message: 'Glossary term deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete glossary term' });
  }
});

export default router;
