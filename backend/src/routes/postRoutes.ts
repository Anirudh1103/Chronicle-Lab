import { Router } from 'express';
import { createPost, getPosts, getPostBySlug, getPostById, updatePost, togglePostVisibility, searchPosts, reactToPost, getStats, deletePost, likePost, dislikePost, sharePost, getComments, addComment, getAllComments, deleteComment, toggleCommentVisibility, replyToComment } from '../controllers/postController';
import { protect, admin } from '../security/middleware/auth.middleware';

const router = Router();

router.post('/', protect, admin, createPost);
router.get('/stats', protect, admin, getStats);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, admin, deletePost);
router.patch('/:id/visibility', protect, admin, togglePostVisibility);
router.get('/admin/comments', protect, admin, getAllComments);
router.delete('/admin/comments/:id', protect, admin, deleteComment);
router.patch('/admin/comments/:id/visibility', protect, admin, toggleCommentVisibility);
router.patch('/admin/comments/:id/reply', protect, admin, replyToComment);
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/id/:id', getPostById);
router.get('/:slug', getPostBySlug);
router.post('/:id/react', reactToPost);
router.post('/:id/like', likePost);
router.post('/:id/dislike', dislikePost);
router.post('/:id/share', sharePost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

export default router;
