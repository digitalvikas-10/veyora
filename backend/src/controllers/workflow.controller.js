import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';
import { WorkflowService } from '../services/workflow.service.js';

/**
 * @desc Get all workflow automation rules for active workspace
 * @route GET /api/v1/workflows
 * @access Protected
 */
export const getRules = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { status, search, event } = req.query;

  const rules = await WorkflowService.getRules({
    workspaceId,
    status,
    search,
    event,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow rules retrieved successfully', {
      rules,
      count: rules.length,
    })
  );
});

/**
 * @desc Create a new workflow automation rule
 * @route POST /api/v1/workflows
 * @access Protected
 */
export const createRule = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { name, description, trigger, actions } = req.body;

  const rule = await WorkflowService.createRule({
    workspaceId,
    name,
    description,
    trigger,
    actions,
    userId,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Workflow rule created successfully', {
      rule,
    })
  );
});

/**
 * @desc Get single workflow rule by ID
 * @route GET /api/v1/workflows/:id
 * @access Protected
 */
export const getRuleById = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { id } = req.params;

  const rule = await WorkflowService.getRuleById({
    workspaceId,
    ruleId: id,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow rule retrieved', {
      rule,
    })
  );
});

/**
 * @desc Update workflow rule
 * @route PUT /api/v1/workflows/:id
 * @access Protected
 */
export const updateRule = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;

  const rule = await WorkflowService.updateRule({
    workspaceId,
    ruleId: id,
    updateData: req.body,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow rule updated successfully', {
      rule,
    })
  );
});

/**
 * @desc Delete workflow rule
 * @route DELETE /api/v1/workflows/:id
 * @access Protected
 */
export const deleteRule = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;

  const result = await WorkflowService.deleteRule({
    workspaceId,
    ruleId: id,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result.message, null)
  );
});

/**
 * @desc Test execute a workflow rule with simulation payload
 * @route POST /api/v1/workflows/:id/test
 * @access Protected
 */
export const testRule = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;
  const { testPayload } = req.body;

  const result = await WorkflowService.testRuleExecution({
    workspaceId,
    ruleId: id,
    testPayload: testPayload || {},
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow simulation completed', {
      result,
    })
  );
});

/**
 * @desc Get workflow execution history audit logs
 * @route GET /api/v1/workflows/executions
 * @access Protected
 */
export const getExecutions = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { ruleId, limit } = req.query;

  const executions = await WorkflowService.getExecutions({
    workspaceId,
    ruleId: req.params.id || ruleId,
    limit,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow executions retrieved', {
      executions,
      count: executions.length,
    })
  );
});

/**
 * @desc Get aggregate workflow metrics
 * @route GET /api/v1/workflows/metrics
 * @access Protected
 */
export const getMetrics = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;

  const metrics = await WorkflowService.getMetrics({ workspaceId });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Workflow analytics retrieved', {
      metrics,
    })
  );
});
