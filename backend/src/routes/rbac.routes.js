import { Router } from 'express';
import {
  getPermissionMatrix,
  getMyPermissions,
  simulateAccessCheck,
  probeOwnerOnly,
  probeAdminLevel,
  probeMemberLevel,
  probeClientOnly,
  probeBillingAction,
  probeProposalApprove,
  switchDemoPersona,
} from '../controllers/rbac.controller.js';
import {
  authenticate,
  authorizeRoles,
  authorizePermissions,
  requireMinimumRole,
} from '../middlewares/index.js';
import { USER_ROLES } from '../constants/index.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

// Public Metadata & Inspection
router.get('/matrix', getPermissionMatrix);
router.post('/simulate', simulateAccessCheck);
router.post('/switch-persona', switchDemoPersona);

// Authenticated User Permissions
router.get('/my-permissions', authenticate, getMyPermissions);

// Role-Guarded Diagnostic Probes
router.get(
  '/probes/owner-only',
  authenticate,
  authorizeRoles(USER_ROLES.OWNER, USER_ROLES.SUPER_ADMIN),
  probeOwnerOnly
);

router.get(
  '/probes/admin-level',
  authenticate,
  requireMinimumRole(USER_ROLES.ADMIN),
  probeAdminLevel
);

router.get(
  '/probes/member-level',
  authenticate,
  requireMinimumRole(USER_ROLES.MEMBER),
  probeMemberLevel
);

router.get(
  '/probes/client-only',
  authenticate,
  authorizeRoles(USER_ROLES.CLIENT),
  probeClientOnly
);

router.post(
  '/probes/billing-action',
  authenticate,
  authorizePermissions(PERMISSIONS.WORKSPACE_BILLING),
  probeBillingAction
);

router.post(
  '/probes/proposal-approve',
  authenticate,
  authorizePermissions(PERMISSIONS.PROPOSAL_APPROVE),
  probeProposalApprove
);

export default router;
