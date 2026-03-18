import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearch } from '../../context/SearchContext';
import { TASK_COLORS } from '../../utils/colorPalette';
import { theme } from '../../styles/theme';

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    gap: 8px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  max-width: 320px;
  flex: 1;
  min-width: 180px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    max-width: 100%;
  }
`;

const SvgIcon = styled.svg`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.lg};
  background: ${theme.colors.surfaceAlt};
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  color: ${theme.colors.text};

  &:focus {
    border-color: ${theme.colors.primaryHover};
    background: ${theme.colors.surface};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const LabelFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterChip = styled.button<{ $color: string; $active: boolean }>`
  width: 24px;
  height: 14px;
  border-radius: 3px;
  background: ${(p) => p.$color};
  border: 2px solid ${(p) => (p.$active ? theme.colors.text : 'transparent')};
  cursor: pointer;
  opacity: ${(p) => (p.$active ? 1 : 0.4)};
  transition: opacity 0.15s, border-color 0.15s;

  &:hover {
    opacity: 1;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 32px;
    height: 20px;
    border-radius: 4px;
  }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSizes.sm};
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    color: ${theme.colors.text};
  }
`;

export function SearchBar() {
  const { setSearchQuery, activeLabels, toggleLabel, clearLabels } = useSearch();
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, setSearchQuery]);

  return (
    <SearchWrapper>
      <InputWrapper>
        <SvgIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </SvgIcon>
        <Input
          type="text"
          placeholder="Filter cards..."
          aria-label="Filter tasks by title"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </InputWrapper>
      <LabelFilters>
        {TASK_COLORS.map((color) => (
          <FilterChip
            key={color}
            $color={color}
            $active={activeLabels.has(color)}
            onClick={() => toggleLabel(color)}
            aria-label={`Filter by ${color} label`}
            title={`Filter by label`}
          />
        ))}
        {activeLabels.size > 0 && (
          <ClearBtn onClick={clearLabels} aria-label="Clear label filters">
            clear
          </ClearBtn>
        )}
      </LabelFilters>
    </SearchWrapper>
  );
}
