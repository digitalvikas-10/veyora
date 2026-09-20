import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

/**
 * PermissionGate: Guard component for rendering UI elements based on RBAC permissions or roles.
 *
 * @param {string|string[]} permission - Single permission or array of permissions required (OR logic by default).
 * @param {boolean} requireAll - If true, requires all permissions in the array.
 * @param {string|string[]} roles - Role or array of roles allowed.
 * @param {React.ReactNode} fallback - Custom fallback to render if unauthorized.
 * @param {boolean} renderDisabled - If true, renders child elements with opacity and pointer-events disabled instead of hiding.
 * @param {string} tooltip - Explanation of required permission when locked.
 */
export default function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  roles,
  fallback = null,
  renderDisabled = false,
  tooltip,
}) {
  const { userPermissions, user, hasRole } = useAuth();

  // Check roles first if provided
  let roleAllowed = true;
  if (roles) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    roleAllowed = hasRole(...roleList);
  }

  // Check permissions
  let permAllowed = true;
  const permsToCheck = [];
  if (permission) permsToCheck.push(permission);
  if (permissions && permissions.length > 0) permsToCheck.push(...permissions);

  if (permsToCheck.length > 0) {
    if (requireAll) {
      permAllowed = permsToCheck.every((p) => userPermissions.includes(p));
    } else {
      permAllowed = permsToCheck.some((p) => userPermissions.includes(p));
    }
  }

  const isAuthorized = roleAllowed && permAllowed;

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (renderDisabled) {
    return (
      <div className="relative group inline-block cursor-not-allowed">
        <div className="opacity-40 pointer-events-none select-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-neutral-950/80 backdrop-blur-[2px] rounded-lg transition-opacity duration-200">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-300 shadow-md">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{tooltip || `Requires ${permission || 'elevated permissions'}`}</span>
          </div>
        </div>
      </div>
    );
  }

  return fallback;
}
