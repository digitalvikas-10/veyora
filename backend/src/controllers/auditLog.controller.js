import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AuditLog } from '../models/index.js';

/**
 * @desc List audit logs for current workspace with advanced filtering
 * @route GET /api/v1/audit-logs
 * @access Protected (AUDIT_LOG_READ)
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const {
    page = 1,
    limit = 50,
    entityType,
    action,
    actorId,
    search,
    timeframe,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { workspaceId: wsId };

  if (entityType && entityType !== 'all') {
    query.entityType = { $regex: new RegExp(`^${entityType}$`, 'i') };
  }
  if (action && action !== 'all') {
    query.action = { $regex: new RegExp(`^${action}$`, 'i') };
  }
  if (actorId) {
    query.actorId = actorId;
  }

  if (timeframe && timeframe !== 'all') {
    const now = new Date();
    if (timeframe === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.createdAt = { $gte: startOfDay };
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: weekAgo };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: monthAgo };
    }
  }

  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    query.$or = [
      { action: searchRegex },
      { entityType: searchRegex },
      { actorName: searchRegex },
      { actorEmail: searchRegex },
      { entityId: searchRegex },
      { ipAddress: searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Audit logs retrieved successfully', {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    })
  );
});

/**
 * @desc Get audit log compliance telemetry and aggregation KPIs
 * @route GET /api/v1/audit-logs/stats
 * @access Protected (AUDIT_LOG_READ)
 */
export const getAuditLogStats = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;

  const now = new Date();
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalLogs,
    logs24h,
    logs7d,
    entityAggregations,
    actionAggregations,
    uniqueActors,
    distinctEntityTypes,
  ] = await Promise.all([
    AuditLog.countDocuments({ workspaceId: wsId }),
    AuditLog.countDocuments({ workspaceId: wsId, createdAt: { $gte: past24Hours } }),
    AuditLog.countDocuments({ workspaceId: wsId, createdAt: { $gte: past7Days } }),
    AuditLog.aggregate([
      { $match: { workspaceId: wsId } },
      { $group: { _id: '$entityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.aggregate([
      { $match: { workspaceId: wsId } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.distinct('actorEmail', { workspaceId: wsId }),
    AuditLog.distinct('entityType', { workspaceId: wsId }),
  ]);

  // Transform aggregations into map/array
  const entityBreakdown = {};
  entityAggregations.forEach((item) => {
    if (item._id) entityBreakdown[item._id] = item.count;
  });

  const actionBreakdown = {};
  actionAggregations.forEach((item) => {
    if (item._id) actionBreakdown[item._id] = item.count;
  });

  // Calculate high-impact/destructive actions (DELETE, REVOKE, CANCEL)
  const destructiveCount = await AuditLog.countDocuments({
    workspaceId: wsId,
    action: { $regex: /(delete|remove|revoke|cancel|purge|reject)/i },
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Audit log statistics generated', {
      totalLogs,
      logs24h,
      logs7d,
      destructiveCount,
      uniqueActorsCount: uniqueActors.filter(Boolean).length || 1,
      entityTypes: distinctEntityTypes,
      entityBreakdown,
      actionBreakdown,
    })
  );
});

/**
 * @desc Get single audit log entry details
 * @route GET /api/v1/audit-logs/:id
 * @access Protected (AUDIT_LOG_READ)
 */
export const getAuditLogDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const wsId = req.workspaceId;

  const log = await AuditLog.findOne({ _id: id, workspaceId: wsId });
  if (!log) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Audit log entry not found in active workspace');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Audit log entry retrieved', { log })
  );
});

/**
 * @desc Record manual compliance event or security audit checkpoint
 * @route POST /api/v1/audit-logs/manual-event
 * @access Protected (AUDIT_LOG_READ or SECURITY_MANAGE)
 */
export const recordManualAuditCheckpoint = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { action, entityType = 'Security', entityId = '', category = 'compliance', notes, metadata = {} } = req.body;

  const log = await AuditLog.create({
    workspaceId: wsId,
    actorId: req.user?._id || req.user?.id || null,
    actorName: req.user?.name || 'Workspace Auditor',
    actorEmail: req.user?.email || '',
    action: action.toUpperCase(),
    entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
    entityId: entityId || `CHK-${Date.now().toString(36).toUpperCase()}`,
    details: {
      category,
      notes,
      manualCheckpoint: true,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'VEYORA Admin Portal',
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Compliance checkpoint logged to immutable audit trail', { log })
  );
});

/**
 * @desc Export audit log trail in structured JSON or CSV preview format
 * @route GET /api/v1/audit-logs/export
 * @access Protected (AUDIT_LOG_READ)
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { format = 'json', limit = 500 } = req.query;

  const logs = await AuditLog.find({ workspaceId: wsId })
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  if (format === 'csv') {
    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Actor Name', 'Actor Email', 'IP Address'];
    const rows = logs.map((l) => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.entityType.replace(/"/g, '""')}"`,
      `"${(l.entityId || '').replace(/"/g, '""')}"`,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      `"${(l.actorEmail || '').replace(/"/g, '""')}"`,
      `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-trail-export-${Date.now()}.csv`);
    return res.status(HTTP_STATUS.OK).send(csvContent);
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Audit logs exported', {
      exportedAt: new Date().toISOString(),
      count: logs.length,
      logs,
    })
  );
});
