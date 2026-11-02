import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS config
  const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
    })
  );

  // Body parser with safe limit
  app.use(express.json({ limit: '10kb' }));

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/v1/tasks', taskRoutes);

  // 404 & centralized error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
