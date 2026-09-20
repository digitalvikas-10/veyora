import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const documentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
      default: null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [150, 'Document title cannot exceed 150 characters'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    category: {
      type: String,
      enum: ['contract', 'design', 'deliverable', 'invoice', 'brief', 'asset', 'other'],
      default: 'deliverable',
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes
documentSchema.index({ workspaceId: 1, category: 1 });
documentSchema.index({ workspaceId: 1, projectId: 1 });
documentSchema.index({ workspaceId: 1, clientId: 1 });

// Apply automatic multi-tenancy plugin
documentSchema.plugin(multiTenantPlugin);

export const Document = mongoose.model('Document', documentSchema);
