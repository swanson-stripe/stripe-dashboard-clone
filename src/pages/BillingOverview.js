import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import LineChart from '../components/LineChart';
import BubbleChart from '../components/BubbleChart';
import ReportingControls from '../components/ReportingControls';
import PlanFilter from '../components/PlanFilter';
import { CURRENT_KEY_METRICS } from '../data/companyData';
import { useMetrics } from '../components/MetricsContext';
import { useTooltip } from '../components/GlobalTooltip';
import MerchantSegmentation from '../components/MerchantSegmentation';
import BarChart from '../components/BarChart';

// Constants for consistent styling
const STRIPE_PURPLE = '#635bff';
const STRIPE_PURPLE_LIGHT = 'rgba(99, 91, 255, 0.1)';
const GRAY = '#aab7c4';
const USAGE_BLUE = '#469FBF';
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

// More options button with three dots
const MoreOptionsButton = styled.button`
  padding: 8px;
  background-color: transparent;
  color: var(--text-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Make section titles have the more options button appear on hover
const SectionTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  &:hover ${MoreOptionsButton} {
    opacity: 1;
  }
`;

// Popover for section options
const SectionOptionsPopoverStyled = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

// Create a forwardRef component for the popover
const SectionOptionsPopover = React.forwardRef((props, ref) => {
  return <SectionOptionsPopoverStyled {...props} ref={ref} />;
});

const PopoverItem = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f5f7fa;
  }
`;

// Replace EditLayoutButton inheritance with direct styling
const ConfigureMetricsButton = styled.button`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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
  
  &:hover {
    .explore-action {
      opacity: 1;
    }
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
  flex-grow: 1;
  min-height: 160px;
  margin-top: auto;
  margin-bottom: 8px;
  position: relative;
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
  z-index: 1000;
  transform: translate(-50%, -100%);
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: 1px solid #e3e8ee;
  font-weight: 500;
  
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
    display: block;
    margin-bottom: 4px;
  }
  
  .current-value {
    color: ${TREND_POSITIVE};
    font-weight: 500;
  }
  
  .previous-value {
    color: ${GRAY};
    margin-top: 2px;
  }
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
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const EmptySection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  min-height: 150px;
`;

const TrendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
`;

const TrendingCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    
    .explore-action {
      opacity: 1;
    }
  }
`;

const TrendingTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-secondary);
`;

const TrendingContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const TrendingValueSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TrendingValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const TrendingTrend = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.trend === 'up' ? TREND_POSITIVE : TREND_NEGATIVE};
`;

const SparklineContainer = styled.div`
  height: 50px;
  width: 100px;
  margin-left: 8px;
  flex-shrink: 0;
  min-width: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

// Modify the MetricChart component to better handle tooltips
const MetricChart = memo(({
  metric, 
  activePeriod, 
  interval, 
  comparison, 
  generateMetricChartData,
  handleShowTooltip,
  hideTooltip
}) => {
  // Refs for optimized tooltip handling
  const throttleRef = useRef(null);
  
  // Memoized event handlers to prevent recreating on each render
  const chartData = useMemo(() => {
    return generateMetricChartData(metric, activePeriod, interval, comparison !== 'none');
  }, [metric, activePeriod, interval, comparison, generateMetricChartData]);
  
  const optimizedTooltipHandler = useCallback((e) => {
    if (!e || !e.currentTarget) return;
    if (throttleRef.current) return;
    
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, 100);
    
    handleShowTooltip(e, metric.id, chartData);
  }, [metric.id, chartData, handleShowTooltip]);
  
  const optimizedHideTooltip = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  // Only render if we have valid chart data
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return <div>No data available</div>;
  }
  
  return (
    <MetricChartContainer 
      onMouseMove={optimizedTooltipHandler}
      onMouseLeave={optimizedHideTooltip}
    >
      <LineChart 
        data={chartData} 
        height={160}
        showLegend={false}
        unit={metric.unit || 'currency'}
      />
    </MetricChartContainer>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders with more comprehensive checks
  return (
    prevProps.metric.id === nextProps.metric.id &&
    prevProps.activePeriod === nextProps.activePeriod &&
    prevProps.interval === nextProps.interval &&
    prevProps.comparison === nextProps.comparison
  );
});

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricColumnCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: none;
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

const PlaceholderContainer = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  min-height: 180px;
`;

const ForecastingContainer = styled.div`
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  background-color: white;
  justify-content: space-between;
`;

const ForecastingHeading = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
  margin: 0 0 16px 0;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: var(--text-color);
  margin-left: 12px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 20px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${STRIPE_PURPLE};
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const InsightContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
`;

const InsightHeading = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1f36;
  margin: 0 0 6px 0;
`;

const InsightText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
  margin: 0 0 8px 0;
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 16px 0 12px 0;
`;

const ChevronIcon = styled.span`
  margin-left: 6px;
  transition: transform 0.3s ease;
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
`;

const RecommendationContent = styled.div`
  max-height: ${props => props.expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const MailchimpButton = styled.button`
  background-color: white;
  color: ${STRIPE_PURPLE};
  border: 1px solid ${STRIPE_PURPLE};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  width: auto;
  align-self: flex-start;
  
  &:hover {
    background-color: ${STRIPE_PURPLE_LIGHT};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 91, 255, 0.3);
  }
`;

// Create a non-interactive styled card specifically for the Total Revenue chart
const StaticMetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: default;
`;

// Define the BarChartMetricCard styled component
const BarChartMetricCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: default;
`;

// Define chart container for bar charts
const ChartContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 16px;
  position: relative;
`;

// Define legend components
const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
`;

const LegendLabel = styled.span`
  font-size: 14px;
  color: #6B7C93;
`;

const HelperText = styled.p`
  font-size: 13px;
  color: #6B7C93;
  margin: 0 0 16px 0;
`;

const ForecastToggleSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const ForecastToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ForecastToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 20px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${STRIPE_PURPLE};
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const ForecastToggleLabel = styled.span`
  font-size: 14px;
  color: var(--text-color);
  margin-left: 12px;
`;

const ForecastTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
`;

const ConnectedForecasting = ({ forecastSettings, setForecastSettings }) => {
  return (
    <ForecastToggleSection>
      <ForecastTitle style={{ marginTop: '20px' }}>Adjustments</ForecastTitle>
      
      <ForecastToggleContainer>
        <ForecastToggleSwitch>
            <input 
              type="checkbox" 
            checked={forecastSettings.creditsEnabled}
            onChange={() => setForecastSettings(prev => ({
              ...prev,
              creditsEnabled: !prev.creditsEnabled
            }))}
          />
          <span></span>
        </ForecastToggleSwitch>
        <ForecastToggleLabel>Include credits</ForecastToggleLabel>
      </ForecastToggleContainer>
      
      <ForecastToggleContainer>
        <ForecastToggleSwitch>
            <input 
              type="checkbox" 
            checked={forecastSettings.discountsEnabled}
            onChange={() => setForecastSettings(prev => ({
              ...prev,
              discountsEnabled: !prev.discountsEnabled
            }))}
          />
          <span></span>
        </ForecastToggleSwitch>
        <ForecastToggleLabel>Include discounts</ForecastToggleLabel>
      </ForecastToggleContainer>
      
      <HelperText>
        Adjust these settings to see how different revenue sources affect your projected revenue.
        Credits add about 12% to forecasted revenue, while discounts add 8%.
      </HelperText>
    </ForecastToggleSection>
  );
};

const ConnectedRevenueComposition = ({ revenueComposition, setRevenueComposition }) => {
  return (
    <ForecastToggleSection>
      <ForecastTitle style={{ marginBottom: '12px' }}>Forecasting</ForecastTitle>
      
      <ForecastToggleContainer>
        <ForecastToggleSwitch>
          <input
            type="checkbox"
            checked={revenueComposition.creditsEnabled}
            onChange={() => setRevenueComposition(prev => ({
              ...prev,
              creditsEnabled: !prev.creditsEnabled
            }))}
          />
          <span></span>
        </ForecastToggleSwitch>
        <ForecastToggleLabel>Include credits</ForecastToggleLabel>
      </ForecastToggleContainer>
      
      <ForecastToggleContainer>
        <ForecastToggleSwitch>
          <input
            type="checkbox"
            checked={revenueComposition.discountsEnabled}
            onChange={() => setRevenueComposition(prev => ({
              ...prev,
              discountsEnabled: !prev.discountsEnabled
            }))}
          />
          <span></span>
        </ForecastToggleSwitch>
        <ForecastToggleLabel>Include discounts</ForecastToggleLabel>
      </ForecastToggleContainer>
      
      <HelperText>
        Adjust these settings to see how different revenue sources affect your projected revenue.
        Credits add about 12% to forecasted revenue, while discounts add 8%.
      </HelperText>
    </ForecastToggleSection>
  );
};

