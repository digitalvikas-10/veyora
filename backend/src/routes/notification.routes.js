import { Router } from 'express';
import {
  getNotifications,
  getNotificationStats,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../controllers/notification.controller.js';
import {
  authenticate,
  requireTenant,
  validate,
} from '../middlewares/index.js';
import {
  notificationQuerySchema,
  createNotificationSchema,
} from '../validations/notification.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

// Notification KPI stats
router.get('/stats', getNotificationStats);

// List & Dispatch Notifications
router
  .route('/')
  .get(validate(notificationQuerySchema, 'query'), getNotifications)
  .post(validate(createNotificationSchema, 'body'), createNotification);

// Global actions
router.post('/mark-all-read', markAllAsRead);
router.delete('/clear-read', clearReadNotifications);

// Individual Notification actions
router.patch('/:id/read', validate(objectIdParamSchema, 'params'), markAsRead);
router.delete('/:id', validate(objectIdParamSchema, 'params'), deleteNotification);

export default router;
