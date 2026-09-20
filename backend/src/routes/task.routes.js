import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  logTaskTime,
  toggleChecklistItem,
  deleteTask,
} from '../controllers/task.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createTaskSchema,
  updateTaskSchema,
  logTimeSchema,
  taskQuerySchema,
} from '../validations/task.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.TASK_READ),
    validate(taskQuerySchema, 'query'),
    getTasks
  )
  .post(
    authorizePermissions(PERMISSIONS.TASK_CREATE),
    validate(createTaskSchema, 'body'),
    createTask
  );

router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.TASK_READ),
    validate(objectIdParamSchema, 'params'),
    getTaskById
  )
  .patch(
    authorizePermissions(PERMISSIONS.TASK_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateTaskSchema, 'body'),
    updateTask
  )
  .put(
    authorizePermissions(PERMISSIONS.TASK_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateTaskSchema, 'body'),
    updateTask
  )
  .delete(
    authorizePermissions(PERMISSIONS.TASK_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteTask
  );

router.post(
  '/:id/time-logs',
  authorizePermissions(PERMISSIONS.TASK_LOG_TIME),
  validate(objectIdParamSchema, 'params'),
  validate(logTimeSchema, 'body'),
  logTaskTime
);

router.patch(
  '/:id/checklist/:itemId/toggle',
  authorizePermissions(PERMISSIONS.TASK_UPDATE),
  toggleChecklistItem
);

export default router;
