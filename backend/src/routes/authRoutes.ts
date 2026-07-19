import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  subscribe, 
  submitFeedback,
  verifyMfaLogin,
  setupMfa,
  enableMfa,
  disableMfa,
  getSecurityLogs,
  getFeedback,
  updatePassword
} from '../controllers/authController';
import { protect, admin } from '../security/middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/subscribe', subscribe);
router.post('/feedback', submitFeedback);
router.get('/feedback', protect, admin, getFeedback);
router.post('/update-password', protect, updatePassword);

// MFA second factor routes
router.post('/mfa/verify', verifyMfaLogin);
router.post('/mfa/setup', protect, setupMfa);
router.post('/mfa/enable', protect, enableMfa);
router.post('/mfa/disable', protect, disableMfa);

// Security audit logging routes
router.get('/logs', protect, admin, getSecurityLogs);

export default router;
