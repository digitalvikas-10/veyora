import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Line item description is required').trim(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0').default(1),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').default(0),
});

export const createProposalSchema = z.object({
  clientId: objectIdSchema,
  projectId: objectIdSchema.optional(),
  proposalNumber: z.string().trim().toUpperCase().optional(),
  title: z
    .string({ required_error: 'Proposal title is required' })
    .min(2, 'Proposal title must be at least 2 characters')
    .max(200, 'Proposal title cannot exceed 200 characters')
    .trim(),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired']).default('draft'),
  issueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
});

export const updateProposalSchema = createProposalSchema.partial();

export const signProposalSchema = z.object({
  signedBy: z.string().min(2, 'Signer name is required').trim(),
  signedEmail: z.string().email('Valid signer email is required').trim().toLowerCase(),
});

export const proposalQuerySchema = paginationQuerySchema.extend({
  clientId: objectIdSchema.optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired']).optional(),
});
