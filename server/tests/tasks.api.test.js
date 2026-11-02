import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Task } from '../src/modules/tasks/task.model.js';

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe('Tasks API Integration Tests', () => {
  describe('Health check', () => {
    it('GET /api/v1/health returns status ok', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/v1/tasks (Create Task)', () => {
    it('creates a task with valid attributes and defaults to IN_PROGRESS', async () => {
      const payload = {
        title: 'Review pull request',
        description: 'Check logic and unit tests',
        scheduledAt: '2026-11-04T10:00:00.000Z',
        priority: 'HIGH',
      };

      const res = await request(app).post('/api/v1/tasks').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.description).toBe(payload.description);
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(new Date(res.body.data.scheduledAt).toISOString()).toBe(payload.scheduledAt);
    });

    it('creates a task with omitted optional description and priority', async () => {
      const payload = {
        title: 'Call doctor',
        scheduledAt: '2026-11-04T14:30:00.000Z',
      };

      const res = await request(app).post('/api/v1/tasks').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.description).toBe('');
      expect(res.body.data.priority).toBeNull();
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('rejects a missing or blank title', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: '   ',
        scheduledAt: '2026-11-04T10:00:00.000Z',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'title')).toBe(true);
    });

    it('rejects missing or invalid scheduledAt', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: 'Valid title',
        scheduledAt: 'not-a-valid-date',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'scheduledAt')).toBe(true);
    });

    it('rejects an unsupported priority value', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: 'Valid title',
        scheduledAt: '2026-11-04T10:00:00.000Z',
        priority: 'CRITICAL',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'priority')).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('fetches an existing task by ID', async () => {
      const task = await Task.create({
        title: 'Existing task',
        scheduledAt: new Date('2026-11-04T09:00:00.000Z'),
        priority: 'MEDIUM',
      });

      const res = await request(app).get(`/api/v1/tasks/${task._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(task._id.toString());
      expect(res.body.data.title).toBe('Existing task');
    });

    it('returns 404 for an unknown valid ObjectId', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/tasks/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for a malformed ID string', async () => {
      const res = await request(app).get('/api/v1/tasks/123-invalid-id');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('updates only allowed fields', async () => {
      const task = await Task.create({
        title: 'Original Title',
        description: 'Original Desc',
        scheduledAt: new Date('2026-11-04T09:00:00.000Z'),
        priority: 'LOW',
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task._id}`)
        .send({
          title: 'Updated Title',
          priority: 'HIGH',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.description).toBe('Original Desc');
    });

    it('rejects an empty update body', async () => {
      const task = await Task.create({
        title: 'Task',
        scheduledAt: new Date(),
      });

      const res = await request(app).patch(`/api/v1/tasks/${task._id}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    it('changes status from IN_PROGRESS to COMPLETED and back', async () => {
      const task = await Task.create({
        title: 'Status Test',
        scheduledAt: new Date(),
        status: 'IN_PROGRESS',
      });

      const res1 = await request(app)
        .patch(`/api/v1/tasks/${task._id}/status`)
        .send({ status: 'COMPLETED' });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('COMPLETED');

      const res2 = await request(app)
        .patch(`/api/v1/tasks/${task._id}/status`)
        .send({ status: 'IN_PROGRESS' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('IN_PROGRESS');
    });

    it('rejects an invalid status value', async () => {
      const task = await Task.create({
        title: 'Status Test',
        scheduledAt: new Date(),
      });

      const res = await request(app)
        .patch(`/api/v1/tasks/${task._id}/status`)
        .send({ status: 'ARCHIVED' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('deletes a task and returns 204', async () => {
      const task = await Task.create({
        title: 'Delete me',
        scheduledAt: new Date(),
      });

      const res = await request(app).delete(`/api/v1/tasks/${task._id}`);
      expect(res.status).toBe(204);

      const findRes = await Task.findById(task._id);
      expect(findRes).toBeNull();
    });

    it('returns 404 when deleting a non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/tasks/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/tasks (Search & Filtering)', () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: 'Prepare assessment presentation',
          description: 'Create slide deck for Monday',
          scheduledAt: new Date('2026-11-02T10:00:00.000Z'),
          status: 'IN_PROGRESS',
        },
        {
          title: 'Buy groceries',
          description: 'Apples, milk, bread',
          scheduledAt: new Date('2026-11-03T12:00:00.000Z'),
          status: 'COMPLETED',
        },
        {
          title: 'Weekly sync with mentor',
          description: 'Discuss technical architecture',
          scheduledAt: new Date('2026-11-09T15:00:00.000Z'),
          status: 'IN_PROGRESS',
        },
      ]);
    });

    it('searches matches in title and description', async () => {
      const resTitle = await request(app).get('/api/v1/tasks?search=presentation');
      expect(resTitle.status).toBe(200);
      expect(resTitle.body.data.length).toBe(1);
      expect(resTitle.body.data[0].title).toContain('presentation');

      const resDesc = await request(app).get('/api/v1/tasks?search=apples');
      expect(resDesc.status).toBe(200);
      expect(resDesc.body.data.length).toBe(1);
      expect(resDesc.body.data[0].title).toBe('Buy groceries');
    });

    it('filters tasks by date range (from inclusive, to exclusive)', async () => {
      const res = await request(app).get(
        '/api/v1/tasks?from=2026-11-02T00:00:00.000Z&to=2026-11-09T00:00:00.000Z'
      );

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.map((t) => t.title)).toEqual([
        'Prepare assessment presentation',
        'Buy groceries',
      ]);
    });
  });

  describe('GET /api/v1/tasks/weekly-summary', () => {
    it('groups tasks by Monday-start weeks and aggregates open and completed counts', async () => {
      // Week 1 (Monday 2026-11-02 to Sunday 2026-11-08)
      await Task.create([
        {
          title: 'Task Mon',
          scheduledAt: new Date('2026-11-02T10:00:00.000Z'),
          status: 'IN_PROGRESS',
        },
        {
          title: 'Task Wed',
          scheduledAt: new Date('2026-11-04T12:00:00.000Z'),
          status: 'COMPLETED',
        },
        {
          title: 'Task Sun',
          scheduledAt: new Date('2026-11-08T23:00:00.000Z'),
          status: 'IN_PROGRESS',
        },
      ]);

      // Week 2 (Monday 2026-11-09 to Sunday 2026-11-15)
      await Task.create([
        {
          title: 'Task Next Mon',
          scheduledAt: new Date('2026-11-09T09:00:00.000Z'),
          status: 'COMPLETED',
        },
      ]);

      const res = await request(app).get('/api/v1/tasks/weekly-summary?timezone=UTC');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(2);

      // Check Week 1
      const week1 = res.body.data[0];
      expect(week1.openCount).toBe(2);
      expect(week1.completedCount).toBe(1);
      expect(week1.totalCount).toBe(3);

      // Check Week 2
      const week2 = res.body.data[1];
      expect(week2.openCount).toBe(0);
      expect(week2.completedCount).toBe(1);
      expect(week2.totalCount).toBe(1);
    });
  });
});