// Update styled components for the benchmark section
const BenchmarkSparklineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0; // Remove gap to create single continuous border
  margin-bottom: 0;
`;

// Grouped container for benchmark section with a single border
const BenchmarkContainer = styled.div`
  margin-bottom: 32px;
  border: 1px solid #E3E8EE;
  border-radius: 8px;
  background: white;
  overflow: hidden;
`;

const BenchmarkSparklineCard = styled.div`
  padding: 16px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
  display: flex;
  flex-direction: column;
  border-right: ${props => props.isLast ? 'none' : '1px solid #E3E8EE'};
  border-bottom: ${props => props.active ? 'none' : '1px solid #E3E8EE'};
  background-color: ${props => props.active ? '#f5f6f7' : 'white'};
  
  &:hover {
    background-color: ${props => props.active ? '#f5f6f7' : '#f9f9f9'};
  }
`;

// Updated styles for benchmark title, value and percentile
const BenchmarkTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

const BenchmarkValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const BenchmarkPercentile = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.trend === 'up' ? TREND_POSITIVE : TREND_NEGATIVE};
  margin-top: -4px;
  display: block;
`;

// Smaller container for sparkline to reduce height
const BenchmarkSparklineContainer = styled.div`
  height: 38px;
  width: 90px;
  margin-left: 8px;
`;

// Updated expanded chart container
const ExpandedMetricContainer = styled.div`
  background: white;
  padding: 20px;
  border-top: none;
`;

// Add the quartile lines color
const QUARTILE_COLOR = '#D8DEE4';

