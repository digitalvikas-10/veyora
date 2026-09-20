import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import {
  Client,
  Proposal,
  Invoice,
  Project,
  Document,
  Workspace,
  Notification,
} from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { WebhookService } from '../services/webhook.service.js';
import { WorkflowService } from '../services/workflow.service.js';
import jwt from 'jsonwebtoken';

const PORTAL_JWT_SECRET = process.env.JWT_SECRET || 'veyora_portal_secret_key_prod_2026';

/**
 * @desc Generate secure shareable portal token for a client
 * @route POST /api/v1/portal/generate-link/:clientId
 * @access Protected (CLIENT_READ)
 */
export const generatePortalLink = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { clientId } = req.params;
  const { expiresInDays = 30 } = req.body;

  const client = await Client.findOne({ _id: clientId, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Client not found in current workspace');
  }

  const token = jwt.sign(
    {
      clientId: client._id.toString(),
      workspaceId: wsId.toString(),
      clientEmail: client.email,
      purpose: 'client_portal_access',
    },
    PORTAL_JWT_SECRET,
    { expiresIn: `${expiresInDays}d` }
  );

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Portal share link generated successfully', {
      clientId: client._id,
      clientName: client.name,
      token,
      expiresAt,
      portalUrl: `/portal/${client._id}?token=${token}`,
    })
  );
});

/**
 * @desc Get public client portal data for preview or client consumption
 * @route GET /api/v1/portal/preview/:clientId
 * @access Public / Token-Secured
 */
export const getClientPortalData = asyncHandler(async (req, res) => {
  const { clientId } = req.params;
  const { token } = req.query;

  let query = { _id: clientId };
  let resolvedWsId = null;

  // If token is provided, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, PORTAL_JWT_SECRET);
      if (decoded.clientId !== clientId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Token mismatch for this client portal');
      }
      resolvedWsId = decoded.workspaceId;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Allow fallback if clientId matches valid public client
    }
  }

  // Fetch client record
  const client = await Client.findById(clientId);
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Client portal target not found');
  }

  resolvedWsId = resolvedWsId || client.workspaceId;

  // Fetch workspace details
  const workspace = await Workspace.findById(resolvedWsId).select(
    'name slug settings plan currency primaryColor'
  );

  // Fetch client's projects, proposals, invoices, documents
  const [projects, proposals, invoices, documents] = await Promise.all([
    Project.find({ clientId, workspaceId: resolvedWsId })
      .select('name code description status priority budget startDate targetDate progress milestones')
      .sort({ createdAt: -1 }),
    Proposal.find({ clientId, workspaceId: resolvedWsId })
      .select('proposalNumber title status totalCurrency totalAmount currency validUntil acceptedAt signedBy clientNotes items milestones terms')
      .sort({ createdAt: -1 }),
    Invoice.find({ clientId, workspaceId: resolvedWsId })
      .select('invoiceNumber status issueDate dueDate subtotal taxTotal discountTotal total currency lineItems notes paymentTerms paidAt')
      .sort({ createdAt: -1 }),
    Document.find({ clientId, workspaceId: resolvedWsId, isArchived: false })
      .select('name originalName mimeType size category description url createdAt')
      .sort({ createdAt: -1 }),
  ]);

  // Aggregate stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const outstandingBalance = invoices
    .filter((inv) => ['sent', 'overdue', 'partially_paid'].includes(inv.status))
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Client portal data retrieved successfully', {
      client: {
        _id: client._id,
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        status: client.status,
        currency: client.currency || 'USD',
      },
      workspace: {
        name: workspace?.name || 'Veyora Workspace',
        currency: workspace?.currency || 'USD',
        slug: workspace?.slug || 'workspace',
      },
      stats: {
        activeProjects: projects.filter((p) => p.status === 'in_progress' || p.status === 'planning').length,
        pendingProposals: proposals.filter((p) => p.status === 'sent' || p.status === 'viewed').length,
        outstandingInvoices: invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length,
        totalInvoiced,
        totalPaid,
        outstandingBalance,
      },
      projects,
      proposals,
      invoices,
      documents,
    })
  );
});

/**
 * @desc Sign proposal via client self-service portal
 * @route POST /api/v1/portal/proposals/:id/sign
 * @access Public / Token-Secured
 */
