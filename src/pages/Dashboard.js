import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';
import { PERIODS, metricCategories, defaultMetricIds } from '../data/companyData';
import { useMetrics } from '../components/MetricsContext';
import { useTooltip } from '../components/GlobalTooltip';
import MeterChart from '../components/MeterChart';

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
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
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
  overflow: visible;
  display: flex;
  flex-direction: column;
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
  margin-top: ${props => props.marginTop || '0'};
  margin-bottom: ${props => props.marginBottom || '0'};
  padding: ${props => props.padding || '0'};
  overflow: visible;
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
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const MetricChartContainer = styled.div`
  flex-grow: 1;
  min-height: 160px;
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
  margin-left: 8px;
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

const AddMetricsButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-left: auto;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
`;

const MetricsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const MetricsModal = styled.div`
  background-color: white;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 180px);
`;

const MetricCategorySection = styled.div`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-color);
`;

const MetricsList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const SelectableMetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  border: 1px solid ${props => props.selected ? STRIPE_PURPLE : 'var(--border-color)'};
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
`;

const MetricPreview = styled.div`
  margin-top: 8px;
  height: 40px;
  position: relative;
  overflow: hidden;
`;

const ToggleIconOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.selected ? STRIPE_PURPLE : 'white'};
  border: 1px solid ${props => props.selected ? STRIPE_PURPLE : 'var(--border-color)'};
  color: ${props => props.selected ? 'white' : GRAY};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const MetricName = styled.div`
  font-size: 14px;
  font-weight: ${props => props.selected ? '500' : 'normal'};
  color: var(--text-color);
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const ApplyButton = styled.button`
  background-color: ${STRIPE_PURPLE};
  color: white;
  border: 1px solid ${STRIPE_PURPLE};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #564bd9;
  }
`;

