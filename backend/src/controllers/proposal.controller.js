import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Proposal, Client, Workspace, Notification } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * @desc List proposals in workspace
 * @route GET /api/v1/proposals
 * @access Protected (PROPOSAL_READ)
 */
export const getProposals = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const {
    page = 1,
    limit = 10,
    clientId,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { workspaceId: wsId };

  if (clientId) query.clientId = clientId;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { proposalNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [proposals, total] = await Promise.all([
    Proposal.find(query)
      .populate('clientId', 'name company email phone')
      .populate('projectId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Proposal.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposals retrieved successfully', {
      proposals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    })
  );
});

/**
 * @desc Get single proposal by ID
 * @route GET /api/v1/proposals/:id
 * @access Protected (PROPOSAL_READ)
 */
export const getProposalById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const proposal = await Proposal.findOne({ _id: id, workspaceId: wsId })
    .populate('clientId', 'name company email phone address')
    .populate('projectId', 'name code description');

  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal details retrieved', { proposal })
  );
});

/**
 * @desc Create new proposal
 * @route POST /api/v1/proposals
 * @access Protected (PROPOSAL_CREATE)
 */
export const createProposal = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  // Validate client exists
  const client = await Client.findOne({ _id: data.clientId, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Referenced client not found');
  }

  // Auto-generate proposal number if not provided
  if (!data.proposalNumber) {
    const ws = await Workspace.findById(wsId);
    const prefix = ws?.billingSettings?.proposalPrefix || 'PROP';
    const year = new Date().getFullYear();
    const count = await Proposal.countDocuments({ workspaceId: wsId });
    data.proposalNumber = `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  // Check uniqueness of proposal number in workspace
  const existing = await Proposal.findOne({ workspaceId: wsId, proposalNumber: data.proposalNumber });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Proposal number ${data.proposalNumber} already exists in workspace`);
  }

  const proposal = new Proposal({
    ...data,
    workspaceId: wsId,
  });

  await proposal.save();

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'proposal.create',
    entityType: 'Proposal',
    entityId: proposal._id,
    details: { proposalNumber: proposal.proposalNumber, totalAmount: proposal.totalAmount },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Proposal created successfully', { proposal })
  );
});

/**
 * @desc Update proposal
 * @route PATCH /api/v1/proposals/:id
 * @access Protected (PROPOSAL_UPDATE)
 */
export const updateProposal = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const data = req.body;

  const proposal = await Proposal.findOne({ _id: id, workspaceId: wsId });
  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  if (proposal.status === 'accepted') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot modify an accepted proposal contract');
  }

  Object.assign(proposal, data);
  await proposal.save(); // triggers financial recalculation pre-save hook

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'proposal.update',
    entityType: 'Proposal',
    entityId: proposal._id,
    details: { updatedFields: Object.keys(data) },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal updated successfully', { proposal })
  );
});

/**
 * @desc Mark proposal as sent to client
 * @route POST /api/v1/proposals/:id/send
 * @access Protected (PROPOSAL_SEND)
 */
export const sendProposal = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const proposal = await Proposal.findOne({ _id: id, workspaceId: wsId }).populate('clientId', 'name email');
  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  proposal.status = 'sent';
  await proposal.save();

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'proposal.send',
    entityType: 'Proposal',
    entityId: proposal._id,
    details: { recipient: proposal.clientId?.email },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal marked as sent', { proposal })
  );
});

/**
 * @desc Digitally sign / approve proposal
 * @route POST /api/v1/proposals/:id/sign
 * @access Protected (PROPOSAL_APPROVE)
 */
export const signProposal = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const { signedBy, signedEmail } = req.body;

  const proposal = await Proposal.findOne({ _id: id, workspaceId: wsId });
  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  proposal.status = 'accepted';
  proposal.signature = {
    signedBy,
    signedEmail,
    signedAt: new Date(),
    ipAddress: Array.isArray(clientIp) ? clientIp[0] : clientIp,
  };

  await proposal.save();

  // Alert workspace staff
  const ws = await Workspace.findById(wsId);
  if (ws?.ownerId) {
    await Notification.create({
      workspaceId: wsId,
      recipientId: ws.ownerId,
      senderId: req.user?.id || null,
      type: 'proposal_signed',
      title: `Proposal Accepted: ${proposal.proposalNumber}`,
      message: `${signedBy} (${signedEmail}) signed proposal "${proposal.title}" for $${proposal.totalAmount.toLocaleString()} USD`,
      link: `/proposals/${proposal._id}`,
    });
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'proposal.sign',
    entityType: 'Proposal',
    entityId: proposal._id,
    details: { signedBy, signedEmail, totalAmount: proposal.totalAmount },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal accepted and signed successfully', { proposal })
  );
});

/**
 * @desc Delete proposal
 * @route DELETE /api/v1/proposals/:id
 * @access Protected (PROPOSAL_DELETE)
 */
export const deleteProposal = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const proposal = await Proposal.findOne({ _id: id, workspaceId: wsId });
  if (!proposal) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Proposal not found');
  }

  await Proposal.deleteOne({ _id: id, workspaceId: wsId });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'proposal.delete',
    entityType: 'Proposal',
    entityId: id,
    details: { proposalNumber: proposal.proposalNumber },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Proposal deleted successfully', { deletedId: id })
  );
});
