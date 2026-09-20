import mongoose from 'mongoose';
import { config } from './env.js';

let dbStatus = {
  isConnected: false,
  host: null,
  name: null,
  error: null,
  recommendation: null,
};

export const connectDB = async () => {
  const uri = config.mongoUri?.trim();

  if (!uri) {
    dbStatus = {
      isConnected: false,
      host: null,
      name: null,
      error: 'MONGODB_URI not configured in environment',
      recommendation: 'Provide your MongoDB Atlas or local connection string in Settings / .env (e.g. mongodb+srv://<user>:<password>@cluster.mongodb.net/veyora)',
    };
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  [Database Notice] MONGODB_URI is not defined. Running in mock/setup mode.');
    return dbStatus;
  }

  // Check for unreplaced placeholders like <username> or <password>
  if (uri.includes('<username>') || uri.includes('<password>')) {
    dbStatus = {
      isConnected: false,
      host: null,
      name: null,
      error: 'MONGODB_URI contains unpopulated placeholders (<username> or <password>)',
      recommendation: 'Replace <username> and <password> with your actual MongoDB Atlas database user credentials.',
    };
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  [Database Warning] MONGODB_URI contains unreplaced <username> or <password> placeholders.');
    return dbStatus;
  }

  try {
    // If already connected, close first before reconnecting
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
    });

    dbStatus = {
      isConnected: true,
      host: conn.connection.host,
      name: conn.connection.name,
      error: null,
      recommendation: 'MongoDB connection is live and active.',
    };

    console.log('\x1b[32m%s\x1b[0m', `✅ [MongoDB Connected] Host: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return dbStatus;
  } catch (error) {
    let recommendation = 'Check your connection string and ensure MongoDB is running.';

    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      recommendation =
        "MongoDB Atlas Network Access restriction: Cloud containers use dynamic outbound IPs. In your MongoDB Atlas dashboard, navigate to 'Security' -> 'Network Access' -> click 'Add IP Address' and choose 'Allow Access From Anywhere' (0.0.0.0/0).";
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth error')) {
      recommendation =
        "MongoDB Atlas Authentication failed: Verify your database username and password in MongoDB Atlas -> Database Access. Ensure special characters in password are URL-encoded if necessary.";
    }

    dbStatus = {
      isConnected: false,
      host: null,
      name: null,
      error: error.message,
      recommendation,
    };
    console.warn('\x1b[33m%s\x1b[0m', `⚠️  [MongoDB Connection Notice]: ${error.message}`);
    console.warn('\x1b[36m%s\x1b[0m', `👉 Recommendation: ${recommendation}`);
    return dbStatus;
  }
};

export const getDBStatus = () => {
  return {
    ...dbStatus,
    readyState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
};
