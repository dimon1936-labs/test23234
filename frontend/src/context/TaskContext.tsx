import React, { createContext, useContext, useReducer, useCallback, useRef, useMemo } from 'react';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';
import { tasksApi } from '../api/tasksApi';
import { toDateKey } from '../utils/dateHelpers';

interface TaskState {
  tasks: Record<string, Task[]>;
  isLoading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string; date: string }
  | { type: 'REORDER_TASKS'; date: string; taskIds: string[] }
  | { type: 'MOVE_TASK'; taskId: string; fromDate: string; toDate: string; newIndex: number }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESTORE_TASKS'; tasks: Record<string, Task[]> };

function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  for (const task of tasks) {
    const dateKey = toDateKey(task.date);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(task);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.order - b.order);
  }
  return grouped;
}

const initialState: TaskState = {
  tasks: {},
  isLoading: false,
  error: null,
};

function reducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: groupTasksByDate(action.tasks), error: null };
    case 'ADD_TASK': {
      const dateKey = toDateKey(action.task.date);
      const existing = state.tasks[dateKey] || [];
      return {
        ...state,
        tasks: { ...state.tasks, [dateKey]: [...existing, action.task] },
        error: null,
      };
    }
    case 'UPDATE_TASK': {
      const dateKey = toDateKey(action.task.date);
      const newTasks: Record<string, Task[]> = {};
      for (const [key, dayTasks] of Object.entries(state.tasks)) {
        const filtered = dayTasks.filter((t) => t.id !== action.task.id);
        if (filtered.length > 0) newTasks[key] = filtered;
      }
      const existing = newTasks[dateKey] || [];
      newTasks[dateKey] = [...existing, action.task].sort((a, b) => a.order - b.order);
      return { ...state, tasks: newTasks, error: null };
    }
    case 'DELETE_TASK': {
      const dateTasks = (state.tasks[action.date] || []).filter((t) => t.id !== action.id);
      const newTasks = { ...state.tasks };
      if (dateTasks.length === 0) {
        delete newTasks[action.date];
      } else {
        newTasks[action.date] = dateTasks;
      }
      return { ...state, tasks: newTasks };
    }
    case 'REORDER_TASKS': {
      const dateTasks = state.tasks[action.date] || [];
      const taskMap = new Map(dateTasks.map((t) => [t.id, t]));
      const reordered = action.taskIds
        .map((id, i) => {
          const task = taskMap.get(id);
          return task ? { ...task, order: i } : null;
        })
        .filter(Boolean) as Task[];
      return {
        ...state,
        tasks: { ...state.tasks, [action.date]: reordered },
      };
    }
    case 'MOVE_TASK': {
      const newTasks = { ...state.tasks };
      const fromTasks = [...(newTasks[action.fromDate] || [])];
      const taskIndex = fromTasks.findIndex((t) => t.id === action.taskId);
      if (taskIndex === -1) return state;
      const [movedTask] = fromTasks.splice(taskIndex, 1);
      newTasks[action.fromDate] = fromTasks;
      if (fromTasks.length === 0) delete newTasks[action.fromDate];

      const toTasks = [...(newTasks[action.toDate] || [])];
      const updatedTask = { ...movedTask, date: action.toDate };
      toTasks.splice(action.newIndex, 0, updatedTask);
      newTasks[action.toDate] = toTasks.map((t, i) => ({ ...t, order: i }));
      return { ...state, tasks: newTasks };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESTORE_TASKS':
      return { ...state, tasks: action.tasks };
    default:
      return state;
  }
}

interface TaskActions {
  loadTasks: (month: number, year: number, signal?: AbortSignal) => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  deleteTask: (id: string, date: string) => Promise<void>;
  reorderTasks: (date: string, taskIds: string[]) => Promise<void>;
  moveTask: (taskId: string, fromDate: string, toDate: string, newIndex: number, month: number, year: number) => Promise<void>;
  clearError: () => void;
}

