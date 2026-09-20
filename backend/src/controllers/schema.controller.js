import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import {
  User,
  Workspace,
  Client,
  Project,
  Task,
  Proposal,
  Invoice,
  Document,
  Notification,
  AuditLog,
} from '../models/index.js';

/**
 * @desc Get complete structural catalog of all Mongoose models
 * @route GET /api/v1/schemas/models-catalog
 * @access Public / Authenticated
 */
export const getModelsCatalog = asyncHandler(async (req, res) => {
  const models = [
    { name: 'Workspace', model: Workspace, desc: 'Multi-tenant agency workspace & root settings', category: 'core' },
    { name: 'User', model: User, desc: 'Staff, agency members, and client portal users', category: 'core' },
    { name: 'Client', model: Client, desc: 'Agency accounts, customer CRM, and billing profiles', category: 'crm' },
    { name: 'Project', model: Project, desc: 'Client projects, deliverables, milestones, and budgets', category: 'operations' },
    { name: 'Task', model: Task, desc: 'Project work items, kanban boards, time logs, and checklists', category: 'operations' },
    { name: 'Proposal', model: Proposal, desc: 'Client quotes, scope contracts, line items, and digital signatures', category: 'finance' },
    { name: 'Invoice', model: Invoice, desc: 'Billing, partial/full payment tracking, and balance reconciliation', category: 'finance' },
    { name: 'Document', model: Document, desc: 'Deliverables, design assets, contracts, and attachments', category: 'assets' },
    { name: 'Notification', model: Notification, desc: 'In-app activity alerts and workflow triggers', category: 'communication' },
    { name: 'AuditLog', model: AuditLog, desc: 'Compliance audit trail, security events, and entity mutations', category: 'security' },
  ];

  const catalog = models.map((m) => {
    const schema = m.model.schema;
    const paths = Object.keys(schema.paths);
    const indexes = schema.indexes();

    const pathDetails = paths.map((pathName) => {
      const pathObj = schema.paths[pathName];
      return {
        path: pathName,
        instance: pathObj.instance,
        isRequired: !!pathObj.isRequired,
        enum: pathObj.enumValues || null,
        defaultValue: typeof pathObj.defaultValue === 'function' ? 'Dynamic' : pathObj.defaultValue,
      };
    });

    return {
      modelName: m.name,
      collection: m.model.collection.name,
      description: m.desc,
      category: m.category,
      totalPaths: paths.length,
      indexCount: indexes.length,
      isMultiTenant: paths.includes('workspaceId'),
      paths: pathDetails,
      indexes: indexes.map(([fields, opts]) => ({ fields, ...opts })),
    };
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Mongoose models & schema catalog retrieved', {
      totalModels: catalog.length,
      multiTenantCount: catalog.filter((c) => c.isMultiTenant).length,
      models: catalog,
    })
  );
});

/**
 * @desc Get live record counts for all collections in current workspace
 * @route GET /api/v1/schemas/counts
 * @access Protected (Requires Tenant Context)
 */
export const getCollectionCounts = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;

  const [
    clientCount,
    projectCount,
    taskCount,
    proposalCount,
    invoiceCount,
    documentCount,
    notificationCount,
    auditLogCount,
  ] = await Promise.all([
    Client.countDocuments({ workspaceId: wsId }),
    Project.countDocuments({ workspaceId: wsId }),
    Task.countDocuments({ workspaceId: wsId }),
    Proposal.countDocuments({ workspaceId: wsId }),
    Invoice.countDocuments({ workspaceId: wsId }),
    Document.countDocuments({ workspaceId: wsId }),
    Notification.countDocuments({ workspaceId: wsId }),
    AuditLog.countDocuments({ workspaceId: wsId }),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Tenant collection record counts retrieved', {
      workspaceId: wsId,
      counts: {
        clients: clientCount,
        projects: projectCount,
        tasks: taskCount,
        proposals: proposalCount,
        invoices: invoiceCount,
        documents: documentCount,
        notifications: notificationCount,
        auditLogs: auditLogCount,
        totalEntities:
          clientCount +
          projectCount +
          taskCount +
          proposalCount +
          invoiceCount +
          documentCount +
          notificationCount +
          auditLogCount,
      },
    })
  );
});

/**
 * @desc Seed realistic client operations dataset into active workspace
 * @route POST /api/v1/schemas/seed-sample-data
 * @access Protected (Requires Tenant Context)
 */
