import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TaskProvider, useTaskContext } from './TaskContext';
import type { Task } from '../types/task';

// Mock tasksApi
vi.mock('../api/tasksApi', () => ({
  tasksApi: {
    getByMonth: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
}));

import { tasksApi } from '../api/tasksApi';

const mockTask: Task = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Test task',
  date: '2026-03-16',
  order: 0,
  labels: [],
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
};

const mockTask2: Task = {
  id: '22222222-2222-2222-2222-222222222222',
  title: 'Second task',
  date: '2026-03-16',
  order: 1,
  labels: [],
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <TaskProvider>{children}</TaskProvider>;
}

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useTaskContext());
    }).toThrow('useTaskContext must be used within TaskProvider');
  });

  it('should have initial empty state', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });
    expect(result.current.state.tasks).toEqual({});
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  describe('loadTasks', () => {
    it('should load and group tasks by date', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask, mockTask2] });

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      expect(result.current.state.tasks['2026-03-16']).toHaveLength(2);
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should set error on failure', async () => {
      (tasksApi.getByMonth as any).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      expect(result.current.state.error).toBe('Failed to load tasks');
    });
  });

  describe('createTask', () => {
    it('should add task to correct date bucket', async () => {
      (tasksApi.create as any).mockResolvedValue({ data: mockTask });

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.createTask({ title: 'Test task', date: '2026-03-16' });
      });

      expect(result.current.state.tasks['2026-03-16']).toHaveLength(1);
      expect(result.current.state.tasks['2026-03-16'][0].title).toBe('Test task');
    });
  });

  describe('updateTask', () => {
    it('should update existing task', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask] });
      (tasksApi.update as any).mockResolvedValue({
        data: { ...mockTask, title: 'Updated' },
      });

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      await act(async () => {
        await result.current.actions.updateTask(mockTask.id, { title: 'Updated' });
      });

      expect(result.current.state.tasks['2026-03-16'][0].title).toBe('Updated');
    });
  });

  describe('deleteTask', () => {
    it('should remove task optimistically', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask] });
      (tasksApi.delete as any).mockResolvedValue({});

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      await act(async () => {
        await result.current.actions.deleteTask(mockTask.id, '2026-03-16');
      });

      expect(result.current.state.tasks['2026-03-16']).toBeUndefined();
    });

    it('should rollback on delete failure', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask] });
      (tasksApi.delete as any).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      await act(async () => {
        await result.current.actions.deleteTask(mockTask.id, '2026-03-16');
      });

      expect(result.current.state.tasks['2026-03-16']).toHaveLength(1);
      expect(result.current.state.error).toContain('Failed to delete');
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks optimistically', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask, mockTask2] });
      (tasksApi.reorder as any).mockResolvedValue({});

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      await act(async () => {
        await result.current.actions.reorderTasks('2026-03-16', [mockTask2.id, mockTask.id]);
      });

      const tasks = result.current.state.tasks['2026-03-16'];
      expect(tasks[0].id).toBe(mockTask2.id);
      expect(tasks[0].order).toBe(0);
      expect(tasks[1].id).toBe(mockTask.id);
      expect(tasks[1].order).toBe(1);
    });

    it('should rollback on reorder failure', async () => {
      (tasksApi.getByMonth as any).mockResolvedValue({ data: [mockTask, mockTask2] });
      (tasksApi.reorder as any).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.loadTasks(3, 2026);
      });

      await act(async () => {
        await result.current.actions.reorderTasks('2026-03-16', [mockTask2.id, mockTask.id]);
      });

      // Should be rolled back to original order
      expect(result.current.state.tasks['2026-03-16'][0].id).toBe(mockTask.id);
      expect(result.current.state.error).toContain('Failed to reorder');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      (tasksApi.create as any).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      await act(async () => {
        await result.current.actions.createTask({ title: 'x', date: '2026-03-16' });
      });
      expect(result.current.state.error).not.toBeNull();

      act(() => {
        result.current.actions.clearError();
      });
      expect(result.current.state.error).toBeNull();
    });
  });
});
