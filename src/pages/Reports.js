import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import LineChart from '../components/LineChart';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// Styled components
const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 24px 44px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin-bottom: 0;
`;

const NewButton = styled.button`
  background-color: #635bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
  }
  
  &:hover {
    background-color: #5a51e5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
`;

const ManageGroupsButton = styled.button`
  background-color: white;
  color: #424770;
  border: 1px solid #e6ebf1;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  
  svg {
    margin-right: 6px;
  }
  
  &:hover {
    background-color: #f7fafc;
  }
`;

const ButtonBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
  color: #656d76;
  border: 1px solid #d1d9e0;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 6px;
  min-width: 16px;
  height: 16px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
`;

const ChevronIcon = styled.span`
  display: inline-flex;
  margin-right: 8px;
  transition: transform 0.2s ease;
  transform: ${props => props.expanded ? 'rotate(0deg)' : 'rotate(-90deg)'};
  position: absolute;
  left: -20px;
`;

const CarouselControls = styled.div`
  display: flex;
  gap: 8px;
`;

const CarouselButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const TrendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
`;

const HighlightCard = styled.div`
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  padding: 16px 20px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #697386;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const TrendIndicator = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
  margin-left: 8px;
`;

const FiltersRow = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  gap: 12px;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.outlined ? 'transparent' : 'white'};
  border: 1px ${props => props.outlined ? 'dashed' : 'solid'} #e3e8ee;
  border-radius: 20px;
  font-size: 14px;
  color: ${props => props.active ? '#635bff' : '#697386'};
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #d7dfe8;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
  color: ${props => props.active ? '#635bff' : '#697386'};
`;

const PlusIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 6px;
  color: #697386;
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
  border: 1px solid #e3e8ee;
`;

const PopoverItem = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  &.active {
    background-color: #f7f9fc;
    color: #6772e5;
    font-weight: 500;
  }
`;

const ManageDataPopover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  padding: 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
  border: 1px solid #e3e8ee;
`;

const ManageDataItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f3f6;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const ManageDataHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ManageDataTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1a1f36;
`;

const ManageDataActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ManageDataSync = styled.div`
  display: flex;
  align-items: center;
  color: #697386;
  cursor: pointer;
  
  &:hover {
    color: #424770;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  
  &:hover::after {
    content: 'Status: Good';
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background-color: #1a1f36;
    color: white;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1001;
    pointer-events: none;
  }
  
  &:hover::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    border: 3px solid transparent;
    border-top-color: #1a1f36;
    z-index: 1001;
    pointer-events: none;
  }
`;

const ManageDataMeta = styled.div`
  font-size: 12px;
  color: #697386;
  margin-top: 2px;
  text-align: left;
`;

const ReportsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e3e8ee;
  
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const TableHead = styled.thead`
  background-color: #f9fafc;
  border-bottom: 1px solid #e3e8ee;
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: ${props => props.sorted ? '600' : 'normal'};
  color: #6b7c93;
  position: relative;
  cursor: pointer;
  
  svg {
    margin-left: 4px;
    vertical-align: middle;
  }
`;

const SparklineHeaderCell = styled(TableHeaderCell)`
  max-width: 120px;
  width: 120px;
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1a1f36;
  border-bottom: 1px solid #e3e8ee;
  font-weight: ${props => props.sorted ? '600' : 'normal'};
`;

const ActionColumn = styled.td`
  padding: 16px;
  text-align: right;
  border-bottom: 1px solid #e3e8ee;
  color: #1a1f36;
`;

const PinColumn = styled.td`
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #e3e8ee;
  width: 40px;
  color: #1a1f36;
`;

const PinButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${props => props.pinned ? '#635bff' : '#6b7c93'};
  
  &:hover {
    color: ${props => props.pinned ? '#5a51e5' : '#4f5e7b'};
    background-color: #f7f9fc;
  }
`;

const OptionsDots = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #1a1f36;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const DateColumn = styled(TableCell)`
  color: #1a1f36;
  font-weight: ${props => props.sorted ? '600' : 'normal'};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  color: #697386;
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background-color: #f7f9fc;
  }
`;

// New styled component for sparkline
const SparklineCell = styled(TableCell)`
  max-width: 120px;
  width: 120px;
  height: 40px;
  padding: 8px 16px;
  box-sizing: border-box;
  color: #1a1f36;
`;

// Add new styled components for the Value and Change columns
const ValueCell = styled(TableCell)`
  color: #1a1f36;
  font-weight: ${props => props.sorted ? '600' : 'normal'};
`;

const ChangeCell = styled(TableCell)`
  color: #1a1f36;
  font-weight: ${props => props.sorted ? '600' : 'normal'};
`;

// New trending components based on BillingOverview
const TrendingCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #e3e8ee;
  height: 90px;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    
    .explore-action {
      opacity: 1;
    }
  }
`;

const TrendingExploreAction = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  color: #635bff;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

const TrendingTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #697386;
`;

const TrendingContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TrendingValueSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TrendingValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrendingValue = styled.div`
  font-size: 20px;
  font-weight: 600;
`;

const TrendingTrend = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
`;

const SparklineContainer = styled.div`
  height: 30px;
  width: 90px;
  margin-left: 8px;
  flex-shrink: 0;
`;

const ExploreAction = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  color: #635bff;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

// Pinned grid components (matching home page structure)
const PinnedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  ${props => !props.expanded && `
    overflow: hidden;
    max-height: 450px;
  `}
`;

const PinnedMetricCard = styled.div`
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

const PinnedExploreAction = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  color: #635bff;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

const PinnedIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(99, 91, 255, 0.05);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #635bff;
  margin-top: 12px;
  width: fit-content;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const PinnedMetricHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const PinnedMetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #697386;
  margin: 0 0 4px 0;
`;

const PinnedMetricValueRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const PinnedMetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const PinnedMetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
  white-space: nowrap;
  font-weight: 500;
  margin-left: 8px;
`;

const PinnedMetricChartContainer = styled.div`
  flex-grow: 1;
  min-height: 160px;
  margin-top: auto;
  margin-bottom: 8px;
  position: relative;
`;

// Gradient overlay and show all components
const PinnedGridContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 1) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 24px;
  pointer-events: none;
  z-index: 10;
`;

const ShowAllButton = styled.button`
  background: white;
  color: #635bff;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f7fafc;
    border-color: #635bff;
  }
