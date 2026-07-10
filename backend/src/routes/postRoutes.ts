import { Router } from 'express';
import { createPost, getPosts, getPostBySlug, getPostById, updatePost, searchPosts, reactToPost } from '../controllers/postController';

const router = Router();

router.post('/', createPost);
router.put('/:id', updatePost);
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/id/:id', getPostById);
router.get('/:slug', getPostBySlug);
router.post('/:id/react', reactToPost);

export default router;
