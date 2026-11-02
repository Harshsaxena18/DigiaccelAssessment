import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi.js';

export const TASK_KEYS = {
  all: ['tasks'],
  weeklySummary: (tz) => ['weekly-summary', tz],
  byRange: (from, to) => ['tasks', 'range', from, to],
  search: (query) => ['tasks', 'search', query],
  detail: (id) => ['tasks', 'detail', id],
};

/**
 * Hook to fetch weekly summaries
 */
export const useWeeklySummary = (timezone) => {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return useQuery({
    queryKey: TASK_KEYS.weeklySummary(tz),
    queryFn: () => tasksApi.getWeeklySummary(tz),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to fetch tasks within a specific week range
 */
export const useTasksByDateRange = (from, to, enabled = true) => {
  return useQuery({
    queryKey: TASK_KEYS.byRange(from, to),
    queryFn: ({ signal }) => tasksApi.getTasks({ from, to, limit: 100 }, signal),
    enabled: Boolean(enabled && from && to),
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to search tasks across all weeks
 */
export const useSearchTasks = (searchQuery, enabled = true) => {
  const query = searchQuery ? searchQuery.trim() : '';
  return useQuery({
    queryKey: TASK_KEYS.search(query),
    queryFn: ({ signal }) => tasksApi.getTasks({ search: query, limit: 50 }, signal),
    enabled: Boolean(enabled && query.length > 0),
    staleTime: 1000 * 10,
  });
};

/**
 * Mutations with query invalidations to keep counts & lists synchronized
 */
export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const invalidateTaskData = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-summary'] });
  };

  const createTask = useMutation({
    mutationFn: (data) => tasksApi.createTask(data),
    onSuccess: invalidateTaskData,
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => tasksApi.updateTask(id, data),
    onSuccess: invalidateTaskData,
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateTaskStatus(id, status),
    onSuccess: invalidateTaskData,
  });

  const deleteTask = useMutation({
    mutationFn: (id) => tasksApi.deleteTask(id),
    onSuccess: invalidateTaskData,
  });

  return {
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
};
