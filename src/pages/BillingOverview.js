import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LineChart from '../components/LineChart';

// Constants for consistent styling
const STRIPE_PURPLE = '#6772e5';
const STRIPE_PURPLE_LIGHT = 'rgba(99, 91, 255, 0.1)';
const GRAY = '#aab7c4';
const TREND_POSITIVE = '#217005';
const TREND_NEGATIVE = '#B13600';

const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin: 0;
`;

const EditLayoutButton = styled.button`
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? STRIPE_PURPLE : 'var(--text-color)'};
  border-bottom: 2px solid ${props => props.active ? STRIPE_PURPLE : 'transparent'};
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${STRIPE_PURPLE};
  }
`;

const ControlsContainer = styled.div`
  margin-bottom: 32px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: visible;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .explore-action {
      opacity: 1;
    }
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #425466;
  margin: 0;
`;

const MetricPeriod = styled.span`
  font-size: 12px;
  color: #697386;
`;

const MetricValueRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1a1f36;
  display: flex;
  align-items: center;
`;

const MetricTrend = styled.span`
  font-size: 14px;
  margin-left: 8px;
  color: ${({ trend }) => trend === 'up' ? '#217005' : '#B13600'};
  font-weight: 500;
`;

const ChartContainer = styled.div`
  height: 130px;
  width: 100%;
  position: relative;
`;

const MetricChartContainer = styled.div`
  height: 130px;
  width: 100%;
  position: relative;
  pointer-events: all;
`;

const TabTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1f36;
`;

const ReportSection = styled.div`
  margin-top: 40px;
`;

const ReportCard = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ReportDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const DownloadButton = styled.button`
  padding: 8px 16px;
  background-color: white;
  color: ${STRIPE_PURPLE};
  border: 1px solid ${STRIPE_PURPLE};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${STRIPE_PURPLE_LIGHT};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const ExploreAction = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 14px;
  color: ${STRIPE_PURPLE};
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: -10px;
  left: 0;
  pointer-events: none;
  opacity: 0;
  background-color: white;
  color: #333;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
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
    color: #36B37E;
    font-weight: 500;
  }
  
  .previous-value {
    color: ${GRAY};
  }
`;

// Add report definitions before the component definition
const summaryReports = [
  { id: 'mrr-report', title: 'MRR Report' },
  { id: 'revenue-summary', title: 'Revenue Summary' },
  { id: 'annual-projections', title: 'Annual Projections' }
];

const revenueReports = [
  { id: 'mrr-breakdown', title: 'MRR Breakdown' },
  { id: 'revenue-by-plan', title: 'Revenue by Plan' },
  { id: 'revenue-growth', title: 'Revenue Growth Analysis' }
];

const subscriberReports = [
  { id: 'subscriber-acquisition', title: 'Subscriber Acquisition Report' },
  { id: 'customer-lifetime-value', title: 'Customer Lifetime Value' },
  { id: 'subscriber-segments', title: 'Subscriber Segments' }
];

const invoiceReports = [
  { id: 'invoice-payments-summary', title: 'Invoice Payments Summary' },
  { id: 'past-due-invoices', title: 'Past Due Invoices' },
  { id: 'payment-methods', title: 'Payment Methods Analysis' }
];

const usageReports = [
  { id: 'usage-breakdown', title: 'Usage Breakdown by Product' },
  { id: 'usage-trends', title: 'Usage Trends' }
];

const churnReports = [
  { id: 'churn-reasons', title: 'Churn Reasons Analysis' },
  { id: 'churn-prevention', title: 'Churn Prevention Opportunities' },
  { id: 'win-back-campaigns', title: 'Win-back Campaign Results' }
];

const trialReports = [
  { id: 'trial-conversion-funnel', title: 'Trial Conversion Funnel' },
  { id: 'trial-usage-patterns', title: 'Trial Usage Patterns' }
];

const ReportsSection = styled.div`
  margin-top: 30px;
  background: white;
  border-radius: 8px;
  padding: 20px;
`;

const ReportButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ReportButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f7fafc;
  border: 1px solid #e3e8ee;
  border-radius: 4px;
  font-size: 14px;
  color: #425466;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f4f8;
    border-color: #d6dce7;
  }
`;

const DownloadIcon = styled.span`
  display: inline-flex;
  margin-right: 8px;
  color: #6772e5;
`;

