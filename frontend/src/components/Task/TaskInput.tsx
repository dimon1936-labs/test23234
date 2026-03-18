import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const InputWrapper = styled.div`
  margin-top: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.md};
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px ${theme.colors.primaryFocus};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 8px 10px;
    font-size: ${theme.fontSizes.base};
    border-radius: ${theme.radii.lg};
  }
`;

const AddButton = styled.button`
  background: none;
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSizes.md};
  cursor: pointer;
  padding: 4px 8px;
  width: 100%;
  text-align: left;
  margin-top: auto;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: ${theme.colors.primary};
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primaryLight};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 8px 10px;
    font-size: ${theme.fontSizes.base};
    border-radius: ${theme.radii.lg};
  }
`;

interface TaskInputProps {
  onSubmit: (title: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export function TaskInput({ onSubmit, initialValue = '', autoFocus = false, onCancel }: TaskInputProps) {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const MAX_TITLE_LENGTH = 200;

  const handleSubmit = () => {
    const trimmed = value.trim().slice(0, MAX_TITLE_LENGTH);
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isEditing) {
    return (
      <AddButton onClick={() => setIsEditing(true)}>+ Add task</AddButton>
    );
  }

  return (
    <InputWrapper>
      <Input
        ref={inputRef}
        value={value}
        maxLength={200}
        aria-label="Task title"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="Task title..."
      />
    </InputWrapper>
  );
}
