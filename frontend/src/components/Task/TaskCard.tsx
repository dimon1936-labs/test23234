import { memo, useState } from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/task';
import { theme } from '../../styles/theme';
import { TaskInput } from './TaskInput';
import { LabelPicker } from './LabelPicker';

const DIMMED_OPACITY = 0.4;

const Card = styled.div<{ $isDragging: boolean; $dimmed: boolean }>`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.xl};
  padding: 8px 10px;
  margin-bottom: 6px;
  font-size: ${theme.fontSizes.base};
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: ${(p) => (p.$dimmed ? DIMMED_OPACITY : p.$isDragging ? 0.5 : 1)};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${(p) =>
    p.$isDragging
      ? `0 6px 16px ${theme.colors.cardShadowDrag}`
      : `0 1px 4px ${theme.colors.cardShadow}`};
  transition: box-shadow 0.2s, opacity 0.2s, border-color 0.2s;
  touch-action: none;

  &:hover {
    box-shadow: 0 3px 8px ${theme.colors.cardShadowHover};
    border-color: ${theme.colors.borderLight};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 1px;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 10px 12px;
    gap: 8px;
    margin-bottom: 8px;
    border-radius: 10px;
  }
`;

const LabelsRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const LabelDot = styled.div<{ $color: string }>`
  width: 32px;
  height: 6px;
  border-radius: 3px;
  background: ${(p) => p.$color};

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 40px;
    height: 8px;
    border-radius: 4px;
  }
`;

const Title = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  color: ${theme.colors.text};
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 15px;
    -webkit-line-clamp: 4;
  }
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    gap: 6px;
    border-top: 1px solid ${theme.colors.border};
    padding-top: 6px;
  }
`;

const ActionBtn = styled.button`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.border};
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  border-radius: ${theme.radii.md};
  padding: 0;
  line-height: 1;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text};
    border-color: ${theme.colors.borderLight};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: auto;
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
    border-radius: ${theme.radii.lg};
    flex: 1;
    gap: 4px;
  }
`;

const BtnLabel = styled.span`
  display: none;

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: inline;
    font-size: 13px;
    font-weight: 500;
  }
`;

const DeleteBtn = styled(ActionBtn)`
  &:hover {
    background: #ffeaea;
    color: ${theme.colors.danger};
    border-color: ${theme.colors.danger};
  }
`;

interface TaskCardProps {
  task: Task;
  dimmed: boolean;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onUpdateLabels: (id: string, labelIds: string[]) => void;
}

export const TaskCard = memo(function TaskCard({ task, dimmed, onUpdate, onDelete, onUpdateLabels }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <TaskInput
          initialValue={task.title}
          autoFocus
          onSubmit={(title) => {
            onUpdate(task.id, title);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      role="listitem"
      aria-label={`Task: ${task.title}`}
      aria-grabbed={isDragging}
      $isDragging={isDragging}
      $dimmed={dimmed}
      {...attributes}
      {...listeners}
    >
      {task.labels?.length > 0 && (
        <LabelsRow aria-label="Labels">
          {task.labels.map((tl) => (
            <LabelDot key={tl.labelId} $color={tl.label.color} title={tl.label.name || tl.label.color} />
          ))}
        </LabelsRow>
      )}
      <CardRow>
        <Title>{task.title}</Title>
        <Actions>
          <LabelPicker
            taskLabels={task.labels || []}
            onToggleLabel={onUpdateLabels}
            taskId={task.id}
          />
          <ActionBtn
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            aria-label={`Edit task: ${task.title}`}
            title="Edit"
          >
            &#9998;<BtnLabel>Edit</BtnLabel>
          </ActionBtn>
          <DeleteBtn
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            aria-label={`Delete task: ${task.title}`}
            title="Delete"
          >
            &times;<BtnLabel>Delete</BtnLabel>
          </DeleteBtn>
        </Actions>
      </CardRow>
    </Card>
  );
});
