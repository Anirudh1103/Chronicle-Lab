import { Router } from 'express';
import { protect, admin } from '../security/middleware/auth.middleware';
import {
  getSecurityScore,
  getSessions,
  revokeSession,
  revokeOtherSessions,
  getTrustedDevices,
  trustDevice,
  removeDeviceTrust,
  getAuditLogs,
  getFailedAttempts,
  getSecurityHeadersStatus,
  getDatabaseSecurityStatus,
  getApiConfiguration,
  getSecuritySettings,
  updateSecuritySettings
} from '../controllers/securityController';

const router = Router();

// Apply protect & admin to all security endpoints
router.use(protect, admin);

router.get('/score', getSecurityScore);
router.get('/settings', getSecuritySettings);
router.put('/settings', updateSecuritySettings);
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.delete('/sessions', revokeOtherSessions);

router.get('/devices', getTrustedDevices);
router.post('/devices', trustDevice);
router.delete('/devices/:id', removeDeviceTrust);

router.get('/logs', getAuditLogs);
router.get('/failed-attempts', getFailedAttempts);
router.get('/headers', getSecurityHeadersStatus);
router.get('/database', getDatabaseSecurityStatus);
router.get('/api-config', getApiConfiguration);

export default router;
