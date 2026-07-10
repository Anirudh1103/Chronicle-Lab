import { Router } from 'express';
import { register, login, logout, getMe, subscribe, submitFeedback } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/subscribe', subscribe);
router.post('/feedback', submitFeedback);

export default router;
