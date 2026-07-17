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

async function ensureGlossaryTerms() {
  for (const item of DEFAULT_GLOSSARY) {
    await prisma.glossaryTerm.upsert({
      where: { term: item.term },
      update: { definition: item.definition, category: item.category },
      create: item,
    });
  }
  console.log('Default glossary terms verified/created successfully.');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  ensureCategories().catch(err => {
    console.error('Error ensuring default categories:', err);
  });
  ensureGlossaryTerms().catch(err => {
    console.error('Error ensuring default glossary terms:', err);
  });
});
