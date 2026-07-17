import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect, admin } from '../security/middleware/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, admin, createCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
