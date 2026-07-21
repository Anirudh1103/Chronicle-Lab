import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';
import mediaRoutes from './routes/mediaRoutes';
import categoryRoutes from './routes/categoryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import glossaryRoutes from './routes/glossaryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import securityRoutes from './routes/securityRoutes';

import { setSecurityHeaders } from './security/headers/headers.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Security Configuration
const allowedOrigins = [
  'https://chronicle-lab.netlify.app',
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Policy: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-device-id'],
  })
);

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(setSecurityHeaders);

// Serve uploads folder with direct Supabase fallback & immutable browser caching
app.get('/uploads/:filename', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const filename = req.params.filename;
  const uploadsDir = path.join(__dirname, '../uploads');
  const exactPath = path.join(uploadsDir, filename);

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // 1. If exact file exists on local disk, serve it directly
  if (fs.existsSync(exactPath)) {
    return res.sendFile(exactPath);
  }

  // 2. Direct Redirect to Supabase Storage Public Bucket URL
  const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';
  const publicStorageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filename}`;

  return res.redirect(302, publicStorageUrl);
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  immutable: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/security', securityRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Chronicle Lab Security & Analytics Engine',
    version: '1.0.0',
    status: 'ONLINE'
  });
});

app.listen(PORT, () => {
  console.log(`[ChronicleLab Server] Running on http://localhost:${PORT}`);
});

export default app;
