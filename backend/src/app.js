import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import apiV1Router from './routes/index.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import {
  securityHeaders,
  sanitizeInputs,
  preventParamPollution,
  ipAccessControl,
} from './middlewares/security.middleware.js';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Express behind reverse proxy (Google Cloud Run / Nginx)
  // Required so express and express-rate-limit can accurately detect client IP via X-Forwarded-For
  app.set('trust proxy', 1);

  // 1. Security Headers (Helmet + Custom Enterprise Headers)
  // Disable CSP, CORP, COOP and Frameguard so iframe preview works without cross-origin or frame blocking
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      frameguard: false,
    })
  );
  app.use(securityHeaders);

  // 2. CORS configuration for multi-tenant and secure cookie exchange
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // In production, strictly enforce authorized client origins
        if (config.env === 'production') {
          if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('ais-dev') || origin.includes('ais-pre') || origin.includes('asia-southeast1.run.app')) {
            return callback(null, true);
          }
          return callback(new Error(`CORS blocked: Origin ${origin} not allowed in production.`));
        }
        // In development, allow the dynamic preview frame or local client
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Workspace-Id', 'Accept'],
    })
  );

  // 3. HTTP Request Logger (Morgan)
  if (config.env !== 'test') {
    app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
  }

  // 4. Rate Limiting for API routes
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false,
      forwardedHeader: false,
      default: false,
    },
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      errors: [],
    },
  });
  app.use('/api', limiter);

  // 5. Body Parsers, Sanitization & Cookie Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(sanitizeInputs);
  app.use(preventParamPollution);
  app.use(ipAccessControl);

  // 6. Static directory for uploads
  const uploadsPath = path.resolve(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadsPath));

  // 7. Mount Primary API V1 Routes
  app.use('/api/v1', apiV1Router);

  // Legacy/Shortcut alias for health
  app.get('/api/health', (req, res) => {
    res.redirect('/api/v1/health');
  });

  return app;
};
