import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Task, Project, Notification } from '../models/index.js';
import { recordAuditLog } from '../utils/auditLogger.js';

/**
 * @desc List tasks with filters (project, assignee, status, priority)
 * @route GET /api/v1/tasks
 * @access Protected (TASK_READ)
 */
export const getTasks = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const {
    page = 1,
    limit = 20,
    projectId,
    clientId,
    assigneeId,
    status,
    priority,
    search,
    sortBy = 'position',
    sortOrder = 'asc',
  } = req.query;

  const query = { workspaceId: wsId };

  if (projectId) query.projectId = projectId;
  if (clientId) query.clientId = clientId;
  if (assigneeId) query.assigneeId = assigneeId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1, createdAt: -1 };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('projectId', 'name code status')
      .populate('assigneeId', 'name email avatar')
      .populate('creatorId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Tasks retrieved successfully', {
      tasks,
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
 * @desc Get single task by ID
 * @route GET /api/v1/tasks/:id
 * @access Protected (TASK_READ)
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, workspaceId: wsId })
    .populate('projectId', 'name code status')
    .populate('clientId', 'name company email')
    .populate('assigneeId', 'name email avatar role')
    .populate('creatorId', 'name email avatar')
    .populate('timeLogs.userId', 'name email avatar');

  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Task details retrieved', { task })
  );
});

/**
 * @desc Create new task
 * @route POST /api/v1/tasks
 * @access Protected (TASK_CREATE)
 */
export const createTask = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const data = req.body;

  // Validate parent project
  const project = await Project.findOne({ _id: data.projectId, workspaceId: wsId });
  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Referenced project does not exist');
  }

  // Auto-set client ID from project if omitted
  if (!data.clientId) {
    data.clientId = project.clientId;
  }

  const task = await Task.create({
    ...data,
    workspaceId: wsId,
    creatorId: req.user.id,
  });

  // If assigned to a team member other than creator, trigger notification
  if (data.assigneeId && String(data.assigneeId) !== String(req.user.id)) {
    await Notification.create({
      workspaceId: wsId,
      recipientId: data.assigneeId,
      senderId: req.user.id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `${req.user.name} assigned you to task: "${task.title}" on project "${project.name}"`,
      link: `/tasks/${task._id}`,
    });
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'task.create',
    entityType: 'Task',
    entityId: task._id,
    details: { title: task.title, projectId: task.projectId },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Task created successfully', { task })
  );
});

/**
 * @desc Update task
 * @route PATCH /api/v1/tasks/:id
 * @access Protected (TASK_UPDATE)
 */
export const updateTask = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const data = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: id, workspaceId: wsId },
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate('projectId', 'name code')
    .populate('assigneeId', 'name email avatar');

  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'task.update',
    entityType: 'Task',
    entityId: task._id,
    details: { updatedFields: Object.keys(data) },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Task updated successfully', { task })
  );
});

/**
 * @desc Log time spent on task
 * @route POST /api/v1/tasks/:id/time-logs
 * @access Protected (TASK_LOG_TIME)
 */
export const logTaskTime = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;
  const { hours, note, loggedAt = new Date() } = req.body;

  const task = await Task.findOne({ _id: id, workspaceId: wsId });
  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
  }

  task.timeLogs.push({
    userId: req.user.id,
    hours: Number(hours),
    note,
    loggedAt,
  });

  // Increment total logged hours
  task.loggedHours = (task.loggedHours || 0) + Number(hours);
  await task.save();

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'task.log_time',
    entityType: 'Task',
    entityId: task._id,
    details: { hours, note },
    req,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Time logged successfully', {
      loggedHours: task.loggedHours,
      timeLogs: task.timeLogs,
    })
  );
});

/**
 * @desc Toggle task checklist item completion
 * @route PATCH /api/v1/tasks/:id/checklist/:itemId/toggle
 * @access Protected (TASK_UPDATE)
 */
export const toggleChecklistItem = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id, itemId } = req.params;

  const task = await Task.findOne({ _id: id, workspaceId: wsId });
  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
  }

  const item = task.checklist.id(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Checklist item not found on this task');
  }

  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date() : null;

  await task.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Checklist item toggled', { checklist: task.checklist })
  );
});

/**
 * @desc Delete task
 * @route DELETE /api/v1/tasks/:id
 * @access Protected (TASK_DELETE)
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const { id } = req.params;

  const task = await Task.findOneAndDelete({ _id: id, workspaceId: wsId });
  if (!task) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Task not found');
  }

  await recordAuditLog({
    workspaceId: wsId,
    actor: req.user,
    action: 'task.delete',
    entityType: 'Task',
    entityId: id,
    details: { title: task.title },
    req,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Task deleted successfully', { deletedId: id })
  );
});
