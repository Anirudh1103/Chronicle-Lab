import { Router } from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tagController';
import { protect, admin } from '../security/middleware/auth.middleware';

/**
 * Express router for Tag-related endpoints.
 * Mounts GET /, POST / (admin only), and DELETE /:id (admin only) routes.
 */
const router = Router();

router.get('/', getTags);
router.post('/', protect, admin, createTag);
router.delete('/:id', protect, admin, deleteTag);

export default router;

