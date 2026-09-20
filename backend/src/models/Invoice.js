import mongoose from 'mongoose';
import { multiTenantPlugin } from './plugins/multiTenantPlugin.js';

const invoiceItemSchema = new mongoose.Schema(
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

const paymentRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Payment amount must be greater than 0'],
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    method: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'paypal', 'manual', 'cash', 'other'],
      default: 'stripe',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Invoice must belong to a Client'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      default: null,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidAt: {
      type: Date,
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    lineItems: [invoiceItemSchema],
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
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'paypal', 'manual', 'cash', 'other'],
      default: 'manual',
    },
    paymentRecords: [paymentRecordSchema],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate financial totals and balance due before saving
invoiceSchema.pre('save', async function () {
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach((item) => {
      item.amount = (item.quantity || 0) * (item.unitPrice || 0);
    });
    this.subtotal = this.lineItems.reduce((acc, curr) => acc + curr.amount, 0);
  }

  const taxableAmount = Math.max(0, (this.subtotal || 0) - (this.discount || 0));
  this.taxAmount = taxableAmount * ((this.taxRate || 0) / 100);
  this.totalAmount = taxableAmount + this.taxAmount;

  // Calculate sum of payments
  if (this.paymentRecords && this.paymentRecords.length > 0) {
    this.amountPaid = this.paymentRecords.reduce((acc, curr) => acc + curr.amount, 0);
  }

  this.balanceDue = Math.max(0, this.totalAmount - (this.amountPaid || 0));

  // Auto-transition status if fully paid
  if (this.totalAmount > 0 && this.balanceDue === 0) {
    this.status = 'paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else if (this.amountPaid > 0 && this.balanceDue > 0) {
    this.status = 'partially_paid';
  } else if (this.status !== 'draft' && this.dueDate && new Date() > this.dueDate && this.balanceDue > 0) {
    this.status = 'overdue';
  }
});

// High-speed compound indexes
invoiceSchema.index({ workspaceId: 1, invoiceNumber: 1 });
invoiceSchema.index({ workspaceId: 1, status: 1 });
invoiceSchema.index({ workspaceId: 1, clientId: 1 });
invoiceSchema.index({ workspaceId: 1, dueDate: 1 });

// Apply automatic multi-tenancy plugin
invoiceSchema.plugin(multiTenantPlugin);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