`;

// Weekly section components (similar to pinned but without pin indicators)
const WeeklyGridContainer = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

const WeeklyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  ${props => !props.expanded && `
    overflow: hidden;
    max-height: 450px;
  `}
`;

const WeeklyMetricCard = styled.div`
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

const WeeklyExploreAction = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  color: #635bff;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

const WeeklyMetricHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const WeeklyMetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #697386;
  margin: 0 0 4px 0;
`;

const WeeklyMetricValueRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const WeeklyMetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const WeeklyMetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
  white-space: nowrap;
  font-weight: 500;
  margin-left: 8px;
`;

const WeeklyMetricChartContainer = styled.div`
  flex-grow: 1;
  min-height: 160px;
  margin-top: auto;
  margin-bottom: 8px;
  position: relative;
`;

// Drafts section components (similar to weekly but only 3 charts, no show all)
const DraftsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
`;

const DraftsMetricCard = styled.div`
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

const DraftsExploreAction = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  color: #635bff;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  svg {
    margin-left: 4px;
  }
`;

const DraftsMetricHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const DraftsMetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #697386;
  margin: 0 0 4px 0;
`;

const DraftsMetricValueRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const DraftsMetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const DraftsMetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
  white-space: nowrap;
  font-weight: 500;
  margin-left: 8px;
`;

const DraftsMetricChartContainer = styled.div`
  flex-grow: 1;
  min-height: 160px;
  margin-top: auto;
  margin-bottom: 8px;
  position: relative;
`;

const DraftsPlaceholder = styled.div`
  background: #f8f9fa;
  border: 2px dashed #e3e8ee;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #697386;
  
  svg {
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const PlaceholderText = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
`;

// Sample data
const trendingReports = [
  { id: 'churn-risk', title: 'Churn risk', value: '413', trend: 3.5, isNegative: true, sparklineData: [25, 22, 20, 18, 16, 15, 14] },
  { id: 'upsell-opportunities', title: 'Upsell opportunities', value: '875', trend: 6.7, isNegative: false, sparklineData: [30, 35, 40, 45, 50, 55, 60] },
  { id: 'revenue-composition', title: 'Revenue composition', value: '$56.4K', trend: 0.4, isNegative: false, sparklineData: [15, 17, 15, 14, 13, 15, 16] },
  { id: 'new-free-trials', title: 'New free trials', value: '1.5K', trend: 2.3, isNegative: false, sparklineData: [12, 13, 14, 14, 15, 15, 16] }
];

