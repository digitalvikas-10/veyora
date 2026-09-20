import { z } from 'zod';
import { paginationQuerySchema, objectIdSchema } from './common.validation.js';

export const createDocumentSchema = z.object({
  clientId: objectIdSchema.optional().nullable(),
  projectId: objectIdSchema.optional().nullable(),
  taskId: objectIdSchema.optional().nullable(),
  title: z
    .string({ required_error: 'Document title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  fileName: z
    .string({ required_error: 'File name is required' })
    .min(1, 'File name cannot be empty')
    .trim(),
  fileUrl: z
    .string({ required_error: 'File URL is required' })
    .min(1, 'File URL cannot be empty'),
  fileSize: z.number().min(0).default(0),
  mimeType: z.string().trim().default('application/octet-stream'),
  category: z
    .enum(['contract', 'design', 'deliverable', 'invoice', 'brief', 'asset', 'other'])
    .default('deliverable'),
});

export const updateDocumentSchema = z.object({
  clientId: objectIdSchema.optional().nullable(),
  projectId: objectIdSchema.optional().nullable(),
  taskId: objectIdSchema.optional().nullable(),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim()
    .optional(),
  category: z
    .enum(['contract', 'design', 'deliverable', 'invoice', 'brief', 'asset', 'other'])
    .optional(),
});

export const documentQuerySchema = paginationQuerySchema.extend({
  clientId: objectIdSchema.optional(),
  projectId: objectIdSchema.optional(),
  category: z
    .enum(['contract', 'design', 'deliverable', 'invoice', 'brief', 'asset', 'other'])
    .optional(),
  search: z.string().trim().optional(),
});
