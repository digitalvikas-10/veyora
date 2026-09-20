import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Project, Client, Task } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * @desc List projects in workspace with filters and pagination
 * @route GET /api/v1/projects
 * @access Protected (PROJECT_READ)
 */
export const getProjects = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const {
    page = 1,
    limit = 10,
    search,
    clientId,
    status,
    priority,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = { workspaceId: wsId };

  if (clientId) query.clientId = clientId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('clientId', 'name company email')
      .populate('assignees', 'name email avatar role')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Projects retrieved successfully', {
      projects,
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
 * @desc Get project by ID with task metrics breakdown
 * @route GET /api/v1/projects/:id
 * @access Protected (PROJECT_READ)
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const project = await Project.findOne({ _id: id, workspaceId: wsId })
    .populate('clientId', 'name company email phone')
    .populate('assignees', 'name email avatar role');

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Project not found in current workspace');
  }

  // Calculate live task metrics
  const [totalTasks, doneTasks, loggedHoursSummary] = await Promise.all([
    Task.countDocuments({ projectId: project._id, workspaceId: wsId }),
    Task.countDocuments({ projectId: project._id, workspaceId: wsId, status: 'done' }),
    Task.aggregate([
      { $match: { projectId: project._id, workspaceId: wsId } },
      { $group: { _id: null, totalLogged: { $sum: '$loggedHours' }, totalEst: { $sum: '$estimatedHours' } } },
    ]),
  ]);

  const stats = {
    totalTasks,
    doneTasks,
    pendingTasks: totalTasks - doneTasks,
    completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progressPercent,
    totalLoggedHours: loggedHoursSummary[0]?.totalLogged || 0,
    totalEstimatedHours: loggedHoursSummary[0]?.totalEst || 0,
  };

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Project details retrieved', { project, stats })
  );
});

/**
 * @desc Create new project
 * @route POST /api/v1/projects
 * @access Protected (PROJECT_CREATE)
 */
export const createProject = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  // Validate client exists in workspace
  const client = await Client.findOne({ _id: data.clientId, workspaceId: wsId });
  if (!client) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Referenced client does not exist in this workspace');
  }

  // Auto-generate project code if not provided
  if (!data.code) {
    const initials = client.company
      ? client.company.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
      : 'PRJ';
    const count = await Project.countDocuments({ workspaceId: wsId });
    data.code = `${initials}-${String(count + 1).padStart(3, '0')}`;
  }

  const project = await Project.create({
    ...data,
    workspaceId: wsId,
  });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'project.create',
    entityType: 'Project',
    entityId: project._id,
    details: { name: project.name, code: project.code, clientId: project.clientId },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Project created successfully', { project })
  );
});

/**
 * @desc Update project
 * @route PATCH /api/v1/projects/:id
 * @access Protected (PROJECT_UPDATE)
 */
export const updateProject = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const data = req.body;

  if (data.clientId) {
    const client = await Client.findOne({ _id: data.clientId, workspaceId: wsId });
    if (!client) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Referenced client not found');
    }
  }

  const project = await Project.findOneAndUpdate(
    { _id: id, workspaceId: wsId },
    { $set: data },
    { new: true, runValidators: true }
  ).populate('clientId', 'name company email');

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Project not found');
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'project.update',
    entityType: 'Project',
    entityId: project._id,
    details: { updatedFields: Object.keys(data) },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Project updated successfully', { project })
  );
});

/**
 * @desc Delete project
 * @route DELETE /api/v1/projects/:id
 * @access Protected (PROJECT_DELETE)
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const project = await Project.findOne({ _id: id, workspaceId: wsId });
  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Project not found');
  }

  // Clean up associated tasks
  await Task.deleteMany({ projectId: id, workspaceId: wsId });
  await Project.deleteOne({ _id: id, workspaceId: wsId });

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'project.delete',
    entityType: 'Project',
    entityId: id,
    details: { name: project.name, code: project.code },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Project and related tasks deleted successfully', { deletedId: id })
  );
});
