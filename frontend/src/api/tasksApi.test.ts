import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock apiClient before importing tasksApi
vi.mock('./apiClient', () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { apiClient: client, createAbortController: vi.fn(() => new AbortController()) };
});

import { tasksApi } from './tasksApi';
import { apiClient } from './apiClient';

describe('tasksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getByMonth should call GET /tasks with month and year', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [] });
    await tasksApi.getByMonth(3, 2026);
    expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
      params: { month: 3, year: 2026 },
      signal: undefined,
    });
  });

  it('getByMonth should pass abort signal', async () => {
    const controller = new AbortController();
    (apiClient.get as any).mockResolvedValue({ data: [] });
    await tasksApi.getByMonth(3, 2026, controller.signal);
    expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
      params: { month: 3, year: 2026 },
      signal: controller.signal,
    });
  });

  it('create should call POST /tasks', async () => {
    const payload = { title: 'Test', date: '2026-03-16' };
    (apiClient.post as any).mockResolvedValue({ data: { id: '1', ...payload } });
    await tasksApi.create(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/tasks', payload);
  });

  it('update should call PUT /tasks/:id', async () => {
    const payload = { title: 'Updated' };
    (apiClient.put as any).mockResolvedValue({ data: { id: '1', ...payload } });
    await tasksApi.update('1', payload);
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/1', payload);
  });

  it('delete should call DELETE /tasks/:id', async () => {
    (apiClient.delete as any).mockResolvedValue({});
    await tasksApi.delete('1');
    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
  });

  it('reorder should call PUT /tasks/reorder', async () => {
    const payload = { taskIds: ['1', '2'], date: '2026-03-16' };
    (apiClient.put as any).mockResolvedValue({ data: [] });
    await tasksApi.reorder(payload);
    expect(apiClient.put).toHaveBeenCalledWith('/tasks/reorder', payload);
  });
});
