import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorName: {
      type: String,
      default: 'System',
    },
    actorEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Audit entity type is required'],
      index: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for compliance logs
auditLogSchema.index({ workspaceId: 1, entityType: 1, createdAt: -1 });
auditLogSchema.index({ workspaceId: 1, action: 1 });

// Apply automatic multi-tenancy plugin
auditLogSchema.plugin(multiTenantPlugin);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
