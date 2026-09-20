import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Invoice, Client, Workspace, Notification } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * @desc List invoices with filters and billing metrics
 * @route GET /api/v1/invoices
 * @access Protected (INVOICE_READ)
 */
export const getInvoices = asyncHandler(async (req, res) => {
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
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [invoices, total, billingSummary] = await Promise.all([
    Invoice.find(query)
      .populate('clientId', 'name company email phone')
      .populate('projectId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Invoice.countDocuments(query),
    Invoice.aggregate([
      { $match: { workspaceId: wsId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
          totalInvoiced: { $sum: '$totalAmount' },
        },
      },
    ]),
  ]);

  const summary = billingSummary[0] || {
    totalRevenue: 0,
    totalOutstanding: 0,
    totalInvoiced: 0,
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoices retrieved successfully', {
      invoices,
      billingSummary: summary,
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
 * @desc Get single invoice by ID
 * @route GET /api/v1/invoices/:id
 * @access Protected (INVOICE_READ)
 */
export const getInvoiceById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const invoice = await Invoice.findOne({ _id: id, workspaceId: wsId })
    .populate('clientId', 'name company email phone address')
    .populate('projectId', 'name code')
    .populate('proposalId', 'proposalNumber title');

  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoice details retrieved', { invoice })
  );
});

/**
 * @desc Create new invoice
 * @route POST /api/v1/invoices
 * @access Protected (INVOICE_CREATE)
 */
export const createInvoice = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  // Validate client exists
  const client = await Client.findOne({ _id: data.clientId, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Referenced client not found in workspace');
  }

  const ws = await Workspace.findById(wsId);

  // Auto-generate invoice number if omitted
  if (!data.invoiceNumber) {
    const prefix = ws?.billingSettings?.invoicePrefix || 'INV';
    const nextNum = ws?.billingSettings?.nextInvoiceNumber || 1001;
    const year = new Date().getFullYear();
    data.invoiceNumber = `${prefix}-${year}-${nextNum}`;

    // Increment next invoice number
    if (ws) {
      ws.billingSettings.nextInvoiceNumber = nextNum + 1;
      await ws.save();
    }
  }

  // Check unique invoiceNumber in workspace
  const existing = await Invoice.findOne({ workspaceId: wsId, invoiceNumber: data.invoiceNumber });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Invoice ${data.invoiceNumber} already exists in workspace`);
  }

  const invoice = new Invoice({
    ...data,
    workspaceId: wsId,
  });

  await invoice.save();

  // Update client's totalBilled
  client.totalBilled = (client.totalBilled || 0) + invoice.totalAmount;
  await client.save();

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'invoice.create',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Invoice created successfully', { invoice })
  );
});

/**
 * @desc Update invoice
 * @route PATCH /api/v1/invoices/:id
 * @access Protected (INVOICE_UPDATE)
 */
export const updateInvoice = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const data = req.body;

  const invoice = await Invoice.findOne({ _id: id, workspaceId: wsId });
  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  if (invoice.status === 'paid') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot modify a fully paid invoice');
  }

  Object.assign(invoice, data);
  await invoice.save();

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'invoice.update',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: { updatedFields: Object.keys(data) },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoice updated successfully', { invoice })
  );
});

/**
 * @desc Send invoice to client
 * @route POST /api/v1/invoices/:id/send
 * @access Protected (INVOICE_SEND)
 */
export const sendInvoice = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const invoice = await Invoice.findOne({ _id: id, workspaceId: wsId }).populate('clientId', 'name email');
  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  if (invoice.status === 'draft') {
    invoice.status = 'sent';
    await invoice.save();
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'invoice.send',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: { recipient: invoice.clientId?.email, invoiceNumber: invoice.invoiceNumber },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoice dispatched successfully', { invoice })
  );
});

/**
 * @desc Record payment settlement on invoice
 * @route POST /api/v1/invoices/:id/payments
 * @access Protected (INVOICE_PAY)
 */
export const recordPayment = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const { amount, method = 'stripe', transactionId, notes, paidAt = new Date() } = req.body;

  const invoice = await Invoice.findOne({ _id: id, workspaceId: wsId });
  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  if (invoice.balanceDue <= 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invoice is already fully settled');
  }

  const paymentRecord = {
    amount: Number(amount),
    paidAt,
    transactionId: transactionId || `tx_${Date.now()}`,
    method,
    notes,
  };

  invoice.paymentRecords.push(paymentRecord);
  await invoice.save(); // pre-save hook updates amountPaid, balanceDue, and status

  // Update client's totalPaid
  await Client.updateOne(
    { _id: invoice.clientId, workspaceId: wsId },
    { $inc: { totalPaid: Number(amount) } }
  );

  // Send notification to workspace owner
  const ws = await Workspace.findById(wsId);
  if (ws?.ownerId) {
    await Notification.create({
      workspaceId: wsId,
      recipientId: ws.ownerId,
      senderId: req.user?.id || null,
      type: 'invoice_paid',
      title: `Payment Received: ${invoice.invoiceNumber}`,
      message: `Payment of $${Number(amount).toLocaleString()} USD was recorded for ${invoice.invoiceNumber}. Remaining balance: $${invoice.balanceDue.toLocaleString()} USD`,
      link: `/invoices/${invoice._id}`,
    });
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'invoice.payment',
    entityType: 'Invoice',
    entityId: invoice._id,
    details: { amount, method, remainingBalance: invoice.balanceDue, status: invoice.status },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Payment recorded successfully', {
      invoice,
      paymentRecord,
    })
  );
});

/**
 * @desc Delete invoice
 * @route DELETE /api/v1/invoices/:id
 * @access Protected (INVOICE_DELETE)
 */
export const deleteInvoice = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const invoice = await Invoice.findOne({ _id: id, workspaceId: wsId });
  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invoice not found');
  }

  if (invoice.amountPaid > 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot delete an invoice that has recorded payments');
  }

  await Invoice.deleteOne({ _id: id, workspaceId: wsId });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'invoice.delete',
    entityType: 'Invoice',
    entityId: id,
    details: { invoiceNumber: invoice.invoiceNumber },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Invoice deleted successfully', { deletedId: id })
  );
});
