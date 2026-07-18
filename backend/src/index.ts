import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import mediaRoutes from './routes/mediaRoutes';
import categoryRoutes from './routes/categoryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import glossaryRoutes from './routes/glossaryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { setSecurityHeaders } from './security/headers/headers.middleware';
import { PrismaClient } from '@prisma/client';

import { DEFAULT_GLOSSARY } from './constants/glossary';

dotenv.config();


const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(setSecurityHeaders);

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.get('/', (req, res) => {
  res.send('Blog API is running');
});

const prisma = new PrismaClient();
async function ensureCategories() {
  const categories = [
    { name: 'History', slug: 'history' },
    { name: 'Technology', slug: 'technology' },
    { name: 'CyberSecurity', slug: 'cybersecurity' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }
  console.log('Default categories verified/created successfully.');
}

async function deduplicateAndSetupIndexes() {
  try {
    // 1. De-duplicate GlossaryTerm
    const glossaryTerms = await prisma.glossaryTerm.findMany();
    const glossarySeen = new Map<string, string>();
    
    for (const gt of glossaryTerms) {
      const normalized = gt.term.trim().replace(/\s+/g, ' ').toLowerCase();
      if (glossarySeen.has(normalized)) {
        const keepId = glossarySeen.get(normalized)!;
        const keepGt = glossaryTerms.find(x => x.id === keepId)!;
        if (gt.definition.length > keepGt.definition.length) {
          await prisma.glossaryTerm.delete({ where: { id: keepId } });
          glossarySeen.set(normalized, gt.id);
          console.log(`De-duplicated Glossary: Removed duplicate for "${gt.term}"`);
        } else {
          await prisma.glossaryTerm.delete({ where: { id: gt.id } });
          console.log(`De-duplicated Glossary: Removed duplicate for "${gt.term}"`);
        }
      } else {
        glossarySeen.set(normalized, gt.id);
      }
    }

    // 2. De-duplicate Quotes
    const quotes = await prisma.quote.findMany();
    const quotesSeen = new Map<string, string>();

    for (const q of quotes) {
      const normalized = q.text.trim().replace(/\s+/g, ' ').toLowerCase();
      if (quotesSeen.has(normalized)) {
        const keepId = quotesSeen.get(normalized)!;
        const keepQ = quotes.find(x => x.id === keepId)!;
        const qScore = (q.meaning?.length || 0) + (q.translation?.length || 0);
        const keepScore = (keepQ.meaning?.length || 0) + (keepQ.translation?.length || 0);
        if (qScore > keepScore) {
          await prisma.quote.delete({ where: { id: keepId } });
          quotesSeen.set(normalized, q.id);
          console.log(`De-duplicated Quote: Kept richer translation/meaning version`);
        } else {
          await prisma.quote.delete({ where: { id: q.id } });
          console.log(`De-duplicated Quote: Removed duplicate version`);
        }
      } else {
        quotesSeen.set(normalized, q.id);
      }
    }

    // 3. Create Case-Insensitive Unique Indexes in PostgreSQL
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS glossary_term_lower_idx ON "GlossaryTerm" (LOWER(TRIM(regexp_replace(term, '\\s+', ' ', 'g'))));
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS quote_text_lower_idx ON "Quote" (LOWER(TRIM(regexp_replace(text, '\\s+', ' ', 'g'))));
    `);
    console.log('PostgreSQL case-insensitive unique indexes verified/created successfully.');
  } catch (err) {
    console.error('Error during deduplicateAndSetupIndexes:', err);
  }
}

async function ensureGlossaryTerms() {
  for (const item of DEFAULT_GLOSSARY) {
    const normalized = item.term.trim().replace(/\s+/g, ' ').toLowerCase();
    const existing = await prisma.glossaryTerm.findFirst({
      where: {
        term: {
          equals: normalized,
          mode: 'insensitive'
        }
      }
    });
    if (existing) {
      await prisma.glossaryTerm.update({
        where: { id: existing.id },
        data: { term: item.term, definition: item.definition, category: item.category }
      });
    } else {
      await prisma.glossaryTerm.create({
        data: item
      });
    }
  }
  console.log('Default glossary terms verified/created successfully.');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  ensureCategories().catch(err => {
    console.error('Error ensuring default categories:', err);
  });
  deduplicateAndSetupIndexes().then(() => {
    ensureGlossaryTerms().catch(err => {
      console.error('Error ensuring default glossary terms:', err);
    });
  });
});
