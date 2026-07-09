import { Router } from 'express';
import { createPost, getPosts, getPostBySlug, getPostById, updatePost } from '../controllers/postController';

const router = Router();

router.post('/', createPost);
router.put('/:id', updatePost);
router.get('/', getPosts);
router.get('/id/:id', getPostById);
router.get('/:slug', getPostBySlug);

export default router;
