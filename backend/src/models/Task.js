import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const timeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: [0.1, 'Logged hours must be at least 0.1'],
    },
    note: {
      type: String,
      trim: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const checklistItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a Project'],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'done', 'cancelled'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    loggedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeLogs: [timeLogSchema],
    checklist: [checklistItemSchema],
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for kanban columns and user workload queries
taskSchema.index({ workspaceId: 1, projectId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1, status: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });

// Apply automatic multi-tenancy plugin
taskSchema.plugin(multiTenantPlugin);

export const Task = mongoose.model('Task', taskSchema);