export const seedSampleData = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;

  // 1. Create Sample Clients
  let clientA = await Client.findOne({ workspaceId: wsId, email: 'contact@acmeglobal.com' });
  if (!clientA) {
    clientA = await Client.create({
      workspaceId: wsId,
      name: 'Sarah Jenkins',
      company: 'Acme Global Dynamics',
      email: 'contact@acmeglobal.com',
      phone: '+1 (555) 349-2910',
      website: 'https://acmeglobal.example.com',
      status: 'active',
      currency: 'USD',
      portalAccess: true,
      tags: ['enterprise', 'retainer'],
      notes: 'Premier strategic partner; retainer renews every 6 months.',
      totalBilled: 12500,
      totalPaid: 6250,
      address: {
        street: '100 Innovation Blvd, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'USA',
      },
    });
  }

  let clientB = await Client.findOne({ workspaceId: wsId, email: 'alex@solariainteractive.io' });
  if (!clientB) {
    clientB = await Client.create({
      workspaceId: wsId,
      name: 'Alexandre Roy',
      company: 'Solaria Interactive',
      email: 'alex@solariainteractive.io',
      phone: '+1 (555) 782-9912',
      website: 'https://solariainteractive.io',
      status: 'lead',
      currency: 'USD',
      portalAccess: false,
      tags: ['fintech', 'mvp'],
      notes: 'High-growth fintech startup seeking custom client portal MVP.',
      totalBilled: 8400,
      totalPaid: 8400,
      address: {
        street: '450 Lexington Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10017',
        country: 'USA',
      },
    });
  }

  // 2. Create Sample Projects
  let projectA = await Project.findOne({ workspaceId: wsId, name: 'Brand Identity & Web Application Redesign' });
  if (!projectA) {
    projectA = await Project.create({
      workspaceId: wsId,
      clientId: clientA._id,
      name: 'Brand Identity & Web Application Redesign',
      code: 'PRJ-ACME-01',
      description: 'Full rebrand, modern design system, and multi-tenant portal implementation.',
      status: 'active',
      priority: 'high',
      budget: 15000,
      currency: 'USD',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      progressPercent: 45,
      assignees: [userId],
      tags: ['design-system', 'react', 'tailwind'],
    });
  }

  let projectB = await Project.findOne({ workspaceId: wsId, name: 'Mobile Client Portal MVP' });
  if (!projectB) {
    projectB = await Project.create({
      workspaceId: wsId,
      clientId: clientB._id,
      name: 'Mobile Client Portal MVP',
      code: 'PRJ-SOL-02',
      description: 'Responsive customer self-service portal with invoice checkout and file downloads.',
      status: 'planning',
      priority: 'medium',
      budget: 9500,
      currency: 'USD',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progressPercent: 15,
      assignees: [userId],
      tags: ['mvp', 'portal'],
    });
  }

  // 3. Create Sample Tasks
  const taskSpecs = [
    {
      title: 'Design System & Token Architecture',
      description: 'Define semantic color palettes, type scale, and reusable components in Figma.',
      status: 'done',
      priority: 'high',
      estimatedHours: 12,
      loggedHours: 12,
      position: 1,
      checklist: [
        { title: 'Color palettes & contrast audits', completed: true },
        { title: 'Typography & modular scale', completed: true },
        { title: 'Button & input microstates', completed: true },
      ],
    },
    {
      title: 'Authentication & Role-Based Middleware',
      description: 'Implement JWT session cookies with refresh rotation and RBAC policy guards.',
      status: 'in-progress',
      priority: 'urgent',
      estimatedHours: 16,
      loggedHours: 9.5,
      position: 2,
      checklist: [
        { title: 'JWT access & refresh tokens', completed: true },
        { title: 'HTTP-only secure cookies', completed: true },
        { title: 'Multi-tenant isolation barrier', completed: true },
        { title: 'Granular permissions matrix', completed: false },
      ],
    },
    {
      title: 'Client Invoicing & Stripe Webhook Integration',
      description: 'Connect automated balance updates and downloadable PDF invoice generator.',
      status: 'todo',
      priority: 'medium',
      estimatedHours: 14,
      loggedHours: 0,
      position: 3,
      checklist: [
        { title: 'Stripe webhook receiver', completed: false },
        { title: 'Auto-reconcile balance due', completed: false },
      ],
    },
    {
      title: 'Client Review & Sign-Off Milestone',
      description: 'Conduct interactive walkthrough of MVP milestones with Sarah Jenkins.',
      status: 'in-review',
      priority: 'high',
      estimatedHours: 4,
      loggedHours: 3,
      position: 4,
      checklist: [
        { title: 'Prepare staging environment link', completed: true },
        { title: 'Gather feedback matrix', completed: false },
      ],
    },
  ];

  for (const t of taskSpecs) {
    const existing = await Task.findOne({ workspaceId: wsId, title: t.title });
    if (!existing) {
      await Task.create({
        workspaceId: wsId,
        projectId: projectA._id,
        clientId: clientA._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        loggedHours: t.loggedHours,
        assigneeId: userId,
        creatorId: userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checklist: t.checklist,
        position: t.position,
      });
    }
  }

  // 4. Create Sample Proposal
  let proposal = await Proposal.findOne({ workspaceId: wsId, proposalNumber: 'PROP-2026-001' });
  if (!proposal) {
    proposal = await Proposal.create({
      workspaceId: wsId,
      clientId: clientA._id,
      projectId: projectA._id,
      proposalNumber: 'PROP-2026-001',
      title: 'Strategic Brand & Web Redesign Agreement',
      status: 'accepted',
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      currency: 'USD',
      lineItems: [
        { description: 'Phase 1: Brand Discovery & Visual Identity Spec', quantity: 1, unitPrice: 4500, amount: 4500 },
        { description: 'Phase 2: React Component Library & Multi-Tenant App', quantity: 1, unitPrice: 7000, amount: 7000 },
        { description: 'Phase 3: QA, Cloud Run Deployment & Handover', quantity: 1, unitPrice: 1000, amount: 1000 },
      ],
      subtotal: 12500,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 12500,
      notes: 'Thank you for choosing VEYORA Studio. Work commences upon 50% initial deposit.',
      terms: 'Net 30. All IP transferred upon final invoice settlement.',
      signature: {
        signedBy: 'Sarah Jenkins',
        signedEmail: 'contact@acmeglobal.com',
        signedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        ipAddress: '198.51.100.42',
      },
    });
  }

  // 5. Create Sample Invoices
  let invoice1 = await Invoice.findOne({ workspaceId: wsId, invoiceNumber: 'INV-2026-001' });
  if (!invoice1) {
    invoice1 = await Invoice.create({
      workspaceId: wsId,
      clientId: clientA._id,
      projectId: projectA._id,
      proposalId: proposal._id,
      invoiceNumber: 'INV-2026-001',
      status: 'paid',
      issueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      currency: 'USD',
      lineItems: [
        { description: '50% Project Kickoff Deposit — Brand Redesign', quantity: 1, unitPrice: 6250, amount: 6250 },
      ],
      subtotal: 6250,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 6250,
      amountPaid: 6250,
      balanceDue: 0,
      paymentMethod: 'stripe',
      paymentRecords: [
        {
          amount: 6250,
          paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          transactionId: 'ch_3N8zXF2eZvKYlo2C19dG88x1',
          method: 'stripe',
          notes: 'Automated Stripe card checkout settlement',
        },
      ],
      notes: 'Initial 50% commencement retainer paid in full.',
    });
  }

  let invoice2 = await Invoice.findOne({ workspaceId: wsId, invoiceNumber: 'INV-2026-002' });
  if (!invoice2) {
    invoice2 = await Invoice.create({
      workspaceId: wsId,
      clientId: clientA._id,
      projectId: projectA._id,
      proposalId: proposal._id,
      invoiceNumber: 'INV-2026-002',
      status: 'sent',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      currency: 'USD',
      lineItems: [
        { description: 'Final Milestone Balance — Delivery & Deployment', quantity: 1, unitPrice: 6250, amount: 6250 },
      ],
      subtotal: 6250,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 6250,
      amountPaid: 0,
      balanceDue: 6250,
      paymentMethod: 'stripe',
      notes: 'Net 14 payment terms. Please settle via portal or direct bank transfer.',
    });
  }

  // 6. Create Sample Documents
  let doc1 = await Document.findOne({ workspaceId: wsId, fileName: 'Design_System_Spec_v1.0.pdf' });
  if (!doc1) {
    await Document.create({
      workspaceId: wsId,
      clientId: clientA._id,
      projectId: projectA._id,
      title: 'Design System & Component Guidelines v1.0',
      fileName: 'Design_System_Spec_v1.0.pdf',
      fileUrl: 'https://storage.googleapis.com/veyora-assets/demo/Design_System_Spec_v1.0.pdf',
      fileSize: 4194304, // 4MB
      mimeType: 'application/pdf',
      category: 'design',
      uploadedBy: userId,
    });
  }

  let doc2 = await Document.findOne({ workspaceId: wsId, fileName: 'Master_Services_Agreement_2026.pdf' });
  if (!doc2) {
    await Document.create({
      workspaceId: wsId,
      clientId: clientA._id,
      projectId: projectA._id,
      title: 'Signed Master Services Agreement (MSA)',
      fileName: 'Master_Services_Agreement_2026.pdf',
      fileUrl: 'https://storage.googleapis.com/veyora-assets/demo/Master_Services_Agreement_2026.pdf',
      fileSize: 1572864, // 1.5MB
      mimeType: 'application/pdf',
      category: 'contract',
      uploadedBy: userId,
    });
  }

  // 7. Create Sample Notifications
  await Notification.create({
    workspaceId: wsId,
    recipientId: userId,
    type: 'invoice_paid',
    title: 'Payment Received: INV-2026-001',
    message: 'Acme Global Dynamics has paid $6,250.00 USD via Stripe.',
    link: '/invoices/INV-2026-001',
    isRead: true,
    readAt: new Date(),
  });

  await Notification.create({
    workspaceId: wsId,
    recipientId: userId,
    type: 'proposal_signed',
    title: 'Proposal Accepted: PROP-2026-001',
    message: 'Sarah Jenkins digitally signed the Strategic Brand & Web Redesign Agreement.',
    link: '/proposals/PROP-2026-001',
    isRead: false,
  });

  await Notification.create({
    workspaceId: wsId,
    recipientId: userId,
    type: 'task_assigned',
    title: 'Sprint Assignment: Multi-Region Failover Architecture',
    message: 'Arthur Sterling assigned you as reviewer on sprint task #TSK-902.',
    link: '/tasks',
    isRead: false,
  });

  await Notification.create({
    workspaceId: wsId,
    recipientId: userId,
    type: 'system',
    title: 'Workspace Security Audit Completed',
    message: 'Automated policy scan found zero critical vulnerabilities.',
    link: '/dashboard',
    isRead: true,
    readAt: new Date(),
  });

  // 8. Create Sample Audit Logs
  await AuditLog.create({
    workspaceId: wsId,
    actorId: userId,
    actorName: req.user.name,
    actorEmail: req.user.email,
    action: 'proposal.accept',
    entityType: 'Proposal',
    entityId: proposal._id.toString(),
    details: { proposalNumber: 'PROP-2026-001', amount: 12500, signer: 'Sarah Jenkins' },
    ipAddress: '198.51.100.42',
    userAgent: req.headers['user-agent'] || 'Mozilla/5.0',
  });

  await AuditLog.create({
    workspaceId: wsId,
    actorId: userId,
    actorName: 'Stripe Webhook',
    actorEmail: 'system@stripe.com',
    action: 'invoice.payment_success',
    entityType: 'Invoice',
    entityId: invoice1._id.toString(),
    details: { invoiceNumber: 'INV-2026-001', paidAmount: 6250, method: 'stripe' },
    ipAddress: '54.187.174.169',
    userAgent: 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Realistic sample operations data successfully seeded', {
      workspaceId: wsId,
      seededEntities: {
        clients: 2,
        projects: 2,
        tasks: 4,
        proposals: 1,
        invoices: 2,
        documents: 2,
        notifications: 2,
        auditLogs: 2,
      },
    })
  );
});

/**
 * @desc Clear seeded operational sample data from active workspace
 * @route DELETE /api/v1/schemas/clear-sample-data
 * @access Protected (Requires Tenant Context)
 */
export const clearSampleData = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;

  await Promise.all([
    Client.deleteMany({ workspaceId: wsId }),
    Project.deleteMany({ workspaceId: wsId }),
    Task.deleteMany({ workspaceId: wsId }),
    Proposal.deleteMany({ workspaceId: wsId }),
    Invoice.deleteMany({ workspaceId: wsId }),
    Document.deleteMany({ workspaceId: wsId }),
    Notification.deleteMany({ workspaceId: wsId }),
    AuditLog.deleteMany({ workspaceId: wsId }),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Sample operational data cleared from workspace', {
      workspaceId: wsId,
    })
  );
});
