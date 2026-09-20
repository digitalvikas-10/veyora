import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const createTaskSchema = z.object({
  projectId: objectIdSchema,
  clientId: objectIdSchema.optional(),
  title: z
    .string({ required_error: 'Task title is required' })
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title cannot exceed 200 characters')
    .trim(),
  description: z.string().trim().optional(),
  status: z.enum(['todo', 'in-progress', 'in-review', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: objectIdSchema.optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  estimatedHours: z.number().min(0).default(0),
  position: z.number().default(0),
  checklist: z
    .array(
      z.object({
        title: z.string().min(1).trim(),
        completed: z.boolean().default(false),
      })
    )
    .default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export const logTimeSchema = z.object({
  hours: z.number().min(0.1, 'Logged hours must be at least 0.1').max(24),
  note: z.string().trim().optional(),
  loggedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export const checklistItemSchema = z.object({
  title: z.string().min(1, 'Checklist item title is required').trim(),
});

export const taskQuerySchema = paginationQuerySchema.extend({
  projectId: objectIdSchema.optional(),
  clientId: objectIdSchema.optional(),
  assigneeId: objectIdSchema.optional(),
  status: z.enum(['todo', 'in-progress', 'in-review', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});
