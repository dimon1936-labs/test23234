import styled, { keyframes } from 'styled-components';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useNavigation } from '../../context/NavigationContext';
import { useTaskContext } from '../../context/TaskContext';
import { useHolidays } from '../../context/HolidayContext';
import { useSearch } from '../../context/SearchContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useTaskLoader } from '../../hooks/useTaskLoader';
import { useHolidayLoader } from '../../hooks/useHolidayLoader';
import { useDragDrop } from '../../hooks/useDragDrop';
import { WEEKDAYS } from '../../utils/dateHelpers';
import { theme } from '../../styles/theme';
import { DayCell } from './DayCell';

/* ── Desktop grid (7 columns) ── */

const GridWrapper = styled.div`
  background: ${theme.colors.border};
  border-radius: ${theme.radii.md};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  min-width: 700px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    min-width: 0;
    border-radius: ${theme.radii.lg};
    border: none;
    background: transparent;
  }
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;

  @media (max-width: ${theme.breakpoints.tablet}) {
    overflow-x: visible;
  }
`;

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${theme.colors.bg};
  border-bottom: 1px solid ${theme.colors.border};

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const WeekdayCell = styled.div`
  padding: 10px 8px;
  text-align: center;
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: capitalize;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${theme.colors.border};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 0;
    background: transparent;
  }
`;

const DragOverlayCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 8px 10px;
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
  box-shadow: 0 8px 24px ${theme.colors.cardShadowDrag};
  cursor: grabbing;
  max-width: 180px;
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const SkeletonCell = styled.div`
  background: ${theme.colors.surface};
  min-height: ${theme.sizes.cellMinHeight};
  padding: 8px;
`;

const SkeletonLine = styled.div<{ $width?: string }>`
  height: 10px;
  width: ${(p) => p.$width || '60%'};
  border-radius: ${theme.radii.sm};
  background: linear-gradient(90deg, ${theme.colors.bg} 0%, ${theme.colors.surfaceHover} 50%, ${theme.colors.bg} 100%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  margin-bottom: 6px;
`;

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 35 }, (_, i) => (
        <SkeletonCell key={i}>
          <SkeletonLine $width="30%" />
          <SkeletonLine $width="80%" />
          <SkeletonLine $width="50%" />
        </SkeletonCell>
      ))}
    </>
  );
}

const WEEKDAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function CalendarGrid() {
  const { state: navState } = useNavigation();
  const { state: taskState } = useTaskContext();
  const { holidays } = useHolidays();
  const { searchQuery } = useSearch();

  const { currentMonth, currentYear, viewMode, currentWeekStart } = navState;
  const { tasks, isLoading } = taskState;

  const days = useCalendar(currentYear, currentMonth, viewMode, currentWeekStart);
  const isWeek = viewMode === 'week';

  useTaskLoader();
  useHolidayLoader();

  const { activeTask, handleDragStart, handleDragEnd } = useDragDrop();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollContainer>
        <GridWrapper role="grid" aria-label="Calendar" data-export-target="calendar">
          <WeekdayHeader role="row">
            {WEEKDAYS.map((day) => (
              <WeekdayCell key={day} role="columnheader">{day}</WeekdayCell>
            ))}
          </WeekdayHeader>
          <DaysGrid>
            {isLoading && Object.keys(tasks).length === 0 ? (
              <LoadingSkeleton />
            ) : (
              days.map((day) => {
                const dayOfWeek = (day.date.getDay() + 6) % 7; // Mon=0
                return (
                  <DayCell
                    key={day.dateStr}
                    day={day}
                    tasks={tasks[day.dateStr] || []}
                    holidays={holidays[day.dateStr] || []}
                    searchQuery={searchQuery}
                    isWeekView={isWeek}
                    weekdayName={WEEKDAY_NAMES_FULL[dayOfWeek] ?? ''}
                  />
                );
              })
            )}
          </DaysGrid>
        </GridWrapper>
      </ScrollContainer>

      <DragOverlay>
        {activeTask ? (
          <DragOverlayCard>{activeTask.title}</DragOverlayCard>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
