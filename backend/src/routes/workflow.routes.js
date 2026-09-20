import { Router } from 'express';
import {
  getRules,
  createRule,
  getRuleById,
  updateRule,
  deleteRule,
  testRule,
  getExecutions,
  getMetrics,
} from '../controllers/workflow.controller.js';
import { authenticate, requireTenant } from '../middlewares/index.js';

const router = Router();

// Authentication & multi-tenant isolation required for all workflow operations
router.use(authenticate, requireTenant);

// Aggregate workflow analytics
router.get('/metrics', getMetrics);

// Query execution logs across workspace
router.get('/executions', getExecutions);

// Workflow Rules CRUD
router
  .route('/')
  .get(getRules)
  .post(createRule);

router
  .route('/:id')
  .get(getRuleById)
  .put(updateRule)
  .delete(deleteRule);

// Test simulation & rule-specific execution history
router.post('/:id/test', testRule);
router.get('/:id/executions', getExecutions);

export default router;