const reportsList = [
  { id: 'high-usage-growth', title: 'High usage growth', creator: 'You', dateCreated: 'Apr 17, 2025', lastUpdated: 'Today', sparklineData: [12, 19, 13, 15, 20, 18, 25], value: '276', trend: 39.4, isNegative: false },
  { id: 'monthly-sales', title: 'Monthly sales', creator: 'kate@example.com', dateCreated: 'Mar 7, 2025', lastUpdated: 'Yesterday', sparklineData: [24, 20, 25, 22, 21, 18, 19], value: '$156.8K', trend: -5.3, isNegative: true },
  { id: 'new-subscribers', title: 'New subscribers past 7 days', creator: 'You', dateCreated: 'Mar 6, 2025', lastUpdated: 'Today', sparklineData: [8, 9, 12, 14, 15, 18, 21], value: '128', trend: 162.5, isNegative: false },
  { id: 'revenue-composition', title: 'Revenue composition', creator: 'Stripe', dateCreated: 'Jan 19, 2025', lastUpdated: 'Today', sparklineData: [15, 17, 15, 14, 13, 15, 16], value: '$56.4K', trend: 0.4, isNegative: false },
  { id: 'weekly-churned', title: 'Weekly churned subscribers', creator: 'You', dateCreated: 'Nov 22, 2024', lastUpdated: 'May 5, 2025', sparklineData: [22, 19, 18, 16, 14, 12, 10], value: '54', trend: -54.5, isNegative: false },
  { id: 'top-selling', title: 'Top selling products of the week', creator: 'kate@example.com', dateCreated: 'Nov 22, 2024', lastUpdated: 'May 1, 2025', sparklineData: [10, 12, 14, 16, 18, 20, 22], value: '215', trend: 120.0, isNegative: false },
  { id: 'high-value', title: 'High value customers', creator: 'You', dateCreated: 'Oct 19, 2024', lastUpdated: 'Today', sparklineData: [30, 28, 30, 32, 30, 28, 30], value: '87', trend: 0.0, isNegative: false },
  { id: 'new-products', title: 'New products adoption', creator: 'You', dateCreated: 'Jun 3, 2024', lastUpdated: 'May 1, 2025', sparklineData: [5, 8, 10, 15, 20, 25, 30], value: '493', trend: 500.0, isNegative: false },
  { id: 'churn-risk', title: 'Churn risk', creator: 'Stripe', dateCreated: 'Apr 14, 2024', lastUpdated: 'May 1, 2025', sparklineData: [25, 22, 20, 18, 16, 15, 14], value: '413', trend: 3.5, isNegative: true },
  { id: 'mrr-growth', title: 'MRR growth drivers', creator: 'Stripe', dateCreated: 'Apr 14, 2024', lastUpdated: 'May 1, 2025', sparklineData: [10, 15, 20, 25, 30, 35, 40], value: '$72.4K', trend: 300.0, isNegative: false },
  { id: 'customer-lifetime-value', title: 'Customer lifetime value analysis', creator: 'sarah@example.com', dateCreated: 'Apr 10, 2025', lastUpdated: 'Today', sparklineData: [45, 48, 52, 49, 51, 53, 55], value: '$2.3K', trend: 12.8, isNegative: false },
  { id: 'payment-failures', title: 'Payment failure rates', creator: 'Stripe', dateCreated: 'Apr 8, 2025', lastUpdated: 'Yesterday', sparklineData: [8, 7, 9, 6, 5, 4, 3], value: '2.1%', trend: -62.5, isNegative: false },
  { id: 'trial-conversion', title: 'Trial to paid conversion', creator: 'You', dateCreated: 'Apr 5, 2025', lastUpdated: 'Today', sparklineData: [18, 22, 25, 28, 30, 32, 35], value: '24.5%', trend: 94.4, isNegative: false },
  { id: 'api-usage-trends', title: 'API usage trends', creator: 'mike@example.com', dateCreated: 'Apr 3, 2025', lastUpdated: 'May 2, 2025', sparklineData: [120, 135, 142, 158, 165, 172, 180], value: '1.2M', trend: 50.0, isNegative: false },
  { id: 'subscription-downgrades', title: 'Subscription downgrades', creator: 'You', dateCreated: 'Mar 28, 2025', lastUpdated: 'Today', sparklineData: [15, 12, 10, 8, 6, 5, 4], value: '23', trend: -73.3, isNegative: false },
  { id: 'geographic-revenue', title: 'Revenue by geography', creator: 'Stripe', dateCreated: 'Mar 25, 2025', lastUpdated: 'May 1, 2025', sparklineData: [85, 88, 92, 95, 98, 102, 105], value: '$234.7K', trend: 23.5, isNegative: false },
  { id: 'feature-adoption', title: 'New feature adoption rates', creator: 'alex@example.com', dateCreated: 'Mar 20, 2025', lastUpdated: 'Yesterday', sparklineData: [5, 12, 18, 25, 32, 38, 45], value: '67%', trend: 800.0, isNegative: false },
  { id: 'support-tickets', title: 'Support ticket volume', creator: 'You', dateCreated: 'Mar 15, 2025', lastUpdated: 'Today', sparklineData: [45, 42, 38, 35, 32, 28, 25], value: '156', trend: -44.4, isNegative: false },
  { id: 'mobile-usage', title: 'Mobile app engagement', creator: 'lisa@example.com', dateCreated: 'Mar 12, 2025', lastUpdated: 'May 3, 2025', sparklineData: [65, 68, 72, 75, 78, 82, 85], value: '78.2%', trend: 30.8, isNegative: false },
  { id: 'refund-requests', title: 'Refund request analysis', creator: 'Stripe', dateCreated: 'Mar 8, 2025', lastUpdated: 'Yesterday', sparklineData: [12, 10, 8, 6, 5, 4, 3], value: '1.8%', trend: -75.0, isNegative: false },
  { id: 'seasonal-trends', title: 'Seasonal revenue patterns', creator: 'You', dateCreated: 'Feb 28, 2025', lastUpdated: 'Today', sparklineData: [100, 105, 110, 115, 120, 125, 130], value: '$189.4K', trend: 30.0, isNegative: false },
  { id: 'cohort-retention', title: 'Customer cohort retention', creator: 'david@example.com', dateCreated: 'Feb 25, 2025', lastUpdated: 'May 1, 2025', sparklineData: [90, 85, 82, 78, 75, 72, 70], value: '72.3%', trend: -22.2, isNegative: true },
  { id: 'pricing-optimization', title: 'Pricing tier performance', creator: 'Stripe', dateCreated: 'Feb 20, 2025', lastUpdated: 'Today', sparklineData: [25, 28, 32, 35, 38, 42, 45], value: '$98.7K', trend: 80.0, isNegative: false },
  { id: 'email-campaigns', title: 'Email campaign effectiveness', creator: 'You', dateCreated: 'Feb 15, 2025', lastUpdated: 'Yesterday', sparklineData: [15, 18, 22, 25, 28, 32, 35], value: '18.5%', trend: 133.3, isNegative: false },
  { id: 'competitor-analysis', title: 'Competitive market share', creator: 'emma@example.com', dateCreated: 'Feb 10, 2025', lastUpdated: 'May 2, 2025', sparklineData: [35, 36, 37, 38, 39, 40, 41], value: '38.2%', trend: 17.1, isNegative: false },
  { id: 'product-usage', title: 'Product feature usage', creator: 'You', dateCreated: 'Feb 5, 2025', lastUpdated: 'Today', sparklineData: [55, 58, 62, 65, 68, 72, 75], value: '68.9%', trend: 36.4, isNegative: false },
  { id: 'billing-disputes', title: 'Billing dispute trends', creator: 'Stripe', dateCreated: 'Jan 30, 2025', lastUpdated: 'May 1, 2025', sparklineData: [8, 7, 6, 5, 4, 3, 2], value: '0.9%', trend: -75.0, isNegative: false },
  { id: 'user-onboarding', title: 'User onboarding completion', creator: 'tom@example.com', dateCreated: 'Jan 25, 2025', lastUpdated: 'Yesterday', sparklineData: [45, 48, 52, 55, 58, 62, 65], value: '61.7%', trend: 44.4, isNegative: false },
  { id: 'cross-sell-success', title: 'Cross-sell opportunities', creator: 'You', dateCreated: 'Jan 20, 2025', lastUpdated: 'Today', sparklineData: [12, 15, 18, 22, 25, 28, 32], value: '156', trend: 166.7, isNegative: false },
  { id: 'server-performance', title: 'API response times', creator: 'Stripe', dateCreated: 'Jan 15, 2025', lastUpdated: 'Today', sparklineData: [250, 240, 230, 220, 210, 200, 190], value: '198ms', trend: -24.0, isNegative: false },
  { id: 'social-media', title: 'Social media engagement', creator: 'jenny@example.com', dateCreated: 'Jan 10, 2025', lastUpdated: 'May 3, 2025', sparklineData: [85, 92, 98, 105, 112, 118, 125], value: '2.4K', trend: 47.1, isNegative: false },
  { id: 'inventory-turnover', title: 'Product inventory analysis', creator: 'You', dateCreated: 'Jan 5, 2025', lastUpdated: 'Yesterday', sparklineData: [15, 18, 22, 25, 28, 32, 35], value: '4.2x', trend: 133.3, isNegative: false },
  { id: 'fraud-detection', title: 'Fraud prevention metrics', creator: 'Stripe', dateCreated: 'Dec 28, 2024', lastUpdated: 'Today', sparklineData: [5, 4, 3, 2, 2, 1, 1], value: '0.3%', trend: -80.0, isNegative: false },
  { id: 'customer-satisfaction', title: 'Customer satisfaction scores', creator: 'chris@example.com', dateCreated: 'Dec 20, 2024', lastUpdated: 'May 1, 2025', sparklineData: [75, 78, 82, 85, 88, 90, 92], value: '4.6/5', trend: 22.7, isNegative: false },
  { id: 'marketplace-fees', title: 'Marketplace transaction fees', creator: 'You', dateCreated: 'Dec 15, 2024', lastUpdated: 'Today', sparklineData: [25, 28, 32, 35, 38, 42, 45], value: '$12.8K', trend: 80.0, isNegative: false },
  { id: 'webhook-reliability', title: 'Webhook delivery success', creator: 'Stripe', dateCreated: 'Dec 10, 2024', lastUpdated: 'Yesterday', sparklineData: [95, 96, 97, 98, 98, 99, 99], value: '98.7%', trend: 4.9, isNegative: false },
  { id: 'partner-revenue', title: 'Partner channel performance', creator: 'anna@example.com', dateCreated: 'Dec 5, 2024', lastUpdated: 'May 2, 2025', sparklineData: [45, 52, 58, 65, 72, 78, 85], value: '$67.3K', trend: 88.9, isNegative: false },
  { id: 'tax-compliance', title: 'Tax calculation accuracy', creator: 'Stripe', dateCreated: 'Nov 30, 2024', lastUpdated: 'Today', sparklineData: [98, 98, 99, 99, 99, 100, 100], value: '99.8%', trend: 2.0, isNegative: false },
  { id: 'subscription-metrics', title: 'Subscription health metrics', creator: 'You', dateCreated: 'Nov 25, 2024', lastUpdated: 'Yesterday', sparklineData: [85, 87, 89, 91, 93, 95, 97], value: '92.1%', trend: 14.1, isNegative: false },
  { id: 'payment-methods', title: 'Payment method preferences', creator: 'ryan@example.com', dateCreated: 'Nov 20, 2024', lastUpdated: 'May 1, 2025', sparklineData: [65, 68, 72, 75, 78, 82, 85], value: '76.4%', trend: 30.8, isNegative: false },
  { id: 'currency-conversion', title: 'Multi-currency transactions', creator: 'Stripe', dateCreated: 'Nov 15, 2024', lastUpdated: 'Today', sparklineData: [35, 38, 42, 45, 48, 52, 55], value: '$89.2K', trend: 57.1, isNegative: false },
  { id: 'user-segmentation', title: 'Customer segment analysis', creator: 'You', dateCreated: 'Nov 10, 2024', lastUpdated: 'Yesterday', sparklineData: [25, 28, 32, 35, 38, 42, 45], value: '8 segments', trend: 80.0, isNegative: false },
  { id: 'integration-usage', title: 'Third-party integrations', creator: 'paul@example.com', dateCreated: 'Nov 5, 2024', lastUpdated: 'May 3, 2025', sparklineData: [15, 18, 22, 25, 28, 32, 35], value: '67', trend: 133.3, isNegative: false },
  { id: 'dispute-resolution', title: 'Chargeback resolution time', creator: 'Stripe', dateCreated: 'Oct 30, 2024', lastUpdated: 'Today', sparklineData: [15, 14, 13, 12, 11, 10, 9], value: '8.2 days', trend: -40.0, isNegative: false },
  { id: 'revenue-forecasting', title: 'Revenue prediction accuracy', creator: 'You', dateCreated: 'Oct 25, 2024', lastUpdated: 'May 1, 2025', sparklineData: [75, 78, 82, 85, 88, 90, 92], value: '87.3%', trend: 22.7, isNegative: false },
  { id: 'customer-acquisition', title: 'Customer acquisition cost', creator: 'maria@example.com', dateCreated: 'Oct 20, 2024', lastUpdated: 'Yesterday', sparklineData: [125, 120, 115, 110, 105, 100, 95], value: '$98', trend: -24.0, isNegative: false },
  { id: 'platform-uptime', title: 'Platform availability metrics', creator: 'Stripe', dateCreated: 'Oct 15, 2024', lastUpdated: 'Today', sparklineData: [99.8, 99.9, 99.9, 99.9, 100, 100, 100], value: '99.95%', trend: 0.2, isNegative: false },
  { id: 'subscription-upgrades', title: 'Plan upgrade patterns', creator: 'You', dateCreated: 'Oct 10, 2024', lastUpdated: 'Yesterday', sparklineData: [8, 12, 15, 18, 22, 25, 28], value: '89', trend: 250.0, isNegative: false },
  { id: 'regional-performance', title: 'Regional sales performance', creator: 'steve@example.com', dateCreated: 'Oct 5, 2024', lastUpdated: 'May 2, 2025', sparklineData: [45, 48, 52, 55, 58, 62, 65], value: '$145.6K', trend: 44.4, isNegative: false },
  { id: 'mobile-payments', title: 'Mobile payment adoption', creator: 'Stripe', dateCreated: 'Sep 30, 2024', lastUpdated: 'Today', sparklineData: [35, 38, 42, 45, 48, 52, 55], value: '48.7%', trend: 57.1, isNegative: false },
  { id: 'customer-feedback', title: 'Product feedback analysis', creator: 'You', dateCreated: 'Sep 25, 2024', lastUpdated: 'May 1, 2025', sparklineData: [65, 68, 72, 75, 78, 82, 85], value: '4.3/5', trend: 30.8, isNegative: false },
  { id: 'compliance-metrics', title: 'Regulatory compliance status', creator: 'Stripe', dateCreated: 'Sep 20, 2024', lastUpdated: 'Yesterday', sparklineData: [95, 96, 97, 98, 98, 99, 99], value: '98.2%', trend: 4.2, isNegative: false },
  { id: 'team-productivity', title: 'Development team velocity', creator: 'You', dateCreated: 'Sep 15, 2024', lastUpdated: 'Today', sparklineData: [25, 28, 32, 35, 38, 42, 45], value: '42 pts', trend: 80.0, isNegative: false }
];

