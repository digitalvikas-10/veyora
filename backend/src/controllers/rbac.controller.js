import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';
import {
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_DEFINITIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  meetsMinimumRole,
} from '../constants/permissions.js';
import { User, Workspace } from '../models/index.js';
import { config } from '../config/env.js';

// Secure cookie helper for demo switching
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: maxAgeMs,
});

/**
 * @desc Get complete Role-Permission Matrix, role metadata, and permission catalog
 * @route GET /api/v1/rbac/matrix
 * @access Public / Authenticated
 */
export const getPermissionMatrix = asyncHandler(async (req, res) => {
  // Group permissions logically by domain
  const permissionCategories = {
    workspace: Object.values(PERMISSIONS).filter((p) => p.startsWith('workspace:')),
    team: Object.values(PERMISSIONS).filter((p) => p.startsWith('team:')),
    client: Object.values(PERMISSIONS).filter((p) => p.startsWith('client:')),
    project: Object.values(PERMISSIONS).filter((p) => p.startsWith('project:')),
    task: Object.values(PERMISSIONS).filter((p) => p.startsWith('task:')),
    proposal: Object.values(PERMISSIONS).filter((p) => p.startsWith('proposal:')),
    invoice: Object.values(PERMISSIONS).filter((p) => p.startsWith('invoice:')),
    document: Object.values(PERMISSIONS).filter((p) => p.startsWith('document:')),
    audit: Object.values(PERMISSIONS).filter((p) => p.startsWith('audit:') || p.startsWith('security:')),
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'RBAC Matrix and metadata retrieved successfully', {
      roles: ROLE_DEFINITIONS,
      hierarchy: ROLE_HIERARCHY,
      permissions: PERMISSIONS,
      categories: permissionCategories,
      rolePermissions: ROLE_PERMISSIONS,
    })
  );
});

/**
 * @desc Get current authenticated user's permissions and effective capability set
 * @route GET /api/v1/rbac/my-permissions
 * @access Protected
 */
export const getMyPermissions = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  const hierarchyLevel = ROLE_HIERARCHY[userRole] || 0;
  const definition = ROLE_DEFINITIONS[userRole] || {
    name: userRole,
    description: 'Custom assigned role',
    scope: 'Workspace',
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Current user permissions retrieved', {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: userRole,
      },
      roleDefinition: definition,
      hierarchyLevel,
      permissionsCount: permissions.length,
      permissions,
    })
  );
});

/**
 * @desc Simulate permission check for any arbitrary role and action
 * @route POST /api/v1/rbac/simulate
 * @access Public
 */
