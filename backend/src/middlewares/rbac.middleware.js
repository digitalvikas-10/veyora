import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import {
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  meetsMinimumRole,
} from '../constants/permissions.js';

/**
 * Middleware: Authorize by Specific Permissions
 *
 * @param {string|string[]} permissions - Single permission string or array of permissions
 * @param {Object} [options]
 * @param {'all'|'any'} [options.match='all'] - Whether the user must have 'all' or 'any' of the permissions
 */
export const authorizePermissions = (permissions, options = { match: 'all' }) => {
  const permList = Array.isArray(permissions) ? permissions : [permissions];

  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required before permission check'
        )
      );
    }

    const userRole = req.user.role;
    const isAuthorized =
      options.match === 'any'
        ? hasAnyPermission(userRole, permList)
        : hasAllPermissions(userRole, permList);

    if (!isAuthorized) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access Forbidden: Role '${userRole}' lacks required permission (${permList.join(', ')})`,
          [
            {
              role: userRole,
              requiredPermissions: permList,
              matchMode: options.match,
            },
          ]
        )
      );
    }

    next();
  };
};

/**
 * Middleware: Enforce Minimum Role Hierarchy Level
 *
 * @param {string} minRole - Lowest acceptable role in the hierarchy (e.g. 'admin' accepts 'admin', 'owner', 'superadmin')
 */
export const requireMinimumRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required before role hierarchy check'
        )
      );
    }

    const userRole = req.user.role;
    if (!meetsMinimumRole(userRole, minRole)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Insufficient Privileges: Role '${userRole}' does not meet minimum required level '${minRole}'`
        )
      );
    }

    next();
  };
};

/**
 * Helper to check capability programmatically within controllers
 */
export const can = (user, permission) => {
  if (!user || !user.role) return false;
  return hasPermission(user.role, permission);
};
