import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const notificationQuerySchema = paginationQuerySchema.extend({
  isRead: z.coerce.boolean().optional(),
  type: z
    .enum(['info', 'task_assigned', 'proposal_signed', 'invoice_paid', 'project_update', 'system'])
    .optional(),
});

export const createNotificationSchema = z.object({
  recipientId: objectIdSchema.optional(), // if omitted, defaults to current user or broadcast
  type: z
    .enum(['info', 'task_assigned', 'proposal_signed', 'invoice_paid', 'project_update', 'system'])
    .default('info'),
  title: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message is too long'),
  link: z.string().max(200).optional(),
});

export const auditLogQuerySchema = paginationQuerySchema.extend({
  entityType: z.string().trim().optional(),
  action: z.string().trim().optional(),
  actorId: objectIdSchema.optional(),
});
