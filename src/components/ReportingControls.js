import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PERIODS } from '../data/companyData';

const ControlsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
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
  
  ${props => props.isActiveFilter && `
    background-color: #f0f0ff;
    border: 1px solid rgba(99, 91, 255, 0.2);
  `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
`;

const RemoveIconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
  cursor: pointer;
  
  &:hover {
    color: var(--danger-color);
  }
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
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'last90days', label: 'Last 3 months' },
  { value: 'thisYear', label: 'Year to date' },
  { value: 'custom', label: 'Custom' }
];

// Interval options
const intervalOptions = [
  { value: PERIODS.DAILY, label: 'Daily' },
  { value: PERIODS.WEEKLY, label: 'Weekly' },
  { value: PERIODS.MONTHLY, label: 'Monthly' }
];

// Comparison options
const comparisonOptions = [
  { value: 'previous-period', label: 'Previous period' },
  { value: 'previous-year', label: 'Previous year' },
  { value: 'no-comparison', label: 'No comparison' }
];

const ReportingControls = ({ 
  initialPeriod = 'last7days', 
  initialInterval = 'daily', 
  initialComparison = 'previous-period',
  onPeriodChange, 
  onIntervalChange, 
  onComparisonChange,
  filters = [],
  onRemoveFilter,
  customContent,
  // Chart-related props
  chartType = null,
  onChartTypeChange = null,
  onChartAxisChange = null,
  chartSettings = null,
  availableColumns = [],
  onRemoveChart = null
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
  const [chartPopoverOpen, setChartPopoverOpen] = useState(false);
  
  // State for pending chart settings (for cancel/apply functionality)
  const [pendingChartSettings, setPendingChartSettings] = useState(() => ({
    type: chartSettings?.type || null,
    xAxis: chartSettings?.xAxis || null,
    yAxis: chartSettings?.yAxis || null
  }));
  
  // Keep pending settings in sync with actual chart settings
  useEffect(() => {
    if (chartSettings) {
      setPendingChartSettings({
        type: chartSettings.type,
        xAxis: chartSettings.xAxis,
        yAxis: chartSettings.yAxis
      });
    }
  }, [chartSettings]);
  
  // Refs for detecting clicks outside popovers
  const periodRef = useRef(null);
  const intervalRef = useRef(null);
  const comparisonRef = useRef(null);
  const chartRef = useRef(null);
  
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
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        setChartPopoverOpen(false);
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
  
  // Handle pending chart settings changes
  const handlePendingChartTypeChange = (newType) => {
    setPendingChartSettings(prev => ({
      ...prev,
      type: newType
    }));
  };
  
  const handlePendingAxisChange = (axisType, column) => {
    setPendingChartSettings(prev => ({
      ...prev,
      [axisType === 'x' ? 'xAxis' : 'yAxis']: column
    }));
  };
  
  // Apply chart settings
  const applyChartSettings = () => {
    if (onChartTypeChange && pendingChartSettings.type !== chartSettings?.type) {
      onChartTypeChange(pendingChartSettings.type);
    }
    if (onChartAxisChange && pendingChartSettings.xAxis !== chartSettings?.xAxis) {
      onChartAxisChange('x', pendingChartSettings.xAxis);
    }
    if (onChartAxisChange && pendingChartSettings.yAxis !== chartSettings?.yAxis) {
      onChartAxisChange('y', pendingChartSettings.yAxis);
    }
    setChartPopoverOpen(false);
  };
  
  // Cancel chart settings
  const cancelChartSettings = () => {
    setPendingChartSettings({
      type: chartSettings?.type || null,
      xAxis: chartSettings?.xAxis || null,
      yAxis: chartSettings?.yAxis || null
    });
    setChartPopoverOpen(false);
  };
  
  // Convert filter IDs to readable names
  const getFilterDisplayName = (filterId) => {
    switch (filterId) {
      case 'developer-plan':
        return 'Developer';
      default:
        return filterId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  // Get label for active filter
  const getFilterLabel = (filterId) => {
    switch (filterId) {
      case 'developer-plan':
        return 'Plan';
      default:
        return filterId.split('-')[0].charAt(0).toUpperCase() + filterId.split('-')[0].slice(1);
    }
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
      
      {/* Active Filter Chips */}
      {filters.map(filter => (
        <Chip key={filter} isActiveFilter={true}>
          <ChipLabel>{getFilterLabel(filter)}</ChipLabel>
          <ChipValue>{getFilterDisplayName(filter)}</ChipValue>
          <RemoveIconWrapper onClick={() => onRemoveFilter(filter)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </RemoveIconWrapper>
        </Chip>
      ))}
      
      {/* Chart Settings Chip - Show when chart exists */}
      {chartType && (
        <Chip ref={chartRef} onClick={() => setChartPopoverOpen(!chartPopoverOpen)}>
          <ChipLabel>Show</ChipLabel>
          <ChipValue>{chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart</ChipValue>
          <IconWrapper>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconWrapper>
          <Popover isOpen={chartPopoverOpen} style={{ minWidth: '280px', padding: '16px' }}>
            <div style={{ marginBottom: '0' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#424770', 
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                Chart settings
                {onRemoveChart && (
                  <button
                    onClick={() => {
                      onRemoveChart();
                      setChartPopoverOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#424770',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '0',
                      textDecoration: 'underline'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Remove chart
                  </button>
                )}
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#424770', marginBottom: '4px' }}>
                  Chart Type
                </div>
                <select 
                  value={pendingChartSettings?.type || ''} 
                  onChange={(e) => handlePendingChartTypeChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e3e8ee',
                    borderRadius: '4px',
                    background: 'white',
                    fontSize: '12px',
                    color: '#424770'
                  }}
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#424770', marginBottom: '4px' }}>
                  X-Axis
                </div>
                <select 
                  value={pendingChartSettings?.xAxis?.id || ''} 
                  onChange={(e) => handlePendingAxisChange('x', availableColumns.find(col => col.id === e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e3e8ee',
                    borderRadius: '4px',
                    background: 'white',
                    fontSize: '12px',
                    color: '#424770'
                  }}
                >
                  {availableColumns.map(column => (
                    <option key={column.id} value={column.id}>{column.label}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#424770', marginBottom: '4px' }}>
                  Y-Axis
                </div>
                <select 
                  value={pendingChartSettings?.yAxis?.id || ''} 
                  onChange={(e) => handlePendingAxisChange('y', availableColumns.find(col => col.id === e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e3e8ee',
                    borderRadius: '4px',
                    background: 'white',
                    fontSize: '12px',
                    color: '#424770'
                  }}
                >
                  {availableColumns.filter(col => col.dataType === 'number' || col.isCurrency || col.isTrend || col.isPercentage).map(column => (
                    <option key={column.id} value={column.id}>{column.label}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '6px', 
                marginTop: '12px'
              }}>
                <button
                  onClick={cancelChartSettings}
                  style={{
                    flex: '1',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #e3e8ee',
                    background: 'white',
                    color: '#424770'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f7f9fc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={applyChartSettings}
                  style={{
                    flex: '1',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid #6772e5',
                    background: '#6772e5',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a51e5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6772e5'}
                >
                  Apply
                </button>
              </div>
            </div>
          </Popover>
        </Chip>
      )}
      
      {/* Add Filter Chip */}
      <Chip isFilterChip={true}>
        <IconWrapper style={{ marginRight: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#6772e5" strokeWidth="2" />
            <path d="M12 8V16M8 12H16" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconWrapper>
        <ChipValue>Filter</ChipValue>
      </Chip>
      
      {/* Custom Content - Render after Add Filter chip */}
      {customContent}
    </ControlsWrapper>
  );
};

export default ReportingControls; 