import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());

  const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          env.NODE_ENV === 'development'
        ) {
          return callback(null, true);
        }
        callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10kb' }));

  app.get(['/api/v1/health', '/api/health', '/v1/health', '/health'], (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/tasks', taskRoutes);
  app.use('/v1/tasks', taskRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
