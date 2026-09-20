import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { WebhookService } from '../services/webhook.service.js';

/**
 * @desc Get all webhook subscriptions for active workspace
 * @route GET /api/v1/webhooks
 * @access Protected (Admin, Owner, Superadmin)
 */
export const getSubscriptions = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { status, search } = req.query;

  const subscriptions = await WebhookService.getSubscriptions({
    workspaceId,
    status,
    search,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Webhook subscriptions retrieved successfully', {
      subscriptions,
      count: subscriptions.length,
    })
  );
});

/**
 * @desc Create new webhook subscription
 * @route POST /api/v1/webhooks
 * @access Protected (Admin, Owner, Superadmin)
 */
export const createSubscription = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { name, url, events, headers, retryPolicy } = req.body;

  if (!name || !url || !events || (Array.isArray(events) && events.length === 0)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Name, endpoint URL, and at least one event trigger are required');
  }

  const subscription = await WebhookService.createSubscription({
    workspaceId,
    userId,
    name,
    url,
    events,
    headers,
    retryPolicy,
  });

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Webhook subscription created successfully', {
      subscription,
    })
  );
});

/**
 * @desc Get webhook subscription by ID
 * @route GET /api/v1/webhooks/:id
 * @access Protected
 */
export const getSubscriptionById = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { id } = req.params;

  const subscription = await WebhookService.getSubscriptionById({
    workspaceId,
    subscriptionId: id,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Webhook subscription retrieved', {
      subscription,
    })
  );
});

/**
 * @desc Update webhook subscription
 * @route PUT /api/v1/webhooks/:id
 * @access Protected
 */
export const updateSubscription = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;

  const subscription = await WebhookService.updateSubscription({
    workspaceId,
    subscriptionId: id,
    updateData: req.body,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Webhook subscription updated successfully', {
      subscription,
    })
  );
});

/**
 * @desc Delete webhook subscription
 * @route DELETE /api/v1/webhooks/:id
 * @access Protected
 */
export const deleteSubscription = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;

  const result = await WebhookService.deleteSubscription({
    workspaceId,
    subscriptionId: id,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result.message, result)
  );
});

/**
 * @desc Rotate webhook HMAC signing secret
 * @route POST /api/v1/webhooks/:id/rotate-secret
 * @access Protected
 */
export const rotateSecret = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { id } = req.params;

  const subscription = await WebhookService.rotateSecret({
    workspaceId,
    subscriptionId: id,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Webhook signing secret rotated successfully', {
      subscriptionId: subscription._id,
      newSecret: subscription.secret,
    })
  );
});

/**
 * @desc Send synthetic test event ping
 * @route POST /api/v1/webhooks/:id/test
 * @access Protected
 */
export const testSubscription = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { id } = req.params;
  const { event } = req.body;

  const deliveryResult = await WebhookService.sendTestPing({
    workspaceId,
    subscriptionId: id,
    event: event || 'test.ping',
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Test event dispatched to webhook endpoint', {
      delivery: deliveryResult,
    })
  );
});

/**
 * @desc Get webhook delivery history
 * @route GET /api/v1/webhooks/:id/deliveries
 * @access Protected
 */
export const getDeliveries = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const { id } = req.params;
  const { page = 1, limit = 20, status } = req.query;

  const result = await WebhookService.getDeliveries({
    workspaceId,
    subscriptionId: id === 'all' ? null : id,
    page,
    limit,
    status,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Delivery logs retrieved', result)
  );
});

/**
 * @desc Re-deliver an existing webhook delivery attempt
 * @route POST /api/v1/webhooks/deliveries/:deliveryId/redeliver
 * @access Protected
 */
export const redeliver = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;
  const userId = req.user?._id;
  const { deliveryId } = req.params;

  const newDelivery = await WebhookService.redeliverAttempt({
    workspaceId,
    deliveryId,
    userId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Event re-delivered successfully', {
      delivery: newDelivery,
    })
  );
});

/**
 * @desc Get webhook system metrics
 * @route GET /api/v1/webhooks/metrics
 * @access Protected
 */
export const getMetrics = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId;

  const metrics = await WebhookService.getWebhookMetrics({
    workspaceId,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Webhook metrics retrieved', {
      metrics,
    })
  );
});
