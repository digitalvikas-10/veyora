import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Line item description is required').trim(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').default(1),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').default(0),
});

export const createInvoiceSchema = z.object({
  clientId: objectIdSchema,
  projectId: objectIdSchema.optional(),
  proposalId: objectIdSchema.optional(),
  invoiceNumber: z.string().trim().toUpperCase().optional(),
  status: z
    .enum(['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'])
    .default('draft'),
  issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  dueDate: z
    .string({ required_error: 'Due date is required' })
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  currency: z.string().length(3).toUpperCase().default('USD'),
  lineItems: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  paymentMethod: z
    .enum(['stripe', 'bank_transfer', 'paypal', 'manual', 'cash', 'other'])
    .default('manual'),
  notes: z.string().trim().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paidAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  method: z
    .enum(['stripe', 'bank_transfer', 'paypal', 'manual', 'cash', 'other'])
    .default('stripe'),
  transactionId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const invoiceQuerySchema = paginationQuerySchema.extend({
  clientId: objectIdSchema.optional(),
  status: z
    .enum(['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'])
    .optional(),
});
