import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  sendInvoice,
  recordPayment,
  deleteInvoice,
} from '../controllers/invoice.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  recordPaymentSchema,
  invoiceQuerySchema,
} from '../validations/invoice.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.INVOICE_READ),
    validate(invoiceQuerySchema, 'query'),
    getInvoices
  )
  .post(
    authorizePermissions(PERMISSIONS.INVOICE_CREATE),
    validate(createInvoiceSchema, 'body'),
    createInvoice
  );

router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.INVOICE_READ),
    validate(objectIdParamSchema, 'params'),
    getInvoiceById
  )
  .patch(
    authorizePermissions(PERMISSIONS.INVOICE_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateInvoiceSchema, 'body'),
    updateInvoice
  )
  .put(
    authorizePermissions(PERMISSIONS.INVOICE_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateInvoiceSchema, 'body'),
    updateInvoice
  )
  .delete(
    authorizePermissions(PERMISSIONS.INVOICE_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteInvoice
  );

router.post(
  '/:id/send',
  authorizePermissions(PERMISSIONS.INVOICE_SEND),
  validate(objectIdParamSchema, 'params'),
  sendInvoice
);

router.post(
  '/:id/payments',
  authorizePermissions(PERMISSIONS.INVOICE_PAY),
  validate(objectIdParamSchema, 'params'),
  validate(recordPaymentSchema, 'body'),
  recordPayment
);

export default router;
