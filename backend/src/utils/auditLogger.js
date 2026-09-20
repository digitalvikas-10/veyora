import { AuditLog } from '../models/AuditLog.js';

/**
 * Record an audit log entry safely without breaking the main request pipeline
 *
 * @param {Object} params
 * @param {string} params.workspaceId - Workspace tenant ID
 * @param {Object} [params.actor] - Current authenticated user
 * @param {string} params.action - Action identifier (e.g. 'client.create', 'invoice.pay')
 * @param {string} params.entityType - Target model/entity type ('Client', 'Project', etc.)
 * @param {string} [params.entityId] - Target ID
 * @param {Object} [params.details] - Additional contextual data or diffs
 * @param {Object} [params.req] - Express request object for IP and user-agent
 */
export const recordAuditLog = async ({
  workspaceId,
  actor,
  action,
  entityType,
  entityId = '',
  details = {},
  req,
}) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
      : '';
    const userAgent = req ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      workspaceId,
      actorId: actor?._id || actor?.id || null,
      actorName: actor?.name || 'System',
      actorEmail: actor?.email || '',
      action,
      entityType,
      entityId: String(entityId),
      details,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to create audit log entry:', err.message);
  }
};
