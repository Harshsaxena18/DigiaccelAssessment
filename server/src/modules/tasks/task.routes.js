import { Router } from 'express';
import { TaskController } from './task.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  taskIdParamSchema,
  listTasksQuerySchema,
  weeklySummaryQuerySchema,
} from './task.validation.js';

const router = Router();

// Static routes registered first to avoid collision with /:id
router.get(
  '/weekly-summary',
  validateRequest({ query: weeklySummaryQuerySchema }),
  TaskController.getWeeklySummary
);

router.get(
  '/',
  validateRequest({ query: listTasksQuerySchema }),
  TaskController.getTasks
);

router.post(
  '/',
  validateRequest({ body: createTaskSchema }),
  TaskController.createTask
);

router.get(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  TaskController.getTaskById
);

router.patch(
  '/:id',
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  TaskController.updateTask
);

router.patch(
  '/:id/status',
  validateRequest({ params: taskIdParamSchema, body: updateStatusSchema }),
  TaskController.updateTaskStatus
);

router.delete(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  TaskController.deleteTask
);

export const taskRoutes = router;
