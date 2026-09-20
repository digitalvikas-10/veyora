import { Router } from 'express';
import {
  getCurrentWorkspace,
  getMyWorkspaces,
  createWorkspace,
  switchWorkspace,
  updateWorkspaceSettings,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  getIsolationDemo,
} from '../controllers/workspace.controller.js';
import {
  authenticate,
  requireTenant,
  authorizeRoles,
} from '../middlewares/index.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

// Public / Diagnostic Isolation Proof
router.get('/probes/isolation-demo', getIsolationDemo);

// Authenticated Workspace Operations
router.use(authenticate);

// Workspace Listing & Context Switching
router.get('/my-workspaces', getMyWorkspaces);
router.post('/', createWorkspace);
router.post('/switch', switchWorkspace);

// Active Workspace Operations (Guarded by requireTenant)
router.get('/current', requireTenant, getCurrentWorkspace);
router.patch(
  '/current',
  requireTenant,
  authorizeRoles(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  updateWorkspaceSettings
);

// Workspace Members Management
router.get('/members', requireTenant, getWorkspaceMembers);
router.post(
  '/members/invite',
  requireTenant,
  authorizeRoles(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  inviteWorkspaceMember
);

export default router;
