import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Document, Project, Client } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../../uploads');

/**
 * @desc List documents in workspace with filters and pagination
 * @route GET /api/v1/documents
 * @access Protected (DOCUMENT_READ)
 */
export const getDocuments = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const {
    page = 1,
    limit = 50,
    clientId,
    projectId,
    category,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { workspaceId: wsId };

  if (clientId) query.clientId = clientId;
  if (projectId) query.projectId = projectId;
  if (category && category !== 'all') query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [documents, total] = await Promise.all([
    Document.find(query)
      .populate('clientId', 'name company email')
      .populate('projectId', 'name code')
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Document.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Documents retrieved successfully', {
      documents,
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
 * @desc Get document storage stats and category breakdown
 * @route GET /api/v1/documents/stats
 * @access Protected (DOCUMENT_READ)
 */
export const getDocumentStats = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;

  const [categoryStats, totalStats] = await Promise.all([
    Document.aggregate([
      { $match: { workspaceId: wsId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalBytes: { $sum: '$fileSize' },
        },
      },
    ]),
    Document.aggregate([
      { $match: { workspaceId: wsId } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalBytes: { $sum: '$fileSize' },
        },
      },
    ]),
  ]);

  const totalCount = totalStats[0]?.totalCount || 0;
  const totalBytes = totalStats[0]?.totalBytes || 0;

  const breakdown = {
    contract: { count: 0, totalBytes: 0 },
    design: { count: 0, totalBytes: 0 },
    deliverable: { count: 0, totalBytes: 0 },
    invoice: { count: 0, totalBytes: 0 },
    brief: { count: 0, totalBytes: 0 },
    asset: { count: 0, totalBytes: 0 },
    other: { count: 0, totalBytes: 0 },
  };

  categoryStats.forEach((cat) => {
    if (cat._id && breakdown[cat._id]) {
      breakdown[cat._id] = {
        count: cat.count,
        totalBytes: cat.totalBytes,
      };
    }
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Document statistics retrieved', {
      totalCount,
      totalBytes,
      breakdown,
    })
  );
});

/**
 * @desc Get single document by ID
 * @route GET /api/v1/documents/:id
 * @access Protected (DOCUMENT_READ)
 */
export const getDocumentById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const document = await Document.findOne({ _id: id, workspaceId: wsId })
    .populate('clientId', 'name company email')
    .populate('projectId', 'name code')
    .populate('uploadedBy', 'name email');

  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Document retrieved successfully', { document })
  );
});

/**
 * @desc Create / Register document metadata (External URL or Direct Link)
 * @route POST /api/v1/documents
 * @access Protected (DOCUMENT_UPLOAD)
 */
export const createDocument = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  if (data.projectId) {
    const project = await Project.findOne({ _id: data.projectId, workspaceId: wsId });
    if (!project) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Project not found in workspace');
    if (!data.clientId) data.clientId = project.clientId;
  }

  const document = await Document.create({
    ...data,
    workspaceId: wsId,
    uploadedBy: req.user.id,
  });

  const populated = await Document.findById(document._id)
    .populate('clientId', 'name company')
    .populate('projectId', 'name code')
    .populate('uploadedBy', 'name email');

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'document.upload',
    entityType: 'Document',
    entityId: document._id,
    details: { title: document.title, fileName: document.fileName, category: document.category },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Document registered successfully', { document: populated })
  );
});

/**
 * @desc Handle Multipart File Upload
 * @route POST /api/v1/documents/upload
 * @access Protected (DOCUMENT_UPLOAD)
 */
export const uploadDocumentFile = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please select a file to upload');
  }

  const { title, clientId, projectId, taskId, category } = req.body;

  const file = req.file;
  const fileUrl = `/uploads/${file.filename}`;

  // Guess category if not explicitly provided
  let determinedCategory = category || 'deliverable';
  const ext = path.extname(file.originalname).toLowerCase();
  if (!category) {
    if (['.fig', '.sketch', '.xd', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ai', '.psd'].includes(ext)) {
      determinedCategory = 'design';
    } else if (['.pdf', '.docx', '.doc'].includes(ext) && file.originalname.toLowerCase().includes('contract')) {
      determinedCategory = 'contract';
    } else if (['.zip', '.tar', '.gz', '.json', '.mp4'].includes(ext)) {
      determinedCategory = 'asset';
    }
  }

  const documentTitle = title?.trim() || file.originalname;

  const document = await Document.create({
    workspaceId: wsId,
    title: documentTitle,
    fileName: file.originalname,
    fileUrl,
    fileSize: file.size,
    mimeType: file.mimetype || 'application/octet-stream',
    category: determinedCategory,
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    taskId: taskId || undefined,
    uploadedBy: req.user.id,
  });

  const populated = await Document.findById(document._id)
    .populate('clientId', 'name company')
    .populate('projectId', 'name code')
    .populate('uploadedBy', 'name email');

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'document.upload',
    entityType: 'Document',
    entityId: document._id,
    details: {
      title: document.title,
      fileName: document.fileName,
      category: document.category,
      fileSize: document.fileSize,
    },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'File uploaded and registered successfully', {
      document: populated,
    })
  );
});

/**
 * @desc Update document metadata
 * @route PATCH /api/v1/documents/:id
 * @access Protected (DOCUMENT_UPLOAD)
 */
export const updateDocument = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const { title, category, clientId, projectId, taskId } = req.body;

  const document = await Document.findOne({ _id: id, workspaceId: wsId });
  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
  }

  if (title !== undefined) document.title = title.trim();
  if (category !== undefined) document.category = category;
  if (clientId !== undefined) document.clientId = clientId || null;
  if (projectId !== undefined) document.projectId = projectId || null;
  if (taskId !== undefined) document.taskId = taskId || null;

  await document.save();

  const populated = await Document.findById(document._id)
    .populate('clientId', 'name company')
    .populate('projectId', 'name code')
    .populate('uploadedBy', 'name email');

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'document.update',
    entityType: 'Document',
    entityId: document._id,
    details: { title: document.title, category: document.category },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Document updated successfully', { document: populated })
  );
});

/**
 * @desc Delete document and purge local file if stored locally
 * @route DELETE /api/v1/documents/:id
 * @access Protected (DOCUMENT_DELETE)
 */
export const deleteDocument = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const document = await Document.findOne({ _id: id, workspaceId: wsId });
  if (!document) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Document not found');
  }

  // If local file, attempt to remove safely from disk
  if (document.fileUrl && document.fileUrl.startsWith('/uploads/')) {
    const filename = path.basename(document.fileUrl);
    const localFilePath = path.join(uploadsDir, filename);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.warn('Could not delete local file from disk:', err);
      }
    }
  }

  await Document.deleteOne({ _id: id, workspaceId: wsId });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'document.delete',
    entityType: 'Document',
    entityId: id,
    details: { fileName: document.fileName },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Document deleted successfully', { deletedId: id })
  );
});
