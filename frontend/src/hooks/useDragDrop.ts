import { useState, useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { Task } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { useNavigation } from '../context/NavigationContext';
import { toDateKey } from '../utils/dateHelpers';

export function useDragDrop() {
  const { state: { tasks }, actions: taskActions } = useTaskContext();
  const { state: { currentMonth, currentYear } } = useNavigation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const draggedTask = active.data.current?.task as Task | undefined;
    if (!draggedTask) return;

    const activeDate = toDateKey(draggedTask.date);

    let overDate: string;
    const overTask = over.data.current?.task as Task | undefined;
    if (overTask) {
      overDate = toDateKey(overTask.date);
    } else {
      overDate = over.id as string;
    }

    const currentTasks = tasksRef.current;

    if (activeDate === overDate) {
      const dayTasks = currentTasks[activeDate] || [];
      const oldIndex = dayTasks.findIndex((t) => t.id === active.id);
      const newIndex = overTask
        ? dayTasks.findIndex((t) => t.id === over.id)
        : dayTasks.length - 1;

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(dayTasks, oldIndex, newIndex);
        taskActions.reorderTasks(activeDate, newOrder.map((t) => t.id));
      }
    } else {
      const targetTasks = currentTasks[overDate] || [];
      const newIndex = overTask
        ? targetTasks.findIndex((t) => t.id === over.id)
        : targetTasks.length;
      taskActions.moveTask(
        active.id as string,
        activeDate,
        overDate,
        newIndex >= 0 ? newIndex : 0,
        currentMonth + 1,
        currentYear,
      );
    }
  }, [taskActions, currentMonth, currentYear]);

  return { activeTask, handleDragStart, handleDragEnd };
}
