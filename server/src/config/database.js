import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServerInstance = null;
let cachedConn = null;
let cachedPromise = null;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    const conn = await cachedPromise;
    cachedConn = conn;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    cachedPromise = null;
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      console.warn(`[Database] Could not connect to ${env.MONGODB_URI}: ${err.message}`);
      console.log('[Database] Starting in-memory MongoDB fallback for local development/testing...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const uri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[Database] Connected to in-memory MongoDB: ${uri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    }
    console.error(`[Database] MongoDB connection error: ${err.message}`);
    throw err;
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
