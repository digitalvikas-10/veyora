import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/client.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema,
} from '../validations/client.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

// Enforce authentication & tenant resolution for all client operations
router.use(authenticate, requireTenant);

router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.CLIENT_READ),
    validate(clientQuerySchema, 'query'),
    getClients
  )
  .post(
    authorizePermissions(PERMISSIONS.CLIENT_CREATE),
    validate(createClientSchema, 'body'),
    createClient
  );

router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.CLIENT_READ),
    validate(objectIdParamSchema, 'params'),
    getClientById
  )
  .patch(
    authorizePermissions(PERMISSIONS.CLIENT_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateClientSchema, 'body'),
    updateClient
  )
  .put(
    authorizePermissions(PERMISSIONS.CLIENT_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateClientSchema, 'body'),
    updateClient
  )
  .delete(
    authorizePermissions(PERMISSIONS.CLIENT_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteClient
  );

export default router;
