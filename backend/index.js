import { createApp } from './src/app.js';
import { connectDB } from './src/config/db.js';
import { config } from './src/config/env.js';
import { notFound } from './src/middlewares/notFound.middleware.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

async function runStandaloneBackend() {
  // Production Environmental Fail-Fast Validation
  if (process.env.NODE_ENV === 'production') {
    if (!config.mongoUri || config.mongoUri.includes('<username>') || config.mongoUri.includes('<password>')) {
      console.error('❌ [Critical Error] MONGODB_URI is required and must be properly configured in production.');
      process.exit(1);
    }
    if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
      console.error('❌ [Critical Error] JWT secrets are required in production.');
      process.exit(1);
    }
    if (config.jwt.accessSecret === config.jwt.refreshSecret) {
      console.error('❌ [Critical Error] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different secrets.');
      process.exit(1);
    }
  }

  await connectDB();
  const app = createApp();

  app.use('/api', notFound);
  app.use(errorHandler);

  const PORT = config.port || 5000;
  const HOST = '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    console.log(`[VEYORA Standalone Backend] Listening on http://${HOST}:${PORT}/api/v1`);
  });

  // Graceful Shutdown Handler
  const shutdown = (signal) => {
    console.log(`\n📬 [${signal}] Received. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('📡 [HTTP Server] Connection pool closed.');
      try {
        await mongoose.connection.close();
        console.log('🗄️ [Database] Mongoose connection closed safely.');
        process.exit(0);
      } catch (err) {
        console.error('⚠️ [Error during shutdown]:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// If executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runStandaloneBackend().catch((err) => {
    console.error('Backend startup error:', err);
    process.exit(1);
  });
}

export { runStandaloneBackend };
