import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';
import { PERIODS } from '../data/companyData';
import { useMetrics } from '../components/MetricsContext';
import { useTooltip } from '../components/GlobalTooltip';
import MeterChart from '../components/MeterChart';
import StackedBarChart from '../components/StackedBarChart';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
`;

const BreadcrumbLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: var(--text-secondary);
  margin: 0 8px;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  /* Add separators between items */
  & > *:not(:last-child)::after {
    content: '/';
    margin-left: 8px;
    color: var(--text-secondary);
  }
`;

const BreadcrumbCurrent = styled.span`
  color: var(--text-secondary);
`;

const MetricDetailContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
`;

const MetricDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MetricDetailTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ShareButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const EditButton = styled(Link)`
  background-color: #635bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: #5147e5;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MoreButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 10;
  overflow: hidden;
`;

const DropdownMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownMenuDivider = styled.div`
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
`;

const MetricDetailValue = styled(motion.div)`
  font-size: 36px;
  font-weight: 700;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const MetricTrend = styled(motion.div)`
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 24px;
  
  &.positive {
    color: var(--success-color);
  }
  
  &.negative {
    color: var(--danger-color);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const ChartContainer = styled.div`
  height: 280px;
  width: 100%;
  margin-bottom: 32px;
`;

const TransactionsSection = styled.div`
  margin-top: 32px;
`;

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 13px;
    }
    
    tr:not(thead tr) {
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f9fafb;
      }
    }
    
    td {
      font-size: 14px;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
`;

const PageInfo = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const PageNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#f7f9fc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ControlsContainer = styled.div`
  margin-bottom: 24px;
`;

const SummaryTableSection = styled.div`
  margin: 32px 0;
`;

const SummaryTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;

const SummaryTable = styled.table`
  font-size: 14px;
  width: 100%;
  border-collapse: collapse;
`;

const SummaryTableCell = styled.td`
  padding: 12px 16px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  transition: all 0.2s ease;
  font-weight: ${props => props.value !== 0 && props.isValue ? '600' : 'normal'};
  
  &:last-child {
    border-right: none;
  }
  
  &.header {
    font-weight: 600;
    position: sticky;
    left: 0;
    z-index: 1;
  }
  
  &.first-column {
    min-width: 180px;
    width: 180px;
  }
  
  &.value-cell {
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background-color: #f2f2f2;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-decoration-color: #777;
      text-decoration-thickness: 2px;
    }
  }
`;

const SummaryTableHeaderCell = styled.th`
  padding: 12px 16px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  
  &:last-child {
    border-right: none;
  }
  
  &.first-column {
    min-width: 180px;
    width: 180px;
    position: sticky;
    left: 0;
    z-index: 1;
  }
`;

const ExportButton = styled.button`
  padding: 8px 12px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChartSectionContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartWrapper = styled.div`
  flex: 3;
  height: 200px; /* Reduced from 280px to 200px */
`;

const AnomalyBreakdownContainer = styled.div`
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  display: ${props => props.hasAnomaly ? 'flex' : 'none'};
  flex-direction: column;
`;

const AnomalyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AnomalyDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
`;

const AnomalyActionLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  
  &:hover {
    text-decoration: underline;
  }
  
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Add new styled components for the interval filtering
const IntervalFilterIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #444;
  margin-bottom: 12px;
`;

const RemoveFilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  
  svg {
    width: 16px;
    height: 16px;
    color: #666;
  }
  
  &:hover svg {
    color: #000;
  }
`;

// Add new styled component for the X axis label with filter indicator
const XAxisFilterLabel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  transform: translateX(-50%);
  z-index: 5;
  
  svg {
    width: 14px;
    height: 14px;
    cursor: pointer;
    color: #666;
  }
  
  &:hover svg {
    color: #000;
  }
`;

// First, let's add a new styled component for the filter chip section
const FilterChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background-color: white;
  border-radius: 14px;
  border: 1px solid #e3e8ee;
  cursor: pointer;
  position: relative;
  font-size: 12px;
  
  &:hover {
    border-color: #d7dfe8;
  }
  
  &:focus-within {
    border-color: #6772e5;
  }
`;

const FilterLabel = styled.span`
  color: #424770;
  font-weight: 600;
  margin-right: 4px;
`;

const FilterValue = styled.span`
  color: #6772e5;
  font-weight: 600;
`;

const FilterIcon = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
`;

const FilterPopover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  padding: 12px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FilterHeader = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #424770;
  margin-bottom: 8px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  
  input {
    margin-right: 8px;
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  background-color: #635bff;
  color: white;
  border: 1px solid #635bff;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #564bd9;
  }
