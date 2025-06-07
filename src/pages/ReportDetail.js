import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReportingControls from '../components/ReportingControls';
import ShareModal from '../components/ShareModal';
import { getColumnSchema } from '../data/reportSchemas';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

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

const ReportDetailContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
`;

const ReportDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ReportDetailTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.primary ? '#5a51e5' : '#f7f9fc'};
  }
`;

const MoreButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f7f9fc;
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
`;
const ReportDetailValue = styled(motion.div)`
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

const ControlsContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultsSection = styled.div`
  margin-top: 24px;
`;

const ResultsHeader = styled.div`
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

const SortIndicator = styled.span`
  margin-left: 4px;
`;

const UsageValue = styled.div`
  color: ${props => props.negative ? 'var(--danger-color)' : 'inherit'};
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

// New styled components for data summary row
const DataTypeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: #6b7c93;
  font-size: 12px;
  font-weight: 500;
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

const HeaderIcons = styled.div`
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

const ChartContainer = styled.div`
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

const ChartModule = styled.div`
  background-color: transparent;
  border: 1px dotted #d1d5db;
  border-radius: 8px;
  padding: 32px;
  margin: 24px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px;
  gap: 12px;
  
  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ChartModuleIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #6b7280;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ChartModuleText = styled.div`
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
`;

const GeneratedChartContainer = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin: 24px 0;
  border: 1px solid var(--border-color);
`;

const ChartSectionContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const GeneratedChartWrapper = styled.div`
  flex: ${props => props.showSettings ? '2' : '1'};
  height: 200px;
  width: 100%;
  min-width: 0;
  transition: all 0.3s ease;
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

const GeneratedChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const GeneratedChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const ChartActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ChartActionButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 20px;
  font-size: 14px;
  color: #697386;
  cursor: pointer;
  gap: 6px;
  white-space: nowrap;
  
  &:hover {
    border-color: #d7dfe8;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

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

const ChartDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
`;

const ChartSettingsPanel = styled.div`
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
  max-width: 280px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
`;

const ChartSettingsHeader = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-color);
`;

const ChartSettingsSection = styled.div`
  margin-bottom: 16px;
`;

const ChartSettingsLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 6px;
`;

const ChartTypeSelector = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const AxisSelector = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ChartSettingsActions = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
`;

const ChartSettingsButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const ChartSettingsButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border-color);
  
  &.primary {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    
    &:hover {
      background: #5a51e5;
    }
  }
  
  &.secondary {
    background: white;
    color: var(--text-color);
    
    &:hover {
      background: #f7f9fc;
    }
  }
`;

const RemoveChartButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--danger-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  
  &:hover {
    background: rgba(220, 53, 69, 0.1);
  }
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

