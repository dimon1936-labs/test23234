import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { Task } from '../../types/task';
import type { CalendarDay } from '../../types/calendar';
import type { Holiday } from '../../types/holiday';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));
vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

// Mock LabelPicker
vi.mock('../Task/LabelPicker', () => ({
  LabelPicker: () => <button>Labels</button>,
}));

// Mock contexts
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock('../../context/TaskContext', () => ({
  useTaskContext: () => ({
    actions: {
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
    },
  }),
}));

vi.mock('../../context/SearchContext', () => ({
  useSearch: () => ({
    activeLabels: new Set<string>(),
  }),
}));

import { DayCell } from './DayCell';

const day: CalendarDay = {
  date: new Date(2026, 2, 16),
  dateStr: '2026-03-16',
  isCurrentMonth: true,
  isToday: false,
};

const todayDay: CalendarDay = {
  ...day,
  isToday: true,
};

const task: Task = {
  id: 'task-1',
  title: 'My task',
  date: '2026-03-16',
  order: 0,
  labels: [],
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
};

const holiday: Holiday = {
  date: '2026-03-16',
  localName: 'Свято',
  name: 'Holiday Name',
  countryCode: 'UA',
};

describe('DayCell', () => {
  const defaultProps = {
    day,
    tasks: [] as Task[],
    holidays: [] as Holiday[],
    searchQuery: '',
    isWeekView: false,
    weekdayName: 'Mon',
  };

  it('should render day number', () => {
    render(<DayCell {...defaultProps} />);
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('should render "+ Add task" button', () => {
    render(<DayCell {...defaultProps} />);
    expect(screen.getByText('+ Add task')).toBeInTheDocument();
  });

  it('should render tasks', () => {
    render(<DayCell {...defaultProps} tasks={[task]} />);
    expect(screen.getByText('My task')).toBeInTheDocument();
  });

  it('should show card count when tasks exist', () => {
    render(<DayCell {...defaultProps} tasks={[task]} />);
    expect(screen.getByText('1 card')).toBeInTheDocument();
  });

  it('should pluralize card count', () => {
    const tasks = [
      task,
      { ...task, id: 'task-2', title: 'Second', order: 1 },
    ];
    render(<DayCell {...defaultProps} tasks={tasks} />);
    expect(screen.getByText('2 cards')).toBeInTheDocument();
  });

  it('should render holidays', () => {
    render(<DayCell {...defaultProps} holidays={[holiday]} />);
    expect(screen.getByText('Свято')).toBeInTheDocument();
  });

  it('should have accessible aria-label', () => {
    render(<DayCell {...defaultProps} tasks={[task]} />);
    expect(screen.getByLabelText('2026-03-16, 1 tasks')).toBeInTheDocument();
  });

  it('should include "today" in aria-label when isToday', () => {
    render(<DayCell {...defaultProps} day={todayDay} />);
    expect(screen.getByLabelText('2026-03-16, today, 0 tasks')).toBeInTheDocument();
  });

  it('should have a task list with role="list"', () => {
    render(<DayCell {...defaultProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('should call createTask when adding a new task', async () => {
    render(<DayCell {...defaultProps} />);
    await userEvent.click(screen.getByText('+ Add task'));
    const input = screen.getByLabelText('Task title');
    await userEvent.type(input, 'New task{Enter}');
    expect(mockCreateTask).toHaveBeenCalledWith({ title: 'New task', date: '2026-03-16' });
  });

  it('should call deleteTask when delete button clicked', async () => {
    render(<DayCell {...defaultProps} tasks={[task]} />);
    await userEvent.click(screen.getByLabelText('Delete task: My task'));
    expect(mockDeleteTask).toHaveBeenCalledWith('task-1', '2026-03-16');
  });
});
