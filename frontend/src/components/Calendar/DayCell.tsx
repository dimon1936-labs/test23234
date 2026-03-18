import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CalendarDay } from '../../types/calendar';
import type { Task } from '../../types/task';
import type { Holiday } from '../../types/holiday';
import { useTaskContext } from '../../context/TaskContext';
import { useSearch } from '../../context/SearchContext';
import { theme } from '../../styles/theme';
import { TaskCard } from '../Task/TaskCard';
import { TaskInput } from '../Task/TaskInput';
import { HolidayBadge } from '../Holiday/HolidayBadge';

/* ── Desktop cell (inside 7-col grid) ── */
const CellWrapper = styled.div<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
  $isOver: boolean;
  $isWeekView: boolean;
}>`
  background: ${(p) =>
    p.$isOver
      ? theme.colors.primaryLight
      : p.$isCurrentMonth
        ? theme.colors.cellBg
        : theme.colors.bg};
  border: 1px solid ${(p) => (p.$isToday ? theme.colors.primary : theme.colors.border)};
  border-width: ${(p) => (p.$isToday ? '2px' : '1px')};
  padding: 6px;
  min-height: ${(p) => (p.$isWeekView ? theme.sizes.cellMinHeightWeek : theme.sizes.cellMinHeight)};
  max-height: ${(p) => (p.$isWeekView ? '400px' : '200px')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.15s;

  /* ── Mobile: full-width card-like day ── */
  @media (max-width: ${theme.breakpoints.tablet}) {
    min-height: auto;
    max-height: none;
    overflow: visible;
    border: none;
    border-width: 1px;
    border-radius: ${theme.radii.xl};
    padding: 12px;
    margin-bottom: 8px;
    background: ${(p) =>
      p.$isOver
        ? theme.colors.primaryLight
        : p.$isToday
          ? theme.colors.primaryLight
          : p.$isCurrentMonth
            ? theme.colors.surface
            : theme.colors.bg};
    box-shadow: ${(p) =>
      p.$isCurrentMonth ? `0 1px 4px ${theme.colors.cardShadow}` : 'none'};
    ${(p) =>
      p.$isToday &&
      `border: 2px solid ${theme.colors.primary};`}
    ${(p) =>
      !p.$isCurrentMonth &&
      `opacity: 0.5;`}
  }
`;

const DayHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-bottom: 8px;
    align-items: center;
  }
`;

/* Day name visible only on mobile */
const DayName = styled.span`
  display: none;

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: inline;
    font-size: 15px;
    font-weight: 600;
    color: ${theme.colors.text};
  }
`;

const DayNumber = styled.span<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
}>`
  font-size: ${theme.fontSizes.lg};
  font-weight: ${(p) => (p.$isToday ? 700 : 500)};
  color: ${(p) =>
    p.$isToday ? theme.colors.primary : p.$isCurrentMonth ? theme.colors.text : theme.colors.textMuted};
  ${(p) =>
    p.$isToday &&
    `
    background: ${theme.colors.primary};
    color: #fff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  `}

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 16px;
    ${(p: { $isToday: boolean }) =>
      p.$isToday &&
      `
      width: 30px;
      height: 30px;
      font-size: 14px;
    `}
  }
`;

const CardCount = styled.span`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-left: auto;
`;

const HolidaySection = styled.div`
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;

  @media (max-width: ${theme.breakpoints.tablet}) {
    position: static;
    margin-bottom: 4px;
  }
`;

const TaskList = styled.div`
  flex: 1;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 2px;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    overflow-y: visible;
    min-height: 0;
  }
`;

interface DayCellProps {
  day: CalendarDay;
  tasks: Task[];
  holidays: Holiday[];
  searchQuery: string;
  isWeekView: boolean;
  weekdayName: string;
}

function isTaskDimmed(task: Task, query: string, activeLabels: Set<string>): boolean {
  const textMatch = !query || task.title.toLowerCase().includes(query);
  const labelMatch =
    activeLabels.size === 0 ||
    task.labels?.some((tl) => activeLabels.has(tl.label.color));
  return !(textMatch && labelMatch);
}

export const DayCell = memo(function DayCell({ day, tasks, holidays, searchQuery, isWeekView, weekdayName }: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: day.dateStr });
  const { actions: taskActions } = useTaskContext();
  const { activeLabels } = useSearch();
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const query = searchQuery.toLowerCase();

  const handleCreate = useCallback(
    (title: string) => taskActions.createTask({ title, date: day.dateStr }),
    [taskActions, day.dateStr],
  );

  const handleUpdate = useCallback(
    (id: string, title: string) => taskActions.updateTask(id, { title }),
    [taskActions],
  );

  const handleDelete = useCallback(
    (id: string) => taskActions.deleteTask(id, day.dateStr),
    [taskActions, day.dateStr],
  );

  const handleUpdateLabels = useCallback(
    (id: string, labelIds: string[]) => taskActions.updateTask(id, { labelIds }),
    [taskActions],
  );

  return (
    <CellWrapper
      ref={setNodeRef}
      $isCurrentMonth={day.isCurrentMonth}
      $isToday={day.isToday}
      $isOver={isOver}
      $isWeekView={isWeekView}
      aria-label={`${day.dateStr}${day.isToday ? ', today' : ''}, ${tasks.length} tasks`}
    >
      <DayHeader>
        <DayName>{weekdayName}</DayName>
        <DayNumber $isCurrentMonth={day.isCurrentMonth} $isToday={day.isToday}>
          {day.date.getDate()}
        </DayNumber>
        {tasks.length > 0 && (
          <CardCount>
            {tasks.length} card{tasks.length !== 1 ? 's' : ''}
          </CardCount>
        )}
      </DayHeader>

      {holidays.length > 0 && (
        <HolidaySection>
          {holidays.map((h) => (
            <HolidayBadge key={`${h.date}-${h.name}`} holiday={h} />
          ))}
        </HolidaySection>
      )}

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <TaskList role="list" aria-label={`Tasks for ${day.dateStr}`}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              dimmed={isTaskDimmed(task, query, activeLabels)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onUpdateLabels={handleUpdateLabels}
            />
          ))}
        </TaskList>
      </SortableContext>

      <TaskInput onSubmit={handleCreate} />
    </CellWrapper>
  );
});