const CategoryBarFill = styled.div`
  height: 100%;
  background-color: ${props => 
    props.isSelected ? '#635bff' : 
    props.hasSelection ? '#F5F6F8' : '#D8DEE4'
  };
  border-radius: 4px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => 
      props.isSelected ? '#5a51e5' : 
      props.hasSelection ? '#E8EAED' : '#C5CDD6'
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

const CategoryChart = ({ data, totalResults, onCategoryClick, selectedCategory }) => {
  // Safety checks for data
  if (!data || typeof data !== 'object') {
    return <div>No data available</div>;
  }

  const categories = Object.keys(data);
  const values = Object.values(data);
  const hasSelection = !!selectedCategory;
  
  // Safety check for categories and values
  if (!Array.isArray(categories) || !Array.isArray(values) || categories.length === 0) {
    return <div>No categories available</div>;
  }
  
  // Create array of category objects and sort by count in descending order
  const sortedCategories = categories.map((category, index) => ({
    name: category,
    count: values[index] || 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div>
      {sortedCategories.map((category) => {
        const percentage = totalResults && totalResults > 0 ? (category.count / totalResults) * 100 : 0;
        const isSelected = selectedCategory === category.name;
        
        return (
          <CategoryBar 
            key={category.name}
            onClick={() => onCategoryClick && onCategoryClick(category.name)}
          >
            <CategoryBarFill 
              style={{ width: `${percentage}%` }} 
              isSelected={isSelected}
              hasSelection={hasSelection}
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
    </div>
  );
};

// Sample report data
const reportSamples = {
  'churn-risk': {
    id: 'churn-risk',
    title: 'Churn risk',
    count: 413,
    trend: 3.5,
    isNegative: true,
    description: 'Customers at risk of churning based on usage patterns and engagement metrics'
  },
  'upsell-opportunities': {
    id: 'upsell-opportunities',
    title: 'Upsell opportunities',
    count: 875,
    trend: 6.7,
    isNegative: false,
    description: 'Customers who may benefit from additional services or higher tiers'
  },
  'revenue-composition': {
    id: 'revenue-composition',
    title: 'Revenue composition',
    count: 56400,
    trend: 0.4,
    isNegative: false,
    description: 'Breakdown of revenue sources across products and customer segments'
  },
  'new-free-trials': {
    id: 'new-free-trials',
    title: 'New free trials',
    count: 1500,
    trend: 2.3,
    isNegative: false,
    description: 'New customers who signed up for a free trial in the selected period'
  },
  'high-usage-growth': {
    id: 'high-usage-growth',
    title: 'High usage growth',
    count: 276,
    trend: 8.2,
    isNegative: false,
    description: 'Customers with significant increases in usage compared to previous period'
  },
  'monthly-sales': {
    id: 'monthly-sales',
    title: 'Monthly sales',
    count: 1238,
    trend: 5.4,
    isNegative: false,
    description: 'Monthly sales trends across all products and services'
  },
  'new-subscribers': {
    id: 'new-subscribers',
    title: 'New subscribers past 7 days',
    count: 93,
    trend: -2.1,
    isNegative: true,
    description: 'Users who subscribed to a paid plan in the last 7 days'
  },
  'weekly-churned': {
    id: 'weekly-churned',
    title: 'Weekly churned subscribers',
    count: 47,
    trend: -12.5,
    isNegative: false,
    description: 'Subscribers who canceled their subscription in the past week'
  },
  'top-selling': {
    id: 'top-selling',
    title: 'Top selling products of the week',
    count: 15,
    trend: 3.3,
    isNegative: false,
    description: 'Products with the highest sales volume in the past week'
  },
  'high-value': {
    id: 'high-value',
    title: 'High value customers',
    count: 164,
    trend: 1.9,
    isNegative: false,
    description: 'Customers with high lifetime value and consistent spending patterns'
  },
  'new-products': {
    id: 'new-products',
    title: 'New products adoption',
    count: 329,
    trend: 17.5,
    isNegative: false,
    description: 'Customers who have adopted newly released products or features'
  },
  'mrr-growth': {
    id: 'mrr-growth',
    title: 'MRR growth drivers',
    count: 284,
    trend: 4.8,
    isNegative: false,
    description: 'Analysis of the factors contributing to MRR (Monthly Recurring Revenue) growth'
  }
};

const ReportDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Get report-specific data
  const getReportData = useMemo(() => {
    // Find the report from our samples
    const report = reportSamples[params.reportId] || {
      title: "Report",
      count: 0,
      trend: 0,
      isNegative: false,
      description: "No description available"
    };

    // Get columns from shared schema
    const columns = getColumnSchema(params.reportId, true);

    return {
      ...report,
      columns: Array.isArray(columns) ? columns : [], // Ensure columns is always an array
      title: report.title || "Report",
      count: report.count || 0,
      trend: report.trend || 0,
      isNegative: report.isNegative || false,
      description: report.description || "No description available"
    };
  }, [params.reportId]);

  // Filter state management
  const [columnFilters, setColumnFilters] = useState({});

  // Chart state management
  const [generatedChart, setGeneratedChart] = useState(null);

  // Add state for tracking mouse position for tooltips
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Add state for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Chart settings panel state
  const [showChartSettings, setShowChartSettings] = useState(false);

  // Add state for pending chart settings changes
  const [pendingChartSettings, setPendingChartSettings] = useState({
    type: null,
    xAxis: null,
    yAxis: null
  });

  // Add state to store original chart settings for cancel functionality
  const [originalChartSettings, setOriginalChartSettings] = useState({
    type: null,
    xAxis: null,
    yAxis: null
  });

  // Initialize pending settings when chart is created or settings panel opens
  useEffect(() => {
    if (generatedChart && showChartSettings) {
      const currentSettings = {
        type: generatedChart.type,
        xAxis: generatedChart.xAxis,
        yAxis: generatedChart.yAxis
      };
      setPendingChartSettings(currentSettings);
      setOriginalChartSettings(currentSettings);
    }
  }, [generatedChart, showChartSettings]);

  const toggleFilter = useCallback((columnId, filterValue) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[columnId] === filterValue) {
        // Remove filter if clicking the same value
        delete newFilters[columnId];
      } else {
        // Set new filter
        newFilters[columnId] = filterValue;
      }
      
      return newFilters;
    });
  }, []);

  const clearFilter = useCallback((columnId) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
  }, []);

  // Global tooltip management
  const hideAllTooltips = useCallback(() => {
    const tooltips = document.querySelectorAll('.chartjs-tooltip');
    tooltips.forEach(tooltip => {
      tooltip.style.opacity = '0';
    });
    
    // Also hide the global tooltip specifically
    const globalTooltip = document.getElementById('global-chart-tooltip');
    if (globalTooltip) {
      globalTooltip.style.opacity = '0';
    }
  }, []);

  const showCustomTooltip = useCallback((event, label, value, chart, column = null) => {
    // Hide all tooltips first
    hideAllTooltips();
    
    // Get or create tooltip element
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
    
    // Set styling
    tooltipEl.style.backgroundColor = 'white';
    tooltipEl.style.color = '#333';
    tooltipEl.style.border = '1px solid #e3e8ee';
    tooltipEl.style.borderRadius = '6px';
    tooltipEl.style.padding = '10px 14px';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.fontWeight = '500';
    tooltipEl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
    tooltipEl.style.whiteSpace = 'nowrap';
    
    // Set content with proper formatting
    let content = `<div style="color: #635bff; font-weight: 600; margin-bottom: 4px;">${label}</div>`;
    
    // Format the value based on column type if available
    let formattedValue = value;
    if (column) {
      if (column.isCurrency && typeof value === 'number') {
        formattedValue = `${value} records`;
      } else if (column.isTrend && typeof value === 'number') {
        formattedValue = `${value} records`;
      } else if (column.isNumber && typeof value === 'number') {
        formattedValue = `${value} records`;
      } else {
        formattedValue = `${value} records`;
      }
    } else {
      formattedValue = `${value} records`;
    }
    
    content += `<div>${formattedValue}</div>`;
    tooltipEl.innerHTML = content;
    
    // Position tooltip
    let mouseX, mouseY;
    
    if (chart) {
      // For Chart.js charts
      mouseX = event.native ? event.native.clientX : event.clientX;
      mouseY = event.native ? event.native.clientY : event.clientY;
    } else {
      // For custom components
      mouseX = event.clientX;
      mouseY = event.clientY;
    }
    
    // Calculate position relative to the mouse
    const tooltipX = mouseX - (tooltipEl.offsetWidth / 2);
    const tooltipY = mouseY - tooltipEl.offsetHeight - 10;
    
    tooltipEl.style.left = tooltipX + 'px';
    tooltipEl.style.top = tooltipY + 'px';
    tooltipEl.style.opacity = '1';
  }, [hideAllTooltips]);

  // Clean up tooltips on unmount
  useEffect(() => {
    return () => {
      hideAllTooltips();
      // Also clean up the custom chart tooltip
      const chartTooltip = document.getElementById('chart-tooltip');
      if (chartTooltip) {
        chartTooltip.remove();
      }
    };
  }, [hideAllTooltips]);

  // Reporting controls
  const [reportingControls, setReportingControls] = useState({
    period: 'last_7_days',
    interval: 'daily',
    comparison: 'previous_period'
  });
  
  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('current_mrr');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;
  
  // Generate sample customer data
  const customerData = useMemo(() => {
    // Safety check for params and reportSamples
    if (!params || !params.reportId || !reportSamples) {
      return [];
    }

    // Get the count from the report sample
    const count = reportSamples[params.reportId]?.count || 413;
    
    // Generate a base template for a customer
    const generateCustomer = (id) => ({
      id,
      name: `Customer ${id}`,
      current_mrr: 100 + Math.floor(Math.random() * 600),
      projected_ltv: 3000 + Math.floor(Math.random() * 15000),
      product: ['Starter', 'Pro', 'Developer', 'Enterprise'][Math.floor(Math.random() * 4)],
      overage_revenue: 40 + Math.floor(Math.random() * 180),
      usage_growth: Math.floor(Math.random() * 100) - 50,
      included_units: 500000 + Math.floor(Math.random() * 1500000)
    });
    
    // Create a list of base customers with enough entries to match the count
    const baseCustomers = Array.from({ length: count }, (_, i) => {
      // Use predefined names for the first 15 customers for consistency
      const predefinedNames = [
        'ApexCloud', 'SynthCore', 'FunnelPilot', 'Lexio AI', 'InsightLoop',
        'BrightNova', 'ComposeAI', 'CloudNova', 'DataSpring', 'OrbitML',
        'PixelWave', 'QuantumLink', 'CyberSphere', 'VelocityAI', 'PulsarTech'
      ];
      
      const customer = generateCustomer(i + 1);
      
      // Use predefined names for first 15 customers
      if (i < predefinedNames.length) {
        customer.name = predefinedNames[i];
      } else {
        // Generate company names for remaining customers
        const prefixes = ['Tech', 'Data', 'Cloud', 'AI', 'Cyber', 'Digital', 'Net', 'Web', 'Dev', 'Soft'];
        const suffixes = ['Systems', 'Solutions', 'Labs', 'Works', 'Tech', 'Group', 'Inc', 'Logic', 'Hub', 'Core'];
        customer.name = `${prefixes[i % 10]}${suffixes[Math.floor(i / 10) % 10]}`;
      }
      
      return customer;
    });
    
    // Modify data based on report type
    switch (params.reportId) {
      case 'high-usage-growth':
        return baseCustomers.map(customer => ({
          ...customer,
          usage_growth: Math.abs(customer.usage_growth) * 2,
          overage_revenue: customer.overage_revenue * 1.5
        }));
        
      case 'monthly-sales':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.2,
          projected_ltv: customer.projected_ltv * 1.1
        }));
        
      case 'new-subscribers':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 0.9,
          projected_ltv: customer.projected_ltv * 1.2
        }));
        
      case 'weekly-churned':
        return baseCustomers.map(customer => ({
          ...customer,
          usage_growth: customer.usage_growth < 0 ? customer.usage_growth * 1.5 : -customer.usage_growth,
          overage_revenue: customer.overage_revenue * 0.5
        }));
        
      case 'top-selling':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.3, // Higher MRR for top sellers
          projected_ltv: customer.projected_ltv * 1.4
        })).sort((a, b) => b.current_mrr - a.current_mrr);
        
      case 'high-value':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.id % 3 === 0 ? customer.current_mrr * 2 : customer.current_mrr,
          projected_ltv: customer.projected_ltv * 1.5
        }));
        
      case 'new-products':
        return baseCustomers.map(customer => ({
          ...customer,
          product: customer.product === 'Pro' ? 'Pro+' : customer.product === 'Enterprise' ? 'Enterprise+' : customer.product,
          current_mrr: customer.current_mrr * 1.1
        }));
        
      case 'mrr-growth':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.25,
          usage_growth: Math.abs(customer.usage_growth) * 0.5
        }));
        
      case 'upsell-opportunities':
        return baseCustomers.map(customer => ({
          ...customer,
          projected_ltv: customer.projected_ltv * 1.8
        }));
        
      case 'new-free-trials':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: 0,
          overage_revenue: 0,
          usage_growth: 100,
          included_units: 500000
        }));
        
      case 'revenue-composition':
        return baseCustomers.map(customer => ({
          ...customer,
          subscription_revenue: customer.current_mrr * 0.7,
          usage_revenue: customer.current_mrr * 0.2,
          add_on_revenue: customer.current_mrr * 0.1
        }));
        
      default: // churn-risk or any other
        return baseCustomers;
    }
  }, [params.reportId]);
  
  // Sort and paginate the data
  const sortedData = useMemo(() => {
    // Safety check for customerData
    if (!customerData || !Array.isArray(customerData)) {
      return [];
    }

    // First apply filters
    let filteredData = [...customerData];
    
    // Safety check for columnFilters
    if (columnFilters && typeof columnFilters === 'object') {
      Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
        if (Array.isArray(filteredData)) {
          filteredData = filteredData.filter(row => {
            if (!row || typeof row !== 'object') return false;
            
            const cellValue = row[columnId];
            
            // Handle null/undefined values
            if (cellValue === null || cellValue === undefined) {
              return false;
            }
            
            // For string/category columns, exact match
            if (typeof cellValue === 'string') {
              return cellValue === filterValue;
            }
            
            // For number columns, check if value falls within the range
            if (typeof cellValue === 'number') {
              // If filterValue is a range (contains ' - ')
              if (typeof filterValue === 'string' && filterValue.includes(' - ')) {
                // Remove currency symbols, commas, percentages, and parse the range
                const cleanFilterValue = filterValue.replace(/[$,%]/g, '');
                const [minStr, maxStr] = cleanFilterValue.split(' - ');
                const min = parseFloat(minStr);
                const max = parseFloat(maxStr);
                return cellValue >= min && cellValue < max; // Changed to < max to avoid overlap
              }
              // If filterValue is a single number
              const numericFilterValue = typeof filterValue === 'string' ? 
                parseFloat(filterValue.replace(/[$,%]/g, '')) : filterValue;
              return cellValue === numericFilterValue;
            }
            
            // For other types, try string comparison
            return String(cellValue) === String(filterValue);
          });
        }
      });
    }
    
    // Ensure filteredData is still an array after filtering
    if (!Array.isArray(filteredData)) {
      filteredData = [];
    }
    
    // Then sort the filtered data
    return filteredData.sort((a, b) => {
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
        return 0;
      }
      
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [customerData, sortField, sortDirection, columnFilters]);
  
  // Get current page of data
  const currentData = useMemo(() => {
    // Safety check for sortedData
    if (!sortedData || !Array.isArray(sortedData)) {
      return [];
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedData, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil((sortedData && Array.isArray(sortedData) ? sortedData.length : 0) / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setReportingControls(prev => ({ ...prev, period }));
  };
  
  // Handle interval change
  const handleIntervalChange = (interval) => {
    setReportingControls(prev => ({ ...prev, interval }));
  };
  
  // Handle comparison change
  const handleComparisonChange = (comparison) => {
    setReportingControls(prev => ({ ...prev, comparison }));
  };

  // Format table cell data based on column type
  const formatCellValue = (value, column) => {
    if (value === undefined || value === null) return '-';
    
    if (column.isCurrency) {
      return typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;
    }
    
    if (column.isTrend) {
      const isNegative = value < 0;
      const displayClass = column.isPositive ? !isNegative : isNegative;
      return (
        <UsageValue negative={displayClass}>
          {value > 0 ? '+' : ''}{value}%
        </UsageValue>
      );
    }
    
    if (column.isNumber || column.dataType === 'number') {
      return typeof value === 'number' ? value.toLocaleString('en-US') : value;
    }
    
    return value;
  };

  // Helper functions for data analysis and visualization
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

  // Format values based on column type
  const formatValue = (value, column) => {
    if (value === null || value === undefined) return value;
    
    if (column.isCurrency) {
      return typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;
    }
    
    if (column.dataType === 'number' && typeof value === 'number') {
      return value.toLocaleString('en-US');
    }
    
    return value;
  };

  // Format values for charts - always returns strings, never React components
  const formatChartValue = (value, column) => {
    if (value === null || value === undefined) return String(value);
    
    if (column.isCurrency) {
      return typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : String(value);
    }
    
    if (column.isTrend) {
      return typeof value === 'number' ? `${value.toFixed(1)}%` : String(value);
    }
    
    if (column.isNumber || column.dataType === 'number') {
      return typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
    }
    
    return String(value);
  };

  // Helper function to calculate median
  const calculateMedian = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const analyzeColumnData = (data, column, filteredData) => {
    // Safety checks for input parameters
    if (!data || !Array.isArray(data) || !column || !filteredData || !Array.isArray(filteredData)) {
      return {
        type: 'bar',
        summary: 'No data available',
        chartData: { 
          labels: ['No data'], 
          datasets: [{ 
            data: [0], 
            backgroundColor: '#F5F6F8',
            borderRadius: 2
          }] 
        }
      };
    }

    const values = data.map(row => row && row[column.id]).filter(val => val !== null && val !== undefined);
    const filteredValues = filteredData.map(row => row && row[column.id]).filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) {
      return {
        type: 'bar',
        summary: '0 values',
        chartData: { 
          labels: ['No data'], 
          datasets: [{ 
            data: [0], 
            backgroundColor: '#F5F6F8',
            borderRadius: 2
          }] 
        }
      };
    }
    
    switch (column.dataType) {
      case 'string':
        // For strings, we'll show count over time (simulated)
        const uniqueCount = new Set(filteredValues).size;
        return {
          type: 'line',
          summary: `${uniqueCount} unique values`,
          chartData: generateTimeSeriesData(values, columnFilters[column.id], column)
        };
        
      case 'category':
        // Count occurrences of each category in original data
        const categoryCount = {};
        values.forEach(val => {
          categoryCount[val] = (categoryCount[val] || 0) + 1;
        });
        
        // Count filtered categories for summary
        const filteredCategoryCount = new Set(filteredValues).size;
        return {
          type: 'category',
          summary: `${filteredCategoryCount} ${filteredCategoryCount === 1 ? 'category' : 'categories'}`,
          chartData: generateCategoryChartData(categoryCount),
          rawData: categoryCount
        };
        
      case 'number':
        // Create distribution buckets from original data
        const numericValues = values.filter(val => typeof val === 'number' && !isNaN(val));
        const filteredNumericValues = filteredValues.filter(val => typeof val === 'number' && !isNaN(val));
        if (numericValues.length === 0) {
          return {
            type: 'bar',
            summary: '0 numeric values',
            chartData: { 
              labels: ['No data'], 
              datasets: [{ 
                data: [0], 
                backgroundColor: '#F5F6F8',
                borderRadius: 2
              }] 
            }
          };
        }
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        
        // Format summary based on column type using median
        let summaryText = `${filteredNumericValues.length} values`;
        let medianText = '';
        if (filteredNumericValues.length > 0) {
          const medianValue = calculateMedian(filteredNumericValues);
          if (column.isCurrency) {
            medianText = `median ${formatChartValue(medianValue, column)}`;
          } else if (column.isTrend) {
            medianText = `median ${medianValue.toFixed(1)}%`;
          } else if (column.isNumber) {
            medianText = `median ${Math.round(medianValue).toLocaleString()}`;
          }
        }
        
        return {
          type: 'bar',
          summary: summaryText,
          medianSummary: medianText,
          chartData: generateNumberDistributionData(numericValues, min, max, columnFilters[column.id], column)
        };
        
      case 'date':
        // Date distribution (if we had date columns)
        return {
          type: 'bar',
          summary: `${filteredValues.length} dates`,
          chartData: generateDateDistributionData(values)
        };
        
      default:
        return {
          type: 'bar',
          summary: `${filteredValues.length} items`,
          chartData: { 
            labels: ['Data'], 
            datasets: [{ 
              data: [values.length], 
              backgroundColor: '#D8DEE4',
              borderColor: '#D8DEE4',
              borderWidth: 1,
              borderRadius: 2,
              hoverBackgroundColor: '#C5CDD6',
              hoverBorderColor: '#C5CDD6'
            }] 
          }
        };
    }
  };

  const generateTimeSeriesData = (values, selectedValue = null, column = null) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalCount = values.length;
    const data = days.map(() => Math.floor(Math.random() * (totalCount / 4)) + 1);
    
    return {
      labels: days,
      datasets: [{
        data: data,
        borderColor: selectedValue ? '#635bff' : '#D8DEE4',
        backgroundColor: selectedValue ? 'rgba(99, 91, 255, 0.1)' : 'rgba(216, 222, 228, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: days.map(day => selectedValue === day ? 6 : 2),
        pointBackgroundColor: days.map(day => selectedValue === day ? '#635bff' : '#D8DEE4'),
        pointBorderColor: days.map(day => selectedValue === day ? '#635bff' : '#D8DEE4'),
        pointBorderWidth: days.map(day => selectedValue === day ? 2 : 1),
        pointHoverRadius: 4,
        pointHitRadius: 10
      }]
    };
  };

  const generateCategoryChartData = (categoryCount) => {
    const labels = Object.keys(categoryCount);
    const data = Object.values(categoryCount);
    const maxValue = Math.max(...data);
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: labels.map((label, index) => {
          // Calculate bar width as percentage of max value
          const percentage = (data[index] / maxValue) * 100;
          return `linear-gradient(90deg, #635bff 0%, #635bff ${percentage}%, #f0f0f0 ${percentage}%, #f0f0f0 100%)`;
        }),
        borderColor: 'transparent',
        borderWidth: 0,
        barThickness: 24,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        hoverBackgroundColor: labels.map((label, index) => {
          const percentage = (data[index] / maxValue) * 100;
          return `linear-gradient(90deg, #5a51e5 0%, #5a51e5 ${percentage}%, #f0f0f0 ${percentage}%, #f0f0f0 100%)`;
        }),
        hoverBorderColor: 'transparent'
      }]
    };
  };

  const generateNumberDistributionData = (values, min, max, selectedValue = null, column = null) => {
    const bucketCount = 10; // Changed to 10 for deciles
    
    // Handle edge case where all values are the same
    if (min === max) {
      const isSelected = selectedValue === String(min);
      const formattedValue = column ? formatChartValue(min, column) : formatValue(min, { dataType: 'number' });
      return {
        labels: [formattedValue],
        datasets: [{
          data: [values.length],
          backgroundColor: isSelected ? '#635bff' : '#D8DEE4',
          borderColor: isSelected ? '#635bff' : '#D8DEE4',
          borderWidth: 1,
          borderRadius: 2,
          hoverBackgroundColor: isSelected ? '#5a51e5' : '#C5CDD6',
          hoverBorderColor: isSelected ? '#5a51e5' : '#C5CDD6'
        }]
      };
    }
    
    const bucketSize = (max - min) / bucketCount;
    const buckets = Array(bucketCount).fill(0);
    const bucketLabels = [];
    
    // Create bucket labels with proper formatting based on column type
    for (let i = 0; i < bucketCount; i++) {
      const start = min + (i * bucketSize);
      const end = min + ((i + 1) * bucketSize);
      
      let startFormatted, endFormatted;
      if (column) {
        startFormatted = formatChartValue(start, column);
        endFormatted = formatChartValue(end, column);
      } else {
        if (bucketSize >= 1) {
          startFormatted = Math.round(start).toLocaleString();
          endFormatted = Math.round(end).toLocaleString();
        } else {
          startFormatted = start.toFixed(1);
          endFormatted = end.toFixed(1);
        }
      }
      
      bucketLabels.push(`${startFormatted} - ${endFormatted}`);
    }
    
    // Distribute values into buckets
    values.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });
    
    return {
      labels: bucketLabels,
      datasets: [{
        data: buckets,
        backgroundColor: bucketLabels.map(label => {
          if (selectedValue === label) return '#635bff';
          if (selectedValue) return '#F5F6F8';
          return '#D8DEE4';
        }),
        borderColor: bucketLabels.map(label => {
          if (selectedValue === label) return '#635bff';
          if (selectedValue) return '#F5F6F8';
          return '#D8DEE4';
        }),
        borderWidth: 1,
        borderRadius: 2,
        hoverBackgroundColor: bucketLabels.map(label => {
          if (selectedValue === label) return '#5a51e5';
          if (selectedValue) return '#E8EAED';
          return '#C5CDD6';
        }),
        hoverBorderColor: bucketLabels.map(label => {
          if (selectedValue === label) return '#5a51e5';
          if (selectedValue) return '#E8EAED';
          return '#C5CDD6';
        })
      }]
    };
  };

  const generateDateDistributionData = (values) => {
    // Placeholder for date distribution
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        data: [10, 15, 12, 8],
        backgroundColor: '#57B2F9',
        borderColor: '#57B2F9',
        borderWidth: 1,
        borderRadius: 2,
        hoverBackgroundColor: '#4A9FE7',
        hoverBorderColor: '#4A9FE7'
      }]
    };
  };

  const getChartOptions = useCallback((type, categoryData = null, columnId = null, selectedValue = null, column = null) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'point'
      },
      onClick: (event, activeElements, chart) => {
        if (activeElements.length > 0 && columnId) {
          const activeElement = activeElements[0];
          const index = activeElement.index;
          const label = chart.data.labels[index];
          const value = chart.data.datasets[activeElement.datasetIndex].data[index];
          
          // For line charts, use the label; for bar charts, use a range or specific value
          if (type === 'line') {
            toggleFilter(columnId, label);
          } else if (type === 'bar') {
            // For bar charts, we'll filter by the bucket/range
            toggleFilter(columnId, label);
          }
        }
      },
      onHover: (event, activeElements, chart) => {
        try {
          // Update mouse position for tooltip with safety checks
          if (event?.native && typeof event.native.clientX === 'number' && typeof event.native.clientY === 'number') {
            setMousePosition({ x: event.native.clientX, y: event.native.clientY });
          }
          
          // Hide custom tooltip if no active elements
          if (!activeElements || activeElements.length === 0) {
            const chartTooltip = document.getElementById('chart-tooltip');
            if (chartTooltip) {
              chartTooltip.style.opacity = '0';
            }
          }
          
          // Prevent event bubbling to avoid navigation conflicts
          if (event?.native) {
            event.native.stopPropagation();
          }
        } catch (error) {
          // Silently handle hover errors to prevent page crashes
          console.warn('Chart hover error:', error);
        }
      },
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          enabled: false // Completely disable Chart.js tooltips
        }
      },
      scales: {
        x: { 
          display: false
        },
        y: { 
          display: false
        }
      },
      elements: {
        point: { 
          radius: (context) => {
            if (type === 'line' && selectedValue) {
              const label = context.chart.data.labels[context.dataIndex];
              return selectedValue === label ? 6 : 2;
            }
            return 2;
          },
          hoverRadius: 4,
          hitRadius: 10,
          backgroundColor: (context) => {
            if (type === 'line' && selectedValue) {
              const label = context.chart.data.labels[context.dataIndex];
              return selectedValue === label ? '#635bff' : '#57B2F9';
            }
            return '#57B2F9';
          },
          borderColor: (context) => {
            if (type === 'line' && selectedValue) {
              const label = context.chart.data.labels[context.dataIndex];
              return selectedValue === label ? '#635bff' : '#57B2F9';
            }
            return '#57B2F9';
          }
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

    if (type === 'horizontalBar') {
      return {
        ...baseOptions,
        indexAxis: 'y',
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 2,
            bottom: 2
          }
        },
        plugins: {
          ...baseOptions.plugins,
          datalabels: {
            display: true,
            anchor: 'start',
            align: 'start',
            color: '#333',
            font: {
              size: 11,
              weight: '500'
            },
            formatter: (value, context) => {
              if (categoryData) {
                const label = context.chart.data.labels[context.dataIndex];
                return `${label} ${value}`;
              }
              return value;
            },
            offset: 8
          }
        }
      };
    }

    return baseOptions;
  }, [toggleFilter, setMousePosition]);

  // Generate reasonable default chart based on data
  const generateDefaultChart = () => {
    const columns = getReportData.columns;
    const reportId = params.reportId;
    
    // Find the best columns for charting
    const categoryColumn = columns.find(col => col.dataType === 'category');
    const currencyColumns = columns.filter(col => col.isCurrency);
    const trendColumn = columns.find(col => col.isTrend);
    const numberColumns = columns.filter(col => col.dataType === 'number' && !col.isCurrency && !col.isTrend);
    
    let chartType = 'bar';
    let xAxis = null;
    let yAxis = null;
    let title = '';
    let description = '';
    
    // Report-specific chart suggestions
    switch (reportId) {
      case 'churn-risk':
        if (categoryColumn && currencyColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = currencyColumns.find(col => col.id === 'current_mrr') || currencyColumns[0];
          title = `MRR at Risk by ${categoryColumn.label}`;
          description = 'Bar chart showing monthly recurring revenue at risk segmented by product or category';
        } else if (trendColumn) {
          chartType = 'histogram';
          xAxis = trendColumn;
          title = 'Usage Trend Distribution';
          description = 'Distribution of usage trends showing patterns in customer behavior';
        }
        break;
        
      case 'high-usage-growth':
        if (trendColumn && currencyColumns.length > 0) {
          chartType = 'scatter';
          xAxis = currencyColumns.find(col => col.id === 'current_mrr') || currencyColumns[0];
          yAxis = trendColumn;
          title = 'Usage Growth vs MRR';
          description = 'Scatter plot showing the relationship between current MRR and usage growth percentage';
        } else if (categoryColumn && trendColumn) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = trendColumn;
          title = `Usage Growth by ${categoryColumn.label}`;
          description = 'Bar chart showing average usage growth rates by product category';
        }
        break;
        
      case 'revenue-composition':
        if (currencyColumns.length >= 3) {
          chartType = 'stacked-bar';
          xAxis = { label: 'Customer', id: 'name' };
          yAxis = currencyColumns;
          title = 'Revenue Composition by Customer';
          description = 'Stacked bar chart showing breakdown of subscription, usage, and add-on revenue';
        } else if (categoryColumn && currencyColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = currencyColumns[0];
          title = `Revenue by ${categoryColumn.label}`;
          description = 'Bar chart showing total revenue by product category';
        }
        break;
        
      case 'monthly-sales':
      case 'top-selling':
        if (categoryColumn && currencyColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = currencyColumns.find(col => col.id === 'current_mrr') || currencyColumns[0];
          title = `Revenue by ${categoryColumn.label}`;
          description = 'Bar chart showing revenue performance by product or category';
        }
        break;
        
      case 'new-subscribers':
      case 'new-free-trials':
        if (categoryColumn && numberColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = numberColumns.find(col => col.id === 'included_units') || numberColumns[0];
          title = `${numberColumns[0]?.label || 'Units'} by ${categoryColumn.label}`;
          description = 'Bar chart showing distribution of plan features by product type';
        } else if (categoryColumn) {
          chartType = 'pie';
          xAxis = categoryColumn;
          title = `Distribution by ${categoryColumn.label}`;
          description = 'Pie chart showing the distribution of new subscribers by plan type';
        }
        break;
        
      default:
        // Generic logic for other reports
        if (categoryColumn && currencyColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = currencyColumns[0];
          title = `${currencyColumns[0].label} by ${categoryColumn.label}`;
          description = `Bar chart showing ${currencyColumns[0].label.toLowerCase()} broken down by ${categoryColumn.label.toLowerCase()}`;
        } else if (categoryColumn && numberColumns.length > 0) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = numberColumns[0];
          title = `${numberColumns[0].label} by ${categoryColumn.label}`;
          description = `Bar chart showing ${numberColumns[0].label.toLowerCase()} by ${categoryColumn.label.toLowerCase()}`;
        } else if (categoryColumn && trendColumn) {
          chartType = 'bar';
          xAxis = categoryColumn;
          yAxis = trendColumn;
          title = `${trendColumn.label} by ${categoryColumn.label}`;
          description = `Bar chart showing ${trendColumn.label.toLowerCase()} by ${categoryColumn.label.toLowerCase()}`;
        } else if (currencyColumns.length > 0) {
          chartType = 'histogram';
          xAxis = currencyColumns[0];
          title = `${currencyColumns[0].label} Distribution`;
          description = `Histogram showing the distribution of ${currencyColumns[0].label.toLowerCase()} values`;
        } else if (trendColumn) {
          chartType = 'histogram';
          xAxis = trendColumn;
          title = `${trendColumn.label} Distribution`;
          description = `Histogram showing the distribution of ${trendColumn.label.toLowerCase()} values`;
        } else if (categoryColumn) {
          chartType = 'pie';
          xAxis = categoryColumn;
          title = `Count by ${categoryColumn.label}`;
          description = `Pie chart showing the count distribution by ${categoryColumn.label.toLowerCase()}`;
        } else {
          chartType = 'metric';
          title = 'Total Count';
          description = 'Single metric showing the total count of records';
        }
    }
    
    return {
      type: chartType,
      title,
      xAxis,
      yAxis,
      description,
      reportType: reportId
    };
  };

  // Generate chart data based on the suggestion
  const generateChartData = (suggestion) => {
    const data = sortedData;
    
    switch (suggestion.type) {
      case 'bar':
        return generateBarChartData(data, suggestion);
      case 'line':
        return generateLineChartData(data, suggestion);
      case 'scatter':
        return generateScatterChartData(data, suggestion);
      case 'pie':
        return generatePieChartData(data, suggestion);
      case 'histogram':
        return generateHistogramChartData(data, suggestion);
      case 'stacked-bar':
        return generateStackedBarChartData(data, suggestion);
      default:
        return generateBarChartData(data, suggestion);
    }
  };

  const generateLineChartData = (data, suggestion) => {
    if (!suggestion.xAxis || !suggestion.yAxis) return null;
    
    // Group data by x-axis values (same as bar chart but with line styling)
    const groupedData = {};
    data.forEach(row => {
      const xValue = row[suggestion.xAxis.id];
      const yValue = row[suggestion.yAxis.id];
      
      if (xValue && typeof yValue === 'number' && !isNaN(yValue)) {
        if (!groupedData[xValue]) {
          groupedData[xValue] = [];
        }
        groupedData[xValue].push(yValue);
      }
    });
    
    // Calculate averages for each group
    const labels = Object.keys(groupedData);
    const values = labels.map(label => {
      const values = groupedData[label];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    return {
      labels,
      datasets: [{
        label: suggestion.yAxis.label,
        data: values,
        borderColor: '#635bff',
        backgroundColor: 'rgba(99, 91, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#635bff',
        pointBorderColor: '#635bff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };
  };

  const generateBarChartData = (data, suggestion) => {
    if (!suggestion.xAxis || !suggestion.yAxis) return null;
    
    // Group data by x-axis values
    const groupedData = {};
    data.forEach(row => {
      const xValue = row[suggestion.xAxis.id];
      const yValue = row[suggestion.yAxis.id];
      
      if (xValue && typeof yValue === 'number' && !isNaN(yValue)) {
        if (!groupedData[xValue]) {
          groupedData[xValue] = [];
        }
        groupedData[xValue].push(yValue);
      }
    });
    
    // Calculate averages for each group
    const labels = Object.keys(groupedData);
    const values = labels.map(label => {
      const values = groupedData[label];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    
    return {
      labels,
      datasets: [{
        label: suggestion.yAxis.label,
        data: values,
        backgroundColor: '#635bff',
        borderColor: '#635bff',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#5a51e5',
        hoverBorderColor: '#5a51e5'
      }]
    };
  };

  const generateScatterChartData = (data, suggestion) => {
    if (!suggestion.xAxis || !suggestion.yAxis) return null;
    
    const scatterData = data.map(row => ({
      x: row[suggestion.xAxis.id],
      y: row[suggestion.yAxis.id]
    })).filter(point => typeof point.x === 'number' && typeof point.y === 'number' && !isNaN(point.x) && !isNaN(point.y));
    
    return {
      datasets: [{
        label: `${suggestion.yAxis.label} vs ${suggestion.xAxis.label}`,
        data: scatterData,
        backgroundColor: '#635bff',
        borderColor: '#635bff',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };
  };

  const generatePieChartData = (data, suggestion) => {
    if (!suggestion.xAxis) return null;
    
    // Count occurrences of each category
    const categoryCount = {};
    data.forEach(row => {
      const category = row[suggestion.xAxis.id];
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    const labels = Object.keys(categoryCount);
    const values = Object.values(categoryCount);
    const colors = [
      '#635bff', '#57B2F9', '#4CAF50', '#FF9800', 
      '#F44336', '#9C27B0', '#607D8B', '#795548'
    ];
    
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const generateHistogramChartData = (data, suggestion) => {
    if (!suggestion.xAxis) return null;
    
    const values = data.map(row => row[suggestion.xAxis.id])
      .filter(val => typeof val === 'number' && !isNaN(val));
    
    if (values.length === 0) return null;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bucketCount = 10;
    const bucketSize = (max - min) / bucketCount;
    
    const buckets = Array(bucketCount).fill(0);
    const bucketLabels = [];
    
    for (let i = 0; i < bucketCount; i++) {
      const start = min + (i * bucketSize);
      const end = min + ((i + 1) * bucketSize);
      bucketLabels.push(`${Math.round(start)}-${Math.round(end)}`);
    }
    
    values.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });
    
    return {
      labels: bucketLabels,
      datasets: [{
        label: 'Count',
        data: buckets,
        backgroundColor: '#635bff',
        borderColor: '#635bff',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  const generateStackedBarChartData = (data, suggestion) => {
    if (!suggestion.yAxis || !Array.isArray(suggestion.yAxis)) return null;
    
    // For stacked bar, we'll show top 10 customers
    const topCustomers = data.slice(0, 10);
    const labels = topCustomers.map(row => row.name);
    
    const datasets = suggestion.yAxis.map((column, index) => {
      const colors = ['#635bff', '#57B2F9', '#4CAF50', '#FF9800'];
      return {
        label: column.label,
        data: topCustomers.map(row => row[column.id] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1
      };
    });
    
    return {
      labels,
      datasets
    };
  };

  const handleAddChart = () => {
    const chartSuggestion = generateDefaultChart();
    const chartData = generateChartData(chartSuggestion);
    
    if (chartData) {
      setGeneratedChart({
        ...chartSuggestion,
        data: chartData,
        timestamp: Date.now()
      });
    }
  };

  const handleRemoveChart = () => {
    setGeneratedChart(null);
  };

  const handleChartTypeChange = (newType) => {
    if (generatedChart) {
      const updatedSettings = {
        type: newType,
        xAxis: generatedChart.xAxis,
        yAxis: generatedChart.yAxis
      };
      
      updateChartWithSettings(updatedSettings);
    }
  };

  const handleAxisChange = (axisType, column) => {
    if (generatedChart) {
      const updatedSettings = {
        type: generatedChart.type,
        xAxis: axisType === 'x' ? column : generatedChart.xAxis,
        yAxis: axisType === 'y' ? column : generatedChart.yAxis
      };
      
      updateChartWithSettings(updatedSettings);
    }
  };

  // Helper function to update chart with new settings
  const updateChartWithSettings = (settings) => {
    if (!generatedChart) return;
    
    const updatedSuggestion = {
      ...generatedChart,
      type: settings.type,
      xAxis: settings.xAxis,
      yAxis: settings.yAxis
    };
    
    // Update the title and description based on new settings
    if (updatedSuggestion.type === 'pie') {
      if (updatedSuggestion.xAxis) {
        updatedSuggestion.title = `Distribution by ${updatedSuggestion.xAxis.label}`;
        updatedSuggestion.description = `Pie chart showing the distribution by ${updatedSuggestion.xAxis.label.toLowerCase()}`;
      }
    } else if (updatedSuggestion.type === 'histogram') {
      if (updatedSuggestion.xAxis) {
        updatedSuggestion.title = `${updatedSuggestion.xAxis.label} Distribution`;
        updatedSuggestion.description = `Histogram showing the distribution of ${updatedSuggestion.xAxis.label.toLowerCase()} values`;
      }
    } else if (updatedSuggestion.xAxis && updatedSuggestion.yAxis) {
      updatedSuggestion.title = `${updatedSuggestion.yAxis.label} by ${updatedSuggestion.xAxis.label}`;
      updatedSuggestion.description = `${updatedSuggestion.type} chart showing ${updatedSuggestion.yAxis.label.toLowerCase()} broken down by ${updatedSuggestion.xAxis.label.toLowerCase()}`;
    }
    
    const newChartData = generateChartData(updatedSuggestion);
    
    if (newChartData) {
      const updatedChart = {
        ...updatedSuggestion,
        data: newChartData,
        timestamp: Date.now()
      };
      
      setGeneratedChart(updatedChart);
    }
  };

  const applyChartSettings = () => {
    // Since the chart is already updated in real-time, we just need to:
    // 1. Update the original settings to match current pending settings
    // 2. Close the settings panel
    setOriginalChartSettings({
      type: pendingChartSettings.type,
      xAxis: pendingChartSettings.xAxis,
      yAxis: pendingChartSettings.yAxis
    });
    
    setShowChartSettings(false);
  };

  const cancelChartSettings = () => {
    // Revert the chart to the original settings
    if (generatedChart && originalChartSettings.type) {
      updateChartWithSettings(originalChartSettings);
      
      // Reset pending settings to original settings
      setPendingChartSettings({
        type: originalChartSettings.type,
        xAxis: originalChartSettings.xAxis,
        yAxis: originalChartSettings.yAxis
      });
    }
    
    setShowChartSettings(false);
  };

  const removeChart = () => {
    setGeneratedChart(null);
    setShowChartSettings(false);
  };

  // Helper function to create consistent tooltip options for charts with enhanced safety checks
  const getChartTooltipOptions = () => ({
    enabled: false, // Disable default tooltip since we're using external
    external: function(context) {
      try {
        // Get the tooltip element
        const {chart, tooltip} = context;
        
        // Safety check for context
        if (!chart || !tooltip) {
          return;
        }
        
        // Get or create tooltip element
        let tooltipEl = document.getElementById('chart-tooltip');
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chart-tooltip';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.zIndex = '1000';
          tooltipEl.style.transition = 'all 0.1s ease';
          document.body.appendChild(tooltipEl);
        }
        
        // Hide tooltip if no data points or opacity is 0
        if (tooltip.opacity === 0 || !tooltip.body) {
          tooltipEl.style.opacity = '0';
          return;
        }
        
        // Set tooltip styling
        tooltipEl.style.backgroundColor = 'white';
        tooltipEl.style.color = '#333';
        tooltipEl.style.border = '1px solid #e3e8ee';
        tooltipEl.style.borderRadius = '6px';
        tooltipEl.style.padding = '10px 14px';
        tooltipEl.style.fontSize = '12px';
        tooltipEl.style.fontWeight = '500';
        tooltipEl.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
        tooltipEl.style.whiteSpace = 'nowrap';
        
        // Set tooltip content with safety checks
        const titleLines = tooltip.title || [];
        const bodyLines = tooltip.body ? tooltip.body.map(b => b.lines) : [];
        
        let innerHtml = '';
        
        
        // Add title
        if (titleLines.length > 0 && titleLines[0]) {
          innerHtml += `<div style="color: #635bff; font-weight: 600; margin-bottom: 4px;">${titleLines[0]}</div>`;
        }
        
        // Add body
        bodyLines.forEach(body => {
          if (body && body.length > 0) {
            innerHtml += `<div>${body}</div>`;
          }
        });
        
        // Only set innerHTML if we have content
        if (innerHtml) {
          tooltipEl.innerHTML = innerHtml;
        }
        
        // Position tooltip relative to the actual cursor position with safety checks
        const tooltipWidth = tooltipEl.offsetWidth || 0;
        const tooltipHeight = tooltipEl.offsetHeight || 0;
        
        // Use the stored mouse position with fallback
        const mouseX = mousePosition.x || 0;
        const mouseY = mousePosition.y || 0;
        
        // Position tooltip 20px above the cursor, centered horizontally
        let tooltipX = mouseX - (tooltipWidth / 2);
        let tooltipY = mouseY - tooltipHeight - 20;
        
        // Keep tooltip within viewport bounds
        const viewportWidth = window.innerWidth || 1000;
        const viewportHeight = window.innerHeight || 800;
        
        // Adjust horizontal position if tooltip would go off screen
        if (tooltipX < 10) {
          tooltipX = 10;
        } else if (tooltipX + tooltipWidth > viewportWidth - 10) {
          tooltipX = viewportWidth - tooltipWidth - 10;
        }
        
        // Adjust vertical position if tooltip would go off screen
        if (tooltipY < 10) {
          // If there's no room above, position below the cursor
          tooltipY = mouseY + 20;
        }
        
        // Apply position with safety checks
        if (tooltipEl && typeof tooltipX === 'number' && typeof tooltipY === 'number') {
          tooltipEl.style.left = `${tooltipX}px`;
          tooltipEl.style.top = `${tooltipY}px`;
          tooltipEl.style.opacity = '1';
        }
      } catch (error) {
        // Silently handle tooltip errors to prevent page crashes
        console.warn('Chart tooltip error:', error);
        // Hide tooltip on error
        const tooltipEl = document.getElementById('chart-tooltip');
        if (tooltipEl) {
          tooltipEl.style.opacity = '0';
        }
      }
    },
    callbacks: {
      title: function(context) {
        try {
          return context[0]?.label || '';
        } catch (error) {
          console.warn('Tooltip title error:', error);
          return '';
        }
      },
      label: function(context) {
        try {
          const value = context.parsed?.y || context.parsed || 0;
          
          // Format value based on chart type and axis
          if (generatedChart && generatedChart.yAxis) {
            return formatChartValue(value, generatedChart.yAxis);
          }
          
          return value.toLocaleString();
        } catch (error) {
          console.warn('Tooltip label error:', error);
          return '';
        }
      }
    }
  });

  // Early return with loading state if data is not ready - MOVED AFTER ALL HOOKS
  if (!getReportData || !Array.isArray(getReportData.columns)) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ReportDetailContainer>
          <div>Loading...</div>
        </ReportDetailContainer>
      </Container>
    );
  }

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ReportDetailContainer>
        <BreadcrumbNav>
          <Breadcrumbs>
            <BreadcrumbLink to="/data-studio">Analytics</BreadcrumbLink>
          </Breadcrumbs>
        </BreadcrumbNav>
        
        <ReportDetailHeader>
          <ReportDetailTitle>{getReportData.title}</ReportDetailTitle>
          <HeaderActions>
            <Button onClick={() => setIsShareModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </Button>
            <EditButton to={`/data-studio/${params.reportId}/edit`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.25 11.5V10C1.25 9.58579 1.58579 9.25 2 9.25C2.41421 9.25 2.75 9.58579 2.75 10V11.5C2.75 12.4665 3.5335 13.25 4.5 13.25H6C6.41421 13.25 6.75 13.5858 6.75 14C6.75 14.4142 6.41421 14.75 6 14.75H4.5C2.70507 14.75 1.25 13.2949 1.25 11.5ZM13.25 11.5V10C13.25 9.58579 13.5858 9.25 14 9.25C14.4142 9.25 14.75 9.58579 14.75 10V11.5C14.75 13.2949 13.2949 14.75 11.5 14.75H10C9.58579 14.75 9.25 14.4142 9.25 14C9.25 13.5858 9.58579 13.25 10 13.25H11.5C12.4665 13.25 13.25 12.4665 13.25 11.5ZM1.25 6V4.5C1.25 2.70507 2.70507 1.25 4.5 1.25H6C6.41421 1.25 6.75 1.58579 6.75 2C6.75 2.41421 6.41421 2.75 6 2.75H4.5C3.5335 2.75 2.75 3.5335 2.75 4.5V6C2.75 6.41421 2.41421 6.75 2 6.75C1.58579 6.75 1.25 6.41421 1.25 6ZM13.25 6V4.5C13.25 3.5335 12.4665 2.75 11.5 2.75H10C9.58579 2.75 9.25 2.41421 9.25 2C9.25 1.58579 9.58579 1.25 10 1.25H11.5C13.2949 1.25 14.75 2.70507 14.75 4.5V6C14.75 6.41421 14.4142 6.75 14 6.75C13.5858 6.75 13.25 6.41421 13.25 6Z" fill="currentColor"/>
              </svg>
              Open in explorer
            </EditButton>
            <MoreButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </MoreButton>
          </HeaderActions>
        </ReportDetailHeader>
        
        <ReportDetailValue>
          {getReportData.count}
        </ReportDetailValue>
        
        <MetricTrend className={getReportData.isNegative ? 'negative' : 'positive'}>
          {getReportData.trend > 0 ? '+' : ''}{getReportData.trend}% compared to previous period
        </MetricTrend>
        
        <ControlsContainer>
          <ReportingControls 
            initialPeriod={reportingControls.period}
            initialInterval={reportingControls.interval}
            initialComparison={reportingControls.comparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
            chartType={generatedChart ? generatedChart.type : null}
            chartSettings={generatedChart ? {
              type: generatedChart.type,
              xAxis: generatedChart.xAxis,
              yAxis: generatedChart.yAxis
            } : null}
            availableColumns={getReportData.columns}
            onChartTypeChange={handleChartTypeChange}
            onChartAxisChange={handleAxisChange}
            onRemoveChart={handleRemoveChart}
            customContent={
              !generatedChart && (
                <ChartChip onClick={handleAddChart}>
                  <ChartIconWrapper>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#6772e5" strokeWidth="2" />
                      <path d="M12 8V16M8 12H16" stroke="#6772e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ChartIconWrapper>
                  <ChartChipValue>Chart</ChartChipValue>
                </ChartChip>
              )
            }
          />
        </ControlsContainer>
        
        {generatedChart && (
          <>
            <ChartSectionContainer>
              <GeneratedChartWrapper>
                {generatedChart.type === 'bar' && (
                  <Bar 
                    key={`bar-${generatedChart.timestamp || 0}-${generatedChart.type}-${generatedChart.xAxis?.id}-${generatedChart.yAxis?.id}`}
                    data={generatedChart.data} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      onHover: (event, activeElements, chart) => {
                        try {
                          // Update mouse position for tooltip with safety checks
                          if (event?.native && typeof event.native.clientX === 'number' && typeof event.native.clientY === 'number') {
                            setMousePosition({ x: event.native.clientX, y: event.native.clientY });
                          }
                          
                          // Hide custom tooltip if no active elements
                          if (!activeElements || activeElements.length === 0) {
                            const chartTooltip = document.getElementById('chart-tooltip');
                            if (chartTooltip) {
                              chartTooltip.style.opacity = '0';
                            }
                          }
                          
                          // Prevent event bubbling to avoid navigation conflicts
                          if (event?.native) {
                            event.native.stopPropagation();
                          }
                        } catch (error) {
                          // Silently handle hover errors to prevent page crashes
                          console.warn('Chart hover error:', error);
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: getChartTooltipOptions()
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: '#f0f0f0'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                )}
                {generatedChart.type === 'line' && (
                  <Line 
                    key={`line-${generatedChart.timestamp || 0}-${generatedChart.type}-${generatedChart.xAxis?.id}-${generatedChart.yAxis?.id}`}
                    data={generatedChart.data} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      onHover: (event, activeElements, chart) => {
                        try {
                          // Update mouse position for tooltip with safety checks
                          if (event?.native && typeof event.native.clientX === 'number' && typeof event.native.clientY === 'number') {
                            setMousePosition({ x: event.native.clientX, y: event.native.clientY });
                          }
                          
                          // Hide custom tooltip if no active elements
                          if (!activeElements || activeElements.length === 0) {
                            const chartTooltip = document.getElementById('chart-tooltip');
                            if (chartTooltip) {
                              chartTooltip.style.opacity = '0';
                            }
                          }
                          
                          // Prevent event bubbling to avoid navigation conflicts
                          if (event?.native) {
                            event.native.stopPropagation();
                          }
                        } catch (error) {
                          // Silently handle hover errors to prevent page crashes
                          console.warn('Chart hover error:', error);
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: getChartTooltipOptions()
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: '#f0f0f0'
                          }
                        },
                        x: {
                          grid: {
                            color: '#f0f0f0'
                          }
                        }
                      },
                      elements: {
                        line: {
                          tension: 0.4
                        }
                      }
                    }}
                  />
                )}
                {generatedChart.type === 'pie' && (
                  <Pie 
                    key={`pie-${generatedChart.timestamp || 0}-${generatedChart.type}-${generatedChart.xAxis?.id}`}
                    data={generatedChart.data} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      onHover: (event, activeElements, chart) => {
                        try {
                          // Update mouse position for tooltip with safety checks
                          if (event?.native && typeof event.native.clientX === 'number' && typeof event.native.clientY === 'number') {
                            setMousePosition({ x: event.native.clientX, y: event.native.clientY });
                          }
                          
                          // Hide custom tooltip if no active elements
                          if (!activeElements || activeElements.length === 0) {
                            const chartTooltip = document.getElementById('chart-tooltip');
                            if (chartTooltip) {
                              chartTooltip.style.opacity = '0';
                            }
                          }
                          
                          // Prevent event bubbling to avoid navigation conflicts
                          if (event?.native) {
                            event.native.stopPropagation();
                          }
                        } catch (error) {
                          // Silently handle hover errors to prevent page crashes
                          console.warn('Chart hover error:', error);
                        }
                      },
                      plugins: {
                        legend: {
                          display: true,
                          position: 'right'
                        },
                        tooltip: getChartTooltipOptions()
                      }
                    }}
                  />
                )}
              </GeneratedChartWrapper>
            </ChartSectionContainer>
            
            <SummaryTableSection>
              <ResultsHeader>
                <SectionTitle>Summary</SectionTitle>
                <ExportButton>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export
                </ExportButton>
              </ResultsHeader>
              
              {generatedChart.type === 'pie' ? (
                <SummaryTableContainer>
                  <SummaryTable>
                    <thead>
                      <tr>
                        <SummaryTableHeaderCell className="first-column">Category</SummaryTableHeaderCell>
                        <SummaryTableHeaderCell>Count</SummaryTableHeaderCell>
                        <SummaryTableHeaderCell>Percentage</SummaryTableHeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedChart.data?.labels && Array.isArray(generatedChart.data.labels) && generatedChart.data.labels.map((label, index) => {
                        const value = generatedChart.data?.datasets?.[0]?.data?.[index];
                        const dataArray = generatedChart.data?.datasets?.[0]?.data;
                        if (!dataArray || !Array.isArray(dataArray) || value === undefined) {
                          return null;
                        }
                        const total = dataArray.reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return (
                          <tr key={index}>
                            <SummaryTableCell className="header first-column">
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div 
                                  style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    backgroundColor: generatedChart.data?.datasets?.[0]?.backgroundColor?.[index] || '#ccc', 
                                    borderRadius: '3px',
                                    marginRight: '8px'
                                  }} 
                                />
                                {label}
                              </div>
                            </SummaryTableCell>
                            <SummaryTableCell 
                              className="value-cell"
                              isValue={true}
                              value={value}
                            >
                              {value}
                            </SummaryTableCell>
                            <SummaryTableCell 
                              className="value-cell"
                              isValue={true}
                              value={percentage}
                            >
                              {percentage}%
                            </SummaryTableCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </SummaryTable>
                </SummaryTableContainer>
              ) : (
                <SummaryTableContainer>
                  <SummaryTable>
                    <thead>
                      <tr>
                        <SummaryTableHeaderCell className="first-column">
                          {generatedChart.xAxis?.label || 'Category'}
                        </SummaryTableHeaderCell>
                        {generatedChart.data?.labels && Array.isArray(generatedChart.data.labels) && generatedChart.data.labels.map((label, index) => (
                          <SummaryTableHeaderCell key={index}>
                            {label}
                          </SummaryTableHeaderCell>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <SummaryTableCell className="header first-column">
                          {generatedChart.yAxis?.label || 'Value'}
                        </SummaryTableCell>
                        {generatedChart.data?.datasets?.[0]?.data && Array.isArray(generatedChart.data.datasets[0].data) && generatedChart.data.datasets[0].data.map((value, index) => (
                          <SummaryTableCell 
                            key={index} 
                            className="value-cell"
                            isValue={true}
                            value={value}
                          >
                            {generatedChart.yAxis ? 
                              formatChartValue(value, generatedChart.yAxis) : 
                              formatChartValue(value, { dataType: 'number' })
                            }
                          </SummaryTableCell>
                        ))}
                      </tr>
                    </tbody>
                  </SummaryTable>
                </SummaryTableContainer>
              )}
            </SummaryTableSection>
          </>
        )}
        
        <ResultsSection>
          <ResultsHeader>
            <SectionTitle>{sortedData.length} results</SectionTitle>
            <ExportButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </ExportButton>
          </ResultsHeader>
          
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  {getReportData.columns && getReportData.columns.map((column) => (
                    <th key={column.id} onClick={() => handleSort(column.id)}>
                      <HeaderCellContent>
                        <HeaderLabel>
                          {column.label} {getSortIndicator(column.id)}
                        </HeaderLabel>
                        <HeaderIcons>
                          {columnFilters[column.id] && (
                            <FilterIcon 
                              className="remove-filter"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearFilter(column.id);
                              }}
                              title="Remove filter"
                              onMouseEnter={(e) => {
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) {
                                  svg.innerHTML = '<path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>';
                                }
                              }}
                              onMouseLeave={(e) => {
                                const svg = e.currentTarget.querySelector('svg');
                                if (svg) {
                                  svg.innerHTML = '<path fillRule="evenodd" clipRule="evenodd" d="M5 9 .9 3.533a2 2 0 0 1-.4-1.2V2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v.333a2 2 0 0 1-.4 1.2L11 9v2.93a2 2 0 0 1-.89 1.664l-3.358 2.238a1 1 0 0 1-.555.168H5.5a.5.5 0 0 1-.5-.5V9ZM2.5 1.5h11a.5.5 0 0 1 .5.5c0 .213.036.452-.1.633L10.25 7.5h-4.5L2.1 2.633C1.964 2.452 2 2.213 2 2a.5.5 0 0 1 .5-.5Zm7 7.5h-3v5.197l2.777-1.851a.5.5 0 0 0 .223-.416V9Z"></path>';
                                }
                              }}
                            >
                              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5 9 .9 3.533a2 2 0 0 1-.4-1.2V2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v.333a2 2 0 0 1-.4 1.2L11 9v2.93a2 2 0 0 1-.89 1.664l-3.358 2.238a1 1 0 0 1-.555.168H5.5a.5.5 0 0 1-.5-.5V9ZM2.5 1.5h11a.5.5 0 0 1 .5.5c0 .213.036.452-.1.633L10.25 7.5h-4.5L2.1 2.633C1.964 2.452 2 2.213 2 2a.5.5 0 0 1 .5-.5Zm7 7.5h-3v5.197l2.777-1.851a.5.5 0 0 0 .223-.416V9Z"></path>
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
                <SummaryRow>
                  {getReportData.columns && getReportData.columns.map((column) => {
                    const analysis = analyzeColumnData(customerData, column, sortedData);
                    return (
                      <SummaryCell key={`summary-${column.id}`}>
                        <SummaryCellContent>
                          <ChartContainer onMouseLeave={hideAllTooltips} chartType={analysis.type}>
                            {analysis.type === 'line' && (
                              <Line
                                data={analysis.chartData}
                                options={getChartOptions('line', null, column.id, columnFilters[column.id], column)}
                              />
                            )}
                            {analysis.type === 'bar' && (
                              <Bar
                                data={analysis.chartData}
                                options={getChartOptions('bar', null, column.id, columnFilters[column.id], column)}
                              />
                            )}
                            {analysis.type === 'category' && (
                              <CategoryChart
                                data={analysis.rawData}
                                totalResults={customerData.length}
                                onCategoryClick={(value) => toggleFilter(column.id, value)}
                                selectedCategory={columnFilters[column.id]}
                              />
                            )}
                          </ChartContainer>
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
                {currentData && Array.isArray(currentData) && currentData.map((customer) => (
                  <tr 
                    key={customer?.id || Math.random()}
                    onClick={() => customer && navigate(`/users/${customer.id}/${params.reportId}`, { 
                      state: { customerData: customer, reportTitle: getReportData.title } 
                    })}
                    style={{ cursor: 'pointer' }}
                  >
                    {getReportData.columns && getReportData.columns.map((column) => (
                      <td key={column.id}>
                        {customer ? formatCellValue(customer[column.id], column) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
          
          <Pagination>
            <PageInfo>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedData?.length || 0)} of {sortedData?.length || 0} results
            </PageInfo>
            <PageNav>
              <PageButton 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
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
        </ResultsSection>
      </ReportDetailContainer>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        title={getReportData.title}
      />
    </Container>
  );
};

export default ReportDetail; 
