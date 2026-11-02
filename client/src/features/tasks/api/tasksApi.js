const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiClientError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details || [];
  }
}

const handleResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorInfo = data.error || {};
    throw new ApiClientError(
      errorInfo.message || 'An error occurred while communicating with the server',
      response.status,
      errorInfo.code || 'API_ERROR',
      errorInfo.details || []
    );
  }

  return data;
};

export const tasksApi = {
  /**
   * Fetch weekly summary
   */
  async getWeeklySummary(timezone) {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const params = new URLSearchParams({ timezone: tz });
    const res = await fetch(`${API_BASE_URL}/tasks/weekly-summary?${params.toString()}`);
    const body = await handleResponse(res);
    return body.data || [];
  },

  /**
   * Fetch tasks with query parameters and optional AbortSignal
   */
  async getTasks(params = {}, signal) {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE_URL}/tasks?${query.toString()}`, { signal });
    const body = await handleResponse(res);
    return body;
  },

  /**
   * Fetch single task by ID
   */
  async getTaskById(id) {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`);
    const body = await handleResponse(res);
    return body.data;
  },

  /**
   * Create task
   */
  async createTask(taskData) {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const body = await handleResponse(res);
    return body.data;
  },

  /**
   * Update task fields
   */
  async updateTask(id, taskData) {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const body = await handleResponse(res);
    return body.data;
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const body = await handleResponse(res);
    return body.data;
  },

  /**
   * Delete task
   */
  async deleteTask(id) {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
