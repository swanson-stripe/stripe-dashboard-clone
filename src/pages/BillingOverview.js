import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LineChart from '../components/LineChart';

// Constants for consistent styling
const STRIPE_PURPLE = '#635bff';
const STRIPE_PURPLE_LIGHT = 'rgba(99, 91, 255, 0.1)';
const GRAY = '#9ca3af';
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
  gap: 24px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .explore-action {
      opacity: 1;
    }
  }
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

const MetricHeader = styled.div`
  margin-bottom: 16px;
`;

const MetricTitle = styled.div`
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
`;

const MetricValueRow = styled.div`
  display: flex;
  align-items: center;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
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

const MetricChartContainer = styled.div`
  position: relative;
  height: 160px;
  width: 100%;
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

    // Generate trend data based on metric
    if (metric.id === 'mrr') {
      // MRR data - general uptrend with some growth
      const baseValue = metric.baseCurrencyValue / 100;
      let value = baseValue;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        value = value * (0.998 + Math.random() * 0.004);
        if (i === pointCount - 1) {
          value = baseValue; // Ensure last value matches the display value
        }
        return value;
      });
      
      if (includePrevious) {
        // Previous period data - slightly lower
        previousData = currentData.map(val => val * 0.97);
      }
    } else if (metric.id === 'mrr-growth') {
      // MRR growth - fluctuating values
      const volatility = 0.06;
      const baseValue = metric.baseCurrencyValue;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
        const value = baseValue * randomFactor;
        return value;
      });
      
      if (includePrevious) {
        // Previous period data - more stable
        previousData = currentData.map(val => val * 1.05);
      }
    } else if (metric.id === 'net-volume') {
      // Net volume - fluctuating around zero, sometimes negative
      currentData = new Array(pointCount).fill(0).map(() => {
        return (Math.random() * 1000 - 500);
      });
      
      if (includePrevious) {
        // Previous period data
        previousData = currentData.map(val => val * 0.8);
      }
    } else if (metric.id === 'mrr-growth-rate') {
      // MRR growth rate - percentage data
      const baseValue = 0.001;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const sinFactor = Math.sin(i / (pointCount / Math.PI * 2));
        return baseValue + (sinFactor * 0.002);
      });
      
      if (includePrevious) {
        // Previous period data
        previousData = currentData.map(val => val * 0.3);
      }
    } else {
      // Generic data for other metrics
      currentData = new Array(pointCount).fill(0).map(() => Math.random() * 1000);
      
      if (includePrevious) {
        previousData = currentData.map(val => val * 0.85);
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
  const handleMetricClick = (metricId) => {
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
      tooltipContent += `<span class="current-value">Current: ${metric.isCurrency ? formatCurrency(currentValue) : formatPercentage(currentValue * 100)}</span><br/>`;
      
      if (comparison !== 'no-comparison') {
        tooltipContent += `<span class="previous-value">Previous: ${metric.isCurrency ? formatCurrency(previousValue) : formatPercentage(previousValue * 100)}</span>`;
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

  // Render content based on active tab
  const renderTabContent = () => {
    if (activeTab === 'revenue') {
      return (
        <>
          {/* Revenue Metrics */}
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
                    <MetricValue>
                      {metric.value}
                      {metric.trendValue > 0 && (
                        <MetricTrend trend={metric.trend}>
                          {metric.trend === 'up' ? '+' : '-'}{metric.trendValue}%
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
                    height={160} 
                    showLegend={false} 
                    type="line" 
                    unit={metric.id === 'mrr-growth-rate' ? 'percentage' : 'currency'}
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
          
          {/* Report Downloads */}
          <ReportSection>
            <SectionTitle>Report downloads</SectionTitle>
            
            <ReportCard>
              <ReportInfo>
                <ReportTitle>MRR per subscriber per month</ReportTitle>
                <ReportDescription>Includes the MRR for each subscriber at the end of the month.</ReportDescription>
              </ReportInfo>
              <DownloadButton>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </DownloadButton>
            </ReportCard>
            
            <ReportCard>
              <ReportInfo>
                <ReportTitle>Subscription metrics per month</ReportTitle>
                <ReportDescription>Includes your MRR roll-forward, subscriber roll-forward, retention, and customer value for each month.</ReportDescription>
              </ReportInfo>
              <DownloadButton>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </DownloadButton>
            </ReportCard>
            
            <ReportCard>
              <ReportInfo>
                <ReportTitle>Customer MRR changes</ReportTitle>
                <ReportDescription>Includes a log of every MRR change for each customer, including new subscribers, upgrades, downgrades, reactivations, and churn.</ReportDescription>
              </ReportInfo>
              <DownloadButton>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </DownloadButton>
            </ReportCard>
          </ReportSection>
        </>
      );
    }
    
    // For other tabs, return placeholder content
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p>Select a different tab to view content.</p>
      </div>
    );
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
