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
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy: Access Denied'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(setSecurityHeaders);

// Serve uploads folder with immutable 1-year browser caching & fallback protection
app.get('/uploads/:filename', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const filename = req.params.filename;
  const uploadsDir = path.join(__dirname, '../uploads');
  const exactPath = path.join(uploadsDir, filename);

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // 1. If exact file exists on disk, serve it
  if (fs.existsSync(exactPath)) {
    return res.sendFile(exactPath);
  }

  // 2. Look for fuzzy prefix match in uploads directory
  const cleanBasename = filename.split('_')[0].toLowerCase();
  try {
    const files = fs.readdirSync(uploadsDir);
    const match = files.find((f: string) => f.toLowerCase().includes(cleanBasename) && !f.endsWith('.ts'));
    if (match) {
      return res.sendFile(path.join(uploadsDir, match));
    }
  } catch (err) {
    // Ignore read errors
  }

  // 3. Fallback: Serve clean SVG branded cover placeholder image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
    <rect width="1200" height="675" fill="#090d16"/>
    <circle cx="600" cy="337" r="300" fill="#06b6d4" fill-opacity="0.08"/>
    <text x="600" y="320" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="32" font-weight="bold" letter-spacing="4">CHRONICLE.LAB</text>
    <text x="600" y="370" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="18" font-weight="500" letter-spacing="2">CLASSIFIED HISTORICAL ARCHIVE</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.send(svg);
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
