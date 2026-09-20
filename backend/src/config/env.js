import dotenv from 'dotenv';

// Load .env variables into process.env
dotenv.config();

export const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'veyora_dev_jwt_access_secret_key_min_32_chars_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'veyora_dev_jwt_refresh_secret_key_min_32_chars_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});
