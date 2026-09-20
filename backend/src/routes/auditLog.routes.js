import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogStats,
  getAuditLogDetails,
  recordManualAuditCheckpoint,
  exportAuditLogs,
} from '../controllers/auditLog.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  auditLogQuerySchema,
  createAuditCheckpointSchema,
} from '../validations/auditLog.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

// Telemetry & compliance statistics
router.get(
  '/stats',
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
  getAuditLogStats
);

// Compliance export (JSON/CSV)
router.get(
  '/export',
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
  exportAuditLogs
);

// Manual compliance checkpoint logging
router.post(
  '/manual-event',
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
  validate(createAuditCheckpointSchema),
  recordManualAuditCheckpoint
);

// List audit logs with pagination and filters
router.get(
  '/',
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
  validate(auditLogQuerySchema, 'query'),
  getAuditLogs
);

// Individual audit log inspection
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.AUDIT_LOG_READ),
  getAuditLogDetails
);

export default router;
