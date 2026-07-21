import { Router } from 'express';
import {
  uploadMedia,
  getAllMedia,
  deleteMedia,
  getFolders,
  createFolder,
  deleteFolder,
  moveMedia,
  copyMedia
} from '../controllers/mediaController';
import { upload } from '../config/multer';
import { protect, admin } from '../security/middleware/auth.middleware';

const router = Router();

// Folders Management
router.get('/folders', protect, admin, getFolders);
router.post('/folders', protect, admin, createFolder);
router.delete('/folders/:id', protect, admin, deleteFolder);

// Media Operations
router.post('/move', protect, admin, moveMedia);
router.post('/copy', protect, admin, copyMedia);
router.post('/upload', protect, admin, upload.single('file'), uploadMedia);
router.get('/', protect, admin, getAllMedia);
router.delete('/:id', protect, admin, deleteMedia);

export default router;
