import crypto from 'crypto';
import mongoose from 'mongoose';
import { WebhookSubscription } from '../models/WebhookSubscription.js';
import { WebhookDelivery } from '../models/WebhookDelivery.js';
import { AuditLog } from '../models/AuditLog.js';

export class WebhookService {
  /**
   * Generates a secure HMAC signing secret with standard 'whsec_' prefix
   */
  static generateSecret() {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Generates HMAC-SHA256 signature string for an event payload
   */
  static generateSignature(payload, secret) {
    const rawData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret).update(rawData).digest('hex');
    return `sha256=${hmac}`;
  }

  /**
   * Create a new webhook subscription for a workspace
   */
  static async createSubscription({ workspaceId, userId, name, url, events, headers = {}, retryPolicy = {} }) {
    const secret = this.generateSecret();
    const subscription = await WebhookSubscription.create({
      workspaceId,
      name,
      url,
      secret,
      events: Array.isArray(events) ? events : [events],
      headers: headers instanceof Map ? Object.fromEntries(headers) : headers,
      retryPolicy: {
        maxRetries: retryPolicy.maxRetries ?? 3,
        backoffSeconds: retryPolicy.backoffSeconds ?? 10,
      },
      createdBy: userId,
      status: 'active',
    });

    // Record in Audit Ledger
    await AuditLog.create({
      workspaceId,
      actorId: userId,
      action: 'WEBHOOK_SUBSCRIPTION_CREATED',
      entityType: 'WebhookSubscription',
      entityId: subscription._id.toString(),
      details: {
        name: subscription.name,
        url: subscription.url,
        events: subscription.events,
      },
    }).catch((err) => console.warn('AuditLog creation warning:', err.message));

    return subscription;
  }