export const simulateAccessCheck = asyncHandler(async (req, res) => {
  const { role, permission, minRole } = req.body;

  if (!role) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Role is required for simulation');
  }

  const roleExists = Object.values(USER_ROLES).includes(role);
  if (!roleExists) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid role '${role}' provided`);
  }

  const result = {
    role,
    permissionChecked: permission || null,
    minRoleChecked: minRole || null,
    hasPermission: permission ? hasPermission(role, permission) : null,
    meetsMinimumRole: minRole ? meetsMinimumRole(role, minRole) : null,
    roleHierarchyLevel: ROLE_HIERARCHY[role] || 0,
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access check simulated successfully', result)
  );
});

/**
 * @desc Probe endpoint: Requires 'owner' or 'superadmin' role
 * @route GET /api/v1/rbac/probes/owner-only
 * @access Protected (Owner, Superadmin)
 */
export const probeOwnerOnly = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You verified Owner-level authorization.', {
      authorizedRole: req.user.role,
      requiredMinLevel: 'owner',
      policy: 'role:owner_or_superadmin',
    })
  );
});

/**
 * @desc Probe endpoint: Requires at least 'admin' hierarchy level
 * @route GET /api/v1/rbac/probes/admin-level
 * @access Protected (Admin, Owner, Superadmin)
 */
export const probeAdminLevel = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You verified Admin hierarchy authorization.', {
      authorizedRole: req.user.role,
      requiredMinLevel: 'admin (weight >= 60)',
      policy: 'hierarchy:admin_minimum',
    })
  );
});

/**
 * @desc Probe endpoint: Requires at least 'member' hierarchy level
 * @route GET /api/v1/rbac/probes/member-level
 * @access Protected (Member, Admin, Owner, Superadmin)
 */
export const probeMemberLevel = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You verified Team Member level authorization.', {
      authorizedRole: req.user.role,
      requiredMinLevel: 'member (weight >= 40)',
      policy: 'hierarchy:member_minimum',
    })
  );
});

/**
 * @desc Probe endpoint: Dedicated client portal role
 * @route GET /api/v1/rbac/probes/client-only
 * @access Protected (Client role exclusively)
 */
export const probeClientOnly = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You verified Client Portal authorization.', {
      authorizedRole: req.user.role,
      policy: 'role:client_exclusive',
    })
  );
});

/**
 * @desc Probe endpoint: Requires granular 'workspace:billing' permission
 * @route POST /api/v1/rbac/probes/billing-action
 * @access Protected (Requires PERMISSIONS.WORKSPACE_BILLING)
 */
export const probeBillingAction = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You possess the WORKSPACE_BILLING permission.', {
      authorizedRole: req.user.role,
      permissionGranted: PERMISSIONS.WORKSPACE_BILLING,
      action: 'Simulated Subscription Plan Upgrade',
    })
  );
});

/**
 * @desc Probe endpoint: Requires granular 'proposal:approve' permission
 * @route POST /api/v1/rbac/probes/proposal-approve
 * @access Protected (Requires PERMISSIONS.PROPOSAL_APPROVE)
 */
export const probeProposalApprove = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Access granted: You possess the PROPOSAL_APPROVE permission.', {
      authorizedRole: req.user.role,
      permissionGranted: PERMISSIONS.PROPOSAL_APPROVE,
      action: 'Simulated Proposal Contract Signature',
    })
  );
});

/**
 * @desc Switch or provision a demo persona user for testing (Owner, Admin, Member, Client, Viewer)
 * @route POST /api/v1/rbac/switch-persona
 * @access Public
 */
export const switchDemoPersona = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;

  if (!targetRole || !Object.values(USER_ROLES).includes(targetRole)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid target role '${targetRole}' provided`);
  }

  // 1. Find or create demo workspace
  let demoWorkspace = await Workspace.findOne({ slug: 'veyora-demo-workspace' });
  if (!demoWorkspace) {
    demoWorkspace = await Workspace.create({
      name: 'Veyora Demo Agency',
      slug: 'veyora-demo-workspace',
      ownerId: '000000000000000000000001',
      plan: 'growth',
    });
  }

  // 2. Demo Persona lookup or bootstrap
  const demoEmail = `demo.${targetRole}@veyora.io`;
  const roleNameMap = {
    [USER_ROLES.SUPER_ADMIN]: 'Vance Administrator',
    [USER_ROLES.OWNER]: 'Olivia Vance (Owner)',
    [USER_ROLES.ADMIN]: 'Arthur Sterling (Admin)',
    [USER_ROLES.MEMBER]: 'Maya Lin (Member)',
    [USER_ROLES.CLIENT]: 'Claire Dupont (Client)',
    [USER_ROLES.VIEWER]: 'Victor Reed (Viewer)',
  };

  let personaUser = await User.findOne({ email: demoEmail });
  if (!personaUser) {
    personaUser = new User({
      name: roleNameMap[targetRole] || `Demo ${targetRole}`,
      email: demoEmail,
      password: 'DemoPassword#2026',
      role: targetRole,
      workspaceId: demoWorkspace._id,
      workspaces: [
        {
          workspace: demoWorkspace._id,
          role: targetRole,
        },
      ],
    });
    await personaUser.save();
  } else {
    // Ensure role matches targetRole
    if (personaUser.role !== targetRole) {
      personaUser.role = targetRole;
    }
    personaUser.workspaceId = demoWorkspace._id;
  }

  // 3. Issue fresh tokens and set cookies
  const accessToken = personaUser.generateAccessToken();
  const refreshToken = personaUser.generateRefreshToken();

  personaUser.refreshToken = refreshToken;
  personaUser.lastLoginAt = new Date();
  await personaUser.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, `Successfully switched session to ${targetRole.toUpperCase()} persona`, {
      user: personaUser.toJSON(),
      workspace: demoWorkspace,
      accessToken,
      role: targetRole,
    })
  );
});
