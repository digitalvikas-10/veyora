import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['info', 'task_assigned', 'proposal_signed', 'invoice_paid', 'project_update', 'system'],
      default: 'info',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes
notificationSchema.index({ workspaceId: 1, recipientId: 1, isRead: 1 });
notificationSchema.index({ workspaceId: 1, createdAt: -1 });

// Apply automatic multi-tenancy plugin
notificationSchema.plugin(multiTenantPlugin);

export const Notification = mongoose.model('Notification', notificationSchema);
