import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Zod validation middleware factory.
 * Validates req.body, req.query, or req.params against a Zod schema.
 * If validation fails, collects all issues into a structured errors array and throws ApiError(400).
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - The request property to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with sanitized & typed data
      next();
    } catch (err) {
      const issues = err.issues || err.errors;
      if (issues && Array.isArray(issues)) {
        const validationErrors = issues.map((e) => ({
          field: e.path && e.path.length > 0 ? e.path.join('.') : 'body',
          message: e.message,
        }));
        return next(
          new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            'Validation failed: Please check input fields',
            validationErrors
          )
        );
      }
      next(err);
    }
  };
};
