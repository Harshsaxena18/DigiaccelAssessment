import { createApp } from '../server/src/app.js';
import { connectDatabase } from '../server/src/config/database.js';

const app = createApp();

export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Failed to connect to database in serverless handler:', err);
  }
  return app(req, res);
}
