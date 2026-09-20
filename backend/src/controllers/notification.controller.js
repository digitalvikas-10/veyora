import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Notification, User } from '../models/index.js';

/**
 * @desc Get user notifications in current workspace
 * @route GET /api/v1/notifications
 * @access Protected
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;
  const { page = 1, limit = 50, isRead, type, search } = req.query;

  const query = { workspaceId: wsId, recipientId: userId };
  if (isRead !== undefined) query.isRead = isRead === 'true' || isRead === true;
  if (type && type !== 'all') query.type = type;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount, typeCounts] = await Promise.all([
    Notification.find(query)
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ workspaceId: wsId, recipientId: userId, isRead: false }),
    Notification.aggregate([
      { $match: { workspaceId: wsId, recipientId: userId } },
      { $group: { _id: '$type', count: { $sum: 1 }, unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } } } },
    ]),
  ]);

  const typeBreakdown = {};
  typeCounts.forEach((item) => {
    typeBreakdown[item._id] = { total: item.count, unread: item.unread };
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Notifications retrieved', {
      notifications,
      unreadCount,
      typeBreakdown,
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
 * @desc Get notification statistics and breakdown for current user
 * @route GET /api/v1/notifications/stats
 * @access Protected
 */
export const getNotificationStats = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;

  const [totalCount, unreadCount, readCount, typeStats] = await Promise.all([
    Notification.countDocuments({ workspaceId: wsId, recipientId: userId }),
    Notification.countDocuments({ workspaceId: wsId, recipientId: userId, isRead: false }),
    Notification.countDocuments({ workspaceId: wsId, recipientId: userId, isRead: true }),
    Notification.aggregate([
      { $match: { workspaceId: wsId, recipientId: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const byType = {};
  typeStats.forEach((t) => {
    byType[t._id] = { total: t.total, unread: t.unread };
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Notification stats retrieved', {
      totalCount,
      unreadCount,
      readCount,
      byType,
    })
  );
});

/**
 * @desc Create / trigger in-app notification (for manual testing, team broadcasts, or alert triggers)
 * @route POST /api/v1/notifications
 * @access Protected
 */
export const createNotification = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const senderId = req.user.id;
  const { recipientId, type = 'info', title, message, link } = req.body;

  // If no recipientId specified, default to current user (self-alert / test trigger)
  const targetRecipientId = recipientId || senderId;

  const notification = await Notification.create({
    workspaceId: wsId,
    recipientId: targetRecipientId,
    senderId,
    type,
    title,
    message,
    link: link || '',
    isRead: false,
  });

  const populatedNotification = await Notification.findById(notification._id).populate(
    'senderId',
    'name email avatar'
  );

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Notification dispatched', {
      notification: populatedNotification,
    })
  );
});

/**
 * @desc Mark single notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Protected
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, workspaceId: wsId, recipientId: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  ).populate('senderId', 'name email avatar');

  if (!notification) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Notification marked as read', { notification })
  );
});

/**
 * @desc Mark all notifications as read for current user
 * @route POST /api/v1/notifications/mark-all-read
 * @access Protected
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;

  const result = await Notification.updateMany(
    { workspaceId: wsId, recipientId: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'All notifications marked as read', {
      updatedCount: result.modifiedCount,
    })
  );
});

/**
 * @desc Delete a single notification
 * @route DELETE /api/v1/notifications/:id
 * @access Protected
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;
  const { id } = req.params;

  const deleted = await Notification.findOneAndDelete({
    _id: id,
    workspaceId: wsId,
    recipientId: userId,
  });

  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Notification removed', { id })
  );
});

/**
 * @desc Clear all read notifications for current user
 * @route DELETE /api/v1/notifications/clear-read
 * @access Protected
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
  const wsId = req.workspaceId;
  const userId = req.user.id;

  const result = await Notification.deleteMany({
    workspaceId: wsId,
    recipientId: userId,
    isRead: true,
  });

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'All read notifications cleared', {
      deletedCount: result.deletedCount,
    })
  );
});