// Filter options
const creatorOptions = [
  { value: 'anyone', label: 'Created by anyone' },
  { value: 'you', label: 'Created by you' },
  { value: 'others', label: 'Created by others' },
  { value: 'stripe', label: 'Created by Stripe' }
];

// Weekly check reports data
const weeklyReports = [
  { id: 'weekly-revenue', title: 'Weekly revenue', value: '$1.2M', trend: 15.2, isNegative: false, sparklineData: [850, 920, 980, 1050, 1120, 1180, 1200] },
  { id: 'user-engagement', title: 'User engagement rate', value: '87.3%', trend: 5.8, isNegative: false, sparklineData: [82, 84, 85, 86, 87, 87, 87] },
  { id: 'support-resolution', title: 'Support resolution time', value: '2.4hrs', trend: -18.5, isNegative: false, sparklineData: [3.2, 3.0, 2.8, 2.6, 2.5, 2.4, 2.4] },
  { id: 'conversion-funnel', title: 'Conversion funnel', value: '12.8%', trend: 22.1, isNegative: false, sparklineData: [10.5, 11.2, 11.8, 12.1, 12.4, 12.6, 12.8] },
  { id: 'server-uptime', title: 'Server uptime', value: '99.97%', trend: 0.1, isNegative: false, sparklineData: [99.95, 99.96, 99.97, 99.97, 99.98, 99.97, 99.97] },
  { id: 'customer-acquisition', title: 'New customer acquisition', value: '234', trend: 28.9, isNegative: false, sparklineData: [180, 195, 210, 220, 225, 230, 234] },
  { id: 'retention-rate', title: 'Customer retention', value: '94.2%', trend: 2.3, isNegative: false, sparklineData: [92, 92.5, 93, 93.5, 94, 94.1, 94.2] },
  { id: 'api-performance', title: 'API response times', value: '185ms', trend: -12.3, isNegative: false, sparklineData: [220, 210, 200, 195, 190, 187, 185] }
];

