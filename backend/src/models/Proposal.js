import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

const signatureSchema = new mongoose.Schema(
  {
    signedBy: { type: String, trim: true },
    signedEmail: { type: String, trim: true },
    signedAt: { type: Date },
    ipAddress: { type: String },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Proposal must belong to a Client'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    proposalNumber: {
      type: String,
      required: [true, 'Proposal number is required'],
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Proposal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'],
      default: 'draft',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    lineItems: [lineItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
    },
    signature: signatureSchema,
  },
  {
    timestamps: true,
  }
);

// Auto-calculate financial totals before saving
proposalSchema.pre('save', async function () {
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach((item) => {
      item.amount = (item.quantity || 0) * (item.unitPrice || 0);
    });
    this.subtotal = this.lineItems.reduce((acc, curr) => acc + curr.amount, 0);
  }

  const taxableAmount = Math.max(0, (this.subtotal || 0) - (this.discount || 0));
  this.taxAmount = taxableAmount * ((this.taxRate || 0) / 100);
  this.totalAmount = taxableAmount + this.taxAmount;
});

// High-speed compound indexes
proposalSchema.index({ workspaceId: 1, proposalNumber: 1 });
proposalSchema.index({ workspaceId: 1, clientId: 1, status: 1 });

// Apply automatic multi-tenancy plugin
proposalSchema.plugin(multiTenantPlugin);

export const Proposal = mongoose.model('Proposal', proposalSchema);
