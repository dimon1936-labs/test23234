import { apiClient } from './apiClient';
import type { Task, CreateTaskPayload, UpdateTaskPayload, ReorderPayload } from '../types/task';

export const tasksApi = {
  getByMonth: (month: number, year: number, signal?: AbortSignal) =>
    apiClient.get<Task[]>('/tasks', { params: { month, year }, signal }),

  create: (data: CreateTaskPayload) =>
    apiClient.post<Task>('/tasks', data),

  update: (id: string, data: UpdateTaskPayload) =>
    apiClient.put<Task>(`/tasks/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  reorder: (data: ReorderPayload) =>
    apiClient.put<Task[]>('/tasks/reorder', data),
};
