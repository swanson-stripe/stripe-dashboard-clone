import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';

// Constants for consistent styling
const STRIPE_PURPLE = '#635bff';
const STRIPE_PURPLE_LIGHT = 'rgba(99, 91, 255, 0.1)';
const GRAY = '#9ca3af';
const GRAY_LIGHT = 'rgba(156, 163, 175, 0.1)';
const TREND_POSITIVE = '#217005';
const TREND_NEGATIVE = '#B13600';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const TodaySection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const TodayChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const RightChartColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  justify-content: space-between;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: none;
  height: ${props => props.height || 'auto'};
  overflow: hidden;
`;

const SmallCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: none;
  flex: 1;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
`;

const TitleWithDropdown = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  
  svg {
    margin-left: 6px;
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const MetricDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 180px;
  overflow: hidden;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &.active {
    background-color: ${STRIPE_PURPLE_LIGHT};
    color: ${STRIPE_PURPLE};
    font-weight: 500;
  }
`;

const ViewLink = styled(Link)`
  font-size: 14px;
  color: ${STRIPE_PURPLE};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MetricTime = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: ${props => props.height || '200px'};
  position: relative;
`;

const OverviewSection = styled.div`
  margin-bottom: 40px;
`;

const OverviewHeader = styled.div`
  margin-bottom: 24px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.active ? STRIPE_PURPLE : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? STRIPE_PURPLE : 'var(--border-color)'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? STRIPE_PURPLE : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const ControlLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonGroup = styled.div`
  display: flex;
  
  button {
    border-radius: 0;
    
    &:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }
    
    &:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
    
    &:not(:last-child) {
      border-right: none;
    }
  }
`;

const ComparisonSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: white;
  font-size: 14px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    
    .explore-action {
      opacity: 1;
    }
  }
`;

const ExploreAction = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  color: ${STRIPE_PURPLE};
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
`;

const MetricValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const MetricChartContainer = styled.div`
  flex-grow: 1;
  min-height: 80px;
  margin-top: auto;
  margin-bottom: 8px;
  position: relative;
`;

