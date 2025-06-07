import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ShareModal from '../components/ShareModal';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';
import { PERIODS } from '../data/companyData';
import { useMetrics } from '../components/MetricsContext';
import { useTooltip } from '../components/GlobalTooltip';
import MeterChart from '../components/MeterChart';
import StackedBarChart from '../components/StackedBarChart';
import { getColumnSchema } from '../data/reportSchemas';

// Register Chart.js components including Tooltip
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

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
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: #f7f9fc;
    text-decoration: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
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
  overflow-y: visible;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }
  
  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 13px;
    position: relative;
    cursor: pointer;
    
    &:hover {
      color: var(--text-color);
    }
  }
  
  /* Column width classes - Content-based widths */
  th:nth-child(1), td:nth-child(1) { width: 220px; } /* Customer names */
  th:nth-child(2), td:nth-child(2) { width: 180px; } /* Product/Category */
  th:nth-child(3), td:nth-child(3) { width: 200px; } /* Numbers/Percentages */
  th:nth-child(4), td:nth-child(4) { width: 250px; } /* Currency values */
  th:nth-child(5), td:nth-child(5) { width: 280px; } /* Additional currency */
  th:nth-child(6), td:nth-child(6) { width: 200px; } /* Units used */
  th:nth-child(7), td:nth-child(7) { width: 200px; } /* Overage units */
  th:nth-child(8), td:nth-child(8) { width: 180px; } /* Overage rate */
  th:nth-child(9), td:nth-child(9) { width: 250px; } /* Overage revenue */
  
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

// Add chart chip styled components (similar to ReportDetail)
const ChartChip = styled.div`
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background-color: transparent;
  border-radius: 14px;
  border: 1px dashed #e3e8ee;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #d7dfe8;
  }
`;

const ChartChipValue = styled.span`
  color: #6772e5;
  font-weight: 600;
  font-size: 12px;
`;

const ChartIconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-right: 8px;
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
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  color: #635bff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #5a51e5;
    
    svg {
      transform: scale(1.1);
    }
  }
  
  &.remove-filter:hover {
    color: #dc3545;
  }
  
  svg {
    width: 12px;
    height: 12px;
    transition: all 0.2s ease;
  }
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

// Data visualization styled components
const DataTypeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: #6b7c93;
  font-size: 12px;
  font-weight: 500;
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderCellContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const HeaderLabel = styled.span`
  display: flex;
  align-items: center;
`;

const SummaryRow = styled.tr`
  &:hover {
    background-color: transparent !important;
  }
`;

const SummaryCell = styled.td`
  padding: 12px 16px !important;
  vertical-align: top;
  border-bottom: 1px solid var(--border-color) !important;
  overflow: visible !important;
  white-space: normal !important;
  position: relative;
  font-size: 14px !important;
  z-index: 1;
`;

const SummaryCellContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  height: 100%;
`;

const DataVizChartContainer = styled.div`
  width: 100%;
  height: ${props => props.chartType === 'category' ? 'auto' : '80px'};
  min-height: ${props => props.chartType === 'category' ? '100px' : '80px'};
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  overflow: visible;
`;

const SummaryText = styled.div`
  font-size: 12px;
  color: #6b7c93;
  font-weight: 500;
  line-height: 1.2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 20px;
  margin-top: auto;
  padding-top: 4px;
`;

const SummaryTextLeft = styled.span`
  text-align: left;
`;

const SummaryTextRight = styled.span`
  text-align: right;
`;

const CategoryBarFill = styled.div`
  height: 100%;
  background-color: ${props => 
    props.isFilteredOut ? '#F5F6F8' :
    props.isSelected ? '#635bff' : 
    props.hasSelection ? '#E8EAED' : '#D8DEE4'
  };
  border-radius: 4px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => 
      props.isFilteredOut ? '#E8EAED' :
      props.isSelected ? '#5a51e5' : 
      props.hasSelection ? '#D7DFE8' : '#C5CDD6'
    };
  }
`;

const CategoryBar = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin-bottom: 4px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryBarText = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  z-index: 2;
  pointer-events: none;
`;

const CategoryBarCount = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  z-index: 2;
  pointer-events: none;
