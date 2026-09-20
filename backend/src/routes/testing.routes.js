import { Router } from 'express';
import {
  runTestSuite,
  runScenario,
  runBenchmarks,
  exportTestReport,
} from '../controllers/testing.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';

const router = Router();

// Apply authentication and tenant context to all testing endpoints
router.use(authenticate);
router.use(requireTenant);

// Full automated integration test suite execution
router.post('/run', runTestSuite);

// Synthetic scenario simulation execution
router.post('/scenario', runScenario);

// Performance & latency benchmarks
router.get('/benchmarks', runBenchmarks);

// Certificate & test report export
router.post('/export', exportTestReport);

export default router;
