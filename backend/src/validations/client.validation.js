import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const createClientSchema = z.object({
  name: z
    .string({ required_error: 'Client name is required' })
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name cannot exceed 100 characters')
    .trim(),
  company: z.string().max(120).trim().optional(),
  email: z
    .string({ required_error: 'Client email is required' })
    .email('Please provide a valid client email address')
    .toLowerCase()
    .trim(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      postalCode: z.string().trim().optional(),
      country: z.string().trim().default('USA'),
    })
    .optional(),
  status: z.enum(['lead', 'active', 'inactive', 'archived']).default('active'),
  currency: z.string().length(3).toUpperCase().default('USD'),
  portalAccess: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([]),
  notes: z.string().trim().optional(),
  avatar: z.string().trim().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const clientQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['lead', 'active', 'inactive', 'archived']).optional(),
  tag: z.string().trim().optional(),
});
