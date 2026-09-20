import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';
import {
  validate,
  authenticate,
  authorizeRoles,
  requireWorkspace,
} from '../middlewares/index.js';

const router = Router();

// Test Zod Schema
const testEchoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  category: z.enum(['development', 'security', 'operations'], {
    errorMap: () => ({ message: 'Category must be development, security, or operations' }),
  }),
  priority: z.number().int().min(1).max(5).default(3),
});

/**
 * @desc Test Zod request validation pipeline
 * @route POST /api/v1/system/test-validation
 * @access Public
 */
router.post(
  '/test-validation',
  validate(testEchoSchema, 'body'),
  asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        'Zod schema validation passed successfully',
        {
          received: req.body,
          validatedAt: new Date().toISOString(),
          status: 'valid',
        }
      )
    );
  })
);

/**
 * @desc Test Auth, RBAC, and Tenant Isolation Pipeline
 * @route GET /api/v1/system/test-protected
 * @access Protected (Requires JWT Token & Workspace Header)
 */
router.get(
  '/test-protected',
  authenticate,
  requireWorkspace,
  authorizeRoles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.TEAM_MEMBER),
  asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        'Protected route accessed with valid JWT and workspace tenant authorization',
        {
          user: req.user,
          activeWorkspaceId: req.workspaceId,
          roleAuthorized: req.user.role,
        }
      )
    );
  })
);

/**
 * @desc Retrieve backend architecture and middleware capability manifest
 * @route GET /api/v1/system/middlewares
 * @access Public
 */
router.get(
  '/middlewares',
  asyncHandler(async (req, res) => {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        'Backend middleware stack is fully initialized and operational',
        {
          stack: [
            { name: 'Helmet Security', purpose: 'CSP, Sniffing, Frameguard & Anti-XSS protection', active: true },
            { name: 'CORS Manager', purpose: 'Secure origin validation with credentials and custom headers', active: true },
            { name: 'Morgan Logger', purpose: 'HTTP request telemetry and status code tracking', active: true },
            { name: 'Rate Limiter', purpose: 'IP-based sliding window protection against DDoS & brute-force', active: true },
            { name: 'JSON & URL Parsers', purpose: '10MB payload limiters with strict entity checks', active: true },
            { name: 'Cookie Parser', purpose: 'HttpOnly cookie parsing for JWT access & refresh tokens', active: true },
            { name: 'Zod Validation Pipeline', purpose: 'Runtime schema validation rejecting malformed requests', active: true },
            { name: 'JWT Authenticator', purpose: 'Stateless signature verification & token expiration detection', active: true },
            { name: 'RBAC Authorization', purpose: 'SuperAdmin, Admin, Member, Client, Viewer enforcement', active: true },
            { name: 'Workspace Tenant Guard', purpose: 'Strict tenant isolation preventing cross-tenant leakage', active: true },
            { name: 'Centralized Error Handler', purpose: 'Standardized ApiError conversion & debug stacks in dev', active: true },
          ],
          phase: 2,
          phaseStatus: 'completed',
        }
      )
    );
  })
);

export default router;
