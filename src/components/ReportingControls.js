import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ControlsWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const ChipLabel = styled.span`
  color: #424770;
  font-weight: 600;
  font-size: 12px;
  margin-right: 8px;
`;

const ChipValue = styled.span`
  color: #6772e5;
  font-weight: 600;
  font-size: 12px;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background-color: white;
  border-radius: 14px;
  border: 1px solid #e3e8ee;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #d7dfe8;
  }

  &:focus-within {
    border-color: #6772e5;
  }

  ${props => props.isFilterChip && `
    border: 1px dashed #e3e8ee;
    background-color: transparent;
  `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 8px 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const PopoverItem = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  &.active {
    background-color: #f7f9fc;
    color: #6772e5;
    font-weight: 600;
  }
`;

// Period options
const periodOptions = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'last_12_months', label: 'Last 12 months' },
  { value: 'year_to_date', label: 'Year to date' },
  { value: 'all_time', label: 'All time' },
];

// Interval options
const intervalOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// Comparison options
const comparisonOptions = [
  { value: 'none', label: 'No comparison' },
  { value: 'previous_period', label: 'Previous period' },
  { value: 'previous_year', label: 'Previous year' },
  { value: 'custom', label: 'Custom period' },
];

const ReportingControls = ({ 
  initialPeriod = 'last_3_months',
  initialInterval = 'daily', 
  initialComparison = 'previous_period',
  onPeriodChange, 
  onIntervalChange,
  onComparisonChange
}) => {
  // Find initial option objects
  const initialPeriodOption = periodOptions.find(option => option.value === initialPeriod) || periodOptions[0];
  const initialIntervalOption = intervalOptions.find(option => option.value === initialInterval) || intervalOptions[0];
  const initialComparisonOption = comparisonOptions.find(option => option.value === initialComparison) || comparisonOptions[0];

  // State for selected options
  const [period, setPeriod] = useState(initialPeriodOption);
  const [interval, setInterval] = useState(initialIntervalOption);
  const [comparison, setComparison] = useState(initialComparisonOption);
  
  // State for popover visibility
  const [periodPopoverOpen, setPeriodPopoverOpen] = useState(false);
  const [intervalPopoverOpen, setIntervalPopoverOpen] = useState(false);
  const [comparisonPopoverOpen, setComparisonPopoverOpen] = useState(false);
  
  // Refs for detecting clicks outside popovers
  const periodRef = useRef(null);
  const intervalRef = useRef(null);
  const comparisonRef = useRef(null);
  
  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodRef.current && !periodRef.current.contains(event.target)) {
        setPeriodPopoverOpen(false);
      }
      if (intervalRef.current && !intervalRef.current.contains(event.target)) {
        setIntervalPopoverOpen(false);
      }
      if (comparisonRef.current && !comparisonRef.current.contains(event.target)) {
        setComparisonPopoverOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle period change
  const handlePeriodChange = (option) => {
    setPeriod(option);
    setPeriodPopoverOpen(false);
    if (onPeriodChange) onPeriodChange(option.value);
  };
  
  // Handle interval change
  const handleIntervalChange = (option) => {
    setInterval(option);
    setIntervalPopoverOpen(false);
    if (onIntervalChange) onIntervalChange(option.value);
  };
  
  // Handle comparison change
  const handleComparisonChange = (option) => {
    setComparison(option);
    setComparisonPopoverOpen(false);
    if (onComparisonChange) onComparisonChange(option.value);
  };
  
  return (
    <ControlsWrapper>
      {/* Period Chip */}
      <Chip ref={periodRef} onClick={() => setPeriodPopoverOpen(!periodPopoverOpen)}>
        <ChipLabel>Period</ChipLabel>
        <ChipValue>{period.label}</ChipValue>
        <IconWrapper>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconWrapper>
        <Popover isOpen={periodPopoverOpen}>
          {periodOptions.map((option) => (
            <PopoverItem
              key={option.value}
              className={period.value === option.value ? 'active' : ''}
              onClick={() => handlePeriodChange(option)}
            >
              {option.label}
            </PopoverItem>
          ))}
        </Popover>
      </Chip>
      
      {/* Interval Chip */}
      <Chip ref={intervalRef} onClick={() => setIntervalPopoverOpen(!intervalPopoverOpen)}>
        <ChipValue>{interval.label}</ChipValue>
        <IconWrapper>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconWrapper>
        <Popover isOpen={intervalPopoverOpen}>
          {intervalOptions.map((option) => (
            <PopoverItem
              key={option.value}
              className={interval.value === option.value ? 'active' : ''}
              onClick={() => handleIntervalChange(option)}
            >
              {option.label}
            </PopoverItem>
          ))}
        </Popover>
      </Chip>
      
      {/* Compare Chip */}
      <Chip ref={comparisonRef} onClick={() => setComparisonPopoverOpen(!comparisonPopoverOpen)}>
        <ChipLabel>Compare</ChipLabel>
        <ChipValue>{comparison.label}</ChipValue>
        <IconWrapper>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconWrapper>
        <Popover isOpen={comparisonPopoverOpen}>
          {comparisonOptions.map((option) => (
            <PopoverItem
              key={option.value}
              className={comparison.value === option.value ? 'active' : ''}
              onClick={() => handleComparisonChange(option)}
            >
              {option.label}
            </PopoverItem>
          ))}
        </Popover>
      </Chip>
      
      {/* Filter Chip */}
      <Chip isFilterChip={true}>
        <IconWrapper style={{ marginRight: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#6772e5" strokeWidth="2" />
            <path d="M12 8V16M8 12H16" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconWrapper>
        <ChipValue>Filter</ChipValue>
      </Chip>
    </ControlsWrapper>
  );
};

export default ReportingControls; 