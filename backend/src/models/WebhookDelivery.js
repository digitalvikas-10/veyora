import mongoose from 'mongoose';

const webhookDeliverySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required for multi-tenant isolation'],
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebhookSubscription',
      required: [true, 'Subscription ID is required'],
      index: true,
    },
    event: {
      type: String,
      required: [true, 'Event type is required'],
      index: true,
    },
    endpointUrl: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    responseStatus: {
      type: Number,
      default: null,
    },
    responseBody: {
      type: String,
      default: '',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'retrying'],
      default: 'success',
      index: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    error: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

webhookDeliverySchema.index({ workspaceId: 1, subscriptionId: 1, createdAt: -1 });
webhookDeliverySchema.index({ workspaceId: 1, status: 1 });

export const WebhookDelivery = mongoose.model('WebhookDelivery', webhookDeliverySchema);
