import { Router } from 'express';
import {
  getSecurityPosture,
  runSecurityScan,
  applyRemediation,
  rotateKeys,
  updateIpFirewall,
  getSecurityEvents,
} from '../controllers/security.controller.js';
import {
  authenticate,
  requireTenant,
  authorizeRoles,
  sensitiveActionLimiter,
} from '../middlewares/index.js';

const router = Router();

// Retrieve Security Health Scorecard & Posture
router.get('/posture', authenticate, requireTenant, authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), getSecurityPosture);

// Execute Real-Time Vulnerability & Compliance Scan
router.post('/scan', authenticate, requireTenant, authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), sensitiveActionLimiter, runSecurityScan);

// Apply Automated Remediation for Findings (Owner/Admin)
router.post(
  '/remediate',
  authenticate,
  requireTenant,
  authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'),
  sensitiveActionLimiter,
  applyRemediation
);

// Rotate Cryptographic Session Salt & Keys (Owner only)
router.post(
  '/rotate-keys',
  authenticate,
  requireTenant,
  authorizeRoles('OWNER', 'SUPER_ADMIN'),
  sensitiveActionLimiter,
  rotateKeys
);

// Update IP Access Firewall Rules (Owner/Admin)
router.put(
  '/ip-firewall',
  authenticate,
  requireTenant,
  authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'),
  updateIpFirewall
);

// Retrieve Security Incidents & Events Stream
router.get('/events', authenticate, requireTenant, getSecurityEvents);

export default router;