const PreviewChart = styled.div`
  margin-top: 12px;
  height: 40px;
  position: relative;
  overflow: hidden;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Add this styled component for the Explore link to match other metrics
const ExploreLink = styled.div`
  display: flex;
  align-items: center;
  color: ${STRIPE_PURPLE};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  svg {
    margin-left: 4px;
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { metrics: standardizedMetrics, getMetricById, getMetricChartData } = useMetrics();
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    endDate: new Date() 
  });
  const [activePeriod, setActivePeriod] = useState('last_3_months');
  const [activeInterval, setActiveInterval] = useState('daily');
  const [activeComparison, setActiveComparison] = useState('previous_period');
  const [metricData, setMetricData] = useState([]);
  const { showTooltip, hideTooltip } = useTooltip();
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
  
  // Base metrics data with their types
  const [baseMetrics, setBaseMetrics] = useState(() => {
    // Use the imported defaultMetricIds from companyData.js
    return defaultMetricIds
      .map(id => standardizedMetrics[id])
      .filter(Boolean);
  });
  
  // Inside the Dashboard component, add these state variables
  const [isMetricsOverlayOpen, setIsMetricsOverlayOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({});
  
  // Add these functions to handle the overlay
  const toggleMetricSelection = (metricId) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  const handleApplyMetrics = () => {
    const selectedMetricsList = Object.entries(selectedMetrics)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => Object.values(standardizedMetrics).find(m => m.id === id))
      .filter(Boolean);
    
    setBaseMetrics(selectedMetricsList);
    setIsMetricsOverlayOpen(false);
  };

  // Initialize today data - only called once
  useEffect(() => {
    try {
      // Use the exact value from standardizedMetrics
      const grossVolumeMetric = standardizedMetrics['gross-volume'];
      
      // Generate hourly breakdown for visualization only
      const volumeData = generateTodayVolumeDataForMetric('gross-volume');
      
      setTodayData({
        // Use the EXACT value from standardizedMetrics for display
        volume: formatCurrency(grossVolumeMetric.baseCurrencyValue),
        volumeChart: volumeData
      });
    } catch (error) {
      console.error("Error initializing today's data:", error);
    }
  }, []);
  
  // Modify the generateTodayVolumeDataForMetric function to format hour labels to 12-hour format
  const generateTodayVolumeDataForMetric = (metricId) => {
    // Find the metric based on the ID
    const selectedMetric = baseMetrics.find(m => m.id === metricId) || baseMetrics[0];
    
    // Use exact value from standardizedMetrics
    const baseValue = selectedMetric.isCurrency ? 
      selectedMetric.baseCurrencyValue : 
      selectedMetric.baseNumberValue;
    
    // Create hourly distribution based on typical business patterns
    const hourlyDistribution = [
      0.02, 0.01, 0.01, 0.01, 0.02, 0.03, // 12am-6am: very low activity
      0.05, 0.06, 0.07, 0.08, 0.08, 0.09, // 6am-12pm: increasing activity
      0.09, 0.08, 0.07, 0.06, 0.06, 0.05, // 12pm-6pm: peak then decreasing
      0.04, 0.03, 0.03, 0.02, 0.02, 0.02  // 6pm-12am: low evening activity
    ];
    
    const hourlyData = hourlyDistribution.map((ratio, hour) => {
      const dateTime = new Date();
      dateTime.setHours(hour, 0, 0, 0);
      
      // Format hour in 12-hour format (12am, 1am, etc.)
      const formattedHour = hour === 0 ? '12am' : 
                             hour === 12 ? '12pm' : 
                             hour < 12 ? `${hour}am` : 
                             `${hour-12}pm`;
      
      // For hours beyond the current hour, show no data
      const currentHour = new Date().getHours();
      if (hour > currentHour) {
        return { hour: formattedHour, value: null };
      }
      
      let value;
      if (selectedMetric.isCurrency) {
        value = baseValue * ratio;
      } else if (selectedMetric.unit === 'percentage') {
        value = baseValue; // For percentages, use the same daily value
      } else {
        // For counts, distribute through the day
        value = Math.round(baseValue * ratio);
      }
      
      return { hour: formattedHour, value };
    });
    
    // Convert hourly data to the format expected by the LineChart component
    return {
      labels: hourlyData.map(item => item.hour),
      datasets: [{
        label: selectedMetric.title,
        data: hourlyData.map(item => item.value),
        borderColor: STRIPE_PURPLE,
        backgroundColor: STRIPE_PURPLE_LIGHT,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        fill: true
      }]
    };
  };

  // Generate volume data for Today section - independent from overview controls
  const generateTodayVolumeData = () => {
    return generateTodayVolumeDataForMetric('gross-volume');
  };
  
  // Calculate the current day's volume for the Today section
  const calculateTodayVolume = (volumeData) => {
    if (!volumeData || !volumeData.datasets || !volumeData.datasets[0] || !volumeData.datasets[0].data) {
      return '$0.00';
    }
    // Filter out null or undefined values before summing
    const validData = volumeData.datasets[0].data.filter(val => val !== null && val !== undefined);
    const total = validData.reduce((sum, val) => sum + val, 0);
    return formatCurrency(total);
  };

  // Generate chart data for metrics based on period and interval
  const generateMetricChartData = (selectedMetric, period, interval, includeComparison = true) => {
    try {
      // Determine the right metric ID to use
      let metricId = selectedMetric.id;
      
      // Only convert format for non-MRR metrics
      if (!metricId.includes('mrr')) {
        metricId = metricId.replace('-', '');
      }
      
      // Use the centralized data source
      const metricData = getMetricChartData(metricId, period, interval);
      
      if (!metricData || !metricData.labels || !metricData.currentData) {
        console.error("Invalid metric data for", metricId);
        return {
          labels: [],
          datasets: [{
            label: selectedMetric.title,
            data: [],
            borderColor: '#635bff',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 1.5
          }]
        };
      }

      // Ensure we have valid data points (convert nulls to zeros for better chart display)
      const processedCurrentData = metricData.currentData.map(val => 
        val === null || isNaN(val) ? 0 : parseFloat(val)
      );
      
      // Map the data to the format expected by the chart component
      const chartData = {
        labels: metricData.labels,
        datasets: [
          {
            label: selectedMetric.title,
            data: processedCurrentData,
            borderColor: '#635bff',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          }
        ]
      };

      // If we have comparison data and it's enabled, add it as a second dataset
      if (includeComparison && metricData.previousData && metricData.previousData.some(val => val !== null)) {
        // Process previous data to replace nulls with zeros
        const processedPreviousData = metricData.previousData.map(val => 
          val === null || isNaN(val) ? 0 : parseFloat(val)
        );
        
        chartData.datasets.push({
          label: 'Previous period',
          data: processedPreviousData,
          borderColor: '#9ca3af',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 1.5,
          borderDash: [4, 4]
        });
      }
      
      return chartData;
    } catch (error) {
      console.error("Error generating chart data:", error);
      // Return a minimal valid chart data structure
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: selectedMetric.title,
          data: [5, 10, 15, 12, 8, 9, 11], // Sample data
          borderColor: '#635bff',
          backgroundColor: 'transparent'
        }]
      };
    }
  };

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
      // Use the exact value from the metric for consistency
      volume: metric.isCurrency ? 
        formatCurrency(metric.baseCurrencyValue) : 
        formatNumber(metric.baseNumberValue),
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
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };
  
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
  const handleMetricClick = (metric) => {
    const metricIdMap = {
      'Gross volume': 'gross-volume',
      'New customers': 'new-customers',
      'Successful payments': 'successful-payments',
      'Payment volume': 'payment-volume',
      'Average order value': 'average-order-value',
      'Conversion rate': 'conversion-rate'
    };
    
    const metricId = metricIdMap[metric.title] || metric.title.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to the metric detail page with full metric data
    navigate(`/metrics/${metricId}`, { 
      state: { 
        metric: {
          ...metric,
          // Ensure baseCurrencyValue and baseNumberValue match the chart data
          baseCurrencyValue: metric.isCurrency ? metric.numericalValue : metric.baseCurrencyValue,
          baseNumberValue: !metric.isCurrency ? metric.numericalValue : metric.baseNumberValue,
          // Add a flag for the meter chart type if applicable
          chartType: metric.chartType
        }, 
        sourcePage: 'Home',
        sourceTab: '' 
      } 
    });
  };

  // Handle tooltip display
  const handleShowTooltip = (event, metricId, chartData) => {
    // Ensure chartData and its properties exist
    if (!chartData || !chartData.labels || !chartData.datasets || !chartData.datasets[0]) {
      return;
    }

    const chartRect = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - chartRect.left;
    const yPosition = event.clientY;
    const xRatio = xPosition / chartRect.width;
    const dataIndex = Math.floor(xRatio * chartData.labels.length);
    
    if (dataIndex >= 0 && dataIndex < chartData.labels.length) {
      const metric = metricData.find(m => m.id === metricId);
      if (!metric) return;

      const currentData = chartData.datasets[0].data;
      if (!currentData || dataIndex >= currentData.length) return;
      
      const currentValue = currentData[dataIndex];
      
      let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong>`;
      tooltipContent += `<div class="current-value">Current: ${metric.isCurrency ? formatCurrency(currentValue) : formatNumber(currentValue)}</div>`;
      
      // Check if we have a second dataset for comparison
      if (activeComparison !== 'no-comparison' && 
          chartData.datasets.length > 1 && 
          chartData.datasets[1] && 
          chartData.datasets[1].data && 
          dataIndex < chartData.datasets[1].data.length) {
        const previousValue = chartData.datasets[1].data[dataIndex];
        tooltipContent += `<div class="previous-value">Previous: ${metric.isCurrency ? formatCurrency(previousValue) : formatNumber(previousValue)}</div>`;
      }
      
      showTooltip(event.clientX, yPosition, tooltipContent, metricId);
    }
  };

  // Update metrics data when period or interval changes
  useEffect(() => {
    try {
      // Generate updated metrics with chart data
      const updatedMetrics = baseMetrics.map(metric => {
        // For meter chart metrics, we don't need to generate chart data
        if (metric.chartType === 'meter') {
          const totalValue = metric.meterData.reduce((sum, item) => sum + item.value, 0);
          const formattedTotal = metric.meterData[0].type === 'currency' 
            ? formatCurrency(totalValue)
            : formatNumber(totalValue);
          
          return {
            ...metric,
            value: formattedTotal,
            numericalValue: totalValue,
            trendValue: metric.trendValue,
            meterData: metric.meterData
          };
        }
        
        // Get chart data for regular metrics - ensure MRR metrics use exact same period/interval
        const chartData = generateMetricChartData(metric, activePeriod, activeInterval);
        
        // Use the last data point for the current value if available
        let adjustedValue;
        if (chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data && chartData.datasets[0].data.length > 0) {
          // Use the last point from the chart data
          adjustedValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
        } else {
          // Fall back to calculated value if chart data isn't available
          adjustedValue = metric.isCurrency ? metric.baseCurrencyValue : metric.baseNumberValue;
        }
        
        // Format the display value
        const displayValue = metric.isCurrency
          ? formatCurrency(adjustedValue)
          : metric.unit === 'percentage'
            ? adjustedValue.toFixed(2) + '%'
            : formatNumber(adjustedValue);
        
        // Calculate trend value based on comparison data
        let trendVal = metric.trendValue;
        
        if (chartData && chartData.datasets && chartData.datasets.length > 1 && 
            chartData.datasets[0].data && chartData.datasets[0].data.length > 0 && 
            chartData.datasets[1].data && chartData.datasets[1].data.length > 0) {
          const currentValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
          const previousValue = chartData.datasets[1].data[chartData.datasets[1].data.length - 1];
          
          if (previousValue > 0) {
            const percentChange = ((currentValue - previousValue) / previousValue) * 100;
            trendVal = percentChange;
          }
        }
        
        return {
          ...metric,
          value: displayValue,
          numericalValue: adjustedValue,
          trendValue: parseFloat(trendVal.toFixed(2)), // Format to 2 decimal places
          chartData: chartData
        };
      });
      
      setMetricData(updatedMetrics);
    } catch (error) {
      console.error("Error updating metrics data:", error);
    }
  }, [activePeriod, activeInterval, activeComparison, baseMetrics, standardizedMetrics]);

  // Update baseMetrics when standardizedMetrics changes (due to plan filter)
  useEffect(() => {
    const updatedBaseMetrics = defaultMetricIds
      .map(id => standardizedMetrics[id])
      .filter(Boolean);
    setBaseMetrics(updatedBaseMetrics);
  }, [standardizedMetrics]);

  // Add a specific useEffect to refresh MRR metric data when other metrics are updated
  useEffect(() => {
    if (metricData.length > 0) {
      // Find MRR metric if it exists in the current metrics
      const mrrMetric = metricData.find(m => m.id === 'mrr');
      
      if (mrrMetric) {
        // Ensure MRR is using the latest period and interval
        const updatedMRRData = generateMetricChartData(
          mrrMetric, 
          activePeriod,
          activeInterval, 
          activeComparison !== 'none'
        );
        
        // Update the MRR metric with the correct data
        setMetricData(prevMetrics => {
          return prevMetrics.map(m => {
            if (m.id === 'mrr') {
              // Get the last value for MRR display
              let adjustedValue = m.numericalValue;
              if (updatedMRRData && updatedMRRData.datasets && updatedMRRData.datasets[0] && 
                  updatedMRRData.datasets[0].data && updatedMRRData.datasets[0].data.length > 0) {
                adjustedValue = updatedMRRData.datasets[0].data[updatedMRRData.datasets[0].data.length - 1];
              }
              
              // Calculate trend if we have comparison data
              let trendVal = m.trendValue;
              if (updatedMRRData && updatedMRRData.datasets && updatedMRRData.datasets.length > 1 && 
                  updatedMRRData.datasets[0].data && updatedMRRData.datasets[0].data.length > 0 && 
                  updatedMRRData.datasets[1].data && updatedMRRData.datasets[1].data.length > 0) {
                const currentValue = updatedMRRData.datasets[0].data[updatedMRRData.datasets[0].data.length - 1];
                const previousValue = updatedMRRData.datasets[1].data[updatedMRRData.datasets[1].data.length - 1];
                
                if (previousValue > 0) {
                  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
                  trendVal = percentChange;
                }
              }
              
              return {
                ...m,
                value: formatCurrency(adjustedValue),
                numericalValue: adjustedValue,
                trendValue: parseFloat(trendVal.toFixed(2)),
                chartData: updatedMRRData
              };
            }
            return m;
          });
        });
      }
    }
  }, [activePeriod, activeInterval, activeComparison, metricData.length]);

  // Handle period change from reporting controls
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    // Update metrics for new period
    const updatedMetrics = baseMetrics.map(metric => {
      const chartData = generateMetricChartData(metric, period, activeInterval);
      return { ...metric, chartData };
    });
    setMetricData(updatedMetrics);
  };
  
  // Handle interval change from reporting controls
  const handleIntervalChange = (interval) => {
    setActiveInterval(interval);
    // Update metrics for new interval
    const updatedMetrics = baseMetrics.map(metric => {
      const chartData = generateMetricChartData(metric, activePeriod, interval);
      return { ...metric, chartData };
    });
    setMetricData(updatedMetrics);
  };
  
  // Handle comparison change from reporting controls
  const handleComparisonChange = (comparison) => {
    setActiveComparison(comparison);
    // Update metrics with new comparison setting
    const updatedMetrics = baseMetrics.map(metric => {
      const chartData = generateMetricChartData(
        metric, 
        activePeriod, 
        activeInterval, 
        comparison !== 'none'
      );
      return { ...metric, chartData };
    });
    setMetricData(updatedMetrics);
  };

  // Update the toggle effect to use the default metric IDs
  useEffect(() => {
    // Set initial toggle state: ON for default metrics, OFF for others
    const initialSelectedMetrics = {};
    Object.values(standardizedMetrics).forEach(metric => {
      initialSelectedMetrics[metric.id] = defaultMetricIds.includes(metric.id);
    });
    
    setSelectedMetrics(initialSelectedMetrics);
  }, []);

  // Add a new function to generate chart data specifically for preview modal with gray comparison lines
  const generatePreviewChartData = (selectedMetric, period, interval) => {
    // Get the standard chart data
    const chartData = generateMetricChartData(selectedMetric, period, interval, true);
    
    // If we have comparison data (second dataset), ensure it uses gray color
    if (chartData.datasets && chartData.datasets.length > 1) {
      chartData.datasets[1] = {
        ...chartData.datasets[1],
        borderColor: GRAY, // Use the standard GRAY constant instead of hardcoded value
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4]
      };
    }
    
    return chartData;
  };

  return (
    <DashboardContainer>
      <TodaySection>
        <SectionTitle>Today</SectionTitle>
        <TodayChartsGrid>
          <ChartCard height="280px">
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
              <ExploreLink onClick={() => handleMetricClick({
                id: selectedMetric,
                title: availableMetrics.find(m => m.id === selectedMetric)?.label,
                isCurrency: selectedMetric === 'new-customers' || selectedMetric === 'successful-payments' ? false : true
              })}>
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ExploreLink>
            </ChartHeader>
            <ChartWrapper 
              height="200px" 
              padding="0 0 10px 0" 
              marginBottom="10px"
              onMouseMove={(e) => handleShowTooltip(e, selectedMetric, todayData.volumeChart)}
              onMouseLeave={hideTooltip}
            >
              {todayData.volumeChart && (
                <LineChart 
                  data={todayData.volumeChart} 
                  height={200}
                  showLegend={false} 
                  type="area" 
                  unit={selectedMetric === 'new-customers' || selectedMetric === 'successful-payments' ? 'number' : 'currency'}
                />
              )}
            </ChartWrapper>
          </ChartCard>
          
          <RightChartColumn>
            <SmallCard>
              <ChartHeader>
                <div>
                  <ChartTitle>USD balance</ChartTitle>
                  <MetricValue>$184,506.24</MetricValue>
                  <MetricTime>Available balance</MetricTime>
                </div>
                <ViewLink to="/balances">View</ViewLink>
              </ChartHeader>
            </SmallCard>
            
            <SmallCard>
              <ChartHeader>
                <div>
                  <ChartTitle>Debits</ChartTitle>
                  <MetricValue>$17,501.67</MetricValue>
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
          <ControlsContainer>
            <ReportingControls 
              initialPeriod={activePeriod}
              initialInterval={activeInterval}
              initialComparison={activeComparison}
              onPeriodChange={handlePeriodChange}
              onIntervalChange={handleIntervalChange}
              onComparisonChange={handleComparisonChange}
            />
            <AddMetricsButton onClick={() => setIsMetricsOverlayOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add metrics
            </AddMetricsButton>
          </ControlsContainer>
        </OverviewHeader>
        
        <MetricsGrid>
          {metricData.map(metric => (
            <MetricCard 
              key={metric.id}
              onClick={() => handleMetricClick(metric)}
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
                  <MetricValue>
                    {metric.value}
                    {metric.trendValue > 0 && metric.chartType !== 'meter' && (
                      <MetricTrend trend={metric.trend}>
                        {metric.trend === 'up' ? '+' : '-'}{metric.trendValue.toFixed(2)}%
                      </MetricTrend>
                    )}
                  </MetricValue>
                </MetricValueRow>
              </MetricHeader>
              
              <MetricChartContainer 
                onMouseMove={(e) => metric.chartType !== 'meter' && handleShowTooltip(e, metric.id, metric.chartData)}
                onMouseLeave={hideTooltip}
              >
                {metric.chartType === 'meter' ? (
                  <MeterChart data={metric.meterData} />
                ) : (
                  <LineChart 
                    data={metric.chartData} 
                    height={160} 
                    showLegend={false}
                    simplified={true}
                    type="line" 
                    unit={metric.unit || 'currency'}
                  />
                )}
              </MetricChartContainer>
            </MetricCard>
          ))}
        </MetricsGrid>
      </OverviewSection>
      <MetricsOverlay isOpen={isMetricsOverlayOpen}>
        <MetricsModal>
          <ModalHeader>
            <ModalTitle>Choose which metrics to include on Home</ModalTitle>
          </ModalHeader>
          <ModalContent>
            {Object.entries(metricCategories).map(([category, metricIds]) => {
              const metricsInCategory = metricIds
                .map(id => standardizedMetrics[id])
                .filter(Boolean);
                
              if (metricsInCategory.length === 0) return null;
              
              return (
                <MetricCategorySection key={category}>
                  <CategoryTitle>{category}</CategoryTitle>
                  <MetricsList>
                    {metricsInCategory.map(metric => {
                      const isSelected = selectedMetrics[metric.id];
                      
                      // Generate the chart data for the preview
                      const chartData = metric.chartType !== 'meter' ? 
                        generatePreviewChartData(metric, activePeriod, activeInterval) : 
                        null;
                      
                      return (
                        <SelectableMetricCard 
                          key={metric.id} 
                          selected={isSelected}
                          onClick={() => toggleMetricSelection(metric.id)}
                        >
                          <ToggleIconOverlay selected={isSelected}>
                            {isSelected ? (
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </ToggleIconOverlay>
                          
                          <MetricTitle>{metric.title}</MetricTitle>
                          <MetricValue style={{ fontSize: '18px' }}>
                            {metric.chartType === 'meter' ? (
                              metric.meterData[0].type === 'currency' ?
                                formatCurrency(metric.meterData.reduce((sum, item) => sum + item.value, 0)) :
                                formatNumber(metric.meterData.reduce((sum, item) => sum + item.value, 0))
                            ) : (
                              metric.isCurrency 
                                ? formatCurrency(metric.baseCurrencyValue)
                                : metric.unit === 'percentage'
                                  ? `${metric.baseNumberValue.toFixed(1)}%`
                                  : formatNumber(metric.baseNumberValue)
                            )}
                          </MetricValue>
                          
                          <PreviewChart>
                            {metric.chartType === 'meter' ? (
                              <MeterChart data={metric.meterData || []} compact={true} />
                            ) : chartData ? (
                              <LineChart 
                                data={generatePreviewChartData(metric, activePeriod, activeInterval)} 
                                height={40} 
                                showLegend={false} 
                                showAxes={false}
                                simplified={true}
                                type="line" 
                                unit={metric.unit || 'currency'}
                              />
                            ) : null}
                          </PreviewChart>
                        </SelectableMetricCard>
                      );
                    })}
                  </MetricsList>
                </MetricCategorySection>
              );
            })}
          </ModalContent>
          <ModalFooter>
            <CancelButton onClick={() => setIsMetricsOverlayOpen(false)}>
              Cancel
            </CancelButton>
            <ApplyButton onClick={handleApplyMetrics}>
              Apply
            </ApplyButton>
          </ModalFooter>
        </MetricsModal>
      </MetricsOverlay>
    </DashboardContainer>
  );
};

export default Dashboard; 