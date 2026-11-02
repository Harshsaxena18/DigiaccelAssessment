import { Task } from './task.model.js';
import { ApiError } from '../../utils/ApiError.js';

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(data) {
    const task = new Task({
      title: data.title,
      description: data.description || '',
      scheduledAt: new Date(data.scheduledAt),
      priority: data.priority ?? null,
      status: 'IN_PROGRESS',
    });

    await task.save();
    return task;
  }

  /**
   * List tasks with search, filtering, and pagination
   */
  static async getTasks({ search, status, from, to, page = 1, limit = 20, sort = 'scheduledAt:asc' }) {
    const filter = {};

    // Keyword search in title and description (case-insensitive and escaped)
    if (search && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (from || to) {
      filter.scheduledAt = {};
      if (from) {
        filter.scheduledAt.$gte = new Date(from);
      }
      if (to) {
        filter.scheduledAt.$lt = new Date(to);
      }
    }

    // Sort order
    const sortOptions = {};
    if (sort === 'scheduledAt:desc') {
      sortOptions.scheduledAt = -1;
    } else if (sort === 'createdAt:desc') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.scheduledAt = 1;
    }

    const skip = (page - 1) * limit;

    const [tasks, totalItems] = await Promise.all([
      Task.find(filter).select('-__v').sort(sortOptions).skip(skip).limit(limit).lean(),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      tasks,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(id) {
    const task = await Task.findById(id).select('-__v');
    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    return task;
  }

  /**
   * Update task fields
   */
  static async updateTask(id, data) {
    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.priority !== undefined) updateData.priority = data.priority;

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update task status (IN_PROGRESS or COMPLETED)
   */
  static async updateTaskStatus(id, status) {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Delete a task
   */
  static async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    return true;
  }

  /**
   * Return weekly summary aggregated by Monday-Sunday in user timezone
   */
  static async getWeeklySummary(timezone = 'UTC') {
    const pipeline = [
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$scheduledAt',
              unit: 'week',
              binSize: 1,
              timezone: timezone,
              startOfWeek: 'monday',
            },
          },
          openCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0],
            },
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          weekStart: '$_id',
          openCount: 1,
          completedCount: 1,
          totalCount: 1,
        },
      },
      {
        $sort: { weekStart: 1 },
      },
    ];

    const data = await Task.aggregate(pipeline);
    return data;
  }
}
