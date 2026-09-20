import { Router } from 'express';
import {
  getProposals,
  getProposalById,
  createProposal,
  updateProposal,
  sendProposal,
  signProposal,
  deleteProposal,
} from '../controllers/proposal.controller.js';
import {
  authenticate,
  requireTenant,
  authorizePermissions,
  validate,
} from '../middlewares/index.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createProposalSchema,
  updateProposalSchema,
  signProposalSchema,
  proposalQuerySchema,
} from '../validations/proposal.validation.js';
import { objectIdParamSchema } from '../validations/common.validation.js';

const router = Router();

router.use(authenticate, requireTenant);

router
  .route('/')
  .get(
    authorizePermissions(PERMISSIONS.PROPOSAL_READ),
    validate(proposalQuerySchema, 'query'),
    getProposals
  )
  .post(
    authorizePermissions(PERMISSIONS.PROPOSAL_CREATE),
    validate(createProposalSchema, 'body'),
    createProposal
  );

router
  .route('/:id')
  .get(
    authorizePermissions(PERMISSIONS.PROPOSAL_READ),
    validate(objectIdParamSchema, 'params'),
    getProposalById
  )
  .patch(
    authorizePermissions(PERMISSIONS.PROPOSAL_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateProposalSchema, 'body'),
    updateProposal
  )
  .put(
    authorizePermissions(PERMISSIONS.PROPOSAL_UPDATE),
    validate(objectIdParamSchema, 'params'),
    validate(updateProposalSchema, 'body'),
    updateProposal
  )
  .delete(
    authorizePermissions(PERMISSIONS.PROPOSAL_DELETE),
    validate(objectIdParamSchema, 'params'),
    deleteProposal
  );

router.post(
  '/:id/send',
  authorizePermissions(PERMISSIONS.PROPOSAL_SEND),
  validate(objectIdParamSchema, 'params'),
  sendProposal
);

router.post(
  '/:id/sign',
  authorizePermissions(PERMISSIONS.PROPOSAL_APPROVE),
  validate(objectIdParamSchema, 'params'),
  validate(signProposalSchema, 'body'),
  signProposal
);

export default router;
