import { createApp } from './backend/src/app.js';
import { connectDB } from './backend/src/config/db.js';
import { config } from './backend/src/config/env.js';
import { notFound } from './backend/src/middlewares/notFound.middleware.js';
import { errorHandler } from './backend/src/middlewares/error.middleware.js';
import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Ensure uploads directory exists
  const uploadsDir = path.resolve(__dirname, 'backend/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. Connect Database
  await connectDB();

  // 2. Initialize Express application
  const app = createApp();

  // 3. Mount Vite Dev Server or Production Static Files
  if (config.env !== 'production') {
    console.log('\x1b[36m%s\x1b[0m', '⚡ [Vite Middleware] Mounting Vite development server...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // 4. API 404 handler for unmatched /api requests
  app.use('/api', notFound);

  // 5. Centralized Error Handler
  app.use(errorHandler);

  // 6. Listen on Port 3000
  const PORT = config.port || 3000;
  const HOST = '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log('\x1b[32m%s\x1b[0m', `🚀 [VEYORA Server Ready] Running on http://${HOST}:${PORT}`);
    console.log('\x1b[34m%s\x1b[0m', `🌐 Environment: ${config.env}`);
    console.log('\x1b[34m%s\x1b[0m', `🔗 API Base URL: http://${HOST}:${PORT}/api/v1`);
    console.log('\x1b[34m%s\x1b[0m', `🩺 Health Check: http://${HOST}:${PORT}/api/v1/health`);
  });
}

startServer().catch((err) => {
  console.error('\x1b[31m%s\x1b[0m', '💥 Fatal error during server startup:', err);
  process.exit(1);
});
