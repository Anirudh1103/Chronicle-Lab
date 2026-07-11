import { Router } from 'express';
import { createPost, getPosts, getPostBySlug, getPostById, updatePost, togglePostVisibility, searchPosts, reactToPost, getStats, deletePost } from '../controllers/postController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, admin, createPost);
router.get('/stats', protect, admin, getStats);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, admin, deletePost);
router.patch('/:id/visibility', protect, admin, togglePostVisibility);
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/id/:id', getPostById);
router.get('/:slug', getPostBySlug);
router.post('/:id/react', reactToPost);

export default router;
