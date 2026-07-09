import { Router } from 'express';
import { createPost, getPosts, getPostBySlug } from '../controllers/postController';

const router = Router();

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

export default router;