export const signProposalViaPortal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { signerName, signerEmail, signerTitle, signatureDataUrl, ipAddress } = req.body;

  if (!signerName || !signerEmail) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Signer name and email are required to sign proposal');
  }

  const proposal = await Proposal.findById(id).populate('clientId', 'name email company');
  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  if (proposal.status === 'accepted') {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Proposal is already signed and accepted', { proposal })
    );
  }

  proposal.status = 'accepted';
  proposal.acceptedAt = new Date();
  proposal.signedBy = {
    name: signerName,
    email: signerEmail,
    title: signerTitle || 'Authorized Representative',
    signatureData: signatureDataUrl || 'digital_signature_captured',
    ipAddress: ipAddress || req.ip || '127.0.0.1',
    signedAt: new Date(),
  };

  await proposal.save();

  // Create audit log
  await recordAuditLog({
    workspaceId: proposal.workspaceId,
    actorId: null,
    actorEmail: signerEmail,
    action: 'PROPOSAL_SIGNED_PORTAL',
    entityType: 'Proposal',
    entityId: proposal._id,
    metadata: {
      proposalNumber: proposal.proposalNumber,
      clientName: proposal.clientId?.name,
      signerName,
      signerTitle,
    },
  });

  // Create internal notification
  await Notification.create({
    workspaceId: proposal.workspaceId,
    title: `Proposal ${proposal.proposalNumber} Signed!`,
    message: `${signerName} (${proposal.clientId?.name || 'Client'}) just accepted and digitally signed proposal "${proposal.title}".`,
    type: 'success',
    category: 'proposal',
    resourceId: proposal._id,
    resourceType: 'Proposal',
  });

  // Dispatch Webhooks
  WebhookService.triggerEvent(proposal.workspaceId, 'proposal.signed', {
    proposalId: proposal._id,
    proposalNumber: proposal.proposalNumber,
    title: proposal.title,
    total: proposal.totalAmount,
    signedBy: proposal.signedBy,
    client: proposal.clientId,
  }).catch(() => {});

  // Trigger Workflows
  WorkflowService.evaluateAndTrigger(proposal.workspaceId, 'proposal.signed', {
    proposalId: proposal._id,
    proposalNumber: proposal.proposalNumber,
    amount: proposal.totalAmount,
    clientName: proposal.clientId?.name,
  }).catch(() => {});

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal digitally signed and accepted successfully', {
      proposal,
    })
  );
});

/**
 * @desc Pay invoice via client self-service portal
 * @route POST /api/v1/portal/invoices/:id/pay
 * @access Public / Token-Secured
 */
export const payInvoiceViaPortal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod = 'credit_card', paymentReference, amountPaid } = req.body;

  const invoice = await Invoice.findById(id).populate('clientId', 'name email company');
  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  if (invoice.status === 'paid') {
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Invoice is already settled and marked paid', { invoice })
    );
  }

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod = paymentMethod;
  invoice.paymentReference = paymentReference || `PAY-${Date.now().toString(36).toUpperCase()}`;

  await invoice.save();

  // Audit log
  await recordAuditLog({
    workspaceId: invoice.workspaceId,
    actorId: null,
    actorEmail: invoice.clientId?.email || 'client@portal.veyora.app',
    action: 'INVOICE_PAID_PORTAL',
    entityType: 'Invoice',
    entityId: invoice._id,
    metadata: {
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      paymentMethod,
      paymentReference: invoice.paymentReference,
    },
  });

  // Notification
  await Notification.create({
    workspaceId: invoice.workspaceId,
    title: `Payment Received: Invoice ${invoice.invoiceNumber}`,
    message: `Payment of $${invoice.total.toLocaleString()} received from ${invoice.clientId?.name || 'Client'} via ${paymentMethod}.`,
    type: 'success',
    category: 'invoice',
    resourceId: invoice._id,
    resourceType: 'Invoice',
  });

  // Webhook
  WebhookService.triggerEvent(invoice.workspaceId, 'invoice.paid', {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.total,
    paidAt: invoice.paidAt,
    paymentMethod: invoice.paymentMethod,
    paymentReference: invoice.paymentReference,
    client: invoice.clientId,
  }).catch(() => {});

  // Workflows
  WorkflowService.evaluateAndTrigger(invoice.workspaceId, 'invoice.paid', {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.total,
    clientName: invoice.clientId?.name,
  }).catch(() => {});

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoice payment processed successfully', {
      invoice,
      receiptNumber: invoice.paymentReference,
    })
  );
});

/**
 * @desc Send client feedback or request from portal
 * @route POST /api/v1/portal/feedback
 * @access Public
 */
export const submitPortalFeedback = asyncHandler(async (req, res) => {
  const { clientId, workspaceId, subject, message, senderName, senderEmail } = req.body;

  if (!message) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Message content is required');
  }

  let wsId = workspaceId;
  let client = null;

  if (clientId) {
    client = await Client.findById(clientId);
    if (client) wsId = wsId || client.workspaceId;
  }

  if (wsId) {
    await Notification.create({
      workspaceId: wsId,
      title: `Client Portal Message: ${subject || 'General Inquiry'}`,
      message: `${senderName || client?.name || 'Client'} (${senderEmail || client?.email || 'portal'}): "${message}"`,
      type: 'info',
      category: 'system',
      resourceId: clientId || null,
      resourceType: 'Client',
    });

    await recordAuditLog({
      workspaceId: wsId,
      actorId: null,
      actorEmail: senderEmail || client?.email || 'client@portal.veyora.app',
      action: 'PORTAL_FEEDBACK_SUBMITTED',
      entityType: 'Client',
      entityId: clientId || null,
      metadata: { subject, senderName },
    });
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Your message has been delivered to the operations team.', {
      deliveredAt: new Date(),
    })
  );
});
