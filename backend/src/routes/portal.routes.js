import { Router } from 'express';
import {
  generatePortalLink,
  getClientPortalData,
  signProposalViaPortal,
  payInvoiceViaPortal,
  submitPortalFeedback,
} from '../controllers/portal.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

// Public / Token endpoints for client portal
router.get('/preview/:clientId', getClientPortalData);
router.post('/proposals/:id/sign', signProposalViaPortal);
router.post('/invoices/:id/pay', payInvoiceViaPortal);
router.post('/feedback', submitPortalFeedback);

// Protected authenticated routes for workspace admins
router.post(
  '/generate-link/:clientId',
  authenticate,
  requireTenant,
  authorizePermissions(PERMISSIONS.CLIENT_READ),
  generatePortalLink
);

export default router;
