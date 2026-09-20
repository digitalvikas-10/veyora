import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../validations/project.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.PROJECT_READ),
    validate(projectQuerySchema, 'query'),
    getProjects
  )
  .post(
    authorizePermissions(PERMISSIONS.PROJECT_CREATE),
    validate(createProjectSchema, 'body'),
    createProject
  );

router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.PROJECT_READ),
    validate(objectIdParamSchema, 'params'),
    getProjectById
  )
  .patch(
    authorizePermissions(PERMISSIONS.PROJECT_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateProjectSchema, 'body'),
    updateProject
  )
  .put(
    authorizePermissions(PERMISSIONS.PROJECT_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateProjectSchema, 'body'),
    updateProject
  )
  .delete(
    authorizePermissions(PERMISSIONS.PROJECT_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteProject
  );

export default router;
