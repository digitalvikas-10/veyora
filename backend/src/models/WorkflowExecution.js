import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const actionExecutionLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    error: {
      type: String,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const workflowExecutionSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowRule',
      required: true,
      index: true,
    },
    ruleName: {
      type: String,
      required: true,
    },
    triggerEvent: {
      type: String,
      required: true,
      index: true,
    },
    triggerPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    conditionsEvaluated: {
      type: Boolean,
      default: true,
    },
    actionsExecuted: {
      type: [actionExecutionLogSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success',
      index: true,
    },
    totalDurationMs: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High speed indexes for execution audit query
workflowExecutionSchema.index({ workspaceId: 1, ruleId: 1, createdAt: -1 });
workflowExecutionSchema.index({ workspaceId: 1, triggerEvent: 1, createdAt: -1 });
workflowExecutionSchema.index({ workspaceId: 1, status: 1 });

// Apply multi-tenancy plugin
workflowExecutionSchema.plugin(multiTenantPlugin);

export const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);
