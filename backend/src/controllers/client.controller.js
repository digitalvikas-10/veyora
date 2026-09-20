import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Client, Project, Invoice } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';
import { WebhookService } from '../services/webhook.service.js';
import { WorkflowService } from '../services/workflow.service.js';

/**
 * @desc List clients in current workspace with search, filter, and pagination
 * @route GET /api/v1/clients
 * @access Protected (CLIENT_READ)
 */
export const getClients = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { page = 1, limit = 10, search, status, tag, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query = { workspaceId: wsId };

  if (status) query.status = status;
  if (tag) query.tags = tag;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [clients, total] = await Promise.all([
    Client.find(query).sort(sort).skip(skip).limit(Number(limit)),
    Client.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Clients retrieved successfully', {
      clients,
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
 * @desc Get single client by ID with related project and invoice summary
 * @route GET /api/v1/clients/:id
 * @access Protected (CLIENT_READ)
 */
export const getClientById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const client = await Client.findOne({ _id: id, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Client not found in current workspace');
  }

  // Aggregate active projects and invoices for overview
  const [projects, invoices] = await Promise.all([
    Project.find({ clientId: client._id, workspaceId: wsId })
      .select('name code status priority budget progressPercent targetDate')
      .sort({ createdAt: -1 })
      .limit(5),
    Invoice.find({ clientId: client._id, workspaceId: wsId })
      .select('invoiceNumber status totalAmount amountPaid balanceDue dueDate')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Client details retrieved', {
      client,
      recentProjects: projects,
      recentInvoices: invoices,
    })
  );
});

/**
 * @desc Create new client in current workspace
 * @route POST /api/v1/clients
 * @access Protected (CLIENT_CREATE)
 */
export const createClient = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  // Check unique email in workspace
  const existing = await Client.findOne({ workspaceId: wsId, email: data.email });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'A client with this email address already exists in your workspace');
  }

  const client = await Client.create({
    ...data,
    workspaceId: wsId,
  });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'client.create',
    entityType: 'Client',
    entityId: client._id,
    details: { name: client.name, company: client.company, email: client.email },
    req,
  });

  // Non-blocking trigger for Webhook and Workflow Automation Engine
  Promise.allSettled([
    WebhookService.dispatchEvent({
      workspaceId: wsId,
      event: 'client.created',
      data: client.toObject(),
      actorId: req.user?._id,
    }),
    WorkflowService.triggerEvent({
      workspaceId: wsId,
      event: 'client.created',
      data: client.toObject(),
      actorId: req.user?._id,
    }),
  ]).catch((err) => console.warn('Automation trigger notice:', err.message));

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Client created successfully', { client })
  );
});

/**
 * @desc Update client profile
 * @route PATCH /api/v1/clients/:id
 * @access Protected (CLIENT_UPDATE)
 */
export const updateClient = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const data = req.body;

  if (data.email) {
    const existing = await Client.findOne({
      workspaceId: wsId,
      email: data.email,
      _id: { $ne: id },
    });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Another client already uses this email address');
    }
  }

  const client = await Client.findOneAndUpdate(
    { _id: id, workspaceId: wsId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Client not found');
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'client.update',
    entityType: 'Client',
    entityId: client._id,
    details: { updatedFields: Object.keys(data) },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Client updated successfully', { client })
  );
});

/**
 * @desc Delete client and cascade status check
 * @route DELETE /api/v1/clients/:id
 * @access Protected (CLIENT_DELETE)
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const client = await Client.findOne({ _id: id, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Client not found');
  }

  // Prevent accidental deletion if active projects exist
  const activeProjectsCount = await Project.countDocuments({
    clientId: id,
    workspaceId: wsId,
    status: { $in: ['planning', 'active', 'on-hold'] },
  });

  if (activeProjectsCount > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot delete client with ${activeProjectsCount} active project(s). Archive the client or close projects first.`
    );
  }

  await Client.deleteOne({ _id: id, workspaceId: wsId });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'client.delete',
    entityType: 'Client',
    entityId: id,
    details: { name: client.name, company: client.company },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Client deleted successfully', { deletedId: id })
  );
});
