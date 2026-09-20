import { USER_ROLES } from './index.js';

/**
 * Granular System Permissions for VEYORA
 */
export const PERMISSIONS = Object.freeze({
  // Workspace & Billing
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_BILLING: 'workspace:billing',
  WORKSPACE_SETTINGS: 'workspace:settings',

  // Team & Member Management
  TEAM_READ: 'team:read',
  TEAM_INVITE: 'team:invite',
  TEAM_UPDATE_ROLE: 'team:update_role',
  TEAM_REMOVE: 'team:remove',

  // Client Management
  CLIENT_CREATE: 'client:create',
  CLIENT_READ: 'client:read',
  CLIENT_UPDATE: 'client:update',
  CLIENT_DELETE: 'client:delete',

  // Project Management
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ASSIGN: 'project:assign',

  // Task Management
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_LOG_TIME: 'task:log_time',

  // Proposals
  PROPOSAL_CREATE: 'proposal:create',
  PROPOSAL_READ: 'proposal:read',
  PROPOSAL_UPDATE: 'proposal:update',
  PROPOSAL_DELETE: 'proposal:delete',
  PROPOSAL_SEND: 'proposal:send',
  PROPOSAL_APPROVE: 'proposal:approve',

  // Invoices & Payments
  INVOICE_CREATE: 'invoice:create',
  INVOICE_READ: 'invoice:read',
  INVOICE_UPDATE: 'invoice:update',
  INVOICE_DELETE: 'invoice:delete',
  INVOICE_SEND: 'invoice:send',
  INVOICE_PAY: 'invoice:pay',

  // Documents & Assets
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_DELETE: 'document:delete',

  // Audit Logs & Security
  AUDIT_LOG_READ: 'audit:read',
  SECURITY_MANAGE: 'security:manage',
});

/**
 * Role Hierarchy Weights (Higher has broader administrative inheritance)
 */
export const ROLE_HIERARCHY = Object.freeze({
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.OWNER]: 80,
  [USER_ROLES.ADMIN]: 60,
  [USER_ROLES.MEMBER]: 40,
  [USER_ROLES.CLIENT]: 20,
  [USER_ROLES.VIEWER]: 10,
});

/**
 * Role Definitions & Metadata
 */
export const ROLE_DEFINITIONS = Object.freeze({
  [USER_ROLES.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description: 'Full global platform control across all tenant workspaces and system diagnostics.',
    scope: 'Global System',
    badgeColor: 'red',
  },
  [USER_ROLES.OWNER]: {
    name: 'Workspace Owner',
    description: 'Full root authority over tenant workspace, billing subscriptions, and role assignments.',
    scope: 'Workspace Root',
    badgeColor: 'violet',
  },
  [USER_ROLES.ADMIN]: {
    name: 'Operations Manager',
    description: 'Manages team members, clients, projects, tasks, proposals, and invoices without billing deletion.',
    scope: 'Workspace Management',
    badgeColor: 'indigo',
  },
  [USER_ROLES.MEMBER]: {
    name: 'Staff & Team Member',
    description: 'Executes assigned projects and tasks, logs work hours, and accesses shared project files.',
    scope: 'Operational Execution',
    badgeColor: 'blue',
  },
  [USER_ROLES.CLIENT]: {
    name: 'Client Stakeholder',
    description: 'External client portal access: approves proposals, tracks milestones, pays invoices, and comments.',
    scope: 'Dedicated Client Portal',
    badgeColor: 'emerald',
  },
  [USER_ROLES.VIEWER]: {
    name: 'Read-Only Stakeholder',
    description: 'Read-only access to view project deliverables, invoices, and activity feeds.',
    scope: 'Auditor / Viewer',
    badgeColor: 'amber',
  },
});

/**
 * Permission Matrix: Detailed mapping of Roles to Allowed Permissions
 */
export const ROLE_PERMISSIONS = Object.freeze({
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [USER_ROLES.OWNER]: Object.values(PERMISSIONS),

  [USER_ROLES.ADMIN]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.WORKSPACE_SETTINGS,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_INVITE,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_ASSIGN,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_LOG_TIME,
    PERMISSIONS.PROPOSAL_CREATE,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.PROPOSAL_UPDATE,
    PERMISSIONS.PROPOSAL_DELETE,
    PERMISSIONS.PROPOSAL_SEND,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.AUDIT_LOG_READ,
  ],

  [USER_ROLES.MEMBER]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_LOG_TIME,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_DELETE,
  ],

  [USER_ROLES.CLIENT]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.PROPOSAL_APPROVE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_PAY,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_READ,
  ],

  [USER_ROLES.VIEWER]: [
    PERMISSIONS.WORKSPACE_READ,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.PROPOSAL_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DOCUMENT_READ,
  ],
});

/**
 * Checks if a given role possesses a specific permission
 */
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Checks if a given role possesses ALL of the required permissions
 */
export const hasAllPermissions = (role, requiredPermissions = []) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return requiredPermissions.every((p) => permissions.includes(p));
};

/**
 * Checks if a given role possesses AT LEAST ONE of the specified permissions
 */
export const hasAnyPermission = (role, candidatePermissions = []) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return candidatePermissions.some((p) => permissions.includes(p));
};

/**
 * Checks if a user role meets or exceeds a target minimum role hierarchy level
 */
export const meetsMinimumRole = (userRole, targetMinRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetMinRole] || 0;
  return userLevel >= targetLevel;
};