// Remove the TooltipContainer component and use a more efficient pattern
const MetricChart = React.memo(({ 
  metric, 
  activePeriod, 
  interval, 
  comparison, 
  tooltipState, 
  showTooltip, 
  hideTooltip,
  generateMetricChartData
}) => {
  // Use a more stable memoization approach for chart data
  const chartData = React.useMemo(() => {
    return generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
  }, [metric.id, activePeriod, interval, comparison, generateMetricChartData]);
  
  const unitType = metric.isCurrency ? 'currency' : 
                  metric.unit === 'percentage' ? 'percentage' : 
                  metric.unit === 'days' ? 'days' : 'number';
  
  return (
    <MetricChartContainer 
      onMouseMove={(e) => showTooltip(e, metric.id, chartData)}
      onMouseLeave={hideTooltip}
    >
      <LineChart 
        data={chartData} 
        height={130} 
        showLegend={false}
        type="line"
        unitType={unitType}
        key={`${metric.id}-${activePeriod}-${interval}-${comparison}`}
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
  );
}, (prevProps, nextProps) => {
  // Only rerender if these specific props changed
  return (
    prevProps.metric.id === nextProps.metric.id &&
    prevProps.activePeriod === nextProps.activePeriod &&
    prevProps.interval === nextProps.interval &&
    prevProps.comparison === nextProps.comparison &&
    (prevProps.tooltipState.visible === nextProps.tooltipState.visible &&
     prevProps.tooltipState.metricId === nextProps.tooltipState.metricId)
  );
});

