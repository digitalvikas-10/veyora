import mongoose from 'mongoose';
import { getCurrentTenantId } from '../../utils/tenantContext.js';

/**
 * Mongoose Plugin for Automatic Multi-Tenant Isolation
 * Ensures that all queries, inserts, and mutations are strictly scoped to the active workspace.
 */
export const multiTenantPlugin = (schema, options = {}) => {
  // 1. Add workspaceId field if not explicitly declared
  if (!schema.path('workspaceId')) {
    schema.add({
      workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace ID is required for multi-tenant isolation'],
        index: true,
      },
    });
  }

  // 2. Add compound index for high-throughput tenant filtering and pagination
  schema.index({ workspaceId: 1, createdAt: -1 });

  // 3. Pre-save hook: auto-inject workspaceId from tenant context if missing
  schema.pre('save', async function () {
    if (!this.workspaceId) {
      const activeTenant = getCurrentTenantId();
      if (activeTenant) {
        this.workspaceId = activeTenant;
      }
    }
  });

  // 4. Query hooks: automatically inject workspaceId condition if tenant context is active
  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'updateMany',
    'updateOne',
    'countDocuments',
    'deleteMany',
    'deleteOne',
  ];

  queryMethods.forEach((method) => {
    schema.pre(method, function () {
      // Allow explicit opt-out for system-wide jobs or superadmin cross-tenant audits
      if (this.getOptions()?.skipTenantFilter) {
        return;
      }

      const activeTenant = this.getOptions()?.workspaceId || getCurrentTenantId();
      if (activeTenant) {
        // Only append if not already explicitly specified in filter
        const queryFilter = this.getQuery();
        if (!queryFilter.workspaceId) {
          this.where({ workspaceId: activeTenant });
        }
      }
    });
  });

  // 5. Static helper to manually scope a query to a specific workspace
  schema.statics.forWorkspace = function (workspaceId) {
    return this.find({ workspaceId });
  };
};
