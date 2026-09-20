import { Router } from 'express';
import {
  getModelsCatalog,
  getCollectionCounts,
  seedSampleData,
  clearSampleData,
} from '../controllers/schema.controller.js';
import { authenticate, requireTenant } from '../middlewares/index.js';

const router = Router();

// Public / Structural schema introspection catalog
router.get('/models-catalog', getModelsCatalog);

// Tenant-specific operations
router.use(authenticate);
router.use(requireTenant);

router.get('/counts', getCollectionCounts);
router.post('/seed-sample-data', seedSampleData);
router.delete('/clear-sample-data', clearSampleData);

export default router;
