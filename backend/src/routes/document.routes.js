import { Router } from 'express';
import {
  getDocuments,
  getDocumentStats,
  getDocumentById,
  createDocument,
  uploadDocumentFile,
  updateDocument,
  deleteDocument,
} from '../controllers/document.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
  upload,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentQuerySchema,
} from '../validations/document.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

// Storage analytics & KPIs
router.get(
  '/stats',
  authorizePermissions(PERMISSIONS.DOCUMENT_READ),
  getDocumentStats
);

// List & JSON Create
router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.DOCUMENT_READ),
    validate(documentQuerySchema, 'query'),
    getDocuments
  )
  .post(
    authorizePermissions(PERMISSIONS.DOCUMENT_UPLOAD),
    validate(createDocumentSchema, 'body'),
    createDocument
  );

// Multipart Form-Data File Upload
router.post(
  '/upload',
  authorizePermissions(PERMISSIONS.DOCUMENT_UPLOAD),
  upload.single('file'),
  uploadDocumentFile
);

// Individual Document Operations
router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.DOCUMENT_READ),
    validate(objectIdParamSchema, 'params'),
    getDocumentById
  )
  .patch(
    authorizePermissions(PERMISSIONS.DOCUMENT_UPLOAD),
    validate(objectIdParamSchema, 'params'),
    validate(updateDocumentSchema, 'body'),
    updateDocument
  )
  .delete(
    authorizePermissions(PERMISSIONS.DOCUMENT_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteDocument
  );

export default router;
