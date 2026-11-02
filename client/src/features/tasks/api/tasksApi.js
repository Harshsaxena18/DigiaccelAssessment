import API from '../../../api/axiosClient.js';

export const tasksApi = {
  /**
   * Fetch weekly summary
   */
  async getWeeklySummary(timezone) {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const response = await API.get('/tasks/weekly-summary', {
      params: { timezone: tz },
    });
    return response.data || [];
  },

  /**
   * Fetch tasks with query parameters and optional AbortSignal
   */
  async getTasks(params = {}, signal) {
    const response = await API.get('/tasks', {
      params,
      signal,
    });
    return response;
  },

  /**
   * Fetch single task by ID
   */
  async getTaskById(id) {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create task
   */
  async createTask(taskData) {
    const response = await API.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Update task fields
   */
  async updateTask(id, taskData) {
    const response = await API.patch(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id, status) {
    const response = await API.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete task
   */
  async deleteTask(id) {
    const response = await API.delete(`/tasks/${id}`);
    return response;
  },
};
