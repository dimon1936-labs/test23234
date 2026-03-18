import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from './TaskInput';

describe('TaskInput', () => {
  it('should render "+ Add task" button by default', () => {
    render(<TaskInput onSubmit={vi.fn()} />);
    expect(screen.getByText('+ Add task')).toBeInTheDocument();
  });

  it('should show input when button is clicked', async () => {
    render(<TaskInput onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByText('+ Add task'));
    expect(screen.getByLabelText('Task title')).toBeInTheDocument();
  });

  it('should render in edit mode when autoFocus is true', () => {
    render(<TaskInput onSubmit={vi.fn()} autoFocus initialValue="Edit me" />);
    const input = screen.getByLabelText('Task title');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Edit me');
  });

  it('should call onSubmit with trimmed value on Enter', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} autoFocus />);
    const input = screen.getByLabelText('Task title');
    await userEvent.type(input, 'New task');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('New task');
  });

  it('should not submit empty value', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} autoFocus />);
    const input = screen.getByLabelText('Task title');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should not submit whitespace-only value', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} autoFocus />);
    const input = screen.getByLabelText('Task title');
    await userEvent.type(input, '   ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onCancel and reset on Escape', async () => {
    const onCancel = vi.fn();
    render(<TaskInput onSubmit={vi.fn()} autoFocus initialValue="Original" onCancel={onCancel} />);
    const input = screen.getByLabelText('Task title');
    await userEvent.clear(input);
    await userEvent.type(input, 'Changed');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('should clear input after successful submit', async () => {
    const onSubmit = vi.fn();
    render(<TaskInput onSubmit={onSubmit} autoFocus />);
    const input = screen.getByLabelText('Task title');
    await userEvent.type(input, 'My task');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('My task');
    // After submit it returns to button view
    expect(screen.getByText('+ Add task')).toBeInTheDocument();
  });

  it('should have maxLength of 200', () => {
    render(<TaskInput onSubmit={vi.fn()} autoFocus />);
    const input = screen.getByLabelText('Task title');
    expect(input).toHaveAttribute('maxLength', '200');
  });

  it('should show placeholder text', () => {
    render(<TaskInput onSubmit={vi.fn()} autoFocus />);
    expect(screen.getByPlaceholderText('Task title...')).toBeInTheDocument();
  });
});
