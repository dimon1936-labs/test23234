import { useCallback, useState, useRef, useEffect } from 'react';
import { addDays } from 'date-fns';
import styled from 'styled-components';
import { useNavigation } from '../../context/NavigationContext';
import { formatMonthYear, formatWeekRange } from '../../utils/dateHelpers';
import { COUNTRIES } from '../../config/countries';
import { theme } from '../../styles/theme';
import { ExportButton } from './ExportButton';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 8px;
  gap: 8px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
    justify-content: center;
  }
`;

const NavBtn = styled.button`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${theme.colors.textSecondary};
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text};
  }
  &:active {
    background: ${theme.colors.border};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 44px;
    height: 44px;
    font-size: 18px;
    border-radius: ${theme.radii.lg};
  }
`;

const TitleBtn = styled.button`
  font-size: ${theme.fontSizes.xl};
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0 4px;
  min-width: 180px;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${theme.radii.md};
  padding: 4px 12px;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 16px;
    min-width: 140px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
    justify-content: center;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.sm};
  overflow: hidden;
`;

const ViewBtn = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.$active ? theme.colors.text : theme.colors.surface)};
  color: ${(p) => (p.$active ? theme.colors.surface : theme.colors.text)};
  transition: all 0.15s;

  &:hover {
    background: ${(p) => (p.$active ? theme.colors.text : theme.colors.surfaceHover)};
  }

  & + & {
    border-left: 1px solid ${theme.colors.borderLight};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 10px 20px;
    font-size: ${theme.fontSizes.lg};
  }
`;

const Btn = styled.button`
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: 8px 16px;
  cursor: pointer;
  font-size: ${theme.fontSizes.base};
  font-weight: 600;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 10px 20px;
    font-size: ${theme.fontSizes.lg};
    border-radius: ${theme.radii.lg};
  }
`;

const CountrySelect = styled.select`
  padding: 8px 10px;
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 10px 12px;
    font-size: ${theme.fontSizes.lg};
    border-radius: ${theme.radii.lg};
  }
`;

/* --- Month/Year Picker Dropdown --- */

const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99;
`;

const PickerDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.lg};
  z-index: 100;
  padding: 12px;
  min-width: 280px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    min-width: 260px;
  }
`;

const PickerYearRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const PickerYearLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const PickerYearBtn = styled.button`
  background: none;
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.sm};
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const MonthCell = styled.button<{ $active: boolean; $isCurrent: boolean }>`
  padding: 8px 4px;
  border: none;
  border-radius: ${theme.radii.md};
  cursor: pointer;
  font-size: ${theme.fontSizes.base};
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  background: ${(p) =>
    p.$active ? theme.colors.primary : 'transparent'};
  color: ${(p) =>
    p.$active
      ? '#fff'
      : p.$isCurrent
        ? theme.colors.primary
        : theme.colors.text};
  transition: background 0.15s;

  &:hover {
    background: ${(p) => (p.$active ? theme.colors.primaryHover : theme.colors.surfaceHover)};
  }
`;

const TitleWrapper = styled.div`
  position: relative;
`;

export function CalendarHeader() {
  const { state, actions } = useNavigation();
  const { currentMonth, currentYear, countryCode, viewMode, currentWeekStart } = state;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);
  const pickerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Sync picker year when calendar year changes externally
  useEffect(() => {
    setPickerYear(currentYear);
  }, [currentYear]);

  const goPrev = useCallback(() => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        actions.setMonthYear(11, currentYear - 1);
      } else {
        actions.setMonthYear(currentMonth - 1, currentYear);
      }
    } else {
      actions.setWeekStart(addDays(currentWeekStart, -7));
    }
  }, [viewMode, currentMonth, currentYear, currentWeekStart, actions]);

  const goNext = useCallback(() => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        actions.setMonthYear(0, currentYear + 1);
      } else {
        actions.setMonthYear(currentMonth + 1, currentYear);
      }
    } else {
      actions.setWeekStart(addDays(currentWeekStart, 7));
    }
  }, [viewMode, currentMonth, currentYear, currentWeekStart, actions]);

  const handleMonthSelect = useCallback(
    (month: number) => {
      actions.setMonthYear(month, pickerYear);
      setPickerOpen(false);
    },
    [actions, pickerYear],
  );

  const togglePicker = useCallback(() => {
    setPickerOpen((prev) => {
      if (!prev) setPickerYear(currentYear);
      return !prev;
    });
  }, [currentYear]);

  const titleText =
    viewMode === 'month'
      ? formatMonthYear(currentYear, currentMonth)
      : formatWeekRange(currentWeekStart);

  const isMonthView = viewMode === 'month';

  return (
    <HeaderWrapper>
      <NavSection>
        <NavBtn onClick={goPrev} aria-label={`Previous ${viewMode}`}>&#9664;</NavBtn>
        <TitleWrapper ref={pickerRef}>
          <TitleBtn
            onClick={isMonthView ? togglePicker : undefined}
            aria-live="polite"
            aria-haspopup={isMonthView ? 'true' : undefined}
            aria-expanded={isMonthView ? pickerOpen : undefined}
            style={isMonthView ? undefined : { cursor: 'default' }}
          >
            {titleText}
          </TitleBtn>

          {pickerOpen && isMonthView && (
            <>
              <PickerOverlay onClick={() => setPickerOpen(false)} />
              <PickerDropdown role="dialog" aria-label="Select month and year">
                <PickerYearRow>
                  <PickerYearBtn onClick={() => setPickerYear((y) => y - 1)} aria-label="Previous year">
                    &#9664;
                  </PickerYearBtn>
                  <PickerYearLabel>{pickerYear}</PickerYearLabel>
                  <PickerYearBtn onClick={() => setPickerYear((y) => y + 1)} aria-label="Next year">
                    &#9654;
                  </PickerYearBtn>
                </PickerYearRow>
                <MonthGrid>
                  {MONTHS.map((name, i) => (
                    <MonthCell
                      key={name}
                      $active={i === currentMonth && pickerYear === currentYear}
                      $isCurrent={i === todayMonth && pickerYear === todayYear}
                      onClick={() => handleMonthSelect(i)}
                    >
                      {name.slice(0, 3)}
                    </MonthCell>
                  ))}
                </MonthGrid>
              </PickerDropdown>
            </>
          )}
        </TitleWrapper>
        <NavBtn onClick={goNext} aria-label={`Next ${viewMode}`}>&#9654;</NavBtn>
      </NavSection>

      <RightSection>
        <Btn onClick={actions.goToToday} aria-label="Go to today">Today</Btn>
        <ExportButton
          targetSelector="[data-export-target='calendar']"
          fileName={`calendar-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`}
        />
        <ViewToggle>
          <ViewBtn $active={viewMode === 'week'} onClick={() => actions.setViewMode('week')}>
            Week
          </ViewBtn>
          <ViewBtn $active={viewMode === 'month'} onClick={() => actions.setViewMode('month')}>
            Month
          </ViewBtn>
        </ViewToggle>
        <CountrySelect
          value={countryCode}
          onChange={(e) => actions.setCountry(e.target.value)}
          aria-label="Select country for holidays"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </CountrySelect>
      </RightSection>
    </HeaderWrapper>
  );
}