  /**
   * Get all webhook subscriptions for a workspace
   */
  static async getSubscriptions({ workspaceId, status, search }) {
    const query = { workspaceId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    return WebhookSubscription.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email avatar');
  }

  /**
   * Get a single subscription by ID
   */
  static async getSubscriptionById({ workspaceId, subscriptionId }) {
    const subscription = await WebhookSubscription.findOne({
      _id: subscriptionId,
      workspaceId,
    }).populate('createdBy', 'name email');

    if (!subscription) {
      throw new Error('Webhook subscription not found in active workspace');
    }
    return subscription;
  }

  /**
   * Update subscription properties
   */
  static async updateSubscription({ workspaceId, subscriptionId, updateData, userId }) {
    const allowedFields = ['name', 'url', 'events', 'status', 'headers', 'retryPolicy'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const subscription = await WebhookSubscription.findOneAndUpdate(
      { _id: subscriptionId, workspaceId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!subscription) {
      throw new Error('Webhook subscription not found');
    }

    // Record audit
    await AuditLog.create({
      workspaceId,
      actorId: userId,
      action: 'WEBHOOK_SUBSCRIPTION_UPDATED',
      entityType: 'WebhookSubscription',
      entityId: subscription._id.toString(),
      details: { updates },
    }).catch((err) => console.warn('AuditLog creation warning:', err.message));

    return subscription;
  }

  /**
   * Delete subscription & cleanup associated delivery records
   */
  static async deleteSubscription({ workspaceId, subscriptionId, userId }) {
    const subscription = await WebhookSubscription.findOneAndDelete({
      _id: subscriptionId,
      workspaceId,
    });

    if (!subscription) {
      throw new Error('Webhook subscription not found');
    }

    // Clean up deliveries
    await WebhookDelivery.deleteMany({ subscriptionId, workspaceId });

    // Record audit
    await AuditLog.create({
      workspaceId,
      actorId: userId,
      action: 'WEBHOOK_SUBSCRIPTION_DELETED',
      entityType: 'WebhookSubscription',
      entityId: subscriptionId.toString(),
      details: { name: subscription.name, url: subscription.url },
    }).catch((err) => console.warn('AuditLog creation warning:', err.message));

    return { success: true, message: 'Webhook subscription deleted successfully' };
  }

  /**
   * Rotate HMAC signing secret
   */
  static async rotateSecret({ workspaceId, subscriptionId, userId }) {
    const newSecret = this.generateSecret();
    const subscription = await WebhookSubscription.findOneAndUpdate(
      { _id: subscriptionId, workspaceId },
      { $set: { secret: newSecret } },
      { returnDocument: 'after' }
    );

    if (!subscription) {
      throw new Error('Webhook subscription not found');
    }

    await AuditLog.create({
      workspaceId,
      actorId: userId,
      action: 'WEBHOOK_SECRET_ROTATED',
      entityType: 'WebhookSubscription',
      entityId: subscription._id.toString(),
      details: { name: subscription.name },
    }).catch((err) => console.warn('AuditLog creation warning:', err.message));

    return subscription;
  }

  /**
   * Dispatch an event to all matching active subscriptions in a workspace
   */
  static async dispatchWebhookEvent({ workspaceId, event, payload, actor = null }) {
    const subscriptions = await WebhookSubscription.find({
      workspaceId,
      status: 'active',
      $or: [{ events: event }, { events: '*' }],
    });

    if (!subscriptions || subscriptions.length === 0) {
      return { dispatchedCount: 0, results: [] };
    }

    const deliveryResults = [];

    for (const sub of subscriptions) {
      const delivery = await this.deliverToSubscriber({
        subscription: sub,
        event,
        payload,
      });
      deliveryResults.push(delivery);
    }

    return {
      dispatchedCount: subscriptions.length,
      results: deliveryResults,
    };
  }

  /**
   * Alias for dispatchWebhookEvent
   */
  static async dispatchEvent(params) {
    return this.dispatchWebhookEvent({
      workspaceId: params.workspaceId,
      event: params.event,
      payload: params.data || params.payload,
      actor: params.actorId || params.actor,
    });
  }

  /**
   * Execute single delivery attempt to endpoint with signature header
   */
  static async deliverToSubscriber({ subscription, event, payload }) {
    const deliveryId = `del_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const envelope = {
      id: deliveryId,
      event,
      timestamp,
      workspaceId: subscription.workspaceId,
      data: payload,
    };

    const signature = this.generateSignature(envelope, subscription.secret);
    const startTime = Date.now();

    const customHeaders = subscription.headers instanceof Map
      ? Object.fromEntries(subscription.headers)
      : (subscription.headers || {});

    const requestHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Veyora-Webhook-Dispatcher/1.0',
      'X-Veyora-Event': event,
      'X-Veyora-Delivery-Id': deliveryId,
      'X-Veyora-Signature': signature,
      'X-Veyora-Timestamp': timestamp,
      ...customHeaders,
    };

    let responseStatus = null;
    let responseBody = '';
    let status = 'failed';
    let errorMessage = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(subscription.url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(envelope),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      responseStatus = res.status;
      const text = await res.text();
      responseBody = text.slice(0, 2000); // Cap at 2000 chars

      if (res.ok) {
        status = 'success';
      } else {
        status = 'failed';
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err) {
      status = 'failed';
      errorMessage = err.name === 'AbortError' ? 'Endpoint timeout (6000ms exceeded)' : err.message;
      responseBody = JSON.stringify({ error: errorMessage });
    }

    const durationMs = Date.now() - startTime;

    // Save Delivery Record
    const deliveryRecord = await WebhookDelivery.create({
      workspaceId: subscription.workspaceId,
      subscriptionId: subscription._id,
      event,
      endpointUrl: subscription.url,
      payload: envelope,
      requestHeaders,
      responseStatus,
      responseBody,
      durationMs,
      status,
      attemptCount: 1,
      error: errorMessage,
      signature,
    });

    // Update Subscription Stats
    const updateStats = {
      $inc: {
        'stats.totalDeliveries': 1,
        ...(status === 'success' ? { 'stats.successCount': 1 } : { 'stats.failureCount': 1 }),
      },
      $set: {
        'stats.lastDeliveredAt': new Date(),
        'stats.lastStatusCode': responseStatus,
      },
    };

    await WebhookSubscription.updateOne({ _id: subscription._id }, updateStats);

    return deliveryRecord;
  }

  /**
   * Send a test ping payload to a webhook subscription
   */
  static async sendTestPing({ workspaceId, subscriptionId, event = 'test.ping' }) {
    const subscription = await this.getSubscriptionById({ workspaceId, subscriptionId });

    const testPayload = {
      test: true,
      message: 'This is a test notification from the VEYORA Enterprise Webhook Dispatcher.',
      dispatchedAt: new Date().toISOString(),
      subscription: {
        id: subscription._id,
        name: subscription.name,
        targetUrl: subscription.url,
      },
      verifiedFeatures: [
        'HMAC-SHA256 Signature Verification',
        'Payload Envelope Standard v1',
        'Non-blocking HTTP Dispatch',
      ],
    };

    return this.deliverToSubscriber({
      subscription,
      event,
      payload: testPayload,
    });
  }

  /**
   * Query delivery logs with filtering & pagination
   */
  static async getDeliveries({ workspaceId, subscriptionId, page = 1, limit = 20, status }) {
    const query = { workspaceId };
    if (subscriptionId) {
      query.subscriptionId = subscriptionId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [deliveries, total] = await Promise.all([
      WebhookDelivery.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('subscriptionId', 'name url'),
      WebhookDelivery.countDocuments(query),
    ]);

    return {
      deliveries,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    };
  }

  /**
   * Re-deliver a specific delivery record
   */
  static async redeliverAttempt({ workspaceId, deliveryId, userId }) {
    const originalDelivery = await WebhookDelivery.findOne({
      _id: deliveryId,
      workspaceId,
    });

    if (!originalDelivery) {
      throw new Error('Delivery record not found');
    }

    const subscription = await WebhookSubscription.findOne({
      _id: originalDelivery.subscriptionId,
      workspaceId,
    });

    if (!subscription) {
      throw new Error('Associated webhook subscription no longer exists');
    }

    const newDelivery = await this.deliverToSubscriber({
      subscription,
      event: originalDelivery.event,
      payload: originalDelivery.payload?.data || originalDelivery.payload,
    });

    // Record audit
    await AuditLog.create({
      workspaceId,
      userId,
      action: 'WEBHOOK_REDELIVERED',
      resourceType: 'WebhookDelivery',
      resourceId: newDelivery._id,
      details: {
        originalDeliveryId: deliveryId,
        subscriptionName: subscription.name,
        newStatus: newDelivery.status,
      },
    }).catch((err) => console.warn('AuditLog creation warning:', err.message));

    return newDelivery;
  }

  /**
   * Get workspace webhook aggregate metrics
   */
  static async getWebhookMetrics({ workspaceId }) {
    const [subscriptions, deliveries] = await Promise.all([
      WebhookSubscription.find({ workspaceId }),
      WebhookDelivery.find({ workspaceId }).sort({ createdAt: -1 }).limit(100),
    ]);

    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    const totalDeliveries = subscriptions.reduce((sum, s) => sum + (s.stats?.totalDeliveries || 0), 0);
    const totalSuccess = subscriptions.reduce((sum, s) => sum + (s.stats?.successCount || 0), 0);
    const successRate = totalDeliveries > 0 ? ((totalSuccess / totalDeliveries) * 100).toFixed(1) : 100;

    const avgDuration = deliveries.length > 0
      ? Math.round(deliveries.reduce((sum, d) => sum + (d.durationMs || 0), 0) / deliveries.length)
      : 0;

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeCount,
      totalDeliveries,
      successRate: parseFloat(successRate),
      avgLatencyMs: avgDuration,
      recentDeliveriesCount: deliveries.length,
    };
  }
}
