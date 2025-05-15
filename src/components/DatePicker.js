import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const DatePickerContainer = styled.div`
  margin-bottom: 24px;
`;

const DatePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateRangeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

const CompareToggle = styled.div`
  display: flex;
  align-items: center;
`;

const CompareLabel = styled.span`
  font-size: 14px;
  margin-right: 8px;
  color: var(--text-secondary);
`;

const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  
  &::before {
    content: '';
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e3e8ee;
    transition: 0.4s;
    border-radius: 20px;
  }
  
  &::after {
    content: '';
    position: absolute;
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + &::before {
    background-color: var(--primary-color);
  }
  
  input:checked + &::after {
    transform: translateX(20px);
  }
`;

const PeriodSelectorWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const PeriodButton = styled.button`
  background: ${props => props.active ? '#f5f5ff' : 'white'};
  border: 1px solid ${props => props.active ? '#635bff' : '#e3e8ee'};
  color: ${props => props.active ? '#635bff' : '#697386'};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.active ? '#635bff' : '#c1c9d2'};
  }
`;

const DatePopup = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  overflow: hidden;
  max-width: 720px;
`;

const DateSidebar = styled.div`
  padding: 16px;
  background-color: #f8f9fb;
  width: 200px;
  border-right: 1px solid var(--border-color);
`;

const SidebarTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-secondary);
`;

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PresetButton = styled.button`
  text-align: left;
  background: ${props => props.active ? '#f5f5ff' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#635bff' : '#1a1f36'};
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5ff;
  }