interface TaskContextValue {
  state: TaskState;
  actions: TaskActions;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const snapshotRef = useRef<Record<string, Task[]>>({});

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const loadTasks = useCallback(async (month: number, year: number, signal?: AbortSignal) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const { data } = await tasksApi.getByMonth(month, year, signal);
      if (!signal?.aborted) {
        dispatch({ type: 'SET_TASKS', tasks: data });
      }
    } catch (e) {
      if (signal?.aborted) return;
      console.error('Failed to load tasks:', e);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load tasks' });
    } finally {
      if (!signal?.aborted) {
        dispatch({ type: 'SET_LOADING', isLoading: false });
      }
    }
  }, []);

  const createTask = useCallback(async (payload: CreateTaskPayload) => {
    try {
      const { data } = await tasksApi.create(payload);
      dispatch({ type: 'ADD_TASK', task: data });
    } catch (e) {
      console.error('Failed to create task:', e);
      dispatch({ type: 'SET_ERROR', error: 'Failed to create task' });
    }
  }, []);

  const updateTask = useCallback(async (id: string, payload: UpdateTaskPayload) => {
    try {
      const { data } = await tasksApi.update(id, payload);
      dispatch({ type: 'UPDATE_TASK', task: data });
    } catch (e) {
      console.error('Failed to update task:', e);
      dispatch({ type: 'SET_ERROR', error: 'Failed to update task' });
    }
  }, []);

  const deleteTask = useCallback(async (id: string, date: string) => {
    snapshotRef.current = { ...state.tasks };
    dispatch({ type: 'DELETE_TASK', id, date });
    try {
      await tasksApi.delete(id);
    } catch (e) {
      console.error('Failed to delete task, rolling back:', e);
      dispatch({ type: 'RESTORE_TASKS', tasks: snapshotRef.current });
      dispatch({ type: 'SET_ERROR', error: 'Failed to delete task. Changes reverted.' });
    }
  }, [state.tasks]);

  const reorderTasks = useCallback(async (date: string, taskIds: string[]) => {
    snapshotRef.current = { ...state.tasks };
    dispatch({ type: 'REORDER_TASKS', date, taskIds });
    try {
      await tasksApi.reorder({ taskIds, date });
    } catch (e) {
      console.error('Failed to reorder tasks, rolling back:', e);
      dispatch({ type: 'RESTORE_TASKS', tasks: snapshotRef.current });
      dispatch({ type: 'SET_ERROR', error: 'Failed to reorder tasks. Changes reverted.' });
    }
  }, [state.tasks]);

  const moveTask = useCallback(async (
    taskId: string,
    fromDate: string,
    toDate: string,
    newIndex: number,
    month: number,
    year: number,
  ) => {
    snapshotRef.current = { ...state.tasks };
    dispatch({ type: 'MOVE_TASK', taskId, fromDate, toDate, newIndex });
    try {
      await tasksApi.update(taskId, { date: toDate });
      // Reorder tasks in the target date to persist correct ordering
      const toTasks = state.tasks[toDate] || [];
      const movedTask = Object.values(state.tasks)
        .flat()
        .find((t) => t.id === taskId);
      const newToTasks = [...toTasks.filter((t) => t.id !== taskId)];
      if (movedTask) newToTasks.splice(newIndex, 0, movedTask);
      if (newToTasks.length > 0) {
        await tasksApi.reorder({ taskIds: newToTasks.map((t) => t.id), date: toDate });
      }
      // Reload to get consistent server state
      const { data } = await tasksApi.getByMonth(month, year);
      dispatch({ type: 'SET_TASKS', tasks: data });
    } catch (e) {
      console.error('Failed to move task, rolling back:', e);
      dispatch({ type: 'RESTORE_TASKS', tasks: snapshotRef.current });
      dispatch({ type: 'SET_ERROR', error: 'Failed to move task. Changes reverted.' });
    }
  }, [state.tasks]);

  const actions = useMemo<TaskActions>(
    () => ({ loadTasks, createTask, updateTask, deleteTask, reorderTasks, moveTask, clearError }),
    [loadTasks, createTask, updateTask, deleteTask, reorderTasks, moveTask, clearError],
  );

  return (
    <TaskContext.Provider value={{ state, actions }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