`;

const MetricDetail = () => {
  const { metricId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showTooltip, hideTooltip } = useTooltip();
  const { metrics: standardizedMetrics, getMetricById, getMetricChartData } = useMetrics();
  
  // Get initial metric data - compute once with useMemo to prevent re-renders
  const baseMetric = useMemo(() => {
    // First try to get the metric from location state
    let foundMetric;
    
    if (location.state?.metric) {
      foundMetric = location.state.metric;
    } else {
      // Otherwise get it directly from the metrics context
      foundMetric = getMetricById(metricId) || standardizedMetrics['gross-volume'];
    }
    
    // Return a complete metric object with all necessary properties
    return {
      id: foundMetric.id || 'gross-volume',
      title: foundMetric.title || 'Gross volume',
      baseCurrencyValue: foundMetric.baseCurrencyValue || 192457.32,
      baseNumberValue: foundMetric.baseNumberValue || 0,
      trendValue: foundMetric.trendValue || 5.2,
      trend: foundMetric.trend || 'up',
      isCurrency: foundMetric.isCurrency !== undefined ? foundMetric.isCurrency : true,
      unit: foundMetric.unit || 'currency',
      source: 'dashboard',
      hasAnomaly: foundMetric.hasAnomaly || false
    };
  }, [location.state, metricId, standardizedMetrics, getMetricById]);
  
  // Function to check if metric has anomaly
  const hasAnomaly = useCallback(() => {
    return baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' || baseMetric.hasAnomaly;
  }, [baseMetric]);

  // Function to generate anomaly highlight for charts
  const generateAnomalyHighlight = useCallback((chartData) => {
    if (!hasAnomaly() || !chartData || !chartData.datasets || !chartData.datasets[0] || !chartData.datasets[0].data) {
      return chartData;
    }
    
    // Make a deep copy of the chart data to avoid mutations
    const chartDataCopy = JSON.parse(JSON.stringify(chartData));
    
    // Get the number of data points
    const dataLength = chartDataCopy.datasets[0].data.length;
    
    // Only proceed if there are at least 2 data points
    if (dataLength < 2) return chartDataCopy;
    
    // Create a new dataset for the highlighted area (last two intervals)
    const highlightData = Array(dataLength).fill(null);
    
    // Set the last two points to match the current data
    highlightData[dataLength - 2] = chartDataCopy.datasets[0].data[dataLength - 2];
    highlightData[dataLength - 1] = chartDataCopy.datasets[0].data[dataLength - 1];
    
    // Add the highlight dataset
    chartDataCopy.datasets.push({
      label: 'Anomaly Highlight',
      data: highlightData,
      backgroundColor: 'rgba(99, 91, 255, 0.15)',
      borderColor: 'transparent',
      pointRadius: 0,
      fill: true,
      order: chartDataCopy.datasets.length + 1
    });
    
    return chartDataCopy;
  }, [hasAnomaly]);
  
  // Use refs to avoid re-renders when accessing current values
  const metricRef = useRef(baseMetric);
  
  // Keep the ref updated with the latest baseMetric
  useEffect(() => {
    metricRef.current = baseMetric;
  }, [baseMetric]);
  
  // Fixed pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;
  
  // Consolidated reporting controls state to prevent unnecessary re-renders
  const [reportingControls, setReportingControls] = useState({
    period: 'last7days',
    interval: 'daily',
    comparison: 'previous-period',
    filters: [] // Add filters array to store active filters
  });
  
  // Generate chart data only once with useMemo to prevent recomputation on each render
  const { chartData, metricValuesData } = useMemo(() => {
    try {
      // Get the exact metric values from standardizedMetrics for consistency
      const standardizedMetric = standardizedMetrics[baseMetric.id];
      if (!standardizedMetric) {
        throw new Error(`No standardized metric found for ${baseMetric.id}`);
      }
      
      // For meter charts, calculate the total value from the meter data
      if (standardizedMetric.chartType === 'meter' && standardizedMetric.meterData) {
        const meterTotal = standardizedMetric.meterData.reduce((total, item) => total + item.value, 0);
        
        return {
          chartData: {
            labels: [],
            datasets: []
          },
          metricValuesData: {
            value: meterTotal,
            trendValue: standardizedMetric.trendValue,
            trend: standardizedMetric.trend
          }
        };
      }
      
      // Get data for chart visualization
      // Don't replace hyphens for overage revenue ID to ensure it works correctly
      const metricIdForData = baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' 
        ? 'overagerevenue' 
        : baseMetric.id.replace(/-/g, '');
      
      const metricData = getMetricChartData(metricIdForData, reportingControls.period, reportingControls.interval);
      
      // Apply filters if any exist
      let filteredCurrentData = [...metricData.currentData];
      let filteredPreviousData = [...metricData.previousData];
      
      // Apply Developer plan filter if it exists
      if (reportingControls.filters.includes('developer-plan')) {
        // For demonstration, show only 40% of the original data when filtered to Developer plan
        filteredCurrentData = metricData.currentData.map(value => value * 0.4);
        filteredPreviousData = metricData.previousData.map(value => value * 0.4);
        
        // When filtered, show a more dramatic growth in the last intervals
        if (filteredCurrentData.length >= 2) {
          // Increase the last 2 data points by a larger percentage to show the anomaly is more pronounced in Developer plan
          filteredCurrentData[filteredCurrentData.length - 2] *= 1.3;
          filteredCurrentData[filteredCurrentData.length - 1] *= 1.5;
        }
      }
      
      // Format for chart component
      const chartData = {
        labels: metricData.labels,
        datasets: [
          {
            label: baseMetric.title,
            data: filteredCurrentData,
            borderColor: '#635bff',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: reportingControls.interval === 'monthly' ? 3 : 0,
            borderWidth: 2,
            fill: false
          }
        ]
      };
      
      // Only add comparison data if it's enabled
      if (reportingControls.comparison !== 'no-comparison' && filteredPreviousData.some(val => val !== null)) {
        chartData.datasets.push({
          label: 'Previous period',
          data: filteredPreviousData,
          borderColor: 'rgba(120, 120, 120, 0.6)',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [4, 4]
        });
      }
      
      // Apply anomaly highlighting if needed
      if (hasAnomaly()) {
        return { 
          chartData: generateAnomalyHighlight(chartData), 
          metricValuesData: {
            value: standardizedMetric.isCurrency ? 
                  standardizedMetric.baseCurrencyValue : 
                  standardizedMetric.baseNumberValue,
            trendValue: standardizedMetric.trendValue,
            trend: standardizedMetric.trend
          }
        };
      }
      
      return { 
        chartData, 
        metricValuesData: {
          value: standardizedMetric.isCurrency ? 
                standardizedMetric.baseCurrencyValue : 
                standardizedMetric.baseNumberValue,
          trendValue: standardizedMetric.trendValue,
          trend: standardizedMetric.trend
        }
      };
    } catch (error) {
      console.error("Error generating chart data:", error);
      return { 
        chartData: { labels: [], datasets: [] }, 
        metricValuesData: { value: 0, trendValue: 0, trend: 'up' } 
      };
    }
  }, [baseMetric, reportingControls, hasAnomaly, generateAnomalyHighlight, standardizedMetrics, getMetricChartData]);
  
  // Set the latestValues state once from the memoized data
  const [latestValues, setLatestValues] = useState(metricValuesData);
  
  // Update latestValues whenever metricValuesData changes
  useEffect(() => {
    setLatestValues(metricValuesData);
  }, [metricValuesData]);
  
  // Use a ref to store the chart instance
  const chartInstanceRef = useRef(null);
  
  // Add state to track the currently hovered data point
  const hoveredDataIndexRef = useRef(null);
  
  // Add state for dropdown menu
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);
  
  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format currency values
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);
  
  // Format number values
  const formatNumber = useCallback((value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  }, []);
  
  // Format the displayed metric value with null checking
  const getFormattedValue = useCallback(() => {
    // Check if this is a meter chart and has meter data
    const isMeterChart = baseMetric.chartType === 'meter';
    const meterData = baseMetric.meterData || (location.state?.metric?.meterData);
    
    if (isMeterChart && meterData) {
      // Calculate total from meter data
      const total = meterData.reduce((sum, item) => sum + item.value, 0);
      // Determine if it's a currency value based on the first item's type
      const isCurrency = meterData[0]?.type === 'currency';
      
      if (isCurrency) {
        return formatCurrency(total);
      } else {
        return formatNumber(total);
      }
    }
    
    // Use the latest value if available, otherwise use the base metric value
    const valueToUse = latestValues.value !== null ? latestValues.value : 
                    (baseMetric.isCurrency ? baseMetric.baseCurrencyValue : baseMetric.baseNumberValue);
    
    if (valueToUse === null || valueToUse === undefined) return '-';
    
    if (baseMetric.isCurrency) {
      return formatCurrency(valueToUse);
    } else if (baseMetric.unit === 'percentage') {
      return `${valueToUse.toFixed(2)}%`;
    } else if (baseMetric.unit === 'days') {
      return `${valueToUse} ${valueToUse === 1 ? 'day' : 'days'}`;
    } else {
      return formatNumber(valueToUse);
    }
  }, [baseMetric, latestValues.value, location.state, formatCurrency, formatNumber]);
  
  // Format value based on metric type
  const formatValue = useCallback((value) => {
    if (value === null || value === undefined) return '-';
    
    if (baseMetric.isCurrency) {
      return formatCurrency(value);
    } else if (baseMetric.unit === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else if (baseMetric.unit === 'days') {
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    } else {
      return formatNumber(value);
    }
  }, [baseMetric, formatCurrency, formatNumber]);
  
  // Handle summary table cell hover
  const handleTableCellHover = useCallback((index) => {
    // Store the hovered index in the ref instead of state to avoid rerenders
    hoveredDataIndexRef.current = index;
    
    // Use the chart instance to update visual elements without recreating the chart
    if (chartInstanceRef.current && chartInstanceRef.current.getChart) {
      const chart = chartInstanceRef.current.getChart();
      
      if (chart) {
        // Set all points to have zero radius except the hovered one
        chart.data.datasets.forEach(dataset => {
          // Create point radius array if it doesn't exist
          if (!dataset.pointRadius || !Array.isArray(dataset.pointRadius)) {
            dataset.pointRadius = Array(dataset.data.length).fill(0);
          }
          
          // Reset all points
          dataset.pointRadius.fill(0);
          
          // Set the hovered point to be visible
          if (index < dataset.data.length) {
            dataset.pointRadius[index] = 6;
          }
          
          // Add a border to the points
          dataset.pointBorderWidth = 2;
          dataset.pointBorderColor = 'white';
          dataset.pointBackgroundColor = dataset.borderColor;
        });
        
        // Store the hovered index for the plugin
        chart.hoveredIndex = index;
        
        // Update the x-axis labels to bold the hovered one
        const xAxis = chart.scales.x;
        if (xAxis && xAxis.ticks) {
          const originalFont = xAxis.options.ticks.font || {};
          
          // Store original font if not already stored
          if (!chart._originalTickFont) {
            chart._originalTickFont = { ...originalFont };
          }
          
          // Update all ticks to use original font
          const ticks = xAxis.ticks;
          ticks.forEach((tick, i) => {
            if (i === index) {
              tick.font = { 
                ...chart._originalTickFont,
                weight: 'bold'
              };
            } else {
              tick.font = chart._originalTickFont;
            }
          });
        }
        
        // Update the chart WITHOUT triggering animations or reflows
        try {
          // Use a minimal update that only affects the presentation, not the layout
          chart.draw();
        } catch (e) {
          console.error("Error drawing chart:", e);
        }
      }
    }
  }, []);
  
  // Handle leaving the table cell
  const handleTableCellLeave = useCallback(() => {
    // Clear the hover index
    hoveredDataIndexRef.current = null;
    
    // Hide the tooltip when mouse leaves the chart or table cell
    hideTooltip();
    
    // Use the chart instance to update visual elements without recreating the chart
    if (chartInstanceRef.current && chartInstanceRef.current.getChart) {
      const chart = chartInstanceRef.current.getChart();
      
      if (chart) {
        // Reset all points to their default radius
        chart.data.datasets.forEach(dataset => {
          // Reset all points based on interval setting
          const useMarkers = reportingControls.interval === 'monthly';
          dataset.pointRadius = useMarkers ? 3 : 0;
          
          // Reset point border
          dataset.pointBorderWidth = 1;
        });
        
        // Remove the hovered index for the plugin
        chart.hoveredIndex = null;
        
        // Reset the x-axis labels to their original font
        const xAxis = chart.scales.x;
        if (xAxis && xAxis.ticks && chart._originalTickFont) {
          const ticks = xAxis.ticks;
          ticks.forEach(tick => {
            tick.font = chart._originalTickFont;
          });
        }
        
        // Update the chart WITHOUT triggering animations or reflows
        try {
          // Use a minimal update that only affects the presentation, not the layout
          chart.draw();
        } catch (e) {
          console.error("Error drawing chart:", e);
        }
      }
    }
  }, [reportingControls.interval, hideTooltip]);
  
  // Handle Chart hover - similar to table hover but updates from chart events
  const handleChartHover = useCallback((event) => {
    if (!chartData || !chartData.labels || !chartData.datasets || !chartData.datasets[0]) {
      return;
    }

    const chartRect = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - chartRect.left;
    const yPosition = event.clientY;
    const xRatio = xPosition / chartRect.width;
    const dataIndex = Math.floor(xRatio * chartData.labels.length);
    
    if (dataIndex >= 0 && dataIndex < chartData.labels.length) {
      // Update hover position
      handleTableCellHover(dataIndex);
      
      // Show tooltip for all points
      const currentData = chartData.datasets[0].data;
      if (!currentData || dataIndex >= currentData.length) return;
      
      const currentValue = currentData[dataIndex];
      
      let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong>`;
      tooltipContent += `<div class="current-value">${baseMetric.title}: ${baseMetric.isCurrency ? formatCurrency(currentValue) : formatNumber(currentValue)}</div>`;
      
      // Check if we have a second dataset for comparison
      if (reportingControls.comparison !== 'no-comparison' && 
          chartData.datasets.length > 1 && 
          chartData.datasets[1] && 
          chartData.datasets[1].data && 
          dataIndex < chartData.datasets[1].data.length) {
        const previousValue = chartData.datasets[1].data[dataIndex];
        tooltipContent += `<div class="previous-value">Previous: ${baseMetric.isCurrency ? formatCurrency(previousValue) : formatNumber(previousValue)}</div>`;
      }
      
      showTooltip(event.clientX, yPosition, tooltipContent, baseMetric.id);
      
      // Store x-axis label and position for the plugin
      if (chartInstanceRef.current && chartInstanceRef.current.getChart) {
        const chart = chartInstanceRef.current.getChart();
        if (chart) {
          const xAxis = chart.scales.x;
          if (xAxis && xAxis.ticks && xAxis.ticks[dataIndex]) {
            chart.xAxisLabel = chartData.labels[dataIndex];
            chart.xAxisLabelPosition = {
              x: xPosition,
              y: chartRect.height
            };
          }
        }
      }
    }
  }, [chartData, baseMetric, reportingControls.comparison, formatCurrency, formatNumber, showTooltip, hideTooltip, handleTableCellHover]);
  
  // Handle Chart click event - removing the functionality by providing an empty handler
  const handleChartClick = useCallback((event) => {
    // Functionality removed to avoid page issues
  }, []);
  
  // Generate transactions with useMemo to prevent recreation on each render
  const { transactions, currentTransactions, totalPages, indexOfFirstTransaction, indexOfLastTransaction } = useMemo(() => {
    // Generate transactions data
    const generateTransactions = () => {
      // For overage revenue, use custom transaction data
      if (baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue') {
        // Base transactions to use as templates
        const baseTransactions = [
          {
            customer: 'ApexCloud',
            plan: 'Pro',
            meter: 'Generator',
            includedUnits: '2,000,000',
            unitsUsed: '2,400,000',
            overageUnits: '400,000',
            overageRate: '$0.001 per call',
            amount: '$400.00'
          },
          {
            customer: 'SynthCore',
            plan: 'Starter',
            meter: 'Classifier',
            includedUnits: '500,000',
            unitsUsed: '1,475,000',
            overageUnits: '975,000',
            overageRate: '$0.001 per call',
            amount: '$975.00'
          },
          {
            customer: 'FunnelPilot',
            plan: 'Enterprise',
            meter: 'Scorer',
            includedUnits: '500,000',
            unitsUsed: '1,500,000',
            overageUnits: '1,000,000',
            overageRate: '$0.002 per token',
            amount: '$2,000.00'
          },
          {
            customer: 'DataNexus',
            plan: 'Pro',
            meter: 'Embedder',
            includedUnits: '1,500,000',
            unitsUsed: '1,950,000',
            overageUnits: '450,000',
            overageRate: '$0.0015 per vector',
            amount: '$675.00'
          },
          {
            customer: 'CloudForge',
            plan: 'Enterprise',
            meter: 'Engine',
            includedUnits: '3,000,000',
            unitsUsed: '3,750,000',
            overageUnits: '750,000',
            overageRate: '$0.0018 per call',
            amount: '$1,350.00'
          },
          {
            customer: 'CodeCraft',
            plan: 'Developer',
            meter: 'Generator',
            includedUnits: '250,000',
            unitsUsed: '350,000',
            overageUnits: '100,000',
            overageRate: '$0.0008 per call',
            amount: '$80.00'
          },
          {
            customer: 'Algotec',
            plan: 'Developer',
            meter: 'Classifier',
            includedUnits: '100,000',
            unitsUsed: '275,000',
            overageUnits: '175,000',
            overageRate: '$0.0007 per call',
            amount: '$122.50'
          }
        ];
        
        // Lists of possible values to randomize
        const companies = [
          'ApexCloud', 'SynthCore', 'FunnelPilot', 'DataNexus', 'CloudForge', 'CodeCraft', 'Algotec',
          'TechNova', 'QuantumBit', 'LogicSphere', 'OmegaAI', 'PulseData', 'NeuralCore', 'VectorFlow',
          'AlgoMind', 'DataPulse', 'CortexLabs', 'BrainSpark', 'InfinitiTech', 'DigitalWave', 'ByteStream',
          'CyberMind', 'SiliconForge', 'MaxVector', 'DeltaCore', 'FusionTech', 'VertexAI', 'EchoLogic',
          'SynapseAI', 'NodeBase', 'DataMatrix'
        ];
        
        const meters = ['Generator', 'Classifier', 'Scorer', 'Embedder', 'Engine', 'Transformer', 'Processor'];
        const rates = ['$0.001 per call', '$0.0012 per token', '$0.0008 per vector', '$0.002 per call', '$0.0015 per token'];
        const plans = ['Pro', 'Starter', 'Enterprise', 'Developer'];
        const planDistribution = {
          'Pro': 0.35, // ~35% of records
          'Starter': 0.25, // ~25% of records
          'Enterprise': 0.25, // ~25% of records
          'Developer': 0.15 // ~15% of records (~27 out of 185)
        };
        
        // Generate realistic amount of transactions
        const allTransactions = [];
        const totalTransactions = 185;
        
        for (let i = 0; i < totalTransactions; i++) {
          // Decide plan based on distribution
          const randomValue = Math.random();
          let selectedPlan;
          let cumulativeProbability = 0;
          
          for (const [plan, probability] of Object.entries(planDistribution)) {
            cumulativeProbability += probability;
            if (randomValue <= cumulativeProbability) {
              selectedPlan = plan;
              break;
            }
          }
          
          // Base amounts by plan
          let baseIncludedUnits, baseUsedUnits, baseAmount;
          switch (selectedPlan) {
            case 'Developer':
              baseIncludedUnits = Math.floor(Math.random() * 5 + 1) * 50000; // 50k-250k
              break;
            case 'Starter':
              baseIncludedUnits = Math.floor(Math.random() * 5 + 3) * 200000; // 600k-1.4M
              break;
            case 'Pro':
              baseIncludedUnits = Math.floor(Math.random() * 6 + 5) * 400000; // 2M-4M
              break;
            case 'Enterprise':
              baseIncludedUnits = Math.floor(Math.random() * 10 + 10) * 500000; // 5M-9.5M
              break;
            default:
              baseIncludedUnits = 1000000;
          }

          // Create random overage based on included units (10-40% overage)
          const overagePercentage = Math.random() * 0.3 + 0.1;
          const overageUnits = Math.floor(baseIncludedUnits * overagePercentage);
          const usedUnits = baseIncludedUnits + overageUnits;

          // Format with commas
          const formatNumber = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          };

          // Calculate amount based on a rate
          const rate = rates[Math.floor(Math.random() * rates.length)];
          const rateValue = parseFloat(rate.match(/\$([0-9.]+)/)[1]);
          const amount = Math.round(overageUnits * rateValue * 100) / 100;
          
          allTransactions.push({
            id: `txn_${Math.random().toString(36).substr(2, 9)}`,
            customer: companies[Math.floor(Math.random() * companies.length)],
            plan: selectedPlan,
            meter: meters[Math.floor(Math.random() * meters.length)],
            includedUnits: formatNumber(baseIncludedUnits),
            unitsUsed: formatNumber(usedUnits),
            overageUnits: formatNumber(overageUnits),
            overageRate: rate,
            amount: `$${amount.toFixed(2)}`
          });
        }

        // Sort by amount descending for more realistic data presentation
        return allTransactions.sort((a, b) => {
          const amountA = parseFloat(a.amount.replace('$', '').replace(',', ''));
          const amountB = parseFloat(b.amount.replace('$', '').replace(',', ''));
          return amountB - amountA;
        });
      }
      
      // Default transaction generation for other metrics
      const transactions = [];
      const statuses = ['Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Refunded', 'Failed', 'Pending'];
      const customers = [
        'John Smith', 'Jane Doe', 'Alice Johnson', 'Bob Brown', 'Charlie Davis', 
        'Diana Evans', 'Ethan Fox', 'Fiona Gallagher', 'George Harris', 'Hannah Miller',
        'Ian Jackson', 'Julia Kim', 'Kevin Lee', 'Lisa Martin', 'Mike Nelson',
        'Natalie Owens', 'Oscar Perez', 'Pamela Quinn', 'Robert Rice', 'Sarah Thompson',
        'Tyler Underwood', 'Victoria Wilson', 'William Young', 'Xavier Zhang', 'Yasmine Allen',
        'Zach Baker', 'Amanda Carter', 'Benjamin Davis', 'Catherine Edwards', 'David Franklin'
      ];
      
      const amounts = [19.99, 29.99, 49.99, 99.99, 149.99, 199.99, 299.99, 499.99, 999.99];
      
      for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        transactions.push({
          id: `txn_${Math.random().toString(36).substr(2, 9)}`,
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          amount: `$${amounts[Math.floor(Math.random() * amounts.length)].toFixed(2)}`,
          customer: customers[Math.floor(Math.random() * customers.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });
      }
      
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    };
    
    // Create transactions data
    const transactions = generateTransactions();
    
    // Apply Developer plan filter if active
    let filteredTransactions = transactions;
    if (baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue') {
      if (reportingControls.filters.includes('developer-plan')) {
        filteredTransactions = transactions.filter(txn => txn.plan === 'Developer');
      }
    }
    
    // Calculate pagination values
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    
    return { 
      transactions: filteredTransactions, 
      currentTransactions, 
      totalPages, 
      indexOfFirstTransaction, 
      indexOfLastTransaction 
    };
  }, [currentPage, baseMetric.id, reportingControls.filters]);
  
  // Determine the source page for breadcrumbs
  const sourcePage = useMemo(() => location.state?.sourcePage || 'Home', [location.state]);
  const sourceTab = useMemo(() => location.state?.sourceTab || '', [location.state]);
  
  // Create the correct return path including the tab if it's from Billing
  const sourcePagePath = useMemo(() => {
    if (sourcePage === 'Billing') {
      // Always return to billing/overview, but include the tab as a query parameter
      return `/billing/overview${sourceTab ? `?tab=${sourceTab}` : ''}`;
    }
    return '/';
  }, [sourcePage, sourceTab]);
  
  // Handle pagination
  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);
  
  // Handle reporting control changes
  const handlePeriodChange = useCallback((period) => {
    setReportingControls(prev => ({ ...prev, period }));
  }, []);
  
  const handleIntervalChange = useCallback((interval) => {
    setReportingControls(prev => ({ ...prev, interval }));
  }, []);
  
  const handleComparisonChange = useCallback((comparison) => {
    setReportingControls(prev => ({ ...prev, comparison }));
  }, []);
  
  // Add a custom Chart.js plugin for rendering hover effects only
  const verticalLinePlugin = useMemo(() => ({
    id: 'verticalLine',
    beforeDraw: (chart) => {
      // Check if we have a hovered interval
      if (chart.hoveredIndex !== undefined && chart.hoveredIndex !== null) {
        const index = chart.hoveredIndex;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || index >= meta.data.length) return;
        
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        
        if (!xScale || !yScale) return;
        
        // Get x position for the vertical line
        let xPos;
        if (meta.data[index]) {
          xPos = meta.data[index].x;
        } else {
          // Fallback calculation if data point not available
          const xPixels = xScale.getPixelForValue(index);
          xPos = xPixels;
        }
        
        // Draw the vertical line
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(xPos, yScale.top);
        ctx.lineTo(xPos, yScale.bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.stroke();
        ctx.restore();
      }
    }
  }), []);
  
  // Check if the metric is a meter chart type
  const isMeterChart = location.state?.metric?.chartType === 'meter';
  const meterData = location.state?.metric?.meterData;
  
  // Add state for status filter dropdown
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const statusFilterRef = useRef(null);
  
  // Define all available statuses for payments
  const allPaymentStatuses = [
    'Blocked', 'Canceled', 'Dispute lost', 'Dispute needs response', 
    'Dispute under review', 'Dispute won', 'Early fraud warning',
    'Expired', 'Failed', 'Incomplete', 'Inquiry closed', 
    'Inquiry needs response', 'Inquiry under review', 'Partially captured',
    'Partially paid', 'Partially refunded', 'Pending', 'Refund pending',
    'Refunded', 'Succeeded', 'Uncaptured', 'Waiting on funding'
  ];
  
  // Track pending status changes separately from applied ones
  const [pendingStatuses, setPendingStatuses] = useState([]);
  
  // Initialize selected statuses based on meter data
  useEffect(() => {
    if (isMeterChart && meterData) {
      // Extract statuses from meter data labels
      const meterStatuses = meterData.map(item => item.label);
      setSelectedStatuses(meterStatuses);
      setPendingStatuses(meterStatuses);
    }
  }, [isMeterChart, meterData]);
  
  // Apply pending status changes
  const applyStatusChanges = () => {
    setSelectedStatuses(pendingStatuses);
    setStatusFilterOpen(false);
  };
  
  // Handle checkbox changes
  const handleStatusChange = (status) => {
    if (pendingStatuses.includes(status)) {
      setPendingStatuses(pendingStatuses.filter(s => s !== status));
    } else {
      setPendingStatuses([...pendingStatuses, status]);
    }
  };
  
  // Generate a formatted display string for selected statuses
  const getStatusDisplayString = () => {
    if (selectedStatuses.length === 0) return '';
    if (selectedStatuses.length === 1) return selectedStatuses[0];
    if (selectedStatuses.length === 2) return `${selectedStatuses[0]} and ${selectedStatuses[1]}`;
    
    return `${selectedStatuses[0]}, ${selectedStatuses[1]}, and ${selectedStatuses.length - 2} more`;
  };
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target)) {
        setStatusFilterOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Add function to generate stacked bar chart data
  const generateStackedBarData = useCallback(() => {
    if (!meterData || !meterData.length) return null;

    // Create sample data across time periods to match chart data structure
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, 6);
    
    // Generate datasets with one dataset per category
    const datasets = meterData.map((category, index) => {
      // Generate some realistic looking data that adds up to the category value
      const total = category.value;
      const distributionFactor = 0.2; // Controls variance in distribution
      
      const generateValue = (targetSum) => {
        const values = [];
        let remaining = targetSum;
        
        for (let i = 0; i < labels.length - 1; i++) {
          // Calculate a portion based on position in array (ascending trend)
          const portion = (remaining / (labels.length - i)) * (1 + (Math.random() * distributionFactor - distributionFactor/2));
          const value = Math.max(0, Math.min(remaining, portion));
          values.push(value);
          remaining -= value;
        }
        
        // Add the remainder to the last element
        values.push(Math.max(0, remaining));
        
        return values;
      };
      
      return {
        label: category.label,
        backgroundColor: category.color,
        borderColor: category.color,
        borderWidth: 1,
        data: generateValue(total),
        currency: category.type === 'currency',
      };
    });
    
    return {
      labels,
      datasets
    };
  }, [meterData]);

  // Create data for the stacked bar chart
  const stackedBarData = useMemo(() => {
    return generateStackedBarData();
  }, [generateStackedBarData]);

  // Create the summary table data for meter chart type
  const generateMeterSummaryData = useCallback(() => {
    if (!meterData || !meterData.length || !stackedBarData || !stackedBarData.labels) return null;
    
    // Calculate totals for each column
    const totals = Array(stackedBarData.labels.length).fill(0);
    stackedBarData.datasets.forEach(dataset => {
      dataset.data.forEach((value, index) => {
        totals[index] += value;
      });
    });
    
    return {
      categories: meterData,
      totals,
      labels: stackedBarData.labels
    };
  }, [meterData, stackedBarData]);

  const meterSummaryData = useMemo(() => {
    return generateMeterSummaryData();
  }, [generateMeterSummaryData]);

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MetricDetailContainer>
        <BreadcrumbNav>
          <Breadcrumbs>
            <BreadcrumbLink to={sourcePagePath}>{sourcePage}</BreadcrumbLink>
          </Breadcrumbs>
        </BreadcrumbNav>
        
        <MetricDetailHeader>
          <MetricDetailTitle>{baseMetric.title}</MetricDetailTitle>
          <ActionButtonsContainer>
            <ShareButton>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </ShareButton>
            <EditButton to={`/metrics/${baseMetric.id}/edit`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.2786 2.87868 18.5544 2.93355 18.8118 3.04015C19.0692 3.14676 19.303 3.30301 19.5 3.5C19.697 3.69698 19.8532 3.93084 19.9598 4.18821C20.0665 4.44558 20.1213 4.72142 20.1213 5C20.1213 5.27857 20.0665 5.55442 19.9598 5.81179C19.8532 6.06916 19.697 6.30302 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit metric
            </EditButton>
            <div style={{ position: 'relative' }} ref={moreMenuRef}>
              <MoreButton onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </MoreButton>
              
              {showMoreMenu && (
                <DropdownMenu>
                  <DropdownMenuItem>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.5 14L5 10.5L8.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 10.5H16C18.2091 10.5 20 12.2909 20 14.5V15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save to reports
                  </DropdownMenuItem>
                  <DropdownMenuDivider />
                  <DropdownMenuItem>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Report an issue
                  </DropdownMenuItem>
                </DropdownMenu>
              )}
            </div>
          </ActionButtonsContainer>
        </MetricDetailHeader>
        
        <MetricDetailValue layoutId={`metric-value-${baseMetric.id}`}>
          {getFormattedValue()}
        </MetricDetailValue>
        
        <MetricTrend 
          className={latestValues.trend === 'up' ? 'positive' : latestValues.trend === 'down' ? 'negative' : ''}
          layoutId={`metric-trend-${baseMetric.id}`}
        >
          {latestValues.trendValue?.toFixed(2) || '0.00'}% compared to previous period
        </MetricTrend>
        
        <ControlsContainer>
          <ReportingControls 
            initialPeriod={reportingControls.period}
            initialInterval={reportingControls.interval}
            initialComparison={reportingControls.comparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
            filters={reportingControls.filters}
            onRemoveFilter={(filterToRemove) => {
              setReportingControls(prev => ({
                ...prev,
                filters: prev.filters.filter(filter => filter !== filterToRemove)
              }));
              // Reset to first page when filter is removed
              setCurrentPage(1);
            }}
            // Add custom content to be placed in the controls
            customContent={isMeterChart && meterData && (
              <FilterChip 
                ref={statusFilterRef}
                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              >
                <FilterLabel>Group |</FilterLabel>
                <FilterValue>{getStatusDisplayString()}</FilterValue>
                <FilterIcon>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </FilterIcon>
                
                <FilterPopover isOpen={statusFilterOpen}>
                  <FilterHeader>Filter by Status</FilterHeader>
                  <CheckboxContainer>
                    {allPaymentStatuses.map(status => (
                      <CheckboxItem key={status}>
                        <input 
                          type="checkbox" 
                          checked={pendingStatuses.includes(status)}
                          onChange={() => handleStatusChange(status)}
                        />
                        {status}
                      </CheckboxItem>
                    ))}
                  </CheckboxContainer>
                  <ApplyButton onClick={applyStatusChanges}>Apply</ApplyButton>
                </FilterPopover>
              </FilterChip>
            )}
          />
        </ControlsContainer>
        
        <ChartSectionContainer>
          {isMeterChart ? (
            <div style={{ width: '100%' }}>
              <h3>Breakdown by Category</h3>
              <div style={{ height: '200px', marginTop: '20px' }}>
                <StackedBarChart 
                  data={stackedBarData} 
                  height={200} 
                />
              </div>
            </div>
          ) : (
            <ChartWrapper 
              id="chart-container"
              onMouseMove={handleChartHover}
              onMouseLeave={handleTableCellLeave}
              onClick={handleChartClick} 
            >
              <LineChart 
                ref={chartInstanceRef}
                data={chartData} 
                height={200} /* Adjust this value as well */
                type={location.state?.metric?.chartType || 'line'}
                unit={location.state?.metric?.unit || 'currency'}
                showLegend={false} 
                useMarkers={true}
                customPlugins={[verticalLinePlugin]}
              />
            </ChartWrapper>
          )}
          
          {/* Anomaly Breakdown Section */}
          <AnomalyBreakdownContainer hasAnomaly={hasAnomaly()}>
            <AnomalyTitle>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17L9 11L13 15L21 7" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 7H21V13" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Anomaly breakdown
            </AnomalyTitle>
            
            <AnomalyDescription>
              {baseMetric.title} increased {latestValues.trendValue?.toFixed(1) || '14.8'}% within the past 10 days, primarily driven by a surge in Generator meter usage from Developer-tier customers. A handful of accounts exceeded their included units by over 200%, suggesting unanticipated usage spikes or under-provisioned plans.
            </AnomalyDescription>
            
            {!reportingControls.filters.includes('developer-plan') && (
              <AnomalyActionLink onClick={() => {
                // Add filter for Developer plan
                setReportingControls(prev => ({
                  ...prev,
                  filters: [...prev.filters, 'developer-plan']
                }));
                // Reset to first page when filter is applied
                setCurrentPage(1);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H10V10H3V3Z" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 3H21V10H14V3Z" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14H21V21H14V14Z" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 14H10V21H3V14Z" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Filter for Developer plan
              </AnomalyActionLink>
            )}
            
            <AnomalyActionLink style={{ marginTop: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4H4V20H20V10" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 4L10 14" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 4H20V8" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open in data explorer
            </AnomalyActionLink>
          </AnomalyBreakdownContainer>
        </ChartSectionContainer>
        
        {/* Summary Table - update for meter chart type */}
        <SummaryTableSection>
          <TransactionsHeader>
            <SectionTitle>Summary</SectionTitle>
            <ExportButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </ExportButton>
          </TransactionsHeader>
          
          {isMeterChart && meterSummaryData ? (
            <SummaryTableContainer>
              <SummaryTable>
                <thead>
                  <tr>
                    <SummaryTableHeaderCell className="first-column">Category</SummaryTableHeaderCell>
                    {meterSummaryData.labels.map((label, index) => (
                      <SummaryTableHeaderCell key={index}>
                        {label}
                      </SummaryTableHeaderCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Render a row for each category */}
                  {meterSummaryData.categories.map((category, categoryIndex) => (
                    <tr key={categoryIndex}>
                      <SummaryTableCell className="header first-column">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              backgroundColor: category.color, 
                              borderRadius: '3px',
                              marginRight: '8px'
                            }} 
                          />
                          {category.label}
                        </div>
                      </SummaryTableCell>
                      {stackedBarData.datasets[categoryIndex].data.map((value, valueIndex) => (
                        <SummaryTableCell 
                          key={valueIndex} 
                          className="value-cell"
                          isValue={true}
                          value={value}
                        >
                          {category.type === 'currency' ? 
                            formatCurrency(value) : 
                            formatNumber(value)
                          }
                        </SummaryTableCell>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Total row */}
                  <tr style={{ fontWeight: 'bold' }}>
                    <SummaryTableCell className="header first-column">Total</SummaryTableCell>
                    {meterSummaryData.totals.map((total, index) => (
                      <SummaryTableCell 
                        key={index} 
                        className="value-cell"
                        isValue={true}
                        value={total}
                        style={{ fontWeight: 'bold' }}
                      >
                        {meterData[0].type === 'currency' ? 
                          formatCurrency(total) : 
                          formatNumber(total)
                        }
                      </SummaryTableCell>
                    ))}
                  </tr>
                  
                  {/* Previous period row - optional based on comparison setting */}
                  {reportingControls.comparison !== 'no-comparison' && (
                    <tr>
                      <SummaryTableCell className="header first-column">Previous period</SummaryTableCell>
                      {meterSummaryData.totals.map((total, index) => {
                        // Generate previous period data (80% of current for demo)
                        const prevValue = total * 0.8;
                        return (
                          <SummaryTableCell 
                            key={index} 
                            className="value-cell"
                            isValue={true}
                            value={prevValue}
                          >
                            {meterData[0].type === 'currency' ? 
                              formatCurrency(prevValue) : 
                              formatNumber(prevValue)
                            }
                          </SummaryTableCell>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </SummaryTable>
            </SummaryTableContainer>
          ) : (
            chartData && chartData.labels && chartData.datasets && chartData.datasets[0] && (
              <SummaryTableContainer>
                <SummaryTable>
                  <thead>
                    <tr>
                      <SummaryTableHeaderCell className="first-column">Period</SummaryTableHeaderCell>
                      {chartData.labels.map((label, index) => (
                        <SummaryTableHeaderCell 
                          key={index}
                          onMouseEnter={() => handleTableCellHover(index)}
                          onMouseLeave={handleTableCellLeave}
                        >
                          {label}
                        </SummaryTableHeaderCell>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <SummaryTableCell className="header first-column">{baseMetric.title}</SummaryTableCell>
                      {chartData.datasets[0].data.map((value, index) => (
                        <SummaryTableCell 
                          key={index} 
                          className="value-cell"
                          isValue={true}
                          value={value}
                          onMouseEnter={() => handleTableCellHover(index)}
                          onMouseLeave={handleTableCellLeave}
                          style={{ 
                            cursor: 'default'
                          }}
                        >
                          {formatValue(value)}
                        </SummaryTableCell>
                      ))}
                    </tr>
                    
                    {reportingControls.comparison !== 'no-comparison' && chartData.datasets.length > 1 && (
                      <tr>
                        <SummaryTableCell className="header first-column">Previous period</SummaryTableCell>
                        {chartData.datasets[1].data.map((value, index) => (
                          <SummaryTableCell 
                            key={index} 
                            className="value-cell"
                            isValue={true}
                            value={value}
                            onMouseEnter={() => handleTableCellHover(index)}
                            onMouseLeave={handleTableCellLeave}
                            style={{ 
                              cursor: 'default'
                            }}
                          >
                            {formatValue(value)}
                          </SummaryTableCell>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </SummaryTable>
              </SummaryTableContainer>
            )
          )}
        </SummaryTableSection>
        
        <TransactionsSection>
          <TransactionsHeader>
            <SectionTitle>
              {transactions.length} results
            </SectionTitle>
            <ExportButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </ExportButton>
          </TransactionsHeader>
          
          <TableContainer>
            <table>
              <thead>
                <tr>
                  {baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' ? (
                    <>
                      <th>Date</th>
                      <th>Customer name</th>
                      <th>Plan</th>
                      <th>Meter</th>
                      <th>Included units</th>
                      <th>Units used</th>
                      <th>Overage units</th>
                      <th>Overage rate</th>
                      <th>Overage revenue</th>
                    </>
                  ) : (
                    <>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    onClick={() => navigate(`/users/${transaction.customer.replace(/\s+/g, '-').toLowerCase()}`)}
                  >
                    {baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' ? (
                      <>
                        <td>{transaction.date || 'N/A'}</td>
                        <td>{transaction.customer}</td>
                        <td>{transaction.plan}</td>
                        <td>{transaction.meter}</td>
                        <td>{transaction.includedUnits}</td>
                        <td>{transaction.unitsUsed}</td>
                        <td>{transaction.overageUnits}</td>
                        <td>{transaction.overageRate}</td>
                        <td>{transaction.amount}</td>
                      </>
                    ) : (
                      <>
                        <td>{transaction.date}</td>
                        <td>{transaction.amount}</td>
                        <td>{transaction.customer}</td>
                        <td>
                          <span style={{ 
                            color: transaction.status === 'Succeeded' ? 'var(--success-color)' : 
                                   transaction.status === 'Failed' ? 'var(--danger-color)' :
                                   transaction.status === 'Refunded' ? 'var(--warning-color)' : 
                                   'var(--text-secondary)'
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
          
          <Pagination>
            <PageInfo>
              Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
            </PageInfo>
            <PageNav>
              <PageButton 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNumber;
                
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <PageButton
                      key={pageNumber}
                      active={currentPage === pageNumber}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </PageButton>
                  );
                }
                return null;
              })}
              
              <PageButton 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </PageNav>
          </Pagination>
        </TransactionsSection>
      </MetricDetailContainer>
    </Container>
  );
};

export default MetricDetail; 