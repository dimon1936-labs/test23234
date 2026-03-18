import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { TASK_COLORS } from '../../utils/colorPalette';
import { labelsApi } from '../../api/labelsApi';
import type { Label, TaskLabel } from '../../types/task';

const TriggerBtn = styled.button`
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

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9990;
`;

const Dropdown = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${(p) => p.$top}px;
  left: ${(p) => p.$left}px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  box-shadow: ${theme.shadows.lg};
  z-index: 9991;
  padding: 10px;
  min-width: 180px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    left: 50% !important;
    transform: translateX(-50%);
    padding: 14px;
    min-width: 240px;
    border-radius: 14px;
  }
`;

const DropdownTitle = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: ${theme.fontSizes.base};
    margin-bottom: 10px;
  }
`;

const ColorRow = styled.button<{ $color: string; $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: ${theme.radii.md};
  cursor: pointer;
  background: ${(p) => (p.$selected ? theme.colors.primaryLight : 'transparent')};
  transition: background 0.1s;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 10px;
    gap: 12px;
    border-radius: ${theme.radii.lg};
  }
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 36px;
  height: 18px;
  border-radius: ${theme.radii.md};
  background: ${(p) => p.$color};
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 48px;
    height: 24px;
    border-radius: ${theme.radii.lg};
  }
`;

const CheckMark = styled.span`
  font-size: 14px;
  color: ${theme.colors.success};
  margin-left: auto;
  font-weight: 700;

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 18px;
  }
`;

interface LabelPickerProps {
  taskLabels: TaskLabel[];
  onToggleLabel: (taskId: string, labelIds: string[]) => void;
  taskId: string;
}

export function LabelPicker({ taskLabels, onToggleLabel, taskId }: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeLabelIds = new Set(taskLabels.map((tl) => tl.labelId));

  const handleOpen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Position dropdown relative to trigger button
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 180),
      });
    }

    setOpen(true);

    // Load & ensure all predefined label colors exist
    try {
      const { data } = await labelsApi.getAll();
      let labels = data;
      const existing = new Set(data.map((l: Label) => l.color));
      const missing = TASK_COLORS.filter((c) => !existing.has(c));
      for (const color of missing) {
        try {
          const { data: created } = await labelsApi.create(color);
          labels = [...labels, created];
        } catch { /* ignore */ }
      }
      setAllLabels(labels);
    } catch { /* ignore */ }
  }, []);

  const handleToggle = useCallback((label: Label) => {
    const current = taskLabels.map((tl) => tl.labelId);
    const newLabelIds = activeLabelIds.has(label.id)
      ? current.filter((id) => id !== label.id)
      : [...current, label.id];
    onToggleLabel(taskId, newLabelIds);
    setOpen(false);
  }, [taskLabels, activeLabelIds, onToggleLabel, taskId]);

  const displayLabels = TASK_COLORS.map((color) => {
    const existing = allLabels.find((l) => l.color === color);
    return existing || { id: '', color, name: '' };
  });

  return (
    <>
      <TriggerBtn
        ref={triggerRef}
        onClick={handleOpen}
        aria-label="Manage labels"
        title="Labels"
      >
        &#9632;<BtnLabel>Labels</BtnLabel>
      </TriggerBtn>
      {open && createPortal(
        <>
          <Overlay onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <Dropdown $top={pos.top} $left={pos.left} onClick={(e) => e.stopPropagation()}>
            <DropdownTitle>Labels</DropdownTitle>
            {displayLabels.map((label) => (
              <ColorRow
                key={label.color}
                $color={label.color}
                $selected={label.id ? activeLabelIds.has(label.id) : false}
                onClick={() => label.id && handleToggle(label)}
                disabled={!label.id}
              >
                <ColorSwatch $color={label.color} />
                {label.id && activeLabelIds.has(label.id) && <CheckMark>&#10003;</CheckMark>}
              </ColorRow>
            ))}
          </Dropdown>
        </>,
        document.body,
      )}
    </>
  );
}
