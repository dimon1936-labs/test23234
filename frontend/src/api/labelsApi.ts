import { apiClient } from './apiClient';
import type { Label } from '../types/task';

export const labelsApi = {
  getAll: () =>
    apiClient.get<Label[]>('/labels'),

  create: (color: string, name?: string) =>
    apiClient.post<Label>('/labels', { color, name: name ?? '' }),

  delete: (id: string) =>
    apiClient.delete(`/labels/${id}`),
};