// Drafts reports data (only 3 charts)
const draftsReports = [
  { id: 'draft-mobile-analytics', title: 'Mobile app analytics', value: '$2.8M', trend: 45.3, isNegative: false, sparklineData: [1200, 1350, 1500, 1650, 1800, 2100, 2800] },
  { id: 'draft-social-metrics', title: 'Social media engagement', value: '156K', trend: 67.8, isNegative: false, sparklineData: [85, 95, 105, 120, 135, 145, 156] },
  { id: 'draft-email-campaigns', title: 'Email campaign performance', value: '23.4%', trend: -8.2, isNegative: false, sparklineData: [28, 27, 26, 25, 24, 23.5, 23.4] }
];

const Reports = () => {
  const [pinnedSortField, setPinnedSortField] = useState('dateCreated');
  const [pinnedSortDirection, setPinnedSortDirection] = useState('desc');
  const [allSortField, setAllSortField] = useState('dateCreated');
  const [allSortDirection, setAllSortDirection] = useState('desc');
  const [creatorFilter, setCreatorFilter] = useState('anyone');
  const [creatorPopoverOpen, setCreatorPopoverOpen] = useState(false);
  const [manageDataPopoverOpen, setManageDataPopoverOpen] = useState(false);
  const [pinnedReports, setPinnedReports] = useState([0, 1, 2, 8, 6, 9, 10, 12]); // Added more key business metrics to pinned reports
  const [pinnedExpanded, setPinnedExpanded] = useState(false); // Track if pinned section shows all charts
  const [weeklyExpanded, setWeeklyExpanded] = useState(false); // Track if weekly section shows all charts
  const [expandedSections, setExpandedSections] = useState({
    trending: true,
    pinned: true,
    weekly: true,
    drafts: true,
    all: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  
  const creatorRef = useRef(null);
  const manageDataRef = useRef(null);
  const navigate = useNavigate();
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creatorRef.current && !creatorRef.current.contains(event.target)) {
        setCreatorPopoverOpen(false);
      }
      if (manageDataRef.current && !manageDataRef.current.contains(event.target)) {
        setManageDataPopoverOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handlePinnedSort = (field) => {
    if (pinnedSortField === field) {
      setPinnedSortDirection(pinnedSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPinnedSortField(field);
      setPinnedSortDirection('asc');
    }
  };
  
  const handleAllSort = (field) => {
    if (allSortField === field) {
      setAllSortDirection(allSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAllSortField(field);
      setAllSortDirection('asc');
    }
  };
  
  const getPinnedSortIcon = (field) => {
    if (pinnedSortField !== field) return '↕';
    return pinnedSortDirection === 'asc' ? '↑' : '↓';
  };
  
  const getAllSortIcon = (field) => {
    if (allSortField !== field) return '↕';
    return allSortDirection === 'asc' ? '↑' : '↓';
  };
  
  const handleCreatorChange = (value) => {
    setCreatorFilter(value);
    setCreatorPopoverOpen(false);
  };
  
  const getCreatorLabel = () => {
    const option = creatorOptions.find(opt => opt.value === creatorFilter);
    return option ? option.label : creatorOptions[0].label;
  };

  // Filter reports based on creator filter
  const filterReportsByCreator = (reports) => {
    if (creatorFilter === 'anyone') {
      return reports;
    } else if (creatorFilter === 'you') {
      return reports.filter(report => report.creator === 'You');
    } else if (creatorFilter === 'others') {
      return reports.filter(report => report.creator !== 'You' && report.creator !== 'Stripe');
    } else if (creatorFilter === 'stripe') {
      return reports.filter(report => report.creator === 'Stripe');
    }
    return reports;
  };
  
  const sortReports = (reports, sortField, sortDirection) => {
    return [...reports].sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];
      
      if (sortField === 'dateCreated') {
        // Parse dates for proper comparison
        compareA = new Date(compareA);
        compareB = new Date(compareB);
      }
      
      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  // Apply filtering and sorting to all reports
  const filteredReports = filterReportsByCreator(reportsList);
  const sortedAllReports = sortReports(filteredReports, allSortField, allSortDirection);
  
  // Pagination logic
  const totalReports = sortedAllReports.length;
  const totalPages = Math.ceil(totalReports / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const currentReports = sortedAllReports.slice(startIndex, endIndex);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [creatorFilter]);
  
  // Get pinned reports with their own sorting
  const getPinnedReports = () => {
    const pinnedReportsList = pinnedReports.map(index => reportsList[index]);
    return sortReports(pinnedReportsList, pinnedSortField, pinnedSortDirection);
  };
  
  const sortedPinnedReports = getPinnedReports();
  
  // Sparkline chart configuration
  const getSparklineOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        point: { radius: 0 },
        line: { tension: 0.4, borderWidth: 1.5 }
      }
    };
  };
  
  const getSparklineData = (data) => {
    // Ensure data exists and is an array
    const safeData = Array.isArray(data) && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
    
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: safeData,
          borderColor: '#635bff',
          backgroundColor: 'transparent',
          fill: false
        }
      ]
    };
  };
  
  const handlePinToggle = (index, e) => {
    e.stopPropagation(); // Prevent row click navigation
    
    setPinnedReports(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HeaderRow>
        <PageTitle>Analytics</PageTitle>
        <ButtonGroup>
          <NewButton>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.5C8.27614 3.5 8.5 3.72386 8.5 4V7.5H12C12.2761 7.5 12.5 7.72386 12.5 8C12.5 8.27614 12.2761 8.5 12 8.5H8.5V12C8.5 12.2761 8.27614 12.5 8 12.5C7.72386 12.5 7.5 12.2761 7.5 12V8.5H4C3.72386 8.5 3.5 8.27614 3.5 8C3.5 7.72386 3.72386 7.5 4 7.5H7.5V4C7.5 3.72386 7.72386 3.5 8 3.5Z" fill="white"/>
            </svg>
            New
          </NewButton>
          <ManageGroupsButton 
            ref={manageDataRef}
            onClick={() => setManageDataPopoverOpen(!manageDataPopoverOpen)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M1 2.75C1 1.23122 3.23858 0 6 0C8.76142 0 11 1.23122 11 2.75C11 2.83427 10.9931 2.91766 10.9796 3H11V9.5C11 10.8807 8.7614 12 6 12C3.2386 12 1.00004 10.8807 1 9.5V3H1.02038C1.00689 2.91766 1 2.83427 1 2.75ZM2.4 2.75C2.4 2.73712 2.4275 2.42356 3.13915 2.03216C3.80039 1.66848 4.80919 1.4 6 1.4C7.19081 1.4 8.19961 1.66848 8.86085 2.03216C9.5725 2.42357 9.6 2.73712 9.6 2.75C9.6 2.76288 9.5725 3.07644 8.86085 3.46784C8.19961 3.83152 7.19081 4.1 6 4.1C4.80919 4.1 3.80039 3.83152 3.13915 3.46784C2.4275 3.07643 2.4 2.76288 2.4 2.75ZM2.4 4.65843V6.29363C2.52893 6.41588 2.72415 6.55597 3.00112 6.69445C3.7066 7.04719 4.76519 7.3 6 7.3C7.23481 7.3 8.2934 7.04719 8.99888 6.69445C9.27585 6.55597 9.47107 6.41588 9.6 6.29363V4.65843C8.69056 5.17726 7.41381 5.5 6 5.5C4.58619 5.5 3.30944 5.17726 2.4 4.65843ZM2.4 9.5V7.73494C3.30944 8.2066 4.58619 8.5 6 8.5C7.41381 8.5 8.69056 8.2066 9.6 7.73494V9.5H9.58558C9.54415 9.57405 9.39909 9.77071 8.90944 10.0155C8.23718 10.3517 7.2105 10.6 6 10.6C4.7895 10.6 3.76282 10.3517 3.09057 10.0155C2.60091 9.77071 2.45585 9.57405 2.41442 9.5H2.4Z" fill="#474E5A"/>
            </svg>
            Manage data
            <ButtonBadge>2</ButtonBadge>
            
            <ManageDataPopover isOpen={manageDataPopoverOpen}>
              <ManageDataItem>
                <ManageDataHeader>
                  <ManageDataTitle>Stripe</ManageDataTitle>
                  <ManageDataActions>
                    <ManageDataSync>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        <path d="M8 12a5 5 0 1 1-4.546-2.914.5.5 0 0 0-.908.417A6 6 0 1 0 8 14v-1z"/>
                        <path d="M8 11.534V15.466a.25.25 0 0 0 .41.192l2.36-1.966c.12-.1.12-.284 0-.384L8.41 11.342a.25.25 0 0 0-.41.192z"/>
                      </svg>
                    </ManageDataSync>
                    <StatusDot />
                  </ManageDataActions>
                </ManageDataHeader>
                <ManageDataMeta>Last updated 2 hours ago</ManageDataMeta>
              </ManageDataItem>
              
              <ManageDataItem>
                <ManageDataHeader>
                  <ManageDataTitle>Snowflake</ManageDataTitle>
                  <ManageDataActions>
                    <ManageDataSync>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        <path d="M8 12a5 5 0 1 1-4.546-2.914.5.5 0 0 0-.908.417A6 6 0 1 0 8 14v-1z"/>
                        <path d="M8 11.534V15.466a.25.25 0 0 0 .41.192l2.36-1.966c.12-.1.12-.284 0-.384L8.41 11.342a.25.25 0 0 0-.41.192z"/>
                      </svg>
                    </ManageDataSync>
                    <StatusDot />
                  </ManageDataActions>
                </ManageDataHeader>
                <ManageDataMeta>Last updated 1 day ago</ManageDataMeta>
              </ManageDataItem>
            </ManageDataPopover>
          </ManageGroupsButton>
        </ButtonGroup>
      </HeaderRow>
      
      <SectionTitleRow>
        <SectionTitle onClick={() => toggleSection('trending')}>
          <ChevronIcon expanded={expandedSections.trending}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ChevronIcon>
          Recently viewed
        </SectionTitle>
        <CarouselControls>
          <CarouselButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CarouselButton>
          <CarouselButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CarouselButton>
        </CarouselControls>
      </SectionTitleRow>
      
      {expandedSections.trending && (
        <TrendingGrid>
          {trendingReports.map(report => (
            <TrendingCard key={report.id} onClick={() => navigate(`/data-studio/${report.id}`)}>
              <TrendingExploreAction className="explore-action">
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </TrendingExploreAction>
              
              <TrendingTitle>{report.title}</TrendingTitle>
              <TrendingContent>
                <TrendingValueSection>
                  <TrendingValueRow>
                    <TrendingValue>{report.value}</TrendingValue>
                    <TrendingTrend trend={report.trend} isNegative={report.isNegative}>
                      {report.trend > 0 ? '+' : ''}{report.trend}%
                    </TrendingTrend>
                  </TrendingValueRow>
                </TrendingValueSection>
                <SparklineContainer>
                  {report.sparklineData && Array.isArray(report.sparklineData) && report.sparklineData.length > 0 && (
                    <Line
                      data={getSparklineData(report.sparklineData)}
                      options={getSparklineOptions()}
                      height={30}
                    />
                  )}
                </SparklineContainer>
              </TrendingContent>
            </TrendingCard>
          ))}
        </TrendingGrid>
      )}
      
      <SectionTitle onClick={() => toggleSection('pinned')}>
        <ChevronIcon expanded={expandedSections.pinned}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ChevronIcon>
        Pinned
      </SectionTitle>
      <div style={{ marginBottom: '12px' }}></div>
      
      {expandedSections.pinned && (
        <PinnedGridContainer>
          <PinnedGrid expanded={pinnedExpanded}>
            {sortedPinnedReports.map((report) => {
              const originalIndex = reportsList.findIndex(r => r.id === report.id);
              return (
                <PinnedMetricCard 
                  key={report.id}
                  onClick={() => navigate(`/data-studio/${report.id}`)}
                >
                  <PinnedExploreAction className="explore-action">
                    Explore
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </PinnedExploreAction>
                  

                  
                  <PinnedMetricHeader>
                    <PinnedMetricTitle>{report.title}</PinnedMetricTitle>
                    <PinnedMetricValueRow>
                      <PinnedMetricValue>
                        {report.value}
                        {report.trend !== 0 && (
                          <PinnedMetricTrend trend={report.trend} isNegative={report.isNegative}>
                            {report.trend > 0 ? '+' : ''}{report.trend}%
                          </PinnedMetricTrend>
                        )}
                      </PinnedMetricValue>
                    </PinnedMetricValueRow>
                  </PinnedMetricHeader>
                  
                  <PinnedMetricChartContainer>
                    {report.sparklineData && Array.isArray(report.sparklineData) && report.sparklineData.length > 0 && (
                      <LineChart 
                        data={getSparklineData(report.sparklineData)}
                        height={160} 
                        showLegend={false}
                        simplified={true}
                        type="line" 
                        unit={report.value.includes('$') ? 'currency' : 'number'}
                      />
                    )}
                  </PinnedMetricChartContainer>
                  
                  <PinnedIndicator>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="m11.98 9.48 3.005-4.096a2 2 0 0 0 .387-1.15 2.042 2.042 0 0 0-.585-1.447l-1.574-1.574a1.997 1.997 0 0 0-2.597-.198L6.52 4.019l-.44-.44a1 1 0 0 0-1.261-.124L2.015 5.323a1 1 0 0 0-.152 1.54L4.97 9.97.72 14.22a.748.748 0 0 0 0 1.06.747.747 0 0 0 1.06 0l4.25-4.25 3.107 3.107a1 1 0 0 0 1.54-.152l1.868-2.803a1 1 0 0 0-.125-1.262l-.44-.44ZM7.593 5.093l3.316 3.316 2.868-3.911a.5.5 0 0 0-.05-.65l-1.573-1.573a.5.5 0 0 0-.65-.05l-3.91 2.868ZM5.31 4.93 3.354 6.233l6.413 6.413 1.303-1.955-5.761-5.76Z"></path>
                    </svg>
                    Pinned
                  </PinnedIndicator>
                </PinnedMetricCard>
              );
            })}
          </PinnedGrid>
          
          {!pinnedExpanded && sortedPinnedReports.length > 4 && (
            <GradientOverlay>
              <ShowAllButton onClick={() => setPinnedExpanded(true)}>
                Show all
              </ShowAllButton>
            </GradientOverlay>
          )}
        </PinnedGridContainer>
      )}
      
      <SectionTitle onClick={() => toggleSection('weekly')}>
        <ChevronIcon expanded={expandedSections.weekly}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ChevronIcon>
        My check weekly
      </SectionTitle>
      <div style={{ marginBottom: '12px' }}></div>
      
      {expandedSections.weekly && (
        <WeeklyGridContainer>
          <WeeklyGrid expanded={weeklyExpanded}>
            {weeklyReports.map((report) => (
              <WeeklyMetricCard 
                key={report.id}
                onClick={() => navigate(`/data-studio/${report.id}`)}
              >
                <WeeklyExploreAction className="explore-action">
                  Explore
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </WeeklyExploreAction>
                
                <WeeklyMetricHeader>
                  <WeeklyMetricTitle>{report.title}</WeeklyMetricTitle>
                  <WeeklyMetricValueRow>
                    <WeeklyMetricValue>
                      {report.value}
                      {report.trend !== 0 && (
                        <WeeklyMetricTrend trend={report.trend} isNegative={report.isNegative}>
                          {report.trend > 0 ? '+' : ''}{report.trend}%
                        </WeeklyMetricTrend>
                      )}
                    </WeeklyMetricValue>
                  </WeeklyMetricValueRow>
                </WeeklyMetricHeader>
                
                <WeeklyMetricChartContainer>
                  {report.sparklineData && Array.isArray(report.sparklineData) && report.sparklineData.length > 0 && (
                    <LineChart 
                      data={getSparklineData(report.sparklineData)}
                      height={160} 
                      showLegend={false}
                      simplified={true}
                      type="line" 
                      unit={report.value.includes('$') ? 'currency' : 'number'}
                    />
                  )}
                </WeeklyMetricChartContainer>
              </WeeklyMetricCard>
            ))}
          </WeeklyGrid>
          
          {!weeklyExpanded && weeklyReports.length > 4 && (
            <GradientOverlay>
              <ShowAllButton onClick={() => setWeeklyExpanded(true)}>
                Show all
              </ShowAllButton>
            </GradientOverlay>
          )}
        </WeeklyGridContainer>
      )}
      
      <SectionTitle onClick={() => toggleSection('drafts')}>
        <ChevronIcon expanded={expandedSections.drafts}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ChevronIcon>
        Drafts
      </SectionTitle>
      <div style={{ marginBottom: '12px' }}></div>
      
      {expandedSections.drafts && (
        <DraftsGrid>
          {draftsReports.map((report) => (
            <DraftsMetricCard 
              key={report.id}
              onClick={() => navigate(`/data-studio/${report.id}`)}
            >
              <DraftsExploreAction className="explore-action">
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </DraftsExploreAction>
              
              <DraftsMetricHeader>
                <DraftsMetricTitle>{report.title}</DraftsMetricTitle>
                <DraftsMetricValueRow>
                  <DraftsMetricValue>
                    {report.value}
                    {report.trend !== 0 && (
                      <DraftsMetricTrend trend={report.trend} isNegative={report.isNegative}>
                        {report.trend > 0 ? '+' : ''}{report.trend}%
                      </DraftsMetricTrend>
                    )}
                  </DraftsMetricValue>
                </DraftsMetricValueRow>
              </DraftsMetricHeader>
              
              <DraftsMetricChartContainer>
                {report.sparklineData && Array.isArray(report.sparklineData) && report.sparklineData.length > 0 && (
                  <LineChart 
                    data={getSparklineData(report.sparklineData)}
                    height={160} 
                    showLegend={false}
                    simplified={true}
                    type="line" 
                    unit={report.value.includes('$') ? 'currency' : 'number'}
                  />
                )}
              </DraftsMetricChartContainer>
            </DraftsMetricCard>
          ))}
          
          <DraftsPlaceholder>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <PlaceholderText>
              New
            </PlaceholderText>
          </DraftsPlaceholder>
        </DraftsGrid>
      )}
      
      <div style={{ marginTop: '40px', marginBottom: '16px' }}>
        <SectionTitle onClick={() => toggleSection('all')}>
          <ChevronIcon expanded={expandedSections.all}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ChevronIcon>
          All
        </SectionTitle>
      </div>
      
      {expandedSections.all && (
        <>
          <FiltersRow>
            <FilterChip 
              ref={creatorRef} 
              active={true} 
              onClick={() => setCreatorPopoverOpen(!creatorPopoverOpen)}
            >
              {getCreatorLabel()}
              <IconWrapper active={true}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconWrapper>
              <Popover isOpen={creatorPopoverOpen}>
                {creatorOptions.map((option) => (
                  <PopoverItem
                    key={option.value}
                    className={creatorFilter === option.value ? 'active' : ''}
                    onClick={() => handleCreatorChange(option.value)}
                  >
                    {option.label}
                  </PopoverItem>
                ))}
              </Popover>
            </FilterChip>
            
            <FilterChip outlined={true}>
              <PlusIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </PlusIcon>
              Created date
            </FilterChip>
            
            <FilterChip outlined={true}>
              <PlusIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </PlusIcon>
              Filter
            </FilterChip>
          </FiltersRow>
          
          <ReportsTable>
            <TableHead>
              <tr>
                <TableHeaderCell style={{ width: '40px' }}></TableHeaderCell>
                <TableHeaderCell sorted={allSortField === 'title'} onClick={() => handleAllSort('title')}>
                  Title {getAllSortIcon('title')}
                </TableHeaderCell>
                <SparklineHeaderCell>
                  Last 7 days
                </SparklineHeaderCell>
                <TableHeaderCell sorted={allSortField === 'value'} onClick={() => handleAllSort('value')}>
                  Value {getAllSortIcon('value')}
                </TableHeaderCell>
                <TableHeaderCell sorted={allSortField === 'trend'} onClick={() => handleAllSort('trend')}>
                  Change {getAllSortIcon('trend')}
                </TableHeaderCell>
                <TableHeaderCell sorted={allSortField === 'creator'} onClick={() => handleAllSort('creator')}>
                  Created by {getAllSortIcon('creator')}
                </TableHeaderCell>
                <TableHeaderCell sorted={allSortField === 'dateCreated'} onClick={() => handleAllSort('dateCreated')}>
                  Date created {getAllSortIcon('dateCreated')}
                </TableHeaderCell>
                <TableHeaderCell sorted={allSortField === 'lastUpdated'} onClick={() => handleAllSort('lastUpdated')}>
                  Last updated date {getAllSortIcon('lastUpdated')}
                </TableHeaderCell>
                <TableHeaderCell></TableHeaderCell>
              </tr>
            </TableHead>
            <tbody>
              {currentReports.map((report, index) => (
                <tr 
                  key={report.id} 
                  onClick={() => navigate(`/data-studio/${report.id}`)}
                >
                  <PinColumn onClick={(e) => e.stopPropagation()}>
                    <PinButton 
                      pinned={pinnedReports.includes(reportsList.findIndex(r => r.id === report.id))}
                      onClick={(e) => handlePinToggle(reportsList.findIndex(r => r.id === report.id), e)}
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
<path fillRule="evenodd" clipRule="evenodd" d="m11.98 9.48 3.005-4.096a2 2 0 0 0 .387-1.15 2.042 2.042 0 0 0-.585-1.447l-1.574-1.574a1.997 1.997 0 0 0-2.597-.198L6.52 4.019l-.44-.44a1 1 0 0 0-1.261-.124L2.015 5.323a1 1 0 0 0-.152 1.54L4.97 9.97.72 14.22a.748.748 0 0 0 0 1.06.747.747 0 0 0 1.06 0l4.25-4.25 3.107 3.107a1 1 0 0 0 1.54-.152l1.868-2.803a1 1 0 0 0-.125-1.262l-.44-.44ZM7.593 5.093l3.316 3.316 2.868-3.911a.5.5 0 0 0-.05-.65l-1.573-1.573a.5.5 0 0 0-.65-.05l-3.91 2.868ZM5.31 4.93 3.354 6.233l6.413 6.413 1.303-1.955-5.761-5.76Z"></path>
</svg>
                    </PinButton>
                  </PinColumn>
                  <TableCell sorted={allSortField === 'title'}>
                    {report.title}
                  </TableCell>
                  <SparklineCell onClick={(e) => e.stopPropagation()}>
                    <div style={{ width: '100%', height: '30px' }}>
                      {report.sparklineData && Array.isArray(report.sparklineData) && report.sparklineData.length > 0 && (
                        <Line
                          data={getSparklineData(report.sparklineData)}
                          options={getSparklineOptions()}
                        />
                      )}
                    </div>
                  </SparklineCell>
                  <ValueCell sorted={allSortField === 'value'}>{report.value}</ValueCell>
                  <ChangeCell sorted={allSortField === 'trend'} trend={report.trend} isNegative={report.isNegative}>
                    {report.trend > 0 ? '+' : ''}{report.trend}%
                  </ChangeCell>
                  <TableCell sorted={allSortField === 'creator'}>{report.creator}</TableCell>
                  <DateColumn sorted={allSortField === 'dateCreated'}>{report.dateCreated}</DateColumn>
                  <DateColumn sorted={allSortField === 'lastUpdated'}>{report.lastUpdated}</DateColumn>
                  <ActionColumn onClick={(e) => e.stopPropagation()}>
                    <OptionsDots>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                      </svg>
                    </OptionsDots>
                  </ActionColumn>
                </tr>
              ))}
            </tbody>
          </ReportsTable>
        </>
      )}
      
      <Pagination>
        <div>{Math.min(startIndex + 1, totalReports)}-{Math.min(endIndex, totalReports)} of {totalReports} results</div>
        <PaginationControls>
          <PaginationButton disabled={currentPage === 1} onClick={handlePreviousPage}>Previous</PaginationButton>
          <PaginationButton disabled={currentPage === totalPages} onClick={handleNextPage}>Next</PaginationButton>
        </PaginationControls>
      </Pagination>
    </PageContainer>
  );
};

export default Reports; 
