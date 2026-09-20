import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const auditLogQuerySchema = paginationQuerySchema.extend({
  entityType: z.string().trim().optional(),
  action: z.string().trim().optional(),
  actorId: objectIdSchema.optional(),
  timeframe: z.enum(['all', 'today', 'week', 'month']).optional(),
});

export const createAuditCheckpointSchema = z.object({
  action: z.string().min(1, 'Action description is required').max(100),
  entityType: z.string().min(1, 'Entity type is required').max(50).default('Security'),
  entityId: z.string().max(100).optional().default(''),
  category: z.enum(['compliance', 'security', 'governance', 'access_review', 'system_event']).default('compliance'),
  notes: z.string().min(1, 'Compliance notes are required').max(1000),
  metadata: z.record(z.any()).optional().default({}),
});