// Create a reusable SectionHeader component
const SectionHeader = ({ id, title, isActive, onOptionsClick, onActionClick, optionsRef }) => {
  return (
    <SectionTitleContainer>
      <SectionTitle>{title}</SectionTitle>
      <MoreOptionsButton onClick={(e) => onOptionsClick(id, e)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="3" r="1.5" fill="#474E5A" />
          <circle cx="8" cy="8" r="1.5" fill="#474E5A" />
          <circle cx="8" cy="13" r="1.5" fill="#474E5A" />
        </svg>
      </MoreOptionsButton>
      {isActive && (
        <SectionOptionsPopover isOpen={true} ref={isActive ? optionsRef : null}>
          <PopoverItem onClick={(e) => onActionClick(id, 'moveUp', e)}>
            Move up
          </PopoverItem>
          <PopoverItem onClick={(e) => onActionClick(id, 'moveDown', e)}>
            Move down
          </PopoverItem>
          <PopoverItem onClick={(e) => onActionClick(id, 'hide', e)}>
            Hide section
          </PopoverItem>
        </SectionOptionsPopover>
      )}
    </SectionTitleContainer>
  );
};

// Add a new styled component for the small anomaly icon
const SmallAnomalyIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 18px;
  padding: 0 4px;
  margin-left: 6px;
  background-color: #f0ecff;
  border-radius: 4px;
  color: ${STRIPE_PURPLE};
  
  svg {
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }
`;

const BillingOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { metrics: standardizedMetrics, getMetricById, getMetricChartData } = useMetrics();
  const [activeTab, setActiveTab] = useState('summary');
  const [activePeriod, setActivePeriod] = useState('last_3_months');
  const [activeInterval, setActiveInterval] = useState('daily');
  const [activeComparison, setActiveComparison] = useState('previous_period');
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    metricId: ''
  });
  const [metricData, setMetricData] = useState([]);
  const { showTooltip, hideTooltip } = useTooltip();
  const [trendingMetrics, setTrendingMetrics] = useState([]);
  // State for forecasting toggles
  const [forecastSettings, setForecastSettings] = useState({
    creditsEnabled: true,
    discountsEnabled: true
  });
  // Add state for active benchmark
  const [activeBenchmark, setActiveBenchmark] = useState('mrr-growth-rate');
  // Add state for section options popover
  const [activeSectionOptions, setActiveSectionOptions] = useState(null);
  // Ref for detecting clicks outside popover
  const sectionOptionsRef = useRef(null);
  
  // State for metrics configuration modal and settings
  const [isConfigureMetricsOpen, setIsConfigureMetricsOpen] = useState(false);
  const [metricsSettings, setMetricsSettings] = useState({
    subtractRecurringDiscounts: false,
    subtractOneTimeDiscounts: true,
    countCanceledSubscriptions: 'immediately',
    countSubscriptionsActive: 'at_subscription_start'
  });

  // Update the anomaly indicator styling to increase spacing and prevent overlap
  const AnomalyIndicator = styled.div`
    position: absolute;
    top: 20px;
    right: 100px; // Increase spacing from the right to avoid overlapping with Explore button
    display: flex;
    align-items: center;
    background-color: #f0ecff;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    color: ${STRIPE_PURPLE};
    z-index: 1; // Ensure it appears above other elements
  `;

  // Update the hasAnomaly function to check specifically for both revenue and usage overage IDs
  const hasAnomaly = (metricId) => {
    // Check for both overage-revenue and usage-overage-revenue IDs
    return metricId === 'overage-revenue' || metricId === 'usage-overage-revenue';
  };

  // Update the generateAnomalyHighlight function to create proper highlighting
  const generateAnomalyHighlight = (chartData, metricId) => {
    if (!hasAnomaly(metricId) || !chartData || !chartData.datasets || 
        !Array.isArray(chartData.datasets) || chartData.datasets.length === 0 || 
        !chartData.labels || !Array.isArray(chartData.labels) || chartData.labels.length === 0) {
      return chartData; // Return the original data, not undefined
    }
    
    // Additional safety check for datasets[0].data
    if (!chartData.datasets[0].data || !Array.isArray(chartData.datasets[0].data) || 
        chartData.datasets[0].data.length === 0) {
      return chartData; // Return the original data if no valid data
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
  };

  // Helper functions for value formatting
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // @deprecated - Use formatCurrency instead, which now displays cents by default
  const formatCurrencyWithCents = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value) => {
    return `${value.toFixed(2)}%`;
  }, []);

  const formatNumber = useCallback((value) => {
    return new Intl.NumberFormat('en-US').format(value);
  }, []);

  // Enhanced tooltip handler for charts
  const handleShowTooltip = useCallback((event, metricId, chartData) => {
    // Safety check for invalid chart data
    if (!chartData || !chartData.datasets || !chartData.datasets.length || 
        !chartData.labels || !Array.isArray(chartData.labels) || chartData.labels.length === 0) {
      console.warn('Invalid chart data structure', chartData);
      return;
    }
    
    // Get the y position, adjusting if too close to the bottom of the window
    let yPosition = event.clientY;
    if (event.clientY > window.innerHeight - 200) {
      yPosition = window.innerHeight - 200;
    }
    
    try {
      // Calculate which data point we're hovering over
      const chartBounds = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - chartBounds.left;
      const chartWidth = chartBounds.width;
      const dataPointWidth = chartWidth / chartData.labels.length;
      const dataIndex = Math.min(
        Math.floor(mouseX / dataPointWidth),
        chartData.labels.length - 1
      );
  
      // Safety check for dataIndex
      if (dataIndex < 0 || dataIndex >= chartData.labels.length) {
        return;
      }
  
      // Get the metric details
      let metric;
      if (metricId === 'total-revenue') {
        metric = {
          id: 'total-revenue',
          title: 'Total Revenue',
          unit: 'currency',
          showCents: true
        };
      } else {
        metric = getMetricById(metricId) || 
                standardizedMetrics[metricId] || 
                { id: metricId, title: 'Metric' };
      }

      // Check if we're dealing with a stacked chart
      const isStacked = chartData && chartData.datasets && chartData.datasets.length > 0 && 
                        chartData.datasets.some(ds => ds.stack !== undefined);
      
      if (isStacked && metricId === 'total-revenue') {
        // For stacked bar charts, show all categories in the tooltip
        let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong>`;
        
        // Process each dataset in the stacked chart
        let hasValidData = false;
        chartData.datasets.forEach(dataset => {
          if (!dataset || !dataset.data || dataIndex >= dataset.data.length) return;
          
          const value = dataset.data[dataIndex];
          if (value > 0) { // Only show non-zero values
            hasValidData = true;
            // Use formatCurrency for all values
            const formattedValue = metric.unit === 'currency' ? 
              formatCurrency(value) : formatNumber(value);
            
            // Determine color based on dataset
            let color;
            if (dataset.label === 'MRR') {
              color = STRIPE_PURPLE;
            } else if (dataset.label === 'Usage revenue') {
              color = USAGE_BLUE;
            } else if (dataset.label === 'Forecasted usage revenue') {
              color = USAGE_BLUE;
            } else {
              color = dataset.borderColor || '#333';
            }
            
            tooltipContent += `<div style="color: ${color};">${dataset.label}: ${formattedValue}</div>`;
          }
        });
        
        if (!hasValidData) return;
        
        // Add the total with cents
        const total = chartData.datasets.reduce((acc, dataset) => {
          if (!dataset || !dataset.data || dataIndex >= dataset.data.length) return acc;
          return acc + (dataset.data[dataIndex] || 0);
        }, 0);
        
        tooltipContent += `<div style="margin-top: 4px; font-weight: 600;">Total: ${formatCurrency(total)}</div>`;
        
        showTooltip(event.clientX, yPosition, tooltipContent, metricId);
      } else {
        // Standard tooltip handling for non-stacked charts
        const currentData = chartData.datasets[0]?.data;
        const previousData = chartData.datasets[1]?.data;
        
        if (!currentData || dataIndex >= currentData.length) return;
        
        const currentValue = currentData[dataIndex];
        if (currentValue === undefined || currentValue === null) return;
        
        const previousValue = previousData && dataIndex < previousData.length ? previousData[dataIndex] : null;
        
        let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong>`;
        
        if (metric.unit === 'currency' || metric.isCurrency) {
          tooltipContent += `<div class="current-value">Current: ${formatCurrency(currentValue)}</div>`;
        } else if (metric.unit === 'percentage') {
          tooltipContent += `<div class="current-value">Current: ${formatPercentage(currentValue)}</div>`;
        } else {
          tooltipContent += `<div class="current-value">Current: ${formatNumber(currentValue)}</div>`;
        }
        
        if (previousValue !== null && previousValue !== undefined) {
          if (metric.unit === 'currency' || metric.isCurrency) {
            tooltipContent += `<div class="previous-value">Previous: ${formatCurrency(previousValue)}</div>`;
          } else if (metric.unit === 'percentage') {
            tooltipContent += `<div class="previous-value">Previous: ${formatPercentage(previousValue)}</div>`;
          } else {
            tooltipContent += `<div class="previous-value">Previous: ${formatNumber(previousValue)}</div>`;
          }
        }
        
        showTooltip(event.clientX, yPosition, tooltipContent, metricId);
      }
    } catch (error) {
      console.error("Error handling tooltip:", error);
    }
  }, [formatCurrency, formatPercentage, formatNumber, getMetricById, showTooltip]);

  // Create a shared throttled tooltip handler for trending metrics
  const throttledShowTooltip = useCallback((e, metricId, chartData) => {
    // Skip if no event or invalid chart data
    if (!e || !e.currentTarget) return;
    
    // Comprehensive safety check for chart data
    if (!chartData || 
        !chartData.datasets || 
        !Array.isArray(chartData.datasets) || 
        chartData.datasets.length === 0 || 
        !chartData.labels || 
        !Array.isArray(chartData.labels) || 
        chartData.labels.length === 0) {
      console.warn('Invalid chart data in throttledShowTooltip', chartData);
      return;
    }
    
    // Check for valid dataset data
    const hasValidData = chartData.datasets.some(dataset => 
      dataset && 
      dataset.data && 
      Array.isArray(dataset.data) && 
      dataset.data.length > 0
    );
    
    if (!hasValidData) {
      console.warn('No valid dataset data in throttledShowTooltip');
      return;
    }
    
    // Use a static variable on the DOM element to prevent refires
    if (!e.currentTarget._tooltipTimestamp || 
        Date.now() - e.currentTarget._tooltipTimestamp > 100) {
      
      e.currentTarget._tooltipTimestamp = Date.now();
      try {
        handleShowTooltip(e, metricId, chartData);
      } catch (error) {
        console.error("Error in throttledShowTooltip:", error);
      }
    }
  }, [handleShowTooltip]);

  // Generate metric chart data
  const generateMetricChartData = useCallback((metric, period, interval, includePrevious = false) => {
    // Default to approximately 30 data points
    let pointCount = 30;
    let labels = [];
    let currentData = [];
    let previousData = [];
    
    // Adjust point count based on interval and period
    if (interval === 'monthly') {
      if (period === 'last_3_months') pointCount = 3;
      else if (period === 'last_6_months') pointCount = 6;
      else if (period === 'last_12_months') pointCount = 12;
      else if (period === 'year_to_date') {
        const today = new Date();
        pointCount = today.getMonth() + 1;
      }
    } else if (interval === 'weekly') {
      if (period === 'last_3_months') pointCount = 12; // ~3 months of weeks
      else if (period === 'last_6_months') pointCount = 24; // ~6 months of weeks
      else if (period === 'last_12_months') pointCount = 52; // ~1 year of weeks
      else if (period === 'year_to_date') {
    const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const diffTime = Math.abs(today - startOfYear);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        pointCount = Math.ceil(diffDays / 7);
      }
    }
    
    // Generate date labels based on interval
      if (interval === 'daily') {
      const today = new Date();
      for (let i = pointCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      } else if (interval === 'weekly') {
      const today = new Date();
      for (let i = pointCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - (i * 7));
        labels.push(`Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
      } else if (interval === 'monthly') {
      const today = new Date();
      for (let i = pointCount - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'long' }));
      }
    }

    // Use metric.id as seed for consistent pseudorandom values
    const generateStableRandomValue = (i, metric) => {
      // Create a deterministic seed based on metric id and index
      const seed = metric.id.charCodeAt(0) + (i * 100);
      // Simple pseudorandom generator with seed
      const random = Math.sin(seed) * 10000;
      return Math.abs(random - Math.floor(random));
    };
    
    // Generate trend data based on metric type with stable random values
    if (metric.id === 'revenue-per-unit') {
      // Special handling for revenue per unit to fluctuate around $0.75
      const baseValue = 0.75;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        // Generate values that fluctuate between $0.65 and $0.85
        const fluctuation = (generateStableRandomValue(i, metric) * 0.2) - 0.1;
        return baseValue + fluctuation;
      });
      
      if (includePrevious) {
        // Previous period data slightly lower
        previousData = currentData.map((val, i) => val * 0.92 * (1 + ((generateStableRandomValue(i + 50, metric) * 0.06) - 0.03)));
      }
    } else if (metric.id === 'net-revenue-retention') {
      // Special handling for net revenue retention to fluctuate around 104.5%
      const baseValue = 104.5;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        // Generate values that fluctuate between 102% and 107%
        const fluctuation = (generateStableRandomValue(i, metric) * 5) - 2.5;
        return baseValue + fluctuation;
      });
      
      if (includePrevious) {
        // Previous period data slightly lower
        previousData = currentData.map((val, i) => val * 0.98 * (1 + ((generateStableRandomValue(i + 50, metric) * 0.04) - 0.02)));
      }
    } else if (metric.isCurrency) {
      // Handle currency metrics - general trend with some volatility
      const baseValue = metric.baseCurrencyValue;
      
      // Generate current data with appropriate trend
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1); // 0 to 1 based on position in timeline
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.05) : 1 - (progress * 0.03);
        const randomFactor = 1 + ((generateStableRandomValue(i, metric) * 0.16) - 0.08);
        return baseValue * trendFactor * randomFactor;
      });
      
      if (includePrevious) {
        // Previous period data - slightly different trend
        const prevTrendMultiplier = metric.trend === 'up' ? 0.92 : 1.05;
        previousData = currentData.map((val, i) => val * prevTrendMultiplier * (1 + ((generateStableRandomValue(i + 50, metric) * 0.1) - 0.05)));
      }
    } else if (metric.id.includes('rate') || metric.unit === 'percentage') {
      // Handle percentage/rate metrics - smaller numbers, less volatility
      const baseValue = metric.baseNumberValue; 
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1);
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.03) : 1 - (progress * 0.02);
        const randomFactor = 1 + ((generateStableRandomValue(i, metric) * 0.1) - 0.05);
        return baseValue * trendFactor * randomFactor;
      });
      
      if (includePrevious) {
        const prevTrendMultiplier = metric.trend === 'up' ? 0.94 : 1.03;
        previousData = currentData.map((val, i) => val * prevTrendMultiplier * (1 + ((generateStableRandomValue(i + 50, metric) * 0.06) - 0.03)));
      }
    } else {
      // Handle count/number metrics
      const baseValue = metric.baseNumberValue;
      
      currentData = new Array(pointCount).fill(0).map((_, i) => {
        const progress = i / (pointCount - 1);
        const trendFactor = metric.trend === 'up' ? 1 + (progress * 0.04) : 1 - (progress * 0.025);
        const randomFactor = 1 + ((generateStableRandomValue(i, metric) * 0.16) - 0.08);
        
        // Round to whole numbers for count metrics
        return Math.round(baseValue * trendFactor * randomFactor);
      });
      
      if (includePrevious) {
        const prevTrendMultiplier = metric.trend === 'up' ? 0.93 : 1.04;
        previousData = currentData.map((val, i) => Math.round(val * prevTrendMultiplier * (1 + ((generateStableRandomValue(i + 50, metric) * 0.1) - 0.05))));
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
  }, []);
  
  // Handle tab change and update URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL with tab parameter without full page reload
    navigate(`/billing/overview?tab=${tab}`, { replace: true });
  };

  // Handle period change from reporting controls
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };
  
  // Handle interval change from reporting controls
  const handleIntervalChange = (interval) => {
    setActiveInterval(interval);
  };
  
  // Handle comparison change from reporting controls
  const handleComparisonChange = (comparison) => {
    setActiveComparison(comparison);
  };

  // Use memoized values from standardized metrics for each tab section
  const baseRevenueMetrics = useMemo(() => [
    standardizedMetrics['mrr'],
    standardizedMetrics['mrr-growth'],
    standardizedMetrics['total-revenue'],
    standardizedMetrics['net-volume'],
    // Add new hybrid MRR metric
    {
      id: 'hybrid-mrr',
      title: 'Hybrid MRR',
      description: 'Monthly recurring revenue from hybrid subscriptions',
      baseCurrencyValue: 32450,
      baseNumberValue: 32450,
      isCurrency: true,
      unit: 'currency',
      trend: 'up',
      trendValue: 3.8
    },
    // Use overage revenue metric from context
    standardizedMetrics['overage-revenue']
  ], [standardizedMetrics]);

  const baseGrowthMetrics = useMemo(() => [
    standardizedMetrics['mrr-growth-rate'],
    standardizedMetrics['subscriber-churn-rate'],
    standardizedMetrics['churned-revenue'],
    standardizedMetrics['gross-mrr-churn-rate'],
    standardizedMetrics['net-mrr-churn-rate'],
    standardizedMetrics['trial-conversion-rate'],
    standardizedMetrics['new-trials'],
    standardizedMetrics['active-trials'],
    standardizedMetrics['converted-trials'],
    // Add net revenue retention metric
    {
      id: 'net-revenue-retention',
      title: 'Net revenue retention',
      description: 'Revenue from existing customers as a percentage of revenue 12 months ago',
      baseCurrencyValue: 0,
      baseNumberValue: 104.5,
      isCurrency: false,
      unit: 'percentage',
      trend: 'up',
      trendValue: 1.8
    }
  ], [standardizedMetrics]);

  const baseSubscribersMetrics = useMemo(() => [
    standardizedMetrics['active-subscribers'],
    standardizedMetrics['active-subscribers-growth'],
    standardizedMetrics['new-subscribers'],
    standardizedMetrics['churned-subscribers'],
    standardizedMetrics['arpu'],
    standardizedMetrics['subscriber-ltv']
  ], [standardizedMetrics]);

  const baseInvoicingMetrics = useMemo(() => [
    standardizedMetrics['invoice-revenue'],
    standardizedMetrics['past-due-invoice-volume'],
    standardizedMetrics['past-due-invoice-payment-rate'],
    standardizedMetrics['avg-invoice-payment-length']
  ], [standardizedMetrics]);

  const baseUsageMetrics = useMemo(() => [
    standardizedMetrics['usage-revenue'],
    standardizedMetrics['usage-count'],
    // Use usage overage revenue metric from context
    standardizedMetrics['usage-overage-revenue'],
    // Add revenue per unit metric
    {
      id: 'revenue-per-unit',
      title: 'Revenue per unit',
      description: 'Average revenue generated per usage unit',
      baseCurrencyValue: 0.75,
      baseNumberValue: 0.75,
      isCurrency: true,
      unit: 'currency',
      showCents: true,
      trend: 'up',
      trendValue: 2.1
    }
  ], [standardizedMetrics]);

  // Check for tab parameter in URL on component mount or when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    
    if (tabParam && ['summary', 'revenue', 'growth', 'subscribers', 'invoicing', 'usage'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Update metrics data when period or interval changes
  useEffect(() => {
    try {
      // Generate updated metrics with chart data based on current active tab
      let metrics = [];
      
      switch (activeTab) {
        case 'revenue':
          metrics = baseRevenueMetrics;
          break;
        case 'growth':
          metrics = baseGrowthMetrics;
          break;
        case 'subscribers':
          metrics = baseSubscribersMetrics;
          break;
        case 'invoicing':
          metrics = baseInvoicingMetrics;
          break;
        case 'usage':
          metrics = baseUsageMetrics;
          break;
        default:
          metrics = baseRevenueMetrics;
      }
      
      // Generate chart data for each metric
      const updatedMetrics = metrics.map(metric => {
        // Generate chart data for the metric
        const chartData = generateMetricChartData(metric, activePeriod, activeInterval, activeComparison !== 'no-comparison');
        
        // Format the display value
        let displayValue;
        if (metric.isCurrency) {
          displayValue = formatCurrency(metric.baseCurrencyValue);
        } else if (metric.unit === 'percentage') {
          displayValue = formatPercentage(metric.baseNumberValue);
        } else {
          displayValue = formatNumber(metric.baseNumberValue);
        }
        
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
  }, [
    activePeriod, 
    activeInterval, 
    activeComparison, 
    activeTab, 
    baseRevenueMetrics,
    baseGrowthMetrics, 
    baseSubscribersMetrics, 
    baseInvoicingMetrics, 
    baseUsageMetrics, 
    generateMetricChartData, 
    formatCurrency, 
    formatPercentage, 
    formatNumber
  ]);

  // Handle metric card click
  const handleMetricClick = useCallback((metric) => {
    const metricId = metric.id;
    
    navigate(`/metrics/${metricId}`, { 
      state: { 
        metric: metric, 
        sourcePage: 'Billing',
        sourceTab: activeTab 
      } 
    });
  }, [navigate, activeTab]);

  // Add handler for Configure metrics button
  const handleConfigureMetrics = useCallback(() => {
    setIsConfigureMetricsOpen(true);
  }, []);

  // Handle saving metrics configuration
  const handleSaveMetricsSettings = useCallback((newSettings) => {
    setMetricsSettings(newSettings);
    console.log('Updated metrics settings:', newSettings);
    // In a real app, this would make a backend call to update settings
  }, []);

  // Handle opening section options popover
  const handleSectionOptionsClick = useCallback((sectionId, event) => {
    event.stopPropagation();
    setActiveSectionOptions(prev => prev === sectionId ? null : sectionId);
  }, []);

  // Handle section actions
  const handleSectionAction = useCallback((sectionId, action, event) => {
    event.stopPropagation();
    console.log(`Section ${sectionId}: ${action}`);
    
    // Close the popover after action
    setActiveSectionOptions(null);
    
    // Implementation would handle actual section movement or hiding
    // For now, just log the action
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sectionOptionsRef.current && !sectionOptionsRef.current.contains(event.target)) {
        setActiveSectionOptions(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate trending metrics for the summary tab
  useEffect(() => {
    // Use overage revenue metric from context
    const overageRevenueMetric = standardizedMetrics['overage-revenue'];
    const subscriberChurnRateMetric = standardizedMetrics['subscriber-churn-rate'];
    const usageRevenueMetric = standardizedMetrics['usage-revenue'];
    
    // Create a stable set of data points with realistic shapes
    const generateStableChartData = (metric) => {
      // Create simple sparkline data with 10 points
      const pointCount = 10;
      const labels = Array.from({ length: pointCount }, (_, i) => `Day ${i+1}`);
      
      // Generate stable random values based on metric ID
      const generateStableRandomValue = (i, metric) => {
        const seed = (metric.id.charCodeAt(0) + i * 100) % 10000;
        return Math.abs(Math.sin(seed)) * 0.5 + 0.5; // Returns value between 0.5 and 1
      };
      
      // Generate data with appropriate trend
      let data;
      const baseValue = metric.isCurrency ? metric.baseCurrencyValue : metric.baseNumberValue;
      
      if (metric.trend === 'up') {
        // Upward trend
        data = Array.from({ length: pointCount }, (_, i) => {
          const progress = i / (pointCount - 1);
          const trendFactor = 0.8 + (progress * 0.4); // 0.8 to 1.2
          const randomFactor = 0.9 + (generateStableRandomValue(i, metric) * 0.2); // 0.9 to 1.1
          return baseValue * trendFactor * randomFactor / 10;
        });
      } else {
        // Downward trend
        data = Array.from({ length: pointCount }, (_, i) => {
          const progress = i / (pointCount - 1);
          const trendFactor = 1.2 - (progress * 0.4); // 1.2 to 0.8
          const randomFactor = 0.9 + (generateStableRandomValue(i, metric) * 0.2); // 0.9 to 1.1
          return baseValue * trendFactor * randomFactor / 10;
        });
      }
      
      return {
        labels,
        datasets: [{
          label: metric.title,
          data,
          borderColor: STRIPE_PURPLE,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }]
      };
    };
    
    // Create metrics with stable chart data
    const stableMetrics = [overageRevenueMetric, subscriberChurnRateMetric, usageRevenueMetric].filter(Boolean).map(metric => {
      const chartData = generateStableChartData(metric);
      
      let displayValue;
      if (metric.isCurrency) {
        displayValue = formatCurrency(metric.baseCurrencyValue);
      } else if (metric.unit === 'percentage') {
        displayValue = formatPercentage(metric.baseNumberValue);
      } else {
        displayValue = formatNumber(metric.baseNumberValue);
      }
      
      const trendSign = metric.trend === 'up' ? '+' : '-';
      const trendDisplay = `${trendSign}${Math.abs(metric.trendValue).toFixed(2)}%`;
      
      return {
        ...metric,
        displayValue,
        trendDisplay,
        chartData
      };
    });
    
    
    setTrendingMetrics(stableMetrics);
  }, [formatCurrency, formatPercentage, formatNumber, activePeriod, activeInterval, activeComparison, getMetricChartData, standardizedMetrics]);

  // Render metric cards for each tab
  const renderMetricCards = useCallback(() => {
    return metricData.map(metric => {
      const showAnomaly = hasAnomaly(metric.id);
      
      // Apply anomaly highlighting to the chart data if needed
      const chartDataWithAnomaly = showAnomaly 
        ? generateAnomalyHighlight(metric.chartData, metric.id)
        : metric.chartData;
      
      return (
        <MetricCard key={metric.id} onClick={() => handleMetricClick(metric)}>
          {showAnomaly && (
            <AnomalyIndicator>
              <SparkleIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 7H21V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SparkleIcon>
              Spiking
            </AnomalyIndicator>
          )}
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
                {metric.trend && (
                  <MetricTrend trend={metric.trend}>
                    {metric.trend === 'up' ? '+' : '-'}{Math.abs(metric.trendValue).toFixed(1)}%
                  </MetricTrend>
                )}
              </MetricValue>
            </MetricValueRow>
          </MetricHeader>
          
          <MetricChartContainer
            onMouseMove={(e) => throttledShowTooltip(e, metric.id, chartDataWithAnomaly)}
            onMouseLeave={hideTooltip}
          >
            <LineChart 
              data={chartDataWithAnomaly}
              height={160} 
              showLegend={false}
              unit={metric.unit}
              disableAnimation={true}
            />
          </MetricChartContainer>
        </MetricCard>
      );
    });
  }, [metricData, handleMetricClick, throttledShowTooltip, hideTooltip, generateAnomalyHighlight]);

  // Render trending metrics for summary tab
  const renderTrendingMetrics = useCallback(() => {
    return trendingMetrics.map(metric => {
      const metricKey = `trending-${metric.id}`;
      const showAnomaly = hasAnomaly(metric.id);
      
      // Add safety check for chart data
      if (!metric.chartData || !metric.chartData.datasets || !metric.chartData.labels) {
        console.warn(`Invalid chart data for trending metric ${metric.id}`);
        return null;
      }
      
      return (
        <TrendingCard key={metricKey} onClick={() => handleMetricClick(metric)}>
          <ExploreAction className="explore-action">
            Explore
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ExploreAction>
          
          <TrendingTitle>
            {metric.title}
            {showAnomaly && (
              <SmallAnomalyIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Spiking
              </SmallAnomalyIcon>
            )}
          </TrendingTitle>
          <TrendingContent>
            <TrendingValueSection>
              <TrendingValue>{metric.displayValue}</TrendingValue>
              <TrendingTrend trend={metric.trend}>{metric.trendDisplay}</TrendingTrend>
            </TrendingValueSection>
            <SparklineContainer
              onMouseMove={(e) => throttledShowTooltip(e, metric.id, metric.chartData)}
              onMouseLeave={hideTooltip}
            >
              <LineChart 
                data={metric.chartData} 
                height={50} 
                showLegend={false}
                showAxes={false}
                unit={metric.unit}
                sparkline={true}
                disableAnimation={true}
              />
            </SparklineContainer>
          </TrendingContent>
        </TrendingCard>
      );
    }).filter(Boolean); // Filter out any null values from invalid chart data
  }, [trendingMetrics, handleMetricClick, throttledShowTooltip, hideTooltip, hasAnomaly]);

  // In the return statement, ensure chart data is properly structured for rendering
  const activityData = useMemo(() => ({
    revenue: [42000, 45000, 48000, 47000, 49000, 52000],
    revenueMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  }), []);
  
  const monthLabels = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], []);
  
  // Create stable stacked bar chart data
  const stableRevenueBarData = useMemo(() => {
    // Generate stable data for the stacked bar chart
    const generateStableBarData = (baseValue) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      // Create stable data points using a deterministic approach
      return months.map((month, i) => {
        // Use month index as seed for stable "random" variation
        const seed = month.charCodeAt(0) + (i * 100);
        const random = Math.abs(Math.sin(seed) * 10000);
        const factor = 0.85 + ((random % 0.3) * 0.3);
        return baseValue * factor;
    });
  };

    const mrrValue = 42500;
    const usageValue = 15800;
    
    // Apply toggle effects to base data
    const applyToggles = (baseData) => {
      let multiplier = 1.0;
      
      // Add approximately 5% for each enabled toggle
      if (forecastSettings.creditsEnabled) {
        multiplier *= 1.05; // 5% increase with credits
      }
      
      if (forecastSettings.discountsEnabled) {
        multiplier *= 1.05; // 5% increase with discounts
      }
      
      // Apply the multiplier to all data points
      return baseData.map(value => value * multiplier);
    };
    
    // Generate baseline data
    const baselineMrrData = generateStableBarData(mrrValue);
    const baselineUsageData = generateStableBarData(usageValue);
    
    // Apply toggle effects to MRR and usage data
    const mrrData = applyToggles(baselineMrrData);
    const usageData = applyToggles(baselineUsageData);
    
    // Create forecasted data (only for last month)
    const forecastedData = Array(6).fill(0);
    const forecastedMRR = Array(6).fill(0);
    
    // For May (current month), calculate forecasted usage revenue
    if (forecastSettings.creditsEnabled || forecastSettings.discountsEnabled) {
      // Calculate a total of about 15% of usage for the forecasted component in current month (May)
      let forecastMultiplier = 0;
      
      if (forecastSettings.creditsEnabled) {
        forecastMultiplier += 0.09; // 9% for credits
      }
      
      if (forecastSettings.discountsEnabled) {
        forecastMultiplier += 0.06; // 6% for discounts
      }
      
      forecastedData[4] = usageData[4] * forecastMultiplier;
      
      // Calculate a total of about 20% of usage for the forecasted component in last month (June)
      forecastMultiplier = 0;
      
      if (forecastSettings.creditsEnabled) {
        forecastMultiplier += 0.12; // 12% for credits
      }
      
      if (forecastSettings.discountsEnabled) {
        forecastMultiplier += 0.08; // 8% for discounts
      }
      
      // For June, set the forecasted usage to the same value as regular usage would be
      // but assign it to forecasted instead
      forecastedData[5] = usageData[5] * (1 + forecastMultiplier);
      
      // For June, also move MRR to forecasted MRR plus add a growth factor
      forecastedMRR[5] = mrrData[5] * 1.05; // 5% growth over the would-be MRR value
    }
    
    // For June (index 5), zero out the regular MRR and usage since it hasn't happened yet
    const finalMrrData = [...mrrData];
    const finalUsageData = [...usageData];
    finalMrrData[5] = 0;
    finalUsageData[5] = 0;
    
    // Calculate total revenue for display in the header (using the last month)
    const totalRevenue = forecastedMRR[5] + forecastedData[5]; // Only forecasted values for June
    const totalTrendPercentage = 5.2 + (forecastSettings.creditsEnabled ? 1.2 : 0) + (forecastSettings.discountsEnabled ? 0.8 : 0);
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'MRR',
          data: finalMrrData,
          backgroundColor: STRIPE_PURPLE,
          borderColor: STRIPE_PURPLE,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          stack: 'stack1'
        },
        {
          label: 'Usage revenue',
          data: finalUsageData,
          backgroundColor: USAGE_BLUE,
          borderColor: USAGE_BLUE,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          stack: 'stack1'
        },
        {
          label: 'Forecasted MRR',
          data: forecastedMRR,
          backgroundColor: 'white',
          borderColor: STRIPE_PURPLE,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          stack: 'stack1'
        },
        {
          label: 'Forecasted usage revenue',
          data: forecastedData,
          backgroundColor: 'white',
          borderColor: USAGE_BLUE,
          borderWidth: 1,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
          stack: 'stack1'
        }
      ],
      totalRevenue,
      totalTrendPercentage
    };
  }, [forecastSettings]);

  // Create benchmark metrics data
  const benchmarkMetrics = useMemo(() => [
    standardizedMetrics['mrr-growth-rate'],
    standardizedMetrics['subscriber-churn-rate'],
    standardizedMetrics['trial-conversion-rate'],
    standardizedMetrics['arpu']
  ], []);
  
  // Generate percentile values for each benchmark metric
  const getPercentileForMetric = useCallback((metricId) => {
    // Realistic percentile values for each metric
    const percentiles = {
      'mrr-growth-rate': '56th',
      'subscriber-churn-rate': '72nd',
      'trial-conversion-rate': '63rd',
      'arpu': '48th'
    };
    
    return percentiles[metricId] || '50th';
  }, []);
  
  // Generate benchmark sparkline data
  const generateBenchmarkSparklineData = useCallback((metric) => {
    // Number of data points for the sparkline
    const pointCount = 12;
    const labels = [];
    
    // Create labels
    for (let i = 0; i < pointCount; i++) {
      labels.push(`P${i+1}`);
    }
    
    // Generate realistic shapes based on metric type
    let data = [];
    const baseValue = metric.isCurrency ? metric.baseCurrencyValue : metric.baseNumberValue;
    
    // Different patterns for different metrics
    if (metric.id === 'mrr-growth-rate') {
      // Upward trend with some volatility
      const pattern = [0.9, 1.0, 0.95, 1.05, 1.1, 1.05, 1.15, 1.1, 1.2, 1.25, 1.3, 1.35];
      data = pattern.map(factor => baseValue * factor);
    } 
    else if (metric.id === 'subscriber-churn-rate') {
      // Downward trend (good for churn rate)
      const pattern = [1.1, 1.05, 1.0, 0.95, 1.0, 0.9, 0.92, 0.88, 0.85, 0.82, 0.8, 0.78];
      data = pattern.map(factor => baseValue * factor);
    }
    else if (metric.id === 'trial-conversion-rate') {
      // Gradual improvement
      const pattern = [0.85, 0.87, 0.9, 0.88, 0.92, 0.94, 0.93, 0.95, 0.98, 0.97, 1.0, 1.02];
      data = pattern.map(factor => baseValue * factor);
    }
    else if (metric.id === 'arpu') {
      // Slight upward trend
      const pattern = [0.95, 0.97, 0.98, 0.96, 0.99, 1.0, 1.02, 1.01, 1.03, 1.04, 1.05, 1.07];
      data = pattern.map(factor => baseValue * factor);
    }
    else {
      // Default pattern for any other metrics
      const pattern = Array(pointCount).fill(0).map((_, i) => 0.8 + (i * 0.03));
      data = pattern.map(factor => baseValue * factor);
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          borderColor: STRIPE_PURPLE,
          backgroundColor: 'transparent',
          tension: 0.2,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 1.5
        }
      ]
    };
  }, []);
  
  // Generate expanded chart data with quartile lines
  const generateExpandedChartData = useCallback((metric) => {
    const baseData = generateMetricChartData(metric, 'last_3_months', 'daily', false);
    const currentData = baseData.datasets[0].data;
    
    // Generate quartile data based on the current data
    const topQuartile = currentData.map(val => val * 1.3); // 25% higher
    const median = currentData.map(val => val * 1.1);      // 10% higher
    const bottomQuartile = currentData.map(val => val * 0.8); // 20% lower
    
    // Add quartile datasets
    baseData.datasets = [
      {
        ...baseData.datasets[0],
        label: 'Your Company',
        borderColor: STRIPE_PURPLE,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Top Quartile',
        data: topQuartile,
        borderColor: QUARTILE_COLOR,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [5, 5]
      },
      {
        label: 'Median',
        data: median,
        borderColor: GRAY,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [5, 5]
      },
      {
        label: 'Bottom Quartile',
        data: bottomQuartile,
        borderColor: QUARTILE_COLOR,
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [5, 5]
      }
    ];
    
    return baseData;
  }, [generateMetricChartData]);
  
  // Enhanced tooltip handler for expanded benchmark charts
  const handleBenchmarkTooltip = useCallback((event, metricId, chartData) => {
    let yPosition = event.clientY;
    if (event.clientY > window.innerHeight - 250) {
      yPosition = window.innerHeight - 250;
    }
    
    // Find the closest data point to the mouse position
    const chartBounds = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - chartBounds.left;
    const chartWidth = chartBounds.width;
    
    // Calculate which data point is closest
    const dataPointWidth = chartWidth / chartData.labels.length;
    const dataIndex = Math.min(
      Math.floor(mouseX / dataPointWidth),
      chartData.labels.length - 1
    );
    
    if (dataIndex < 0) {
      return;
    }
    
    const metric = getMetricById(metricId) || 
                  standardizedMetrics[metricId] || 
                  { id: metricId, title: 'Metric' };
    
    // Get values for all quartiles and company data
    const companyData = chartData.datasets[0].data[dataIndex];
    const topQuartileData = chartData.datasets[1].data[dataIndex];
    const medianData = chartData.datasets[2].data[dataIndex];
    const bottomQuartileData = chartData.datasets[3].data[dataIndex];
    
    // Format values based on metric type
    let formattedCompany, formattedTop, formattedMedian, formattedBottom;
    
    if (metric.isCurrency) {
      formattedCompany = formatCurrency(companyData);
      formattedTop = formatCurrency(topQuartileData);
      formattedMedian = formatCurrency(medianData);
      formattedBottom = formatCurrency(bottomQuartileData);
    } else if (metric.unit === 'percentage') {
      formattedCompany = formatPercentage(companyData);
      formattedTop = formatPercentage(topQuartileData);
      formattedMedian = formatPercentage(medianData);
      formattedBottom = formatPercentage(bottomQuartileData);
    } else {
      formattedCompany = formatNumber(companyData);
      formattedTop = formatNumber(topQuartileData);
      formattedMedian = formatNumber(medianData);
      formattedBottom = formatNumber(bottomQuartileData);
    }
    
    // Create updated tooltip with custom format
    let tooltipContent = `<strong>${chartData.labels[dataIndex]}</strong>`;
    
    // Add color square and category label for each quartile
    tooltipContent += `
      <div style="display: flex; align-items: center; margin-top: 4px;">
        <div style="width: 8px; height: 8px; background-color: ${STRIPE_PURPLE}; border-radius: 2px; margin-right: 6px;"></div>
        <div style="color: var(--text-color);">You (${getPercentileForMetric(metricId)})</div>
        <div style="margin-left: auto; color: var(--text-color);">${formattedCompany}</div>
      </div>
      <div style="display: flex; align-items: center; margin-top: 4px;">
        <div style="width: 8px; height: 8px; background-color: ${QUARTILE_COLOR}; border-radius: 2px; margin-right: 6px;"></div>
        <div style="color: var(--text-color);">Top 25%</div>
        <div style="margin-left: auto; color: var(--text-color);">${formattedTop}</div>
      </div>
      <div style="display: flex; align-items: center; margin-top: 4px;">
        <div style="width: 8px; height: 8px; background-color: ${GRAY}; border-radius: 2px; margin-right: 6px;"></div>
        <div style="color: var(--text-color);">Median 50%</div>
        <div style="margin-left: auto; color: var(--text-color);">${formattedMedian}</div>
      </div>
      <div style="display: flex; align-items: center; margin-top: 4px;">
        <div style="width: 8px; height: 8px; background-color: ${QUARTILE_COLOR}; border-radius: 2px; margin-right: 6px;"></div>
        <div style="color: var(--text-color);">Bottom 25%</div>
        <div style="margin-left: auto; color: var(--text-color);">${formattedBottom}</div>
      </div>
    `;
    
    showTooltip(event.clientX, yPosition, tooltipContent, metricId);
  }, [formatCurrency, formatPercentage, formatNumber, getMetricById, showTooltip, getPercentileForMetric]);
  
  // Prepare benchmark metrics with sparkline and expanded chart data
  const benchmarkMetricsWithData = useMemo(() => {
    return benchmarkMetrics.map(metric => {
      const sparklineData = generateBenchmarkSparklineData(metric);
      const expandedChartData = generateExpandedChartData(metric);
      
      let displayValue;
      if (metric.isCurrency) {
        displayValue = formatCurrency(metric.baseCurrencyValue);
      } else if (metric.unit === 'percentage') {
        displayValue = formatPercentage(metric.baseNumberValue);
      } else {
        displayValue = formatNumber(metric.baseNumberValue);
      }
      
      // Use percentile instead of trend
      const percentile = getPercentileForMetric(metric.id);
      
      return {
        ...metric,
        displayValue,
        percentile: `${percentile} pct`,
        sparklineData,
        expandedChartData
      };
    });
  }, [benchmarkMetrics, generateBenchmarkSparklineData, generateExpandedChartData, formatCurrency, formatPercentage, formatNumber, getPercentileForMetric]);
  
  // Render benchmark sparklines - update to use new styled components
  const renderBenchmarkSparklines = useCallback(() => {
    return benchmarkMetricsWithData.map((metric, index) => {
      const isActive = activeBenchmark === metric.id;
      const isLast = index === benchmarkMetricsWithData.length - 1;

          return (
        <BenchmarkSparklineCard 
          key={metric.id} 
          active={isActive}
          isLast={isLast}
          onClick={() => setActiveBenchmark(isActive ? null : metric.id)}
        >
          <BenchmarkTitle>{metric.title}</BenchmarkTitle>
          <TrendingContent>
            <div>
              <BenchmarkValue>{metric.displayValue}</BenchmarkValue>
              <BenchmarkPercentile trend="up">{metric.percentile}</BenchmarkPercentile>
            </div>
            <BenchmarkSparklineContainer>
              <LineChart 
                data={metric.sparklineData} 
                height={38} 
                showLegend={false}
                showAxes={false}
                unit={metric.unit}
                sparkline={true}
                type="line"
              />
            </BenchmarkSparklineContainer>
          </TrendingContent>
        </BenchmarkSparklineCard>
      );
    });
  }, [benchmarkMetricsWithData, activeBenchmark]);
  
  // Render expanded benchmark chart - update to increase height by 50%
  const renderExpandedBenchmarkChart = useCallback(() => {
    if (!activeBenchmark) return null;
    
    const selectedMetric = benchmarkMetricsWithData.find(m => m.id === activeBenchmark);
    if (!selectedMetric) return null;
    
    return (
      <ExpandedMetricContainer>
          <MetricChartContainer 
          onMouseMove={(e) => handleBenchmarkTooltip(e, selectedMetric.id, selectedMetric.expandedChartData)}
          onMouseLeave={hideTooltip}
          >
            <LineChart 
            data={selectedMetric.expandedChartData} 
            height={270} // Increased by 50% from 180px
              showLegend={false}
            unit={selectedMetric.unit}
            />
          </MetricChartContainer>
      </ExpandedMetricContainer>
    );
  }, [activeBenchmark, benchmarkMetricsWithData, handleBenchmarkTooltip, hideTooltip]);

  // Create modal components for the Configure Metrics dialog
  const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
    padding-top: 100px;
  `;

  const ModalDialog = styled.div`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 650px;
    padding: 24px;
    position: relative;
  `;

  const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  `;

  const ModalTitle = styled.h2`
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  `;

  const CloseButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `;

  const ModalSection = styled.div`
    margin-bottom: 32px;
  `;

  const ModalSectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
  `;

  const SectionDescription = styled.p`
    font-size: 14px;
    color: #666;
    margin: 0 0 16px 0;
  `;

  const LearnMoreLink = styled.a`
    color: ${STRIPE_PURPLE};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  `;

  const ToggleOption = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  `;

  const ModalToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    margin-right: 12px;
    
    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    span {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e3e8ee;
      transition: .3s;
      border-radius: 34px;
      
      &:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
    }
    
    input:checked + span {
      background-color: ${STRIPE_PURPLE};
    }
    
    input:checked + span:before {
      transform: translateX(20px);
    }
  `;

  const ModalToggleLabel = styled.span`
    font-size: 15px;
  `;

  const InfoIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid #aaa;
    color: #666;
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
    cursor: help;
  `;

  // Update the SelectWrapper and related components for inline layout
  const SelectWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  `;

  const SelectLabel = styled.div`
    font-size: 15px;
    margin-right: 16px;
    white-space: nowrap;
  `;

  const StyledSelect = styled.div`
    position: relative;
    width: auto;
    min-width: 180px;
    flex-shrink: 0;
  `;

  const SelectButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    background-color: white;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    
    svg {
      margin-left: 8px;
    }
  `;

  const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 24px;
    gap: 12px;
  `;

  const CancelButton = styled.button`
    padding: 10px 16px;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    background-color: white;
    font-size: 14px;
    cursor: pointer;
    
    &:hover {
      background-color: #f7f9fc;
    }
  `;

  // Update the ApplyButton styling
  const ApplyButton = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background-color: ${STRIPE_PURPLE};
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      filter: brightness(0.95);
    }
  `;

  // Add dropdown menu component for selects
  const SelectDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
    border: 1px solid #e3e8ee;
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
    
    ${props => props.selected && `
      background-color: ${STRIPE_PURPLE_LIGHT};
      color: ${STRIPE_PURPLE};
      font-weight: 500;
    `}
  `;

  // ConfigureMetricsModal component
  const ConfigureMetricsModal = ({ isOpen, onClose, settings, onSave }) => {
    // Local state for form fields - move this BEFORE the conditional return
    const [localSettings, setLocalSettings] = useState({ ...settings });
    // State for tracking which dropdown is open
    const [openDropdown, setOpenDropdown] = useState(null);
    
    // Close dropdowns when clicking outside - MOVE BEFORE THE CONDITIONAL RETURN
    useEffect(() => {
      if (!isOpen) return;
      
      const handleClickOutside = (event) => {
        if (openDropdown && !event.target.closest('.select-container')) {
          setOpenDropdown(null);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, openDropdown]);
    
    if (!isOpen) return null;
    
    const handleToggleChange = (field) => {
      setLocalSettings({
        ...localSettings,
        [field]: !localSettings[field]
      });
    };
    
    const handleDropdownToggle = (dropdownName) => {
      setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };
    
    const handleDropdownSelect = (field, value) => {
      setLocalSettings({
        ...localSettings,
        [field]: value
      });
      setOpenDropdown(null);
    };
    
    const handleApply = () => {
      onSave(localSettings);
      onClose();
    };
    
    // Define dropdown options
    const canceledSubscriptionsOptions = [
      { value: 'immediately', label: 'Immediately' },
      { value: 'billing_period_end', label: 'At the billing period end' }
    ];
    
    const subscriptionsActiveOptions = [
      { value: 'at_subscription_start', label: 'At the subscription start' },
      { value: 'first_payment_received', label: 'When the first payment is received' }
    ];

        return (
      <ModalOverlay onClick={onClose}>
        <ModalDialog onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Configure metric calculations</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
          
          <ModalSection>
            <ModalSectionTitle>Metrics calculation</ModalSectionTitle>
            <SectionDescription>
              Changes will only affect MRR and churn metrics, and will reflect in 24-48 hours. <LearnMoreLink href="#">Learn More</LearnMoreLink>
            </SectionDescription>
            
            <ToggleOption>
              <ModalToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={localSettings.subtractRecurringDiscounts} 
                  onChange={() => handleToggleChange('subtractRecurringDiscounts')}
                />
                <span></span>
              </ModalToggleSwitch>
              <ModalToggleLabel>Subtract recurring discounts from MRR</ModalToggleLabel>
              <InfoIcon>?</InfoIcon>
            </ToggleOption>
            
            <ToggleOption>
              <ModalToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={localSettings.subtractOneTimeDiscounts} 
                  onChange={() => handleToggleChange('subtractOneTimeDiscounts')}
                />
                <span></span>
              </ModalToggleSwitch>
              <ModalToggleLabel>Subtract one-time discounts from MRR</ModalToggleLabel>
            </ToggleOption>
            
            <SelectWrapper>
              <SelectLabel>Count canceled subscriptions as churn</SelectLabel>
              <StyledSelect className="select-container">
                <SelectButton onClick={() => handleDropdownToggle('canceled')}>
                  {canceledSubscriptionsOptions.find(opt => opt.value === localSettings.countCanceledSubscriptions)?.label || 'Immediately'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SelectButton>
                <SelectDropdown isOpen={openDropdown === 'canceled'}>
                  {canceledSubscriptionsOptions.map(option => (
                    <DropdownItem 
                      key={option.value}
                      selected={localSettings.countCanceledSubscriptions === option.value}
                      onClick={() => handleDropdownSelect('countCanceledSubscriptions', option.value)}
                    >
                      {option.label}
                    </DropdownItem>
                  ))}
                </SelectDropdown>
              </StyledSelect>
            </SelectWrapper>
            
            <SelectWrapper>
              <SelectLabel>Count subscriptions as active</SelectLabel>
              <StyledSelect className="select-container">
                <SelectButton onClick={() => handleDropdownToggle('active')}>
                  {subscriptionsActiveOptions.find(opt => opt.value === localSettings.countSubscriptionsActive)?.label || 'At the subscription start'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SelectButton>
                <SelectDropdown isOpen={openDropdown === 'active'}>
                  {subscriptionsActiveOptions.map(option => (
                    <DropdownItem 
                      key={option.value}
                      selected={localSettings.countSubscriptionsActive === option.value}
                      onClick={() => handleDropdownSelect('countSubscriptionsActive', option.value)}
                    >
                      {option.label}
                    </DropdownItem>
                  ))}
                </SelectDropdown>
              </StyledSelect>
            </SelectWrapper>
          </ModalSection>
          
          <ModalFooter>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <ApplyButton onClick={handleApply}>Apply</ApplyButton>
          </ModalFooter>
        </ModalDialog>
      </ModalOverlay>
    );
  };

  const SparkleIcon = styled.span`
    display: inline-flex;
    margin-right: 6px;
    svg {
      width: 14px;
      height: 14px;
    }
  `;

  return (
    <PageContainer>
      <HeaderContainer>
        <Title>Billing Overview</Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ConfigureMetricsButton onClick={handleConfigureMetrics}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.25 1C7.25 0.586 7.586 0.25 8 0.25C8.414 0.25 8.75 0.586 8.75 1V1.634C9.704 1.748 10.608 2.079 11.408 2.592L11.834 2.166C12.129 1.871 12.605 1.871 12.9 2.166C13.196 2.462 13.196 2.937 12.9 3.232L12.475 3.658C12.988 4.458 13.319 5.362 13.433 6.316L14 6.316C14.414 6.316 14.75 6.652 14.75 7.066C14.75 7.48 14.414 7.816 14 7.816H13.433C13.319 8.77 12.988 9.674 12.475 10.474L12.9 10.9C13.196 11.196 13.196 11.671 12.9 11.966C12.605 12.262 12.129 12.262 11.834 11.966L11.408 11.54C10.608 12.054 9.704 12.384 8.75 12.498V13.132C8.75 13.546 8.414 13.882 8 13.882C7.586 13.882 7.25 13.546 7.25 13.132V12.498C6.296 12.384 5.392 12.054 4.592 11.54L4.166 11.966C3.871 12.262 3.395 12.262 3.1 11.966C2.804 11.671 2.804 11.196 3.1 10.9L3.525 10.474C3.012 9.674 2.681 8.77 2.567 7.816H2C1.586 7.816 1.25 7.48 1.25 7.066C1.25 6.652 1.586 6.316 2 6.316H2.567C2.681 5.362 3.012 4.458 3.525 3.658L3.1 3.232C2.804 2.937 2.804 2.462 3.1 2.166C3.395 1.871 3.871 1.871 4.166 2.166L4.592 2.592C5.392 2.079 6.296 1.748 7.25 1.634V1Z" stroke="#474E5A" stroke-width="1.3"/>
              <circle cx="8" cy="7" r="2" stroke="#474E5A" stroke-width="1.3"/>
            </svg>
            Configure metrics
          </ConfigureMetricsButton>
          </div>
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
          active={activeTab === 'growth'} 
          onClick={() => handleTabChange('growth')}
        >
          Growth
        </Tab>
        <Tab 
          active={activeTab === 'subscribers'} 
          onClick={() => handleTabChange('subscribers')}
        >
          Subscribers
        </Tab>
        <Tab 
          active={activeTab === 'invoicing'} 
          onClick={() => handleTabChange('invoicing')}
        >
          Invoicing
        </Tab>
        <Tab 
          active={activeTab === 'usage'} 
          onClick={() => handleTabChange('usage')}
        >
          Usage
        </Tab>
      </TabsContainer>

      {/* Configure Metrics Modal */}
      <ConfigureMetricsModal 
        isOpen={isConfigureMetricsOpen}
        onClose={() => setIsConfigureMetricsOpen(false)}
        settings={metricsSettings}
        onSave={handleSaveMetricsSettings}
      />

      {/* Only show controls when not on summary tab */}
      {activeTab !== 'summary' && (
        <ControlsContainer>
          <ReportingControls 
            initialPeriod={activePeriod}
            initialInterval={activeInterval}
            initialComparison={activeComparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
          />
          <PlanFilter />
        </ControlsContainer>
      )}
      
      {activeTab === 'summary' && (
        <>
          {/* Add PlanFilter at the top of the summary tab */}
          <div style={{ marginBottom: '24px' }}>
            <PlanFilter />
          </div>
          
          <SectionHeader 
            id="trending-metrics"
            title="Trending metrics"
            isActive={activeSectionOptions === 'trending-metrics'}
            onOptionsClick={handleSectionOptionsClick}
            onActionClick={handleSectionAction}
            optionsRef={sectionOptionsRef}
          />
          {trendingMetrics.length > 0 ? (
            <TrendingGrid>
              {renderTrendingMetrics()}
            </TrendingGrid>
          ) : (
            <EmptySection>
              <div style={{ padding: "20px", textAlign: "center" }}>
                Loading trending metrics...
              </div>
            </EmptySection>
          )}
          
          <SectionHeader 
            id="benchmarks"
            title="Benchmarks"
            isActive={activeSectionOptions === 'benchmarks'}
            onOptionsClick={handleSectionOptionsClick}
            onActionClick={handleSectionAction}
            optionsRef={sectionOptionsRef}
          />
          <BenchmarkContainer>
            <BenchmarkSparklineGrid>
              {renderBenchmarkSparklines()}
            </BenchmarkSparklineGrid>
            
            {activeBenchmark && renderExpandedBenchmarkChart()}
          </BenchmarkContainer>
          
          <SectionHeader 
            id="forecasting"
            title="Forecasting revenue"
            isActive={activeSectionOptions === 'forecasting'}
            onOptionsClick={handleSectionOptionsClick}
            onActionClick={handleSectionAction}
            optionsRef={sectionOptionsRef}
          />
          <TwoColumnLayout>
            <div>
              <StaticMetricCard>
                <MetricHeader>
                  <MetricTitle>Total revenue</MetricTitle>
                  <MetricValue>
                    {formatCurrency(stableRevenueBarData.totalRevenue)}
                    <MetricTrend trend="up">+{stableRevenueBarData.totalTrendPercentage.toFixed(2)}%</MetricTrend>
                  </MetricValue>
                </MetricHeader>
        <ChartContainer
                  onMouseMove={(e) => throttledShowTooltip(e, 'total-revenue', stableRevenueBarData)}
          onMouseLeave={hideTooltip}
        >
          <BarChart
                    data={stableRevenueBarData} 
            height={180}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    borderDash: [3, 3]
                  },
                  ticks: {
                    callback: function(value) {
                        return '$' + (value >= 1000 ? (value / 1000) + 'k' : value);
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: false
                }
              }
            }}
          />
        </ChartContainer>
                {/* Add the legend */}
        <Legend>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: STRIPE_PURPLE }} />
                    <LegendLabel>MRR</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: USAGE_BLUE }} />
                    <LegendLabel>Usage revenue</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: 'white', border: `1px solid ${STRIPE_PURPLE}` }} />
                    <LegendLabel>Forecasted MRR</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: 'white', border: `1px solid ${USAGE_BLUE}` }} />
                    <LegendLabel>Forecasted usage revenue</LegendLabel>
                  </LegendItem>
        </Legend>
              </StaticMetricCard>
            </div>
            <div>
              <ConnectedForecasting 
                forecastSettings={forecastSettings}
                setForecastSettings={setForecastSettings}
              />
            </div>
          </TwoColumnLayout>
        </>
      )}
      
      {activeTab !== 'summary' && (
        metricData.length > 0 ? (
          <MetricsGrid>
            {renderMetricCards()}
          </MetricsGrid>
        ) : (
          <EmptySection>
            <div style={{ padding: "20px", textAlign: "center" }}>
              Loading {activeTab} metrics...
            </div>
          </EmptySection>
        )
      )}
    </PageContainer>
  );
};

export default BillingOverview;
