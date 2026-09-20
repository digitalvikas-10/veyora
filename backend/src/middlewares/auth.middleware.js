import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';

/**
 * Verifies the user's JWT access token from HTTP-only cookie or Bearer Authorization header.
 * Attaches user payload to req.user: { id, email, role, workspaceId }
 */
export const authenticate = (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only signed/standard cookies
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required: No access token provided in request'
      )
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Access token expired: Please refresh your session',
          [],
          'TOKEN_EXPIRED'
        )
      );
    }
    return next(
      new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid access token: Authorization failed'
      )
    );
  }
};

/**
 * Optional authentication: If token is present and valid, attaches req.user; otherwise proceeds.
 */
export const optionalAuth = (req, res, next) => {
  let token = null;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      req.user = decoded;
    } catch {
      // Ignore errors for optional authentication
    }
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Verifies that the authenticated user has one of the allowed roles.
 *
 * @param  {...string} allowedRoles - e.g. USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, etc.
 */
export const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required before role verification'
        )
      );
    }

    const userRole = String(req.user.role || '').toLowerCase();
    if (!normalizedAllowed.includes(userRole)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access forbidden: Role '${req.user.role}' is not authorized to perform this action`
        )
      );
    }

    next();
  };
};

/**
 * Workspace isolation middleware.
 * Ensures that multi-tenant workspace operations target the tenant associated with the user or request.
 */
export const requireWorkspace = (req, res, next) => {
  const workspaceId =
    req.headers['x-workspace-id'] ||
    req.params.workspaceId ||
    req.query.workspaceId ||
    req.user?.workspaceId;

  if (!workspaceId) {
    return next(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Workspace context missing: Missing X-Workspace-Id header or workspace assignment'
      )
    );
  }

  // Cross-tenant protection: non-superadmins cannot switch to foreign workspace
  if (
    req.user &&
    req.user.role !== USER_ROLES.SUPER_ADMIN &&
    req.user.workspaceId &&
    req.user.workspaceId !== workspaceId
  ) {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Cross-workspace access denied: You cannot access foreign tenant resources'
      )
    );
  }

  req.workspaceId = workspaceId;
  next();
};
