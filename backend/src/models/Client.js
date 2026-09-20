import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client contact name is required'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid client email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'USA' },
    },
    status: {
      type: String,
      enum: ['lead', 'active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    portalAccess: {
      type: Boolean,
      default: false,
    },
    portalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    totalBilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for search & multi-tenant partitioning
clientSchema.index({ workspaceId: 1, email: 1 });
clientSchema.index({ workspaceId: 1, company: 1 });
clientSchema.index({ workspaceId: 1, status: 1 });

// Apply automatic multi-tenancy plugin
clientSchema.plugin(multiTenantPlugin);

export const Client = mongoose.model('Client', clientSchema);
