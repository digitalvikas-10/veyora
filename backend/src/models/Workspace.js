import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Workspace name must be at least 2 characters long'],
      maxlength: [50, 'Workspace name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Workspace slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'starter',
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branding: {
      logoUrl: { type: String, default: '' },
      primaryColor: { type: String, default: '#6366F1' },
      companyWebsite: { type: String, default: '' },
    },
    billingSettings: {
      invoicePrefix: { type: String, default: 'INV' },
      nextInvoiceNumber: { type: Number, default: 1001 },
      proposalPrefix: { type: String, default: 'PROP' },
      taxRate: { type: Number, default: 0, min: 0, max: 100 },
      paymentTerms: { type: String, default: 'Net 30' },
    },
    portalSettings: {
      clientPortalEnabled: { type: Boolean, default: true },
      allowClientUploads: { type: Boolean, default: true },
    },
    settings: {
      security: {
        keyRotation: {
          lastRotatedAt: { type: Date, default: Date.now },
          rotationCycleDays: { type: Number, default: 90 },
          saltVersion: { type: String, default: 'v1-init' },
        },
        ipFirewall: {
          mode: {
            type: String,
            enum: ['allow_all', 'allowlist_only', 'blocklist_active'],
            default: 'allow_all',
          },
          allowlist: [{ type: String }],
          blocklist: [{ type: String }],
          updatedAt: { type: Date, default: Date.now },
          updatedBy: { type: String, default: '' },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for multi-tenant isolation
workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ ownerId: 1 });

export const Workspace = mongoose.model('Workspace', workspaceSchema);
