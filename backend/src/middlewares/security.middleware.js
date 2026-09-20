import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { Workspace } from '../models/Workspace.js';

/**
 * Deep sanitization function that removes MongoDB operators and prototype pollution keys.
 */
export const sanitizeData = (data) => {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Strip null byte characters and dangerous script injection tags
    return data
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(data)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      // Prevent NoSQL operator injection in query params and generic untrusted keys
      if (key.startsWith('$')) {
        continue;
      }
      cleanObj[key] = sanitizeData(value);
    }
    return cleanObj;
  }

  return data;
};

/**
 * Middleware: Input Sanitization & NoSQL Injection Protection
 */
export const sanitizeInputs = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }
  next();
};

/**
 * Middleware: HTTP Parameter Pollution (HPP) Prevention
 */
export const preventParamPollution = (req, res, next) => {
  if (req.query) {
    for (const [key, val] of Object.entries(req.query)) {
      if (Array.isArray(val) && !['sort', 'fields', 'filter', 'tags', 'roles', 'ids'].includes(key)) {
        req.query[key] = val[val.length - 1]; // Use the last provided parameter
      }
    }
  }
  next();
};

/**
 * Middleware: Enterprise Security Headers
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
};

/**
 * Middleware: Strict Rate Limiter for Authentication and Login Routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 auth requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    default: false,
  },
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: [],
  },
});

/**
 * Middleware: Sensitive Security Operation Rate Limiter (Key Rotations, Scans)
 */
export const sensitiveActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    default: false,
  },
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive security operations. Please wait a moment.',
    errors: [],
  },
});

/**
 * Middleware: Workspace IP Access Firewall Guard
 */
export const ipAccessControl = async (req, res, next) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || req.user?.workspaceId;
    if (!workspaceId) return next();

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    
    // Normalize IP
    const cleanIp = clientIp.includes(',') ? clientIp.split(',')[0].trim() : clientIp;

    // Check workspace settings if configured
    const workspace = await Workspace.findById(workspaceId).select('settings name').lean();
    if (!workspace?.settings?.security?.ipFirewall) {
      return next();
    }

    const { mode, allowlist = [], blocklist = [] } = workspace.settings.security.ipFirewall;

    if (mode === 'blocklist_active' && blocklist.length > 0) {
      if (blocklist.some((ip) => ip.trim() === cleanIp || ip.trim() === '0.0.0.0')) {
        return next(
          new ApiError(
            HTTP_STATUS.FORBIDDEN,
            `Access Denied: Your IP address (${cleanIp}) is on the blocked list for workspace "${workspace.name}".`
          )
        );
      }
    }

    if (mode === 'allowlist_only' && allowlist.length > 0) {
      const isAllowed = allowlist.some(
        (ip) => ip.trim() === cleanIp || ip.trim() === '127.0.0.1' || ip.trim() === '::1' || ip.trim() === 'localhost'
      );
      if (!isAllowed) {
        return next(
          new ApiError(
            HTTP_STATUS.FORBIDDEN,
            `Access Denied: Your IP address (${cleanIp}) is not authorized on the enterprise allowlist for workspace "${workspace.name}".`
          )
        );
      }
    }

    next();
  } catch (err) {
    // Non-blocking fallback on lookup errors
    next();
  }
};
