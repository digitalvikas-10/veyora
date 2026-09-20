/**
 * VEYORA System Constants
 * Centralized enumeration of user roles, resource statuses, and HTTP codes.
 */

export const ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  CLIENT: 'client',
});

// Alias for auth middlewares
export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'superadmin',
  OWNER: 'owner',
  ADMIN: 'admin',
  TEAM_MEMBER: 'member',
  MEMBER: 'member',
  CLIENT: 'client',
  VIEWER: 'viewer',
});

export const CLIENT_STATUS = Object.freeze({
  LEAD: 'lead',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
});

export const PROJECT_STATUS = Object.freeze({
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const PROJECT_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
});

export const TASK_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const PROPOSAL_STATUS = Object.freeze({
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
});

export const INVOICE_STATUS = Object.freeze({
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
});

export const NOTIFICATION_TYPES = Object.freeze({
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  PROJECT_DEADLINE: 'project_deadline',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  INVOICE_PAID: 'invoice_paid',
  DOCUMENT_UPLOADED: 'document_uploaded',
  TEAM_INVITED: 'team_invited',
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});
