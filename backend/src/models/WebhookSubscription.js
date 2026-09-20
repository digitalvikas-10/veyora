import mongoose from 'mongoose';
import crypto from 'crypto';

const webhookSubscriptionSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required for multi-tenant isolation'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'Webhook endpoint URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          try {
            const parsed = new URL(v);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Endpoint must be a valid HTTP or HTTPS URL',
      },
    },
    secret: {
      type: String,
      default: function () {
        return `whsec_${crypto.randomBytes(32).toString('hex')}`;
      },
    },
    events: {
      type: [String],
      required: [true, 'At least one event trigger must be specified'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one subscribed event is required',
      },
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'disabled'],
      default: 'active',
      index: true,
    },
    headers: {
      type: Map,
      of: String,
      default: {},
    },
    retryPolicy: {
      maxRetries: {
        type: Number,
        default: 3,
        min: 0,
        max: 5,
      },
      backoffSeconds: {
        type: Number,
        default: 10,
        min: 1,
        max: 300,
      },
    },
    stats: {
      totalDeliveries: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      lastDeliveredAt: { type: Date, default: null },
      lastStatusCode: { type: Number, default: null },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for workspace filtering and fast subscriber lookups
webhookSubscriptionSchema.index({ workspaceId: 1, status: 1 });
webhookSubscriptionSchema.index({ workspaceId: 1, events: 1 });

export const WebhookSubscription = mongoose.model('WebhookSubscription', webhookSubscriptionSchema);
