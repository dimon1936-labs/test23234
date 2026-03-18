import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { Task } from '../../types/task';

// Mock dnd-kit so we don't need DndContext
vi.mock('@dnd-kit/sortable', () => ({
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

// Mock LabelPicker to keep test simple
vi.mock('./LabelPicker', () => ({
  LabelPicker: () => <button>Labels</button>,
}));

import { TaskCard } from './TaskCard';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test task title',
  date: '2026-03-16',
  order: 0,
  labels: [
    { taskId: 'task-1', labelId: 'label-1', label: { id: 'label-1', color: '#4A90D9', name: 'Blue' } },
  ],
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
};

const taskNoLabels: Task = {
  ...mockTask,
  id: 'task-2',
  labels: [],
};

describe('TaskCard', () => {
  const defaultProps = {
    task: mockTask,
    dimmed: false,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onUpdateLabels: vi.fn(),
  };

  it('should render task title', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText('Test task title')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByLabelText('Task: Test task title')).toBeInTheDocument();
  });

  it('should render label dots when task has labels', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByLabelText('Labels')).toBeInTheDocument();
  });

  it('should not render label dots when task has no labels', () => {
    render(<TaskCard {...defaultProps} task={taskNoLabels} />);
    expect(screen.queryByLabelText('Labels')).not.toBeInTheDocument();
  });

  it('should have edit and delete buttons', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByLabelText('Edit task: Test task title')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete task: Test task title')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', async () => {
    const onDelete = vi.fn();
    render(<TaskCard {...defaultProps} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText('Delete task: Test task title'));
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });

  it('should switch to edit mode when edit button clicked', async () => {
    render(<TaskCard {...defaultProps} />);
    await userEvent.click(screen.getByLabelText('Edit task: Test task title'));
    // Should now show input with task title
    expect(screen.getByLabelText('Task title')).toHaveValue('Test task title');
  });

  it('should call onUpdate after editing and pressing Enter', async () => {
    const onUpdate = vi.fn();
    render(<TaskCard {...defaultProps} onUpdate={onUpdate} />);

    await userEvent.click(screen.getByLabelText('Edit task: Test task title'));
    const input = screen.getByLabelText('Task title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated title{Enter}');

    expect(onUpdate).toHaveBeenCalledWith('task-1', 'Updated title');
  });

  it('should have role="listitem"', () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
