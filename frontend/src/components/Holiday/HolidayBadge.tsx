import styled from 'styled-components';
import type { Holiday } from '../../types/holiday';
import { theme } from '../../styles/theme';

const Badge = styled.div`
  background: ${theme.colors.holidayBg};
  color: ${theme.colors.holidayText};
  font-size: ${theme.fontSizes.sm};
  padding: 2px 6px;
  border-radius: ${theme.radii.md};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`;

interface HolidayBadgeProps {
  holiday: Holiday;
}

export function HolidayBadge({ holiday }: HolidayBadgeProps) {
  return (
    <Badge title={holiday.name} role="status" aria-label={`Holiday: ${holiday.name}`}>
      {holiday.localName}
    </Badge>
  );
}
