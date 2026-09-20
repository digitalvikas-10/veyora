import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  rotateSecret,
  testSubscription,
  getDeliveries,
  redeliver,
  getMetrics,
} from '../controllers/webhook.controller.js';
import { authenticate, requireTenant } from '../middlewares/index.js';

const router = Router();

// All webhook management routes require authentication and tenant context
router.use(authenticate, requireTenant);

// Aggregate webhook statistics
router.get('/metrics', getMetrics);

// Query delivery logs across workspace or redeliver
router.get('/deliveries', (req, res, next) => {
  req.params.id = 'all';
  getDeliveries(req, res, next);
});
router.post('/deliveries/:deliveryId/redeliver', redeliver);

// Base Webhook Subscriptions CRUD
router
  .route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router
  .route('/:id')
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

// Key actions: secret rotation, test dispatch & specific delivery history
router.post('/:id/rotate-secret', rotateSecret);
router.post('/:id/test', testSubscription);
router.get('/:id/deliveries', getDeliveries);

export default router;
