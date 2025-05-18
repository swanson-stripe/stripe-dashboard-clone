import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    endDate: new Date() 
  });
  const [activePeriod, setActivePeriod] = useState('last_3_months');
  const [activeInterval, setActiveInterval] = useState('daily');
  const [activeComparison, setActiveComparison] = useState('previous_period');
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
  
  // Base metrics data with their types
  const [baseMetrics, setBaseMetrics] = useState(Object.values(standardizedMetrics));
  
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
  const generateTodayVolumeDataForMetric = (selectedMetric) => {
    // Instead of generating random data, we'll use our consistent data
    const metricData = getMetricData(
      selectedMetric.id.replace('-', ''), // Convert ID format to match the data keys
      'last7days',
      PERIODS.DAILY
    );
    
    // Get the most recent day's data
    const latestData = metricData.currentData.length > 0 ? 
      metricData.currentData[metricData.currentData.length - 1] : 0;
    
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
      
      // For hours beyond the current hour, show no data
      const currentHour = new Date().getHours();
      if (hour > currentHour) {
        return { hour: `${hour}:00`, value: null };
      }
      
      let value;
      if (selectedMetric.isCurrency) {
        value = latestData * ratio;
      } else if (selectedMetric.unit === 'percentage') {
        value = latestData; // For percentages, use the same daily value
      } else {
        // For counts, distribute through the day
        value = Math.round(latestData * ratio);
      }
      
      return { hour: `${hour}:00`, value };
    });
    
    return hourlyData;
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
  const generateMetricChartData = (selectedMetric, period, interval) => {
    // Use the centralized data source instead of generating random data
    const metricId = selectedMetric.id.replace('-', ''); // Convert ID format
    const metricData = getMetricData(metricId, period, interval);
    
    // Map the data to the format expected by the chart component
    const chartData = {
      labels: metricData.labels,
      datasets: [
        {
          label: selectedMetric.title,
          data: metricData.currentData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
    
    // If we have comparison data, add it as a second dataset
    if (metricData.previousData.some(val => val !== null)) {
      chartData.datasets.push({
        label: 'Previous period',
        data: metricData.previousData,
        borderColor: 'rgba(201, 203, 207, 0.5)',
        backgroundColor: 'rgba(201, 203, 207, 0.2)',
        borderDash: [5, 5],
      });
    }
    
    return chartData;
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
        }, 
        sourcePage: 'Home',
        sourceTab: '' 
      } 
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
      
      if (activeComparison !== 'no-comparison') {
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
          (activeInterval === 'weekly') ? 1.1 : 
          (activeInterval === 'monthly') ? 1.2 : 1
        );
        
        // Get chart data first
        const chartData = generateMetricChartData(metric, activePeriod, activeInterval, activeComparison !== 'no-comparison');
        
        // Use the last data point for the current value
        let adjustedValue;
        if (chartData.currentData && chartData.currentData.length > 0) {
          // Use the last point from the chart data
          adjustedValue = chartData.currentData[chartData.currentData.length - 1];
        } else {
          // Fall back to calculated value if chart data isn't available
          adjustedValue = metric.isCurrency
            ? metric.baseCurrencyValue * valueMultiplier
            : Math.round(metric.baseNumberValue * valueMultiplier);
        }
        
        // Format the display value
        const displayValue = metric.isCurrency
          ? formatCurrency(adjustedValue)
          : metric.unit === 'percentage'
            ? adjustedValue.toFixed(2) + '%'
            : formatNumber(adjustedValue);
        
        // Calculate trend value based on comparison data
        let trendVal = metric.trendValue;
        
        if (chartData.previousData && chartData.previousData.length > 0 && chartData.currentData && chartData.currentData.length > 0) {
          const currentValue = chartData.currentData[chartData.currentData.length - 1];
          const previousValue = chartData.previousData[chartData.previousData.length - 1];
          
          if (previousValue > 0) {
            const percentChange = ((currentValue - previousValue) / previousValue) * 100;
            trendVal = percentChange;
          }
        } else if (activeComparison === 'previous-year') {
          trendVal = trendVal * 1.5;
        } else if (activeComparison === 'no-comparison') {
          trendVal = 0;
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
  }, [activePeriod, activeInterval, activeComparison, navigate]);

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
          <SectionTitle>Business overview</SectionTitle>
          <ReportingControls 
            initialPeriod={activePeriod}
            initialInterval={activeInterval}
            initialComparison={activeComparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
          />
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
                    {metric.trendValue > 0 && (
                      <MetricTrend trend={metric.trend}>
                        {metric.trend === 'up' ? '+' : '-'}{metric.trendValue.toFixed(2)}%
                      </MetricTrend>
                    )}
                  </MetricValue>
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
                  unit={metric.unit || 'currency'}
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