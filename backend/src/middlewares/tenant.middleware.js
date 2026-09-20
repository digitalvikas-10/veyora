import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';
import { Workspace } from '../models/Workspace.js';
import { runWithTenant } from '../utils/tenantContext.js';

/**
 * Middleware: Require and Validate Multi-Tenant Workspace Context
 *
 * Extracts the requested workspace from headers, cookies, or user profile.
 * Verifies that the authenticated user actually has membership in that tenant workspace.
 * Prevents horizontal cross-tenant privilege escalation and unauthorized access.
 */
export const requireTenant = asyncHandler(async (req, res, next) => {
  // 1. Extract requested workspace ID from prioritized sources
  const workspaceId =
    req.headers['x-workspace-id'] ||
    req.cookies?.activeWorkspaceId ||
    req.params?.workspaceId ||
    req.query?.workspaceId ||
    req.user?.workspaceId;

  if (!workspaceId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Workspace Context Required: Please provide an active workspace ID via X-Workspace-Id header or session'
    );
  }

  // 2. Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid Workspace ID format: '${workspaceId}' is not a valid ObjectId`
    );
  }

  // 3. Authenticated tenant boundary verification
  if (req.user) {
    const isSuperAdmin = req.user.role === USER_ROLES.SUPER_ADMIN;

    if (!isSuperAdmin) {
      // Check if user is the direct workspaceId holder or has it in their workspaces array
      const isDirectMatch = req.user.workspaceId && req.user.workspaceId.toString() === workspaceId.toString();
      const hasMembership =
        req.user.workspaces &&
        req.user.workspaces.some(
          (w) => (w.workspace?._id || w.workspace || '').toString() === workspaceId.toString()
        );

      if (!isDirectMatch && !hasMembership) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Cross-workspace access denied: You cannot access foreign tenant resources',
          [
            {
              attemptedWorkspace: workspaceId,
              userWorkspace: req.user.workspaceId,
              securityPolicy: 'multi_tenant_isolation_boundary',
            },
          ]
        );
      }
    }
  }

  // 4. Fetch and verify workspace exists and is active
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Workspace '${workspaceId}' not found or has been decommissioned`
    );
  }

  if (!workspace.isActive) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      `Workspace '${workspace.name}' is currently suspended or inactive`
    );
  }

  // 5. Attach tenant references to request
  req.workspaceId = workspace._id.toString();
  req.currentWorkspace = workspace;

  // 6. Execute downstream request inside AsyncLocalStorage tenant boundary
  runWithTenant(req.workspaceId, () => {
    next();
  });
});

/**
 * Middleware: Verify Target Document Belongs to Current Tenant Workspace
 *
 * Ensures that a specific MongoDB document being retrieved, modified, or deleted
 * strictly belongs to req.workspaceId.
 *
 * @param {import('mongoose').Model} Model - The Mongoose model to query
 * @param {string} idParam - Request param holding the resource ID (default: 'id')
 * @param {string} resourceName - Human-readable name for errors (default: 'Resource')
 */
export const verifyWorkspaceOwnership = (Model, idParam = 'id', resourceName = 'Resource') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[idParam];
    const targetWorkspaceId = req.workspaceId;

    if (!resourceId) {
      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, `Missing required route param: ${idParam}`));
    }

    if (!targetWorkspaceId) {
      return next(
        new ApiError(HTTP_STATUS.BAD_REQUEST, 'Workspace context is required to verify resource ownership')
      );
    }

    const doc = await Model.findById(resourceId);

    if (!doc) {
      return next(new ApiError(HTTP_STATUS.NOT_FOUND, `${resourceName} not found`));
    }

    // Check workspace tenant association
    if (doc.workspaceId && doc.workspaceId.toString() !== targetWorkspaceId.toString()) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied: ${resourceName} does not belong to your active workspace`,
          [
            {
              resourceId,
              resourceTenant: doc.workspaceId,
              requestTenant: targetWorkspaceId,
            },
          ]
        )
      );
    }

    // Attach pre-fetched document to request for downstream controller performance
    req.targetDocument = doc;
    next();
  });
};
