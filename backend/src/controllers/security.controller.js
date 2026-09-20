import { securityService } from '../services/security.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Controller handling Security Hardening, Vulnerability Auditing, and Perimeter Defense.
 */
export const getSecurityPosture = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;
  const posture = await securityService.getSecurityPosture(workspaceId, req.user);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Security posture scorecard evaluated successfully', posture)
  );
});

export const runSecurityScan = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;
  const scanResults = await securityService.runSecurityScan(workspaceId, req.user);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workspace security scan completed successfully', scanResults)
  );
});

export const applyRemediation = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;
  const { action } = req.body;

  const result = await securityService.applyRemediation(workspaceId, action, req.user, {
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Security remediation applied successfully', result)
  );
});

export const rotateKeys = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;

  const result = await securityService.rotateWorkspaceKeys(workspaceId, req.user, {
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workspace cryptographic credentials rotated successfully', result)
  );
});

export const updateIpFirewall = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;

  const result = await securityService.updateIpFirewall(workspaceId, req.body, req.user, {
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent'],
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'IP Firewall configuration updated successfully', result)
  );
});

export const getSecurityEvents = asyncHandler(async (req, res) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;
  const { limit = 20 } = req.query;

  const events = await securityService.getSecurityEvents(workspaceId, limit);

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Security events retrieved successfully', events)
  );
});