const BillingOverview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('revenue');
  const [activePeriod, setActivePeriod] = useState('last30days');
  const [interval, setInterval] = useState('daily');
  const [comparison, setComparison] = useState('previous-period');
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    metricId: ''
  });
  const [metricData, setMetricData] = useState([]);

  // Base metrics for revenue tab
  const baseRevenueMetrics = [
    {
      id: 'mrr',
      title: 'MRR',
      baseCurrencyValue: 29501672.81,
      trendValue: 0.1,
      trend: 'up',
      isCurrency: true,
    },
    {
      id: 'mrr-growth',
      title: 'MRR growth',
      baseCurrencyValue: 25816.82,
      trendValue: 4.8,
      trend: 'down',
      isCurrency: true,
    },
    {
      id: 'net-volume',
      title: 'Net volume',
      baseCurrencyValue: 0.00,
      trendValue: 100.0,
      trend: 'up',
      isCurrency: true,
    },
    {
      id: 'mrr-growth-rate',
      title: 'MRR growth rate',
      baseNumberValue: 0.1,
      trendValue: 350.0,
      trend: 'up',
      isCurrency: false,
    }
  ];

  // Base metrics for subscribers tab
  const baseSubscribersMetrics = [
    {
      id: 'active-subscribers',
      title: 'Active subscribers',
      baseCurrencyValue: 0,
      baseNumberValue: 2483,
      trendValue: 4.2,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    },
    {
      id: 'active-subscribers-growth',
      title: 'Active subscribers growth',
      baseCurrencyValue: 0,
      baseNumberValue: 8.6,
      trendValue: 1.3,
      trend: 'up',
      isCurrency: false,
      unit: 'percentage'
    },
    {
      id: 'new-subscribers',
      title: 'New subscribers',
      baseCurrencyValue: 0,
      baseNumberValue: 214,
      trendValue: 6.8,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    },
    {
      id: 'churned-subscribers',
      title: 'Churned subscribers',
      baseCurrencyValue: 0,
      baseNumberValue: 48,
      trendValue: 1.2,
      trend: 'down',
      isCurrency: false,
      unit: 'number'
    },
    {
      id: 'arpu',
      title: 'Average revenue per user',
      baseCurrencyValue: 118.32,
      baseNumberValue: 0,
      trendValue: 2.4,
      trend: 'up',
      isCurrency: true,
      unit: 'currency'
    },
    {
      id: 'subscriber-ltv',
      title: 'Subscriber lifetime value',
      baseCurrencyValue: 2463.75,
      baseNumberValue: 0,
      trendValue: 3.7,
      trend: 'up',
      isCurrency: true,
      unit: 'currency'
    }
  ];

  // Base metrics for invoices tab
  const baseInvoicesMetrics = [
    {
      id: 'invoice-revenue',
      title: 'Invoice revenue',
      baseCurrencyValue: 247865.43,
      baseNumberValue: 0,
      trendValue: 5.8,
      trend: 'up',
      isCurrency: true,
      unit: 'currency'
    },
    {
      id: 'past-due-invoice-volume',
      title: 'Past due invoice volume',
      baseCurrencyValue: 18432.21,
      baseNumberValue: 0,
      trendValue: 2.1,
      trend: 'down',
      isCurrency: true,
      unit: 'currency'
    },
    {
      id: 'avg-invoice-payment-length',
      title: 'Average invoice payment length',
      baseCurrencyValue: 0,
      baseNumberValue: 4.2,
      trendValue: 0.3,
      trend: 'down',
      isCurrency: false,
      unit: 'number'
    }
  ];

  // Base metrics for usage tab
  const baseUsageMetrics = [
    {
      id: 'usage-revenue',
      title: 'Usage revenue',
      baseCurrencyValue: 85742.65,
      baseNumberValue: 0,
      trendValue: 12.3,
      trend: 'up',
      isCurrency: true,
      unit: 'currency'
    },
    {
      id: 'usage-count',
      title: 'Usage count',
      baseCurrencyValue: 0,
      baseNumberValue: 1243572,
      trendValue: 8.7,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    }
  ];

  // Base metrics for churn tab
  const baseChurnMetrics = [
    {
      id: 'subscriber-churn-rate',
      title: 'Subscriber churn rate',
      baseCurrencyValue: 0,
      baseNumberValue: 2.4,
      trendValue: 0.3,
      trend: 'down',
      isCurrency: false,
      unit: 'percentage'
    },
    {
      id: 'churned-revenue',
      title: 'Churned revenue',
      baseCurrencyValue: 14253.87,
      baseNumberValue: 0,
      trendValue: 1.6,
      trend: 'down',
      isCurrency: true,
      unit: 'currency'
    },
    {
      id: 'gross-mrr-churn-rate',
      title: 'Gross MRR churn rate',
      baseCurrencyValue: 0,
      baseNumberValue: 2.8,
      trendValue: 0.2,
      trend: 'down',
      isCurrency: false,
      unit: 'percentage'
    },
    {
      id: 'net-mrr-churn-rate',
      title: 'Net MRR churn rate',
      baseCurrencyValue: 0,
      baseNumberValue: 0.7,
      trendValue: 0.4,
      trend: 'down',
      isCurrency: false,
      unit: 'percentage'
    }
  ];

  // Base metrics for trials tab
  const baseTrialsMetrics = [
    {
      id: 'new-trials',
      title: 'New trials',
      baseCurrencyValue: 0,
      baseNumberValue: 183,
      trendValue: 8.5,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    },
    {
      id: 'trial-conversion-rate',
      title: 'Trial conversion rate',
      baseCurrencyValue: 0,
      baseNumberValue: 42.6,
      trendValue: 3.2,
      trend: 'up',
      isCurrency: false,
      unit: 'percentage'
    },
    {
      id: 'active-trials',
      title: 'Active trials',
      baseCurrencyValue: 0,
      baseNumberValue: 376,
      trendValue: 5.4,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    },
    {
      id: 'converted-trials',
      title: 'Converted trials',
      baseCurrencyValue: 0,
      baseNumberValue: 78,
      trendValue: 4.8,
      trend: 'up',
      isCurrency: false,
      unit: 'number'
    }
  ];

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle date range changes
  const handleDateChange = (period) => {
    setActivePeriod(period);
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 100 ? 2 : 0,
      maximumFractionDigits: value < 100 ? 2 : 0
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  // Format general numbers
  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  // Generate chart data for metrics
  const generateMetricChartData = (metric, period, interval, includePrevious = true) => {
    let labels = [];
    let currentData = [];
    let previousData = [];
    let pointCount = 0;
    
    // Determine number of data points based on period and interval
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
        pointCount = interval === 'daily' ? 30 : interval === 'weekly' ? 52 : 12;
        break;
      default:
        pointCount = 7;
    }
    
    // Generate labels based on interval
    const today = new Date();
    
    for (let i = pointCount - 1; i >= 0; i--) {
      let date = new Date(today);
      
      if (interval === 'daily') {
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else if (interval === 'weekly') {
        date.setDate(today.getDate() - (i * 7));
        labels.push(`Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      } else if (interval === 'monthly') {
        date.setMonth(today.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'long' }));
      }
    }

    // Generate trend data based on metric type
    const volatility = 0.08; // Standard volatility
    
    if (metric.isCurrency) {
      // Handle currency metrics - general trend with some volatility
      const baseValue = metric.baseCurrencyValue;
      
      // Generate current data with appropriate trend
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1); // 0 to 1 based on position in timeline
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.05) : 1 - (progress * 0.03);
        const randomFactor = 1 + ((Math.random() * volatility * 2) - volatility);
        return baseValue * trendFactor * randomFactor;
      });
      
      if (includePrevious) {
        // Previous period data - slightly different trend
        const prevTrendMultiplier = metric.trend === 'up' ? 0.92 : 1.05;
        previousData = currentData.map(val => val * prevTrendMultiplier);
      }
    } else if (metric.id.includes('rate') || metric.unit === 'percentage') {
      // Handle percentage/rate metrics - smaller numbers, less volatility
      const baseValue = metric.baseNumberValue / 100; // Convert to decimal for calculations
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1);
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.03) : 1 - (progress * 0.02);
        const randomFactor = 1 + ((Math.random() * (volatility/2) * 2) - (volatility/2));
        return baseValue * trendFactor * randomFactor;
      });
      
      if (includePrevious) {
        const prevTrendMultiplier = metric.trend === 'up' ? 0.94 : 1.03;
        previousData = currentData.map(val => val * prevTrendMultiplier);
      }
    } else {
      // Handle count/number metrics
      const baseValue = metric.baseNumberValue;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1);
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.04) : 1 - (progress * 0.025);
        const randomFactor = 1 + ((Math.random() * volatility * 2) - volatility);
        
        // Round to whole numbers for count metrics
        return Math.round(baseValue * trendFactor * randomFactor);
      });
      
      if (includePrevious) {
        const prevTrendMultiplier = metric.trend === 'up' ? 0.93 : 1.04;
        previousData = currentData.map(val => Math.round(val * prevTrendMultiplier));
      }
    }
    
    return {
      labels,
      currentData,
      previousData,
      datasets: [
        {
          label: 'Current',
          data: currentData,
          borderColor: STRIPE_PURPLE,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        },
        ...(includePrevious ? [{
          label: 'Previous',
          data: previousData,
          borderColor: GRAY,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [5, 5]
        }] : [])
      ]
    };
  };

  // Handle metric card click
  const handleMetricClick = (metric) => {
    navigate(`/metrics/${metric.id}`, { 
      state: { metric }
    });
  };

  // Update the showTooltip function implementation
  const showTooltip = (event, metricId, chartData) => {
    const chartRect = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - chartRect.left;
    const xRatio = xPosition / chartRect.width;
    const dataIndex = Math.floor(xRatio * chartData.labels.length);
    
    if (dataIndex >= 0 && dataIndex < chartData.labels.length) {
      // Find the metric from any of the possible metric sources
      const metric = metricData.find(m => m.id === metricId) || 
                    baseRevenueMetrics.find(m => m.id === metricId) ||
                    baseSubscribersMetrics.find(m => m.id === metricId) ||
                    baseInvoicesMetrics.find(m => m.id === metricId) ||
                    baseUsageMetrics.find(m => m.id === metricId) ||
                    baseChurnMetrics.find(m => m.id === metricId) ||
                    baseTrialsMetrics.find(m => m.id === metricId);
                    
      if (!metric) return;
      
      const currentValue = chartData.currentData[dataIndex];
      const previousValue = chartData.previousData ? chartData.previousData[dataIndex] : null;
      
      let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong><br/>`;
      
      if (metric.isCurrency) {
        tooltipContent += `<span class="current-value">Current: ${formatCurrency(currentValue)}</span>`;
      } else if (metric.unit === 'percentage') {
        tooltipContent += `<span class="current-value">Current: ${formatPercentage(currentValue * 100)}</span>`;
      } else {
        tooltipContent += `<span class="current-value">Current: ${formatNumber(currentValue)}</span>`;
      }
      
      if (previousValue !== null && comparison !== 'no-comparison') {
        tooltipContent += '<br/>';
        if (metric.isCurrency) {
          tooltipContent += `<span class="previous-value">Previous: ${formatCurrency(previousValue)}</span>`;
        } else if (metric.unit === 'percentage') {
          tooltipContent += `<span class="previous-value">Previous: ${formatPercentage(previousValue * 100)}</span>`;
        } else {
          tooltipContent += `<span class="previous-value">Previous: ${formatNumber(previousValue)}</span>`;
        }
      }
      
      setTooltipState({
        visible: true,
        x: xPosition,
        y: 25,
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
      // Generate updated metrics with chart data
      const updatedMetrics = baseRevenueMetrics.map(metric => {
        // Generate chart data for the metric
        const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
        
        // Format the display value
        const displayValue = metric.isCurrency
          ? formatCurrency(metric.baseCurrencyValue)
          : formatPercentage(metric.baseNumberValue * 100);
        
        return {
          ...metric,
          value: displayValue,
          numericalValue: metric.isCurrency ? metric.baseCurrencyValue : metric.baseNumberValue,
          chartData: chartData
        };
      });
      
      setMetricData(updatedMetrics);
    } catch (error) {
      console.error("Error updating metrics data:", error);
    }
  }, [activePeriod, interval, comparison]);

  // Helper function to render reports - restored previous treatment
  const renderReportSection = (title, reports) => {
    return (
      <ReportSection>
        <SectionTitle>{title}</SectionTitle>
        
        {reports.map(report => (
          <ReportCard key={report.id || report.title}>
            <ReportInfo>
              <ReportTitle>{report.title}</ReportTitle>
              <ReportDescription>{report.description}</ReportDescription>
            </ReportInfo>
            <DownloadButton onClick={() => handleReportDownload(report)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
            </DownloadButton>
          </ReportCard>
        ))}
      </ReportSection>
    );
  };

  // Function to handle report download
  const handleReportDownload = (report) => {
    console.log(`Downloading report: ${report.title}`);
    // In a real implementation, this would trigger an API call or generate a report
    // toast.success(`Started download: ${report.title}`);
  };

  // Update the renderMetricsGrid function to use the new MetricChart component
  const renderMetricsGrid = (metrics, gridType = 'default') => {
    return (
      <MetricsGrid type={gridType}>
        {metrics.map(metric => {
          const valueDisplay = metric.isCurrency 
            ? `$${formatNumber(metric.baseCurrencyValue)}` 
            : metric.unit === 'percentage'
              ? `${metric.baseNumberValue.toFixed(1)}%`
              : metric.unit === 'days'
                ? `${formatNumber(metric.baseNumberValue)} ${metric.baseNumberValue === 1 ? 'day' : 'days'}`
                : formatNumber(metric.baseNumberValue);
                
          const trendDisplay = metric.unit === 'days'
            ? `${metric.trendValue} ${Math.abs(metric.trendValue) === 1 ? 'day' : 'days'} ${metric.trend === 'up' ? 'up' : 'down'}`
            : `${metric.trend === 'up' ? '+' : '-'}${Math.abs(metric.trendValue).toFixed(1)}%`;

          return (
            <MetricCard key={metric.id} onClick={() => handleMetricClick(metric)}>
              <ExploreAction className="explore-action">
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ExploreAction>
              
              <MetricHeader>
                <MetricTitle>{metric.title}</MetricTitle>
              </MetricHeader>
              <MetricValueRow>
                <MetricValue>
                  {valueDisplay}
                  <MetricTrend trend={metric.trend}>
                    {trendDisplay}
                  </MetricTrend>
                </MetricValue>
              </MetricValueRow>
              
              <MetricChart 
                metric={metric}
                activePeriod={activePeriod}
                interval={interval}
                comparison={comparison}
                tooltipState={tooltipState}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                generateMetricChartData={generateMetricChartData}
              />
            </MetricCard>
          );
        })}
      </MetricsGrid>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    // Render different content based on the active tab
    switch (activeTab) {
      case 'revenue':
        return (
          <>
            {renderMetricsGrid(metricData)}
            
            {renderReportSection("Report downloads", [
              {
                id: 'mrr-per-subscriber',
                title: "MRR per subscriber per month",
                description: "Includes the MRR for each subscriber at the end of the month."
              },
              {
                id: 'subscription-metrics',
                title: "Subscription metrics per month",
                description: "Includes your MRR roll-forward, subscriber roll-forward, retention, and customer value for each month."
              },
              {
                id: 'customer-mrr-changes',
                title: "Customer MRR changes",
                description: "Includes a log of every MRR change for each customer, including new subscribers, upgrades, downgrades, reactivations, and churn."
              }
            ])}
          </>
        );

      case 'subscribers':
        // Calculate metrics for subscribers tab using the helper functions
        const subscribersMetrics = baseSubscribersMetrics.map(metric => {
          const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
          const displayValue = metric.isCurrency 
            ? formatCurrency(metric.baseCurrencyValue) 
            : formatPercentage(metric.baseNumberValue);

          return {
            ...metric,
            value: displayValue,
            chartData: chartData
          };
        });

        return (
          <>
            {renderMetricsGrid(subscribersMetrics)}
          </>
        );

      case 'invoices':
        // Calculate metrics for invoices tab
        const invoicesMetrics = baseInvoicesMetrics.map(metric => {
          const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
          const displayValue = metric.isCurrency 
            ? formatCurrency(metric.baseCurrencyValue) 
            : formatNumber(metric.baseNumberValue);

          return {
            ...metric,
            value: displayValue,
            chartData: chartData
          };
        });

        return (
          <>
            {renderMetricsGrid(invoicesMetrics)}
          </>
        );

      case 'usage':
        // Calculate metrics for usage tab
        const usageMetrics = baseUsageMetrics.map(metric => {
          const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
          const displayValue = metric.isCurrency 
            ? formatCurrency(metric.baseCurrencyValue) 
            : formatNumber(metric.baseNumberValue);

          return {
            ...metric,
            value: displayValue,
            chartData: chartData
          };
        });

        return (
          <>
            {renderMetricsGrid(usageMetrics)}
          </>
        );

      case 'churn':
        // Calculate metrics for churn tab
        const churnMetrics = baseChurnMetrics.map(metric => {
          const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
          let displayValue;
          
          if (metric.isCurrency) {
            displayValue = formatCurrency(metric.baseCurrencyValue);
          } else if (metric.id.includes('rate')) {
            displayValue = formatPercentage(metric.baseNumberValue);
          } else {
            displayValue = formatNumber(metric.baseNumberValue);
          }

          return {
            ...metric,
            value: displayValue,
            chartData: chartData
          };
        });

        return (
          <>
            {renderMetricsGrid(churnMetrics)}
          </>
        );

      case 'trials':
        // Calculate metrics for trials tab
        const trialsMetrics = baseTrialsMetrics.map(metric => {
          const chartData = generateMetricChartData(metric, activePeriod, interval, comparison !== 'no-comparison');
          let displayValue;
          
          if (metric.id.includes('rate')) {
            displayValue = formatPercentage(metric.baseNumberValue);
          } else {
            displayValue = formatNumber(metric.baseNumberValue);
          }

          return {
            ...metric,
            value: displayValue,
            chartData: chartData
          };
        });

        return (
          <>
            {renderMetricsGrid(trialsMetrics)}
          </>
        );
        
      case 'summary':
        return (
          <>
            <div style={{ textAlign: 'center', padding: '40px 0', marginBottom: '40px' }}>
              <p>Overview of your key billing metrics will appear here.</p>
            </div>
          </>
        );
        
      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Select a tab to view content.</p>
          </div>
        );
    }
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HeaderContainer>
        <Title>Billing Overview</Title>
        <EditLayoutButton>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit layout
        </EditLayoutButton>
      </HeaderContainer>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'summary'} 
          onClick={() => handleTabChange('summary')}
        >
          Summary
        </Tab>
        <Tab 
          active={activeTab === 'revenue'} 
          onClick={() => handleTabChange('revenue')}
        >
          Revenue
        </Tab>
        <Tab 
          active={activeTab === 'subscribers'} 
          onClick={() => handleTabChange('subscribers')}
        >
          Subscribers
        </Tab>
        <Tab 
          active={activeTab === 'invoices'} 
          onClick={() => handleTabChange('invoices')}
        >
          Invoices
        </Tab>
        <Tab 
          active={activeTab === 'usage'} 
          onClick={() => handleTabChange('usage')}
        >
          Usage
        </Tab>
        <Tab 
          active={activeTab === 'churn'} 
          onClick={() => handleTabChange('churn')}
        >
          Churn
        </Tab>
        <Tab 
          active={activeTab === 'trials'} 
          onClick={() => handleTabChange('trials')}
        >
          Trials
        </Tab>
      </TabsContainer>
      
      <ControlsContainer>
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
      </ControlsContainer>
      
      {renderTabContent()}
    </PageContainer>
  );
};

export default BillingOverview;