`;

const CalendarContainer = styled.div`
  flex: 1;
  padding: 16px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MonthTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  
  &:hover {
    background-color: #f5f5ff;
    color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: default;
    &:hover {
      background-color: transparent;
      color: var(--text-secondary);
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  padding: 8px 0;
`;

const DayCell = styled.button`
  height: 32px;
  background: ${props => 
    props.isSelected ? '#635bff' : 
    props.isInRange ? '#f5f5ff' : 
    'transparent'};
  color: ${props => 
    props.isSelected ? 'white' : 
    props.isInRange ? '#635bff' : 
    props.isCurrentMonth ? '#1a1f36' : 
    '#a3acb9'};
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.3 : 1};
  
  &:hover {
    background-color: ${props => 
      props.isSelected ? '#635bff' : 
      !props.disabled ? '#f5f5ff' : 
      'transparent'};
  }
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid var(--border-color);
`;

const FooterButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: #574ae2;
    }
  }
  
  &.secondary {
    background-color: white;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: #f7f9fc;
    }
  }
`;

// A simple date formatting function
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Date manipulation helper functions
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const getMonthDays = (year, month) => {
  // Create a grid of days for the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Create an array for all days in the grid
  const days = [];
  
  // Add days from previous month to fill the first week
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevMonthYear, prevMonth, prevMonthLastDay - i),
      currentMonth: false
    });
  }
  
  // Add days for current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      currentMonth: true
    });
  }
  
  // Add days from next month to fill the last week
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, i),
        currentMonth: false
      });
    }
  }
  
  return days;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DatePicker = ({ activePeriod, onChange, startDate, endDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [compare, setCompare] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(startDate || null);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate || null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [activePreset, setActivePreset] = useState(activePeriod || 'last7days');
  
  const popupRef = useRef(null);
  
  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate calendar data
  const month1 = {
    date: currentDate,
    days: getMonthDays(currentDate.getFullYear(), currentDate.getMonth())
  };
  
  const month2 = {
    date: addMonths(currentDate, 1),
    days: getMonthDays(
      addMonths(currentDate, 1).getFullYear(),
      addMonths(currentDate, 1).getMonth()
    )
  };
  
  // Handle date range selection
  const handleDateClick = (date) => {
    // If we haven't selected a start date or we have both dates and are starting a new selection
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(date);
      setTempEndDate(null);
    } 
    // If we have a start date but no end date
    else if (tempStartDate && !tempEndDate) {
      // Ensure end date is after start date
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
    }
  };
  
  // Handle date hover for range preview
  const handleDateHover = (date) => {
    if (tempStartDate && !tempEndDate) {
      setHoveredDate(date);
    }
  };
  
  // Apply the selected date range
  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      setSelectedStartDate(tempStartDate);
      setSelectedEndDate(tempEndDate);
      onChange('custom', { startDate: tempStartDate, endDate: tempEndDate });
      setIsOpen(false);
    }
  };
  
  // Clear selected dates
  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setHoveredDate(null);
  };
  
  // Handle preset selection
  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    
    const now = new Date();
    let start, end;
    
    switch(preset) {
      case 'today':
        start = new Date(now);
        end = new Date(now);
        break;
      case 'yesterday':
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case 'last7days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        break;
      case 'last30days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 29);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3months':
        end = new Date(now);
        start = new Date(now);
        start.setMonth(start.getMonth() - 3);
        break;
      case 'last12months':
        end = new Date(now);
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start = selectedStartDate || now;
        end = selectedEndDate || now;
    }
    
    setTempStartDate(start);
    setTempEndDate(end);
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    
    if (preset !== 'custom') {
      onChange(preset, { startDate: start, endDate: end });
      setIsOpen(false);
    }
  };
  
  // Format date range for display
  const formatDateRange = () => {
    if (activePreset === 'today') return 'Today';
    if (activePreset === 'yesterday') return 'Yesterday';
    if (activePreset === 'last7days') return 'Last 7 days';
    if (activePreset === 'last30days') return 'Last 30 days';
    if (activePreset === 'thisMonth') return 'This month';
    if (activePreset === 'lastMonth') return 'Last month';
    if (activePreset === 'last3months') return 'Last 3 months';
    if (activePreset === 'last12months') return 'Last 12 months';
    
    if (selectedStartDate && selectedEndDate) {
      return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
    }
    
    return 'Select a date range';
  };
  
  // Check if a date is within the selected range
  const isInRange = (date) => {
    if (!tempStartDate) return false;
    
    if (tempStartDate && !tempEndDate && hoveredDate) {
      return (date >= tempStartDate && date <= hoveredDate) || 
             (date <= tempStartDate && date >= hoveredDate);
    }
    
    if (tempStartDate && tempEndDate) {
      return date >= tempStartDate && date <= tempEndDate;
    }
    
    return false;
  };
  
  // Check if a date is one of the selected dates
  const isSelected = (date) => {
    if (!tempStartDate) return false;
    
    const isSameDay = (d1, d2) => {
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear();
    };
    
    return isSameDay(date, tempStartDate) || 
           (tempEndDate && isSameDay(date, tempEndDate));
  };
  
  // Navigate between months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  return (
    <DatePickerContainer>
      <DatePickerHeader>
        <DateDisplay>
          <DateRangeButton onClick={() => setIsOpen(!isOpen)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {formatDateRange()}
          </DateRangeButton>
        </DateDisplay>
        
        <CompareToggle>
          <CompareLabel>Compare to</CompareLabel>
          <ToggleInput 
            type="checkbox" 
            id="compare-toggle" 
            checked={compare} 
            onChange={() => setCompare(!compare)} 
          />
          <ToggleLabel htmlFor="compare-toggle" />
        </CompareToggle>
      </DatePickerHeader>
      
      <PeriodSelectorWrapper>
        <PeriodButton 
          active={activePreset === 'last7days'} 
          onClick={() => handlePresetSelect('last7days')}
        >
          Last 7 days
        </PeriodButton>
        <PeriodButton 
          active={activePreset === 'last30days'} 
          onClick={() => handlePresetSelect('last30days')}
        >
          Last 30 days
        </PeriodButton>
        <PeriodButton 
          active={activePreset === 'last3months'} 
          onClick={() => handlePresetSelect('last3months')}
        >
          Last 3 months
        </PeriodButton>
        <PeriodButton 
          active={activePreset === 'last12months'} 
          onClick={() => handlePresetSelect('last12months')}
        >
          Last 12 months
        </PeriodButton>
        <PeriodButton 
          active={activePreset === 'custom'} 
          onClick={() => {
            setActivePreset('custom');
            setIsOpen(true);
          }}
        >
          Custom
        </PeriodButton>
      </PeriodSelectorWrapper>
      
      {isOpen && (
        <div style={{ position: 'relative' }} ref={popupRef}>
          <DatePopup isOpen={isOpen}>
            <DateSidebar>
              <SidebarTitle>Date presets</SidebarTitle>
              <PresetList>
                <PresetButton 
                  active={activePreset === 'today'}
                  onClick={() => handlePresetSelect('today')}
                >
                  Today
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'yesterday'}
                  onClick={() => handlePresetSelect('yesterday')}
                >
                  Yesterday
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'last7days'}
                  onClick={() => handlePresetSelect('last7days')}
                >
                  Last 7 days
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'last30days'}
                  onClick={() => handlePresetSelect('last30days')}
                >
                  Last 30 days
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'thisMonth'}
                  onClick={() => handlePresetSelect('thisMonth')}
                >
                  This month
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'lastMonth'}
                  onClick={() => handlePresetSelect('lastMonth')}
                >
                  Last month
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'last3months'}
                  onClick={() => handlePresetSelect('last3months')}
                >
                  Last 3 months
                </PresetButton>
                <PresetButton 
                  active={activePreset === 'last12months'}
                  onClick={() => handlePresetSelect('last12months')}
                >
                  Last 12 months
                </PresetButton>
              </PresetList>
            </DateSidebar>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex' }}>
                <CalendarContainer>
                  <CalendarHeader>
                    <MonthSelector>
                      <NavButton onClick={() => navigateMonth(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </NavButton>
                      <MonthTitle>
                        {month1.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </MonthTitle>
                    </MonthSelector>
                  </CalendarHeader>
                  
                  <CalendarGrid>
                    {WEEKDAYS.map(day => (
                      <WeekdayHeader key={day}>{day}</WeekdayHeader>
                    ))}
                    
                    {month1.days.map((day, index) => (
                      <DayCell 
                        key={index}
                        isCurrentMonth={day.currentMonth}
                        isSelected={isSelected(day.date)}
                        isInRange={isInRange(day.date)}
                        onClick={() => handleDateClick(day.date)}
                        onMouseEnter={() => handleDateHover(day.date)}
                      >
                        {day.date.getDate()}
                      </DayCell>
                    ))}
                  </CalendarGrid>
                </CalendarContainer>
                
                <CalendarContainer>
                  <CalendarHeader>
                    <MonthSelector>
                      <MonthTitle>
                        {month2.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </MonthTitle>
                      <NavButton onClick={() => navigateMonth(1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </NavButton>
                    </MonthSelector>
                  </CalendarHeader>
                  
                  <CalendarGrid>
                    {WEEKDAYS.map(day => (
                      <WeekdayHeader key={day}>{day}</WeekdayHeader>
                    ))}
                    
                    {month2.days.map((day, index) => (
                      <DayCell 
                        key={index}
                        isCurrentMonth={day.currentMonth}
                        isSelected={isSelected(day.date)}
                        isInRange={isInRange(day.date)}
                        onClick={() => handleDateClick(day.date)}
                        onMouseEnter={() => handleDateHover(day.date)}
                      >
                        {day.date.getDate()}
                      </DayCell>
                    ))}
                  </CalendarGrid>
                </CalendarContainer>
              </div>
              
              <PopupFooter>
                <FooterButton className="secondary" onClick={handleClear}>
                  Clear
                </FooterButton>
                <FooterButton className="primary" onClick={handleApply}>
                  Apply
                </FooterButton>
              </PopupFooter>
            </div>
          </DatePopup>
        </div>
      )}
    </DatePickerContainer>
  );
};

export default DatePicker; 