`;

// Helper functions for data visualization
const getDataTypeIcon = (dataType) => {
  switch (dataType) {
    case 'date':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    case 'string':
      return <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>ABC</span>;
    case 'number':
      return <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>123</span>;
    case 'category':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    default:
      return null;
  }
};

const CategoryChart = ({ data, totalResults, onCategoryClick, selectedCategories = [] }) => {
  const categories = Object.keys(data);
  const values = Object.values(data);
  const hasSelection = selectedCategories && selectedCategories.length > 0;
  
  // Create array of category objects and sort by count in descending order
  const sortedCategories = categories.map((category, index) => ({
    name: category,
    count: values[index]
  })).sort((a, b) => b.count - a.count);
  
  // Limit to top 4 categories
  const maxDisplay = 4;
  const displayCategories = sortedCategories.slice(0, maxDisplay);
  const hasMoreCategories = sortedCategories.length > maxDisplay;
  const remainingCount = sortedCategories.slice(maxDisplay).reduce((sum, cat) => sum + cat.count, 0);
  
  return (
    <div>
      {displayCategories.map((category) => {
        const percentage = totalResults ? (category.count / totalResults) * 100 : 0;
        const isSelected = selectedCategories.includes(category.name);
        const isFilteredOut = hasSelection && !isSelected;
        
        return (
          <CategoryBar 
            key={category.name}
            onClick={() => onCategoryClick && onCategoryClick(category.name)}
          >
            <CategoryBarFill 
              style={{ width: `${percentage}%` }} 
              isSelected={isSelected}
              hasSelection={hasSelection}
              isFilteredOut={isFilteredOut}
            />
            <CategoryBarText>
              {category.name}
            </CategoryBarText>
            <CategoryBarCount>
              {category.count}
            </CategoryBarCount>
          </CategoryBar>
        );
      })}
      
      {hasMoreCategories && (
        <CategoryBar>
          <CategoryBarFill 
            style={{ width: `${totalResults ? (remainingCount / totalResults) * 100 : 0}%` }} 
            isSelected={false}
            hasSelection={hasSelection}
            isFilteredOut={false}
          />
          <CategoryBarText>
            {sortedCategories.length - maxDisplay} more
          </CategoryBarText>
          <CategoryBarCount>
            {remainingCount}
          </CategoryBarCount>
        </CategoryBar>
      )}
    </div>
  );
};

const MetricDetail = () => {
  const { metricId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showTooltip, hideTooltip } = useTooltip();
  const { metrics: standardizedMetrics, getMetricById, getMetricChartData, setPlan, currentPlan } = useMetrics();
  
  // Get initial metric data - compute once with useMemo to prevent re-renders
  const baseMetric = useMemo(() => {
    // First try to get the metric from location state
    if (location.state?.metric) {
      return location.state.metric;
    }

    // Otherwise get it from the URL parameter
    const foundMetric = standardizedMetrics[metricId] || standardizedMetrics['gross-volume'];
    
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
  }, [location.state, metricId, standardizedMetrics]);
  
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
  
  // Add state for data visualization filters
  const [activeFilters, setActiveFilters] = useState({});
  
  // Add state for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Custom tooltip management
  const hideAllTooltips = useCallback(() => {
    const tooltips = document.querySelectorAll('.chartjs-tooltip');
    tooltips.forEach(tooltip => {
      tooltip.style.opacity = '0';
    });
    
    const globalTooltip = document.getElementById('global-chart-tooltip');
    if (globalTooltip) {
      globalTooltip.style.opacity = '0';
    }
  }, []);

  const showCustomTooltip = useCallback((event, label, value, chart, column = null) => {
    hideAllTooltips();
    
    let tooltipEl = document.getElementById('global-chart-tooltip');
    
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'global-chart-tooltip';
      tooltipEl.className = 'chartjs-tooltip';
      tooltipEl.style.position = 'fixed';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.zIndex = '9999';
      tooltipEl.style.transition = 'opacity 0.2s ease';
      tooltipEl.style.opacity = '0';
      document.body.appendChild(tooltipEl);
    }
    
    tooltipEl.style.backgroundColor = 'white';
    tooltipEl.style.color = '#333';
    tooltipEl.style.border = '1px solid #e3e8ee';
    tooltipEl.style.borderRadius = '6px';
    tooltipEl.style.padding = '10px 14px';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.fontWeight = '500';
    tooltipEl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
    tooltipEl.style.whiteSpace = 'nowrap';
    
    let content = `<strong>${label}</strong><br/>${value}`;
    tooltipEl.innerHTML = content;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const tooltipX = mouseX - (tooltipEl.offsetWidth / 2);
    const tooltipY = mouseY - tooltipEl.offsetHeight - 10;
    
    tooltipEl.style.left = tooltipX + 'px';
    tooltipEl.style.top = tooltipY + 'px';
    tooltipEl.style.opacity = '1';
  }, [hideAllTooltips]);

  // Toggle filter function
  const toggleFilter = useCallback((columnId, filterValue) => {
    setActiveFilters(prev => {
      const currentFilters = prev[columnId] || [];
      const isActive = currentFilters.includes(filterValue);
      
      if (isActive) {
        const newFilters = currentFilters.filter(f => f !== filterValue);
        if (newFilters.length === 0) {
          const { [columnId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [columnId]: newFilters };
      } else {
        return { ...prev, [columnId]: [...currentFilters, filterValue] };
      }
    });
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, []);

  // Remove filter function
  const removeFilter = useCallback((columnId) => {
    setActiveFilters(prev => {
      const { [columnId]: removed, ...rest } = prev;
      return rest;
    });
    // Reset to first page when filter is removed
    setCurrentPage(1);
  }, []);

  // Chart options with tooltip functionality
  const getChartOptions = useCallback((type, columnKey, selectedValue, column = null) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'point'
      },
      onClick: (event, activeElements, chart) => {
        if (activeElements.length > 0 && columnKey) {
          const activeElement = activeElements[0];
          const index = activeElement.index;
          const label = chart.data.labels[index];
          toggleFilter(columnKey, label);
        }
      },
      onHover: (event, activeElements, chart) => {
        const canvas = chart.canvas;
        if (activeElements.length > 0) {
          canvas.style.cursor = 'pointer';
          
          const activeElement = activeElements[0];
          const index = activeElement.index;
          const dataset = chart.data.datasets[activeElement.datasetIndex];
          const value = dataset.data[index];
          const label = chart.data.labels[index];
          
          showCustomTooltip(event.native, label, value, chart, column);
        } else {
          canvas.style.cursor = 'default';
          hideAllTooltips();
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        point: { 
          radius: 2,
          hoverRadius: 4,
          hitRadius: 10
        },
        line: { 
          borderWidth: 2,
          tension: 0.4
        },
        bar: {
          borderWidth: 0
        }
      }
    };
  }, [toggleFilter, showCustomTooltip, hideAllTooltips]);

  // Helper functions for chart generation
  const generateTimeSeriesData = useCallback((values, selectedValues = []) => {
    if (values.length === 0) return null;
    
    const dateCounts = {};
    values.forEach(dateValue => {
      let date;
      
      // Handle different date formats
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Try to parse the string as a date
        date = new Date(dateValue);
      } else {
        // Skip invalid date values
        return;
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return;
      }
      
      const dateStr = date.toLocaleDateString();
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    const labels = Object.keys(dateCounts).sort();
    const data = labels.map(label => dateCounts[label]);
    
    return {
      labels,
      datasets: [{
        data,
        borderColor: '#D8DEE4',
        backgroundColor: 'rgba(216, 222, 228, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: labels.map(label => selectedValues.includes(label) ? 6 : 2),
        pointBackgroundColor: labels.map(label => selectedValues.includes(label) ? '#635bff' : '#D8DEE4'),
        pointBorderColor: labels.map(label => selectedValues.includes(label) ? '#635bff' : '#D8DEE4')
      }]
    };
  }, []);

  const generateNumberDistributionData = useCallback((values, selectedValues = []) => {
    if (values.length === 0) return null;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    const labels = [];
    
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binSize;
      const binEnd = min + (i + 1) * binSize;
      labels.push(`${Math.round(binStart)}-${Math.round(binEnd)}`);
    }
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });
    
    return {
      labels,
      datasets: [{
        data: bins,
        backgroundColor: labels.map(label => selectedValues.includes(label) ? '#635bff' : '#D8DEE4'),
        borderColor: labels.map(label => selectedValues.includes(label) ? '#635bff' : '#D8DEE4'),
        borderWidth: 1,
        borderRadius: 2
      }]
    };
  }, []);

  const calculateMedian = useCallback((values) => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    return sorted[mid];
  }, []);

  // Column definitions
  const getColumnDefinitions = useCallback(() => {
    // Get columns from shared schema
    const columns = getColumnSchema(baseMetric.id, false);
    
    // If no schema found, return default columns based on metric type
    if (!columns || columns.length === 0) {
      if (baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue') {
        return [
          { id: 'date', label: 'Date', dataType: 'date' },
          { id: 'customer', label: 'Customer name', dataType: 'string' },
          { id: 'plan', label: 'Plan', dataType: 'category' },
          { id: 'meter', label: 'Meter', dataType: 'category' },
          { id: 'includedUnits', label: 'Included units', dataType: 'number' },
          { id: 'unitsUsed', label: 'Units used', dataType: 'number' },
          { id: 'overageUnits', label: 'Overage units', dataType: 'number' },
          { id: 'overageRate', label: 'Overage rate', dataType: 'number' },
          { id: 'amount', label: 'Overage revenue', dataType: 'number', isCurrency: true }
        ];
      } else {
        return [
          { id: 'date', label: 'Date', dataType: 'date' },
          { id: 'amount', label: baseMetric.title, dataType: 'number', isCurrency: baseMetric.isCurrency },
          { id: 'customer', label: 'Customer', dataType: 'string' },
          { id: 'status', label: 'Status', dataType: 'category' }
        ];
      }
    }
    
    return columns;
  }, [baseMetric.id, baseMetric.title, baseMetric.isCurrency]);

  // Analyze column data for charts
  const analyzeColumnDataForChart = useCallback((data, column) => {
    const values = data.map(row => row[column.id]).filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) {
      return { 
        type: 'empty', 
        chartData: null, 
        summary: 'No data', 
        medianSummary: '' 
      };
    }
    
    const selectedValues = activeFilters[column.id] || [];
    
    switch (column.dataType) {
      case 'date': {
        const dateValues = values.map(val => {
          if (val instanceof Date) {
            return val;
          } else if (typeof val === 'string') {
            return new Date(val);
          } else {
            return new Date(val);
          }
        }).filter(d => !isNaN(d.getTime()));
        
        const chartData = generateTimeSeriesData(dateValues, selectedValues);
        
        let summary = 'No data';
        if (dateValues.length > 0) {
          const earliest = new Date(Math.min(...dateValues));
          const latest = new Date(Math.max(...dateValues));
          summary = `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
        }
        
        return {
          type: 'line',
          chartData,
          summary,
          medianSummary: `${values.length} values`
        };
      }
      
      case 'string': {
        // For strings, show count over time (like customer names, emails)
        // We need to get the dates from the data rows, not the string values themselves
        const uniqueCount = new Set(values).size;
        
        // Generate time series based on when these string values occurred
        // We'll use the transaction dates for this
        const transactionDates = data.map(row => {
          const dateValue = row.date;
          if (dateValue instanceof Date) {
            return dateValue;
          } else if (typeof dateValue === 'string') {
            return new Date(dateValue);
          } else {
            return new Date(dateValue);
          }
        }).filter(d => !isNaN(d.getTime()));
        
        const chartData = generateTimeSeriesData(transactionDates, selectedValues);
        
        return {
          type: 'line',
          chartData,
          summary: `${uniqueCount} unique values`,
          medianSummary: ''
        };
      }
      
      case 'number': {
        const numericValues = values.map(val => {
          if (typeof val === 'string') {
            const cleaned = val.replace(/[$,]/g, '');
            return parseFloat(cleaned);
          }
          return parseFloat(val);
        }).filter(val => !isNaN(val));
        
        if (numericValues.length === 0) {
          return { 
            type: 'empty', 
            chartData: null, 
            summary: 'No data', 
            medianSummary: '' 
          };
        }
        
        const chartData = generateNumberDistributionData(numericValues, selectedValues);
        const median = calculateMedian(numericValues);
        
        let medianText = '';
        if (column.id === 'amount' || column.id.includes('revenue')) {
          medianText = `median $${median.toFixed(2)}`;
        } else if (column.isPercentage || column.id.includes('Rate')) {
          medianText = `median ${median.toFixed(1)}%`;
        } else if (column.id.includes('rate') && !column.isPercentage) {
          medianText = `median $${median.toFixed(3)}`;
        } else {
          medianText = `median ${Math.round(median).toLocaleString()}`;
        }
        
        return {
          type: 'bar',
          chartData,
          summary: `${values.length} values`,
          medianSummary: medianText
        };
      }
      
      case 'category': {
        const categoryCount = {};
        values.forEach(val => {
          categoryCount[val] = (categoryCount[val] || 0) + 1;
        });
        
        const uniqueCount = Object.keys(categoryCount).length;
        const summary = uniqueCount === 1 ? '1 category' : 
                       uniqueCount <= 10 ? `${uniqueCount} categories` : 
                       `${uniqueCount} unique values`;
        
        return {
          type: 'category',
          chartData: null,
          rawData: categoryCount,
          summary,
          medianSummary: ''
        };
      }
      
      default:
        return { 
          type: 'empty', 
          chartData: null, 
          summary: 'No data', 
          medianSummary: '' 
        };
    }
  }, [activeFilters, generateTimeSeriesData, generateNumberDistributionData, calculateMedian]);

  const columnDefinitions = getColumnDefinitions();
  
  // Consolidated reporting controls state to prevent unnecessary re-renders
  const [reportingControls, setReportingControls] = useState({
    period: 'last7days',
    interval: 'daily',
    comparison: 'previous-period',
    filters: [] // Add filters array to store active filters
  });
  
  // Chart state management - initialize with the current chart configuration matching metric cards
  const [generatedChart, setGeneratedChart] = useState(() => {
    // Don't initialize chart settings for meter charts since they use a different visualization
    if (location.state?.metric?.chartType === 'meter' || 
        baseMetric.id === 'payments-status' || 
        baseMetric.id === 'invoices-status') {
      return null;
    }
    
    // For regular metrics, determine the appropriate chart type
    let chartType = 'line'; // Default to line charts for most metrics
    
    // Use specific chart types for certain metrics
    if (baseMetric.id.includes('rate') || baseMetric.unit === 'percentage') {
      chartType = 'line'; // Rates and percentages work well as line charts
    } else if (baseMetric.id === 'new-customers' || baseMetric.id === 'active-subscribers') {
      chartType = 'bar'; // Customer counts might look better as bar charts
    } else if (location.state?.metric?.chartType) {
      chartType = location.state.metric.chartType; // Use passed chart type if available
    }
    
    // Set up the axes based on the metric type
    let xAxis, yAxis;
    
    if (baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue') {
      // For overage revenue metrics
      xAxis = { id: 'date', label: 'Date', dataType: 'date' };
      yAxis = { id: 'amount', label: 'Overage revenue', dataType: 'number', isCurrency: true };
    } else {
      // For other metrics like gross volume
      xAxis = { id: 'date', label: 'Date', dataType: 'date' };
      yAxis = { 
        id: 'amount', 
        label: baseMetric.title, 
        dataType: 'number',
        isCurrency: baseMetric.isCurrency,
        isPercentage: baseMetric.unit === 'percentage'
      };
    }
    
    const initialChart = {
      type: chartType,
      xAxis: xAxis,
      yAxis: yAxis,
      title: `${yAxis.label} by ${xAxis.label}`,
      description: `${chartType} chart showing ${yAxis.label.toLowerCase()} over time`,
      data: null, // Will be populated by chart data generation
      timestamp: Date.now()
    };
    
    return initialChart;
  });
  
  // Add state to track when chart needs to update
  const [chartVersion, setChartVersion] = useState(0);
  
  // Chart type change handler
  const handleChartTypeChange = useCallback((newType) => {
    if (generatedChart) {
      setGeneratedChart(prev => {
        const updated = { 
          ...prev, 
          type: newType,
          timestamp: Date.now()
        };
        return updated;
      });
      setChartVersion(prev => prev + 1); // Force chart refresh
    }
  }, [generatedChart]);
  
  // Chart axis change handler
  const handleChartAxisChange = useCallback((axisType, column) => {
    if (generatedChart && column) {
      setGeneratedChart(prev => {
        const updated = {
          ...prev,
          [axisType + 'Axis']: column,
          title: axisType === 'y' ? `${column.label} by ${prev.xAxis.label}` : `${prev.yAxis.label} by ${column.label}`,
          timestamp: Date.now()
        };
        return updated;
      });
      setChartVersion(prev => prev + 1); // Force chart refresh
    }
  }, [generatedChart]);
  
  // Remove chart handler
  const handleRemoveChart = useCallback(() => {
    setGeneratedChart(null);
    setChartVersion(prev => prev + 1);
  }, []);
  
  // Add chart handler (similar to ReportDetail)
  const handleAddChart = useCallback(() => {
    // Create a default chart configuration
    const availableColumns = getColumnDefinitions();
    const numericColumn = availableColumns.find(col => col.dataType === 'number' || col.isCurrency || col.isPercentage) || 
                         { id: 'amount', label: baseMetric.title, dataType: 'number', isCurrency: baseMetric.isCurrency };
    
    const defaultChart = {
      type: 'line',
      xAxis: { id: 'date', label: 'Date', dataType: 'date' },
      yAxis: numericColumn,
      title: `${numericColumn.label} by Date`,
      description: `Line chart showing ${numericColumn.label.toLowerCase()} over time`,
      data: null,
      timestamp: Date.now()
    };
    
    setGeneratedChart(defaultChart);
    setChartVersion(prev => prev + 1);
  }, [baseMetric, getColumnDefinitions]);
  
  // Generate chart data that responds to chart settings changes
  const generateChartDataForSettings = useCallback((chartSettings) => {
    if (!chartSettings) return null;
    
    try {
      // Get the exact metric values from standardizedMetrics for consistency
      const standardizedMetric = standardizedMetrics[baseMetric.id];
      if (!standardizedMetric) {
        throw new Error(`No standardized metric found for ${baseMetric.id}`);
      }
      
      // Get data for chart visualization
      const metricIdForData = baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' 
        ? 'overagerevenue' 
        : baseMetric.id.replace(/-/g, '');
      
      const metricData = getMetricChartData(metricIdForData, reportingControls.period, reportingControls.interval);
      
      // Use the metric data directly - plan filtering is handled by MetricsContext
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
      
      // Handle different Y-axis selections
      let dataToUse = filteredCurrentData;
      let previousDataToUse = filteredPreviousData;
      
      // If the Y-axis is different from the default 'amount', we might need to transform the data
      if (chartSettings.yAxis && chartSettings.yAxis.id !== 'amount') {
        // For demonstration, we'll simulate different data transformations
        switch (chartSettings.yAxis.id) {
          case 'customer':
            // For customer data, show count of unique customers per time period
            dataToUse = metricData.currentData.map((_, index) => Math.floor(Math.random() * 50) + 10 + index * 2);
            previousDataToUse = metricData.previousData.map((_, index) => Math.floor(Math.random() * 40) + 8 + index * 1.5);
            break;
          case 'customerCount':
            // Show customer count growth over time
            dataToUse = metricData.currentData.map((_, index) => Math.floor(Math.random() * 30) + 20 + index * 3);
            previousDataToUse = metricData.previousData.map((_, index) => Math.floor(Math.random() * 25) + 15 + index * 2);
            break;
          case 'transactionCount':
            // Show transaction count variations
            dataToUse = metricData.currentData.map((_, index) => Math.floor(Math.random() * 100) + 50 + index * 10);
            previousDataToUse = metricData.previousData.map((_, index) => Math.floor(Math.random() * 80) + 40 + index * 8);
            break;
          case 'transactionVolume':
            // Show transaction volume growth
            dataToUse = metricData.currentData.map((_, index) => Math.floor(Math.random() * 200) + 100 + index * 15);
            previousDataToUse = metricData.previousData.map((_, index) => Math.floor(Math.random() * 150) + 80 + index * 12);
            break;
          case 'averageTransactionValue':
            // Show average transaction value trends
            dataToUse = metricData.currentData.map(() => Math.floor(Math.random() * 50) + 75); // $75-125 range
            previousDataToUse = metricData.previousData.map(() => Math.floor(Math.random() * 40) + 65); // $65-105 range
            break;
          case 'successRate':
            // Show success rate as percentage (85-98%)
            dataToUse = metricData.currentData.map(() => Math.floor(Math.random() * 13) + 85);
            previousDataToUse = metricData.previousData.map(() => Math.floor(Math.random() * 10) + 82);
            break;
          case 'refundRate':
            // Show refund rate as percentage (1-8%)
            dataToUse = metricData.currentData.map(() => Math.floor(Math.random() * 7) + 1);
            previousDataToUse = metricData.previousData.map(() => Math.floor(Math.random() * 6) + 2);
            break;
          case 'averageOverageRate':
            // Show average overage rate for overage revenue metrics
            dataToUse = metricData.currentData.map(() => (Math.random() * 0.002 + 0.0008).toFixed(4)); // $0.0008-0.0028 range
            previousDataToUse = metricData.previousData.map(() => (Math.random() * 0.0015 + 0.0006).toFixed(4)); // $0.0006-0.0021 range
            break;
          case 'status':
            // For status data, show success rate as percentage
            dataToUse = metricData.currentData.map(() => Math.floor(Math.random() * 10) + 85); // 85-95% success rate
            previousDataToUse = metricData.previousData.map(() => Math.floor(Math.random() * 10) + 80); // 80-90% success rate
            break;
          case 'date':
            // For date as Y-axis (unusual but possible), show days since start
            dataToUse = metricData.currentData.map((_, index) => index + 1);
            previousDataToUse = metricData.previousData.map((_, index) => index + 1);
            break;
          default:
            // Use the original data
            break;
        }
      }
      
      // Format for chart component
      const chartData = {
        labels: metricData.labels,
        datasets: [
          {
            label: chartSettings.yAxis.label,
            data: dataToUse,
            borderColor: '#635bff',
            backgroundColor: chartSettings.type === 'bar' ? '#635bff' : 'transparent',
            tension: chartSettings.type === 'line' ? 0.4 : 0,
            pointRadius: reportingControls.interval === 'monthly' ? 3 : 0,
            borderWidth: 2,
            fill: false
          }
        ]
      };
      
      // Only add comparison data if it's enabled
      if (reportingControls.comparison !== 'no-comparison' && previousDataToUse.some(val => val !== null)) {
        chartData.datasets.push({
          label: 'Previous period',
          data: previousDataToUse,
          borderColor: 'rgba(120, 120, 120, 0.6)',
          backgroundColor: chartSettings.type === 'bar' ? 'rgba(120, 120, 120, 0.6)' : 'transparent',
          tension: chartSettings.type === 'line' ? 0.4 : 0,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: chartSettings.type === 'line' ? [4, 4] : undefined
        });
      }
      
      return chartData;
    } catch (error) {
      console.error("Error generating chart data for settings:", error);
      return { labels: [], datasets: [] };
    }
  }, [baseMetric, reportingControls, standardizedMetrics, getMetricChartData]);
  
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
      
      // Use the new chart data generation function if we have chart settings
      let chartData;
      if (generatedChart) {
        chartData = generateChartDataForSettings(generatedChart);
      } else {
        // Fallback to original data generation for when no chart settings exist
        const metricIdForData = baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue' 
          ? 'overagerevenue' 
          : baseMetric.id.replace(/-/g, '');
        
        const metricData = getMetricChartData(metricIdForData, reportingControls.period, reportingControls.interval);
        
        // Use the metric data directly - plan filtering is handled by MetricsContext
        let filteredCurrentData = [...metricData.currentData];
        let filteredPreviousData = [...metricData.previousData];
        
        // Apply Developer plan filter if it exists
        if (reportingControls.filters.includes('developer-plan')) {
          filteredCurrentData = metricData.currentData.map(value => value * 0.4);
          filteredPreviousData = metricData.previousData.map(value => value * 0.4);
          
          if (filteredCurrentData.length >= 2) {
            filteredCurrentData[filteredCurrentData.length - 2] *= 1.3;
            filteredCurrentData[filteredCurrentData.length - 1] *= 1.5;
          }
        }
        
        chartData = {
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
      }
      
      // Apply anomaly highlighting if needed
      if (hasAnomaly() && chartData) {
        chartData = generateAnomalyHighlight(chartData);
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
  }, [baseMetric, reportingControls, hasAnomaly, generateAnomalyHighlight, standardizedMetrics, getMetricChartData, generatedChart, chartVersion, generateChartDataForSettings]); // Add dependencies
  
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
  
  // Handle Chart click event - properly handle chart interactions without navigation conflicts
  const handleChartClick = useCallback((event, elements) => {
    // Only handle click if we have elements and valid event data
    if (!elements || !elements.length || !event) {
      return;
    }
    
    try {
      const element = elements[0];
      const datasetIndex = element.datasetIndex;
      const index = element.index;
      
      // Get the clicked data point information
      if (chartData && chartData.datasets && chartData.datasets[datasetIndex]) {
        const dataset = chartData.datasets[datasetIndex];
        const label = chartData.labels ? chartData.labels[index] : '';
        const value = dataset.data[index];
        
        // For now, just log the interaction (could be expanded to show details)
        console.log('Chart clicked:', { label, value, datasetIndex, index });
        
        // Prevent event bubbling to avoid navigation conflicts
        if (event.native) {
          event.native.stopPropagation();
          event.native.preventDefault();
        }
      }
    } catch (error) {
      // Silently handle any errors to prevent page crashes
      console.warn('Chart click handler error:', error);
    }
  }, [chartData]);
  
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
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
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
        
        // Generate realistic values for all additional columns
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        transactions.push({
          id: `txn_${Math.random().toString(36).substr(2, 9)}`,
          date: date,
          amount: `$${amount.toFixed(2)}`,
          customer: customers[Math.floor(Math.random() * customers.length)],
          status: status,
          // Add realistic data for the new chartable columns
          customerCount: Math.floor(Math.random() * 50) + 10, // 10-60 customers
          transactionCount: Math.floor(Math.random() * 200) + 50, // 50-250 transactions
          averageTransactionValue: amount + (Math.random() * 50 - 25), // Vary around the amount
          successRate: status === 'Succeeded' ? 
            (Math.random() * 10 + 90) : // 90-100% for successful transactions
            (Math.random() * 30 + 50),  // 50-80% for others
          refundRate: status === 'Refunded' ?
            (Math.random() * 15 + 10) : // 10-25% for refunded
            (Math.random() * 5 + 1)     // 1-6% for others
        });
      }
      
      return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    };
    
    // Create transactions data
    const transactions = generateTransactions();
    
    // Apply Developer plan filter if active
    let filteredTransactions = transactions;
    if (baseMetric.id === 'overage-revenue' || baseMetric.id === 'usage-overage-revenue') {
      if (currentPlan === 'developer') {
        filteredTransactions = transactions.filter(txn => txn.plan === 'Developer');
      }
    }
    
    // Apply data visualization filters
    if (Object.keys(activeFilters).length > 0) {
      filteredTransactions = filteredTransactions.filter(transaction => {
        return Object.entries(activeFilters).every(([columnKey, filterValues]) => {
          const transactionValue = transaction[columnKey];
          return filterValues.includes(transactionValue);
        });
      });
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
  }, [currentPage, baseMetric.id, currentPlan, activeFilters]);
  
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

  // Update generatedChart with actual data when chartData is available
  useEffect(() => {
    if (generatedChart && chartData && chartData.labels && chartData.datasets && !generatedChart.data) {
      setGeneratedChart(prev => ({
        ...prev,
        data: chartData,
        timestamp: Date.now()
      }));
    }
  }, [chartData, generatedChart]);

  // Format table cell values based on column type
  const formatTableCellValue = useCallback((value, column) => {
    if (value === null || value === undefined) return '-';
    
    // Handle different column types
    if (column.isCurrency) {
      // Format currency values
      const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
      return formatCurrency(numValue);
    } else if (column.isPercentage) {
      // Format percentage values to 2 decimal places
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return `${numValue.toFixed(2)}%`;
    } else if (column.dataType === 'number' && typeof value === 'number') {
      // Format other numbers to reasonable decimal places
      if (value >= 1000) {
        return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
      } else if (value >= 10) {
        return value.toFixed(1);
      } else {
        return value.toFixed(2);
      }
    }
    
    return value;
  }, [formatCurrency]);

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
            <ShareButton onClick={() => setIsShareModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="8,6 12,2 16,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </ShareButton>
            <EditButton to={`/metrics/${baseMetric.id}/edit`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.25 11.5V10C1.25 9.58579 1.58579 9.25 2 9.25C2.41421 9.25 2.75 9.58579 2.75 10V11.5C2.75 12.4665 3.5335 13.25 4.5 13.25H6C6.41421 13.25 6.75 13.5858 6.75 14C6.75 14.4142 6.41421 14.75 6 14.75H4.5C2.70507 14.75 1.25 13.2949 1.25 11.5ZM13.25 11.5V10C13.25 9.58579 13.5858 9.25 14 9.25C14.4142 9.25 14.75 9.58579 14.75 10V11.5C14.75 13.2949 13.2949 14.75 11.5 14.75H10C9.58579 14.75 9.25 14.4142 9.25 14C9.25 13.5858 9.58579 13.25 10 13.25H11.5C12.4665 13.25 13.25 12.4665 13.25 11.5ZM1.25 6V4.5C1.25 2.70507 2.70507 1.25 4.5 1.25H6C6.41421 1.25 6.75 1.58579 6.75 2C6.75 2.41421 6.41421 2.75 6 2.75H4.5C3.5335 2.75 2.75 3.5335 2.75 4.5V6C2.75 6.41421 2.41421 6.75 2 6.75C1.58579 6.75 1.25 6.41421 1.25 6ZM13.25 6V4.5C13.25 3.5335 12.4665 2.75 11.5 2.75H10C9.58579 2.75 9.25 2.41421 9.25 2C9.25 1.58579 9.58579 1.25 10 1.25H11.5C13.2949 1.25 14.75 2.70507 14.75 4.5V6C14.75 6.41421 14.4142 6.75 14 6.75C13.5858 6.75 13.25 6.41421 13.25 6Z" fill="#635bff"/>
              </svg>
              Open in explorer
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
                      <path d="M21 15C21 15.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            // Chart-related props
            chartType={generatedChart ? generatedChart.type : null}
            chartSettings={generatedChart}
            availableColumns={columnDefinitions}
            onChartTypeChange={handleChartTypeChange}
            onChartAxisChange={handleChartAxisChange}
            onRemoveChart={handleRemoveChart}
            // Pass the current chart configuration
            currentChart={generatedChart}
            customContent={(
              <>
                {/* Add chart chip when no chart exists and not a meter chart */}
                {!generatedChart && !isMeterChart && (
                  <ChartChip onClick={handleAddChart}>
                    <ChartIconWrapper>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#6772e5" strokeWidth="2" />
                        <path d="M12 8V16M8 12H16" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </ChartIconWrapper>
                    <ChartChipValue>Chart</ChartChipValue>
                  </ChartChip>
                )}
                
                {/* Meter chart specific controls */}
                {isMeterChart && meterData && (
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
              </>
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
          ) : generatedChart ? (
            <ChartWrapper 
              id="chart-container"
              onMouseMove={handleChartHover}
              onMouseLeave={handleTableCellLeave}
              onClick={handleChartClick} 
            >
              <LineChart 
                ref={chartInstanceRef}
                data={chartData} 
                height={200}
                type={generatedChart.type}
                unit={generatedChart.yAxis?.isCurrency ? 'currency' : 'number'}
                showLegend={false} 
                useMarkers={true}
                customPlugins={[verticalLinePlugin]}
                key={`chart-${chartVersion}-${generatedChart.timestamp || 0}`}
              />
            </ChartWrapper>
          ) : null}
          
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
            
            {currentPlan !== 'developer' && (
              <AnomalyActionLink onClick={() => {
                // Set plan to Developer in MetricsContext
                setPlan('developer');
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
            
            {currentPlan === 'developer' && (
              <AnomalyActionLink onClick={() => {
                // Clear plan filter in MetricsContext
                setPlan('all');
                // Reset to first page when filter is cleared
                setCurrentPage(1);
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="#635bff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear Developer plan filter
              </AnomalyActionLink>
            )}
            
            <AnomalyActionLink style={{ marginTop: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.25 11.5V10C1.25 9.58579 1.58579 9.25 2 9.25C2.41421 9.25 2.75 9.58579 2.75 10V11.5C2.75 12.4665 3.5335 13.25 4.5 13.25H6C6.41421 13.25 6.75 13.5858 6.75 14C6.75 14.4142 6.41421 14.75 6 14.75H4.5C2.70507 14.75 1.25 13.2949 1.25 11.5ZM13.25 11.5V10C13.25 9.58579 13.5858 9.25 14 9.25C14.4142 9.25 14.75 9.58579 14.75 10V11.5C14.75 13.2949 13.2949 14.75 11.5 14.75H10C9.58579 14.75 9.25 14.4142 9.25 14C9.25 13.5858 9.58579 13.25 10 13.25H11.5C12.4665 13.25 13.25 12.4665 13.25 11.5ZM1.25 6V4.5C1.25 2.70507 2.70507 1.25 4.5 1.25H6C6.41421 1.25 6.75 1.58579 6.75 2C6.75 2.41421 6.41421 2.75 6 2.75H4.5C3.5335 2.75 2.75 3.5335 2.75 4.5V6C2.75 6.41421 2.41421 6.75 2 6.75C1.58579 6.75 1.25 6.41421 1.25 6ZM13.25 6V4.5C13.25 3.5335 12.4665 2.75 11.5 2.75H10C9.58579 2.75 9.25 2.41421 9.25 2C9.25 1.58579 9.58579 1.25 10 1.25H11.5C13.2949 1.25 14.75 2.70507 14.75 4.5V6C14.75 6.41421 14.4142 6.75 14 6.75C13.5858 6.75 13.25 6.41421 13.25 6Z" fill="#635bff"/>
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
                          {formatTableCellValue(value, { id: 'amount', isCurrency: baseMetric.isCurrency })}
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
                            {formatTableCellValue(value, { id: 'amount', isCurrency: baseMetric.isCurrency })}
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
            <StyledTable>
              <thead>
                <tr>
                  {columnDefinitions.map((column) => (
                    <th key={column.id}>
                      <HeaderCellContent>
                        <HeaderLabel>
                          {column.label}
                        </HeaderLabel>
                        <HeaderIcons>
                          {activeFilters[column.id] && activeFilters[column.id].length > 0 && (
                            <FilterIcon 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFilter(column.id);
                              }}
                              onMouseEnter={(e) => {
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) {
                                  svg.innerHTML = `
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  `;
                                }
                              }}
                              onMouseLeave={(e) => {
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) {
                                  svg.innerHTML = `
                                    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  `;
                                }
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </FilterIcon>
                          )}
                          <DataTypeIcon>
                            {getDataTypeIcon(column.dataType)}
                          </DataTypeIcon>
                        </HeaderIcons>
                      </HeaderCellContent>
                    </th>
                  ))}
                </tr>
                
                {/* Data visualization summary row */}
                <SummaryRow>
                  {columnDefinitions.map((column) => {
                    const analysis = analyzeColumnDataForChart(transactions, column);
                    return (
                      <SummaryCell key={`summary-${column.id}`}>
                        <SummaryCellContent>
                          <DataVizChartContainer chartType={analysis.type}>
                            {analysis.type === 'line' && analysis.chartData && (
                              <Line
                                data={analysis.chartData}
                                options={getChartOptions('line', column.id, activeFilters[column.id], column)}
                              />
                            )}
                            {analysis.type === 'bar' && analysis.chartData && (
                              <Bar
                                data={analysis.chartData}
                                options={getChartOptions('bar', column.id, activeFilters[column.id], column)}
                              />
                            )}
                            {analysis.type === 'category' && analysis.rawData && (
                              <CategoryChart
                                data={analysis.rawData}
                                totalResults={transactions.length}
                                onCategoryClick={(value) => toggleFilter(column.id, value)}
                                selectedCategories={activeFilters[column.id]}
                              />
                            )}
                            {analysis.type === 'empty' && (
                              <div style={{ color: '#6b7c93', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                No data
                              </div>
                            )}
                          </DataVizChartContainer>
                          <SummaryText>
                            <SummaryTextLeft>{analysis.summary}</SummaryTextLeft>
                            <SummaryTextRight>{analysis.medianSummary || ''}</SummaryTextRight>
                          </SummaryText>
                        </SummaryCellContent>
                      </SummaryCell>
                    );
                  })}
                </SummaryRow>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    onClick={() => navigate(`/users/${transaction.customer.replace(/\s+/g, '-').toLowerCase()}`)}
                  >
                    {columnDefinitions.map((column) => (
                      <td key={column.id}>
                        {column.id === 'status' ? (
                          <span style={{ 
                            color: transaction[column.id] === 'Succeeded' ? 'var(--success-color)' : 
                                   transaction[column.id] === 'Failed' ? 'var(--danger-color)' :
                                   transaction[column.id] === 'Refunded' ? 'var(--warning-color)' : 
                                   'var(--text-secondary)'
                          }}>
                            {transaction[column.id]}
                          </span>
                        ) : column.id === 'date' ? (
                          transaction[column.id] instanceof Date ? 
                            transaction[column.id].toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) :
                            transaction[column.id]
                        ) : (
                          formatTableCellValue(transaction[column.id], column)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </StyledTable>
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
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        title={baseMetric.title}
      />
    </Container>
  );
};

export default MetricDetail; 
