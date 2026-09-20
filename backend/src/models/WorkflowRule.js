import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const conditionSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'is_set'],
      default: 'equals',
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
  },
  { _id: false }
);

const actionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'create_task',
        'send_notification',
        'update_client_status',
        'generate_invoice_draft',
        'dispatch_webhook',
      ],
      required: true,
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const workflowRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow rule name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    trigger: {
      event: {
        type: String,
        required: [true, 'Trigger event identifier is required'],
        enum: [
          'client.created',
          'client.updated',
          'proposal.signed',
          'proposal.created',
          'invoice.paid',
          'invoice.created',
          'project.status_changed',
          'task.completed',
          'security.threat_detected',
          'manual.trigger',
        ],
        index: true,
      },
      conditions: {
        type: [conditionSchema],
        default: [],
      },
    },
    actions: {
      type: [actionSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Workflow rule must contain at least one action',
      },
    },
    stats: {
      totalTriggered: {
        type: Number,
        default: 0,
      },
      totalSucceeded: {
        type: Number,
        default: 0,
      },
      totalFailed: {
        type: Number,
        default: 0,
      },
      lastExecutedAt: {
        type: Date,
        default: null,
      },
      lastStatus: {
        type: String,
        enum: ['success', 'failed', 'none'],
        default: 'none',
      },
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

// High performance compound indexes for rule evaluation
workflowRuleSchema.index({ workspaceId: 1, 'trigger.event': 1, isActive: 1 });

// Apply multi-tenancy plugin
workflowRuleSchema.plugin(multiTenantPlugin);

export const WorkflowRule = mongoose.model('WorkflowRule', workflowRuleSchema);
