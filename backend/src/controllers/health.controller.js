import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getDBStatus, connectDB } from '../config/db.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * @desc Get system health status, DB connectivity, uptime, and platform metadata
 * @route GET /api/v1/health
 * @access Public
 */
export const getHealth = asyncHandler(async (req, res) => {
  const db = getDBStatus();

  const healthData = {
    service: 'VEYORA Core API',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: db.isConnected ? 'connected' : 'pending_configuration',
      host: db.host,
      databaseName: db.name,
      readyState: db.readyState,
      note: db.isConnected
        ? 'MongoDB is healthy and accepting operations'
        : db.error || 'Provide MONGODB_URI in .env to connect live database',
      recommendation: db.recommendation || null,
    },
    modules: {
      workspaces: 'ready',
      authentication: 'ready',
      clients: 'ready',
      projects: 'ready',
      tasks: 'ready',
      proposals: 'ready',
      invoices: 'ready',
      documents: 'ready',
      auditLogs: 'ready',
      notifications: 'ready',
    },
  };

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, 'VEYORA API is online and healthy', healthData));
});

/**
 * @desc Manually re-attempt MongoDB connection on demand
 * @route POST /api/v1/health/reconnect-db
 * @access Public
 */
export const reconnectDatabase = asyncHandler(async (req, res) => {
  const dbResult = await connectDB();
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        dbResult.isConnected ? 'MongoDB connected successfully' : 'Database connection test completed',
        dbResult
      )
    );
});

/**
 * @desc Simple ping-pong endpoint
 * @route GET /api/v1/health/ping
 * @access Public
 */
export const ping = asyncHandler(async (req, res) => {
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, 'pong', { pingTime: Date.now() }));
});
