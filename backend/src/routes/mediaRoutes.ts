import { Router } from 'express';
import { uploadMedia, getAllMedia, deleteMedia } from '../controllers/mediaController';
import { upload } from '../config/multer';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.post('/upload', protect, admin, upload.single('file'), uploadMedia);
router.get('/', protect, admin, getAllMedia);
router.delete('/:id', protect, admin, deleteMedia);

export default router;
