import { Router } from 'express';
import healthRouter from './health.routes.js';
import systemRouter from './system.routes.js';
import authRouter from './auth.routes.js';
import rbacRouter from './rbac.routes.js';
import workspaceRouter from './workspace.routes.js';
import schemaRouter from './schema.routes.js';
import clientRouter from './client.routes.js';
import projectRouter from './project.routes.js';
import taskRouter from './task.routes.js';
import proposalRouter from './proposal.routes.js';
import invoiceRouter from './invoice.routes.js';
import documentRouter from './document.routes.js';
import notificationRouter from './notification.routes.js';
import auditLogRouter from './auditLog.routes.js';
import analyticsRouter from './analytics.routes.js';
import securityRouter from './security.routes.js';
import testingRouter from './testing.routes.js';
import webhookRouter from './webhook.routes.js';
import workflowRouter from './workflow.routes.js';
import portalRouter from './portal.routes.js';

const router = Router();

// Health Check API
router.use('/health', healthRouter);

// System Diagnostics & Middleware Verification API (Phase 2)
router.use('/system', systemRouter);

// Authentication & Token Management API (Phase 3)
router.use('/auth', authRouter);

// Role-Based Access Control (RBAC) & Permissions API (Phase 4)
router.use('/rbac', rbacRouter);

// Multi-Tenancy & Workspace Partitioning API (Phase 5)
router.use('/workspaces', workspaceRouter);

// Database Models & Mongoose Schemas Catalog API (Phase 6)
router.use('/schemas', schemaRouter);

// REST API Architecture Endpoints (Phase 7)
router.use('/clients', clientRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/proposals', proposalRouter);
router.use('/invoices', invoiceRouter);
router.use('/documents', documentRouter);
router.use('/notifications', notificationRouter);
router.use('/audit-logs', auditLogRouter);
router.use('/analytics', analyticsRouter);

// Security Hardening & Vulnerability Management API (Phase 19)
router.use('/security', securityRouter);

// Automated Integration Testing & Verification API (Phase 20)
router.use('/testing', testingRouter);

// Webhook Automation & Event Dispatcher API (Phase 22)
router.use('/webhooks', webhookRouter);

// Workflow Automation & Rule Engine API (Phase 23)
router.use('/workflows', workflowRouter);

// Client Self-Service Portal & Public Share Links API (Phase 24)
router.use('/portal', portalRouter);

export default router;