const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.trend === 'up' ? TREND_POSITIVE : TREND_NEGATIVE};
  white-space: nowrap;
  font-weight: 500;
  
  svg {
    margin-right: 4px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  background-color: white;
  color: #333;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  transform: translate(-50%, -100%);
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  
  &.visible {
    opacity: 1;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: white transparent transparent transparent;
  }
  
  strong {
    color: ${STRIPE_PURPLE};
    font-weight: 600;
  }
  
  .current-value {
    color: ${TREND_POSITIVE};
    font-weight: 500;
  }
  
  .previous-value {
    color: ${GRAY};
  }
`;

const NegativeValue = styled.div`
  color: #EF4444;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    endDate: new Date() 
  });
  const [activePeriod, setActivePeriod] = useState('last7days');
  const [comparison, setComparison] = useState('previous-period');
  const [interval, setInterval] = useState('daily');
  const [metricData, setMetricData] = useState([]);
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    metricId: ''
  });
  const [todayData, setTodayData] = useState({
    volume: '$0.00',
    volumeChart: {
      labels: [],
      datasets: [{
        label: 'Gross volume',
        data: [],
        borderColor: STRIPE_PURPLE,
        backgroundColor: STRIPE_PURPLE_LIGHT,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }]
    }
  });
  
  // Add state for dropdown control
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('gross-volume');
  const dropdownRef = useRef(null);
  
  // Available metrics for dropdown
  const availableMetrics = [
    { id: 'gross-volume', label: 'Gross volume' },
    { id: 'new-customers', label: 'New customers' },
    { id: 'successful-payments', label: 'Successful payments' },
    { id: 'net-volume', label: 'Net volume' }
  ];
  
  // Handle dropdown item click
  const handleMetricChange = (metricId) => {
    setSelectedMetric(metricId);
    setIsDropdownOpen(false);
    
    // Find the base metric data
    const metric = baseMetrics.find(m => m.id === metricId);
    if (!metric) return;
    
    // Generate new data for the selected metric
    const newVolumeData = generateTodayVolumeDataForMetric(metricId);
    
    setTodayData({
      volume: metric.isCurrency ? formatCurrency(metric.baseCurrencyValue) : formatNumber(metric.baseNumberValue),
      volumeChart: newVolumeData
    });
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Generate volume data based on metric type
  const generateTodayVolumeDataForMetric = (metricId) => {
    const labels = Array(24).fill('').map((_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const ampm = i < 12 ? 'AM' : 'PM';
      return `${hour}:00 ${ampm}`;
    });
    
    const now = new Date();
    const currentHour = now.getHours();
    const data = Array(24).fill(0);
    
    // Generate some data for hours that have "passed" today
    for (let i = 0; i <= currentHour; i++) {
      // Different factors for different metrics
      let hourFactor;
      
      if (metricId === 'gross-volume' || metricId === 'net-volume') {
        hourFactor = (i >= 9 && i <= 17) ? 0.8 : 0.3;
        data[i] = Math.round(Math.random() * 2000 * hourFactor);
      } else if (metricId === 'new-customers') {
        hourFactor = (i >= 9 && i <= 17) ? 0.7 : 0.2;
        data[i] = Math.round(Math.random() * 10 * hourFactor);
      } else if (metricId === 'successful-payments') {
        hourFactor = (i >= 9 && i <= 17) ? 0.75 : 0.25;
        data[i] = Math.round(Math.random() * 40 * hourFactor);
      } else {
        hourFactor = (i >= 9 && i <= 17) ? 0.8 : 0.3;
        data[i] = Math.round(Math.random() * 2000 * hourFactor);
      }
    }
    
    // Get metric title
    const metricLabel = availableMetrics.find(m => m.id === metricId)?.label || 'Metric';
    
    return {
      labels,
      datasets: [{
        label: metricLabel,
        data: data,
        borderColor: STRIPE_PURPLE,
        backgroundColor: STRIPE_PURPLE_LIGHT,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      }]
    };
  };

  // Generate realistic volume data for Today section - independent from overview controls
  const generateTodayVolumeData = () => {
    return generateTodayVolumeDataForMetric('gross-volume');
  };
  
  // Calculate the current day's volume for the Today section
  const calculateTodayVolume = (volumeData) => {
    if (!volumeData || !volumeData.datasets || !volumeData.datasets[0] || !volumeData.datasets[0].data) {
      return '$0.00';
    }
    const total = volumeData.datasets[0].data.reduce((sum, val) => sum + val, 0);
    return formatCurrency(total);
  };

  // Initialize today data - only called once
  useEffect(() => {
    try {
      const volumeData = generateTodayVolumeData();
      if (volumeData && volumeData.datasets && volumeData.datasets[0]) {
        setTodayData({
          volume: calculateTodayVolume(volumeData),
          volumeChart: volumeData
        });
      }
    } catch (error) {
      console.error("Error initializing today's data:", error);
    }
  }, []);
  
  // For the overview metrics, generate data based on selected time period and interval
  const generateMetricChartData = (metric, period, interval, includePrevious = true) => {
    let dataPoints = [];
    let previousDataPoints = [];
    let labels = [];
    let pointCount = 0;
    
    // Set up data points based on period and interval
    switch (period) {
      case 'last7days':
        pointCount = interval === 'daily' ? 7 : 1;
        break;
      case 'last30days':
        pointCount = interval === 'daily' ? 30 : interval === 'weekly' ? 4 : 1;
        break;
      case 'last90days':
        pointCount = interval === 'daily' ? 90 : interval === 'weekly' ? 13 : 3;
        break;
      case 'thisYear':
        pointCount = interval === 'daily' ? 365 : interval === 'weekly' ? 52 : 12;
        break;
      default:
        pointCount = 7;
    }
    
    // Generate labels based on interval
    if (interval === 'daily') {
      labels = Array(pointCount).fill('').map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (pointCount - 1) + i);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    } else if (interval === 'weekly') {
      labels = Array(pointCount).fill('').map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (pointCount * 7) + (i * 7));
        return `Week ${i + 1}`;
      });
    } else {
      labels = Array(pointCount).fill('').map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (pointCount - 1) + i);
        return date.toLocaleDateString('en-US', { month: 'short' });
      });
    }
    
    // Different data patterns for different metrics
    switch (metric.id) {
      case 'payments':
        dataPoints = generateRealisticTrend(pointCount, 30000, 40000, 0.05, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 26000, 35000, 0.05, metric.trend === 'up');
        break;
      case 'gross-volume':
        dataPoints = generateRealisticTrend(pointCount, 20000, 30000, 0.08, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 18000, 26000, 0.08, metric.trend === 'up');
        break;
      case 'net-volume':
        dataPoints = generateRealisticTrend(pointCount, 15000, 25000, 0.06, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 13000, 22000, 0.06, metric.trend === 'up');
        break;
      case 'successful-payments':
        dataPoints = generateRealisticTrend(pointCount, 400, 500, 0.1, metric.trend === 'up', false);
        previousDataPoints = generateRealisticTrend(pointCount, 360, 450, 0.1, metric.trend === 'up', false);
        break;
      case 'failed-payments':
        dataPoints = generateRealisticTrend(pointCount, 20, 35, 0.15, metric.trend === 'up', false);
        previousDataPoints = generateRealisticTrend(pointCount, 22, 40, 0.15, metric.trend === 'up', false);
        break;
      case 'new-customers':
        dataPoints = generateRealisticTrend(pointCount, 120, 180, 0.2, metric.trend === 'up', false);
        previousDataPoints = generateRealisticTrend(pointCount, 100, 160, 0.2, metric.trend === 'up', false);
        break;
      case 'active-subscribers':
        dataPoints = generateRealisticTrend(pointCount, 1000, 1400, 0.03, metric.trend === 'up', false);
        previousDataPoints = generateRealisticTrend(pointCount, 900, 1200, 0.03, metric.trend === 'up', false);
        break;
      case 'arpu':
        dataPoints = generateRealisticTrend(pointCount, 80, 95, 0.04, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 75, 90, 0.04, metric.trend === 'up');
        break;
      case 'mrr':
        dataPoints = generateRealisticTrend(pointCount, 50000, 60000, 0.07, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 46000, 55000, 0.07, metric.trend === 'up');
        break;
      default:
        dataPoints = generateRealisticTrend(pointCount, 100, 200, 0.1, metric.trend === 'up');
        previousDataPoints = generateRealisticTrend(pointCount, 90, 180, 0.1, metric.trend === 'up');
    }
    
    const datasets = [{
      data: dataPoints,
      borderColor: STRIPE_PURPLE,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 1.5
    }];
    
    // Add comparison dataset if needed
    if (includePrevious && comparison !== 'no-comparison') {
      datasets.push({
        data: previousDataPoints,
        borderColor: GRAY,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4]
      });
    }
    
    return {
      labels,
      datasets,
      currentData: dataPoints,
      previousData: previousDataPoints
    };
  };
  
  // Helper to generate realistic trending data
  const generateRealisticTrend = (count, min, max, volatility, isUptrend, isCurrency = true) => {
    const data = [];
    let value = min + Math.random() * (max - min) * 0.5;
    
    for (let i = 0; i < count; i++) {
      // Add some volatility
      const change = (Math.random() - 0.5) * volatility * value;
      // Add trend direction
      const trend = isUptrend ? 
        value * (volatility / 2) * (1 + (i / count)) : 
        -value * (volatility / 2) * (1 + (i / count));
      
      value = Math.max(min * 0.8, value + change + trend);
      
      // Round appropriately based on type
      if (isCurrency) {
        data.push(parseFloat(value.toFixed(2)));
      } else {
        data.push(Math.round(value));
      }
    }
    
    return data;
  };

  // Format currency with appropriate separation
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format numbers with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  // Base metrics data
  const baseMetrics = [
    {
      id: 'payments',
      title: 'Payments',
      baseCurrencyValue: 32543.60,
      baseNumberValue: 456,
      trend: 'up',
      trendValue: 12.5,
      isCurrency: true,
    },
    {
      id: 'gross-volume',
      title: 'Gross volume',
      baseCurrencyValue: 25650.45,
      baseNumberValue: 0,
      trend: 'up',
      trendValue: 8.2,
      isCurrency: true,
    },
    {
      id: 'net-volume',
      title: 'Net volume from sales',
      baseCurrencyValue: 20650.45,
      baseNumberValue: 0,
      trend: 'up',
      trendValue: 4.7,
      isCurrency: true,
    },
    {
      id: 'successful-payments',
      title: 'Successful payments',
      baseCurrencyValue: 0,
      baseNumberValue: 456,
      trend: 'up',
      trendValue: 6.3,
      isCurrency: false,
    },
    {
      id: 'failed-payments',
      title: 'Failed payments',
      baseCurrencyValue: 0,
      baseNumberValue: 24,
      trend: 'down',
      trendValue: 2.1,
      isCurrency: false,
    },
    {
      id: 'new-customers',
      title: 'New customers',
      baseCurrencyValue: 0,
      baseNumberValue: 156,
      trend: 'up',
      trendValue: 9.4,
      isCurrency: false,
    },
    {
      id: 'active-subscribers',
      title: 'Active subscribers',
      baseCurrencyValue: 0,
      baseNumberValue: 1245,
      trend: 'up',
      trendValue: 3.7,
      isCurrency: false,
    },
    {
      id: 'arpu',
      title: 'Average revenue per user',
      baseCurrencyValue: 86.32,
      baseNumberValue: 0,
      trend: 'up',
      trendValue: 5.2,
      isCurrency: true,
    },
    {
      id: 'mrr',
      title: 'MRR',
      baseCurrencyValue: 54876,
      baseNumberValue: 0,
      trend: 'up',
      trendValue: 7.8,
      isCurrency: true,
    },
  ];
  
  // Handle date range changes
  const handleDateChange = (period) => {
    setActivePeriod(period);
    
    // Set appropriate date range based on selected period
    const now = new Date();
    let start = new Date();
    
    switch(period) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    setDateRange({ startDate: start, endDate: now });
  };
  
  // Handle metric card click
  const handleMetricClick = (metricId) => {
    // Find the current metric data to pass to the detail page
    const currentMetric = metricData.find(metric => metric.id === metricId);
    navigate(`/metrics/${metricId}`, { 
      state: currentMetric 
    });
  };

  // Handle tooltip display
  const showTooltip = (event, metricId, chartData) => {
    const chartRect = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - chartRect.left;
    const xRatio = xPosition / chartRect.width;
    const dataIndex = Math.floor(xRatio * chartData.labels.length);
    
    if (dataIndex >= 0 && dataIndex < chartData.labels.length) {
      const metric = metricData.find(m => m.id === metricId);
      const currentValue = chartData.currentData[dataIndex];
      const previousValue = chartData.previousData[dataIndex];
      
      let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong><br/>`;
      tooltipContent += `<span class="current-value">Current: ${metric.isCurrency ? formatCurrency(currentValue) : formatNumber(currentValue)}</span><br/>`;
      
      if (comparison !== 'no-comparison') {
        tooltipContent += `<span class="previous-value">Previous: ${metric.isCurrency ? formatCurrency(previousValue) : formatNumber(previousValue)}</span>`;
      }
      
      setTooltipState({
        visible: true,
        x: xPosition,
        y: 0,
        content: tooltipContent,
        metricId
      });
    }
  };

  const hideTooltip = () => {
    setTooltipState({
      ...tooltipState,
      visible: false
    });
  };

  // Update metrics data when period or interval changes
  useEffect(() => {
    try {
      // Adjust multipliers based on period
      let periodMultiplier = 1;
      switch(activePeriod) {
        case 'last30days':
          periodMultiplier = 4.2;
          break;
        case 'last90days':
          periodMultiplier = 12.5;
          break;
        case 'thisYear':
          periodMultiplier = 48;
          break;
        default:
          periodMultiplier = 1;
      }
      
      // Generate updated metrics with chart data
      const updatedMetrics = baseMetrics.map(metric => {
        const valueMultiplier = periodMultiplier * (
          (interval === 'weekly') ? 1.1 : 
          (interval === 'monthly') ? 1.2 : 1
        );
        
        // Calculate adjusted values based on period and interval
        const adjustedValue = metric.isCurrency
          ? metric.baseCurrencyValue * valueMultiplier
          : Math.round(metric.baseNumberValue * valueMultiplier);
        
        // Format the display value
        const displayValue = metric.isCurrency
          ? formatCurrency(adjustedValue)
          : formatNumber(adjustedValue);
        
        // Adjust trend value based on comparison
        let trendVal = metric.trendValue;
        if (comparison === 'previous-year') {
          trendVal = trendVal * 1.5;
        } else if (comparison === 'no-comparison') {
          trendVal = 0;
        }
        
        const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
        
        return {
          ...metric,
          value: displayValue,
          numericalValue: adjustedValue,
          trendValue: parseFloat(trendVal.toFixed(1)),
          chartData: chartData
        };
      });
      
      setMetricData(updatedMetrics);
    } catch (error) {
      console.error("Error updating metrics data:", error);
    }
  }, [activePeriod, interval, comparison, navigate]);

  return (
    <DashboardContainer>
      <TodaySection>
        <SectionTitle>Today</SectionTitle>
        <TodayChartsGrid>
          <ChartCard height="260px">
            <ChartHeader>
              <div>
                <TitleWithDropdown 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  isOpen={isDropdownOpen}
                  ref={dropdownRef}
                >
                  <ChartTitle>
                    {availableMetrics.find(m => m.id === selectedMetric)?.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ChartTitle>
                  
                  <MetricDropdown isOpen={isDropdownOpen}>
                    {availableMetrics.map(metric => (
                      <DropdownItem 
                        key={metric.id}
                        className={selectedMetric === metric.id ? 'active' : ''}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMetricChange(metric.id);
                        }}
                      >
                        {metric.label}
                      </DropdownItem>
                    ))}
                  </MetricDropdown>
                </TitleWithDropdown>
                <MetricValue>{todayData.volume}</MetricValue>
                <MetricTime>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</MetricTime>
              </div>
              <ViewLink to={`/metrics/${selectedMetric}`}>View</ViewLink>
            </ChartHeader>
            <ChartWrapper height="180px">
              {todayData.volumeChart && (
                <LineChart 
                  data={todayData.volumeChart} 
                  height={180} 
                  showLegend={false} 
                  type="area" 
                />
              )}
            </ChartWrapper>
          </ChartCard>
          
          <RightChartColumn>
            <SmallCard>
              <ChartHeader>
                <div>
                  <ChartTitle>USD balance</ChartTitle>
                  <NegativeValue>
                    <MetricValue>-$71,431.76</MetricValue>
                  </NegativeValue>
                  <MetricTime>Your Stripe balance is negative. <Link to="/balances" style={{ color: STRIPE_PURPLE }}>Add funds</Link></MetricTime>
                </div>
                <ViewLink to="/balances">View</ViewLink>
              </ChartHeader>
            </SmallCard>
            
            <SmallCard>
              <ChartHeader>
                <div>
                  <ChartTitle>Debits</ChartTitle>
                  <MetricValue>$41.60</MetricValue>
                  <MetricTime>Debited Nov 24, 2024</MetricTime>
                </div>
                <ViewLink to="/transactions">View</ViewLink>
              </ChartHeader>
            </SmallCard>
          </RightChartColumn>
        </TodayChartsGrid>
      </TodaySection>
      
      <OverviewSection>
        <OverviewHeader>
          <SectionTitle>Your overview</SectionTitle>
          
          <ControlsRow>
            <ControlGroup>
              <ControlLabel>Date range</ControlLabel>
              <ButtonGroup>
                <ControlButton 
                  active={activePeriod === 'last7days'} 
                  onClick={() => handleDateChange('last7days')}
                >
                  Last 7 days
                </ControlButton>
                <ControlButton 
                  active={activePeriod === 'last30days'} 
                  onClick={() => handleDateChange('last30days')}
                >
                  Last 30 days
                </ControlButton>
                <ControlButton 
                  active={activePeriod === 'last90days'} 
                  onClick={() => handleDateChange('last90days')}
                >
                  Last 90 days
                </ControlButton>
                <ControlButton 
                  active={activePeriod === 'thisYear'} 
                  onClick={() => handleDateChange('thisYear')}
                >
                  This year
                </ControlButton>
              </ButtonGroup>
            </ControlGroup>
            
            <ControlGroup>
              <ControlLabel>Interval</ControlLabel>
              <ButtonGroup>
                <ControlButton 
                  active={interval === 'daily'} 
                  onClick={() => setInterval('daily')}
                >
                  Daily
                </ControlButton>
                <ControlButton 
                  active={interval === 'weekly'} 
                  onClick={() => setInterval('weekly')}
                >
                  Weekly
                </ControlButton>
                <ControlButton 
                  active={interval === 'monthly'} 
                  onClick={() => setInterval('monthly')}
                >
                  Monthly
                </ControlButton>
              </ButtonGroup>
            </ControlGroup>
            
            <ControlGroup>
              <ControlLabel>Comparison</ControlLabel>
              <ComparisonSelect 
                value={comparison}
                onChange={(e) => setComparison(e.target.value)}
              >
                <option value="previous-period">vs. previous period</option>
                <option value="previous-year">vs. previous year</option>
                <option value="no-comparison">No comparison</option>
              </ComparisonSelect>
            </ControlGroup>
          </ControlsRow>
        </OverviewHeader>
        
        <MetricsGrid>
          {metricData.map(metric => (
            <MetricCard 
              key={metric.id}
              onClick={() => handleMetricClick(metric.id)}
            >
              <ExploreAction className="explore-action">
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ExploreAction>
              
              <MetricHeader>
                <MetricTitle>{metric.title}</MetricTitle>
                <MetricValueRow>
                  <MetricValue>{metric.value}</MetricValue>
                  {metric.trendValue > 0 && (
                    <MetricTrend trend={metric.trend}>
                      {metric.trend === 'up' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {metric.trend === 'up' ? '+' : '-'}{metric.trendValue}%
                    </MetricTrend>
                  )}
                </MetricValueRow>
              </MetricHeader>
              
              <MetricChartContainer 
                onMouseMove={(e) => showTooltip(e, metric.id, metric.chartData)}
                onMouseLeave={hideTooltip}
              >
                <LineChart 
                  data={metric.chartData} 
                  height={80} 
                  showLegend={false} 
                  type="line" 
                />
                {tooltipState.visible && tooltipState.metricId === metric.id && (
                  <Tooltip 
                    className={tooltipState.visible ? 'visible' : ''}
                    style={{ 
                      left: `${tooltipState.x}px`,
                      top: `${tooltipState.y}px` 
                    }}
                    dangerouslySetInnerHTML={{ __html: tooltipState.content }}
                  />
                )}
              </MetricChartContainer>
            </MetricCard>
          ))}
        </MetricsGrid>
      </OverviewSection>
    </DashboardContainer>
  );
};

export default Dashboard; 