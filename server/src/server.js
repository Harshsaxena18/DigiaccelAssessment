import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log(`[Server] To-Do API listening on port ${env.PORT} (${env.NODE_ENV})`);
    });

    const shutdown = async (signal) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Database disconnected. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
