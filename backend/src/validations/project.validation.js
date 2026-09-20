import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const createProjectSchema = z.object({
  clientId: objectIdSchema,
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Project name must be at least 2 characters')
    .max(150, 'Project name cannot exceed 150 characters')
    .trim(),
  code: z.string().trim().toUpperCase().optional(),
  description: z.string().trim().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  budget: z.number().min(0).default(0),
  currency: z.string().length(3).toUpperCase().default('USD'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  targetDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  assignees: z.array(objectIdSchema).default([]),
  progressPercent: z.number().min(0).max(100).default(0),
  tags: z.array(z.string().trim()).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = paginationQuerySchema.extend({
  clientId: objectIdSchema.optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});
