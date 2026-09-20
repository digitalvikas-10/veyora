import { AsyncLocalStorage } from 'async_hooks';

/**
 * Node.js AsyncLocalStorage for thread-safe multi-tenant request isolation.
 * Automatically tracks the active workspace context across async promise chains.
 */
const tenantStorage = new AsyncLocalStorage();

/**
 * Runs a function within an isolated tenant context
 *
 * @param {string} workspaceId - The tenant's Workspace ObjectId as string
 * @param {Function} callback - Function or middleware next() to execute
 */
export const runWithTenant = (workspaceId, callback) => {
  return tenantStorage.run(workspaceId, callback);
};

/**
 * Retrieves the active workspace ID for the current execution context
 *
 * @returns {string|null} - Current workspaceId or null if outside tenant scope
 */
export const getCurrentTenantId = () => {
  return tenantStorage.getStore() || null;
};
