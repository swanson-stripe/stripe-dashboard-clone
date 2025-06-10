import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData } from '../data/companyData';
import { METRIC_SCHEMAS, REPORT_SCHEMAS } from '../data/reportSchemas';
import LineChart from '../components/LineChart';

// Main container for the entire editor
const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: ${props => props.hasAnalysisPanel ? 'calc(100% - 400px)' : '100%'};
  background: white;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRjVGNkY4Ii8+CjxyZWN0IHg9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRjVGNkY4Ii8+CjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGNUY2RjgiLz4KPHJlY3QgeT0iMTAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGNUY2RjgiLz4KPC9zdmc+');
  background-size: 20px 20px;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
`;

// Minimal left panel for navigation controls only
const LeftPanel = styled.div`
  width: 260px;
  background: white;
  border-right: 1px solid #e3e8ee;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
`;

// Top controls in left panel
const LeftPanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e3e8ee;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SaveButton = styled.button`
  background: #625df5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #5b56f0;
  }
`;

const EditorTitle = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-align: center;
`;

const InfoSection = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
`;

const InfoItem = styled.div`
  margin-bottom: 12px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
`;

// Spreadsheet toolbar above the main content
const SpreadsheetToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: white;
  border-bottom: 1px solid #e3e8ee;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ToolbarTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Controls above spreadsheet on background
const SpreadsheetHeader = styled.div`
  padding: 52px 40px 0px 40px;
  background: transparent;
    display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-align: center;
`;

const HeaderButtons = styled.div`
    display: flex;
    align-items: center;
  gap: 12px;
  position: absolute;
  left: 40px;
  top: 52px;
`;

const HeaderButtonsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: absolute;
  right: 40px;
  top: 52px;
`;

const DoneButton = styled.button`
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SelectionSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e3e8ee;
`;

// Main spreadsheet container
const SpreadsheetContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

// Spreadsheet wrapper for scrolling
const SpreadsheetWrapper = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
  user-select: none;
  padding: 20px 40px 40px 40px;
  overflow-x: auto;
  overflow-y: auto;
`;

// Table container for better overflow control
const TableContainer = styled.div`
  border-radius: 8px;
  border: 1px solid #e3e8ee;
  height: calc(100vh - 180px);
  position: relative;
  overflow: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: white;
  
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #F5F6F8 transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #F5F6F8;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #e5e7eb;
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

// Table styles
const SpreadsheetTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  margin: 0 0 40px 0;
  
  th, td {
    border-right: 1px solid #e3e8ee;
    border-bottom: 1px solid #e3e8ee;
    padding: 8px 12px;
    text-align: left;
    position: relative;
    margin: 0;
    
    &:first-child {
      border-left: 1px solid #e3e8ee;
    }
  }
  
  thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  th {
    background: white;
    font-weight: 600;
    color: #374151;
  cursor: pointer;
    user-select: none;
    margin: 0;
    min-width: 140px;
    white-space: nowrap;
  
  &:hover {
      background: #f1f3f4;
    }
    
    &.selected {
      background: #dbeafe;
      color: #0369a1;
      outline: 2px solid #3b82f6;
      outline-offset: -2px;
    }
    
    &.dragging-reorder {
      cursor: grabbing;
      opacity: 0.8;
      background: #e0f2fe;
    }
    
    &.drop-target {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
    }
  }

  tbody {
    overflow-y: auto;
  }

  // Row number column styles
  .row-number {
    background: white;
    font-weight: 600;
    color: #6b7280;
    text-align: center;
    cursor: pointer;
  user-select: none;
    width: 60px;
    min-width: 60px;
    max-width: 60px;
    border-right: 2px solid #e3e8ee;
    position: sticky;
    left: 0;
    z-index: 5;
    
    &:hover {
      background: #f1f3f4;
      color: #374151;
    }
    
    &.selected {
      background: #dbeafe;
      color: #0369a1;
      outline: 2px solid #3b82f6;
      outline-offset: -2px;
    }
    
    &.all-selected {
      background: #dbeafe;
      color: #0369a1;
      outline: 2px solid #3b82f6;
      outline-offset: -2px;
    }
  }
  
  // Select all button in top-left corner
  .select-all-button {
    background: white;
  font-weight: 600;
    color: #6b7280;
    text-align: center;
    cursor: pointer;
    user-select: none;
    width: 60px;
    min-width: 60px;
    max-width: 60px;
    border-right: 2px solid #e3e8ee;
    border-bottom: 1px solid #e3e8ee;
    position: sticky;
    left: 0;
    top: 0;
    z-index: 15;
    padding: 8px 12px !important;
    vertical-align: middle;
    
    &:hover {
      background: #f1f3f4;
    }
    
    &.selected {
      background: #dbeafe;
      color: #0369a1;
      outline: 2px solid #3b82f6;
    }
    
    svg {
      width: 12px;
      height: 12px;
      stroke: #6b7280;
      stroke-width: 2px;
      fill: none;
      display: block;
      margin: 0 auto;
    }
    
    &.selected svg {
      stroke: #0369a1;
    }
  }
  
  tbody tr {
    &:hover {
      background: #f8f9fa;
    }
    
    &.selected {
      background: #e0f2fe;
    }
  }
  
  td {
    cursor: pointer;
  
  &:hover {
      background: #f1f3f4;
    }
    
    &.selected {
      background: #dbeafe;
      outline: 2px solid #3b82f6;
      outline-offset: -2px;
    }
    
    &.column-selected {
      background: #dbeafe;
    }
  }
`;

// Column menu components
const ColumnMenuPopover = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
  padding: 4px 0;
`;

const ColumnMenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: #f3f4f6;
  }
  
  svg {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }
`;

const ColumnHeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
`;

const ColumnIcon = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #374151;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

// Floating action buttons
const FloatingActionContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: ${props => props.hasAnalysisPanel 
    ? 'calc(260px + (100vw - 260px - 400px) / 2)' 
    : 'calc(260px + (100vw - 260px) / 2)'};
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 8px;
`;

const FloatingActionButton = styled.button`
  background: #625df5;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 93, 245, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #5b56f0;
    box-shadow: 0 6px 16px rgba(98, 93, 245, 0.4);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Analysis panel
const AnalysisPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  border-left: 1px solid #e3e8ee;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #F5F6F8 transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #F5F6F8;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #e5e7eb;
  }
`;

const AnalysisPanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e3e8ee;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AnalysisPanelTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const AnalysisPanelClose = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AnalysisPanelContent = styled.div`
  padding: 16px;
`;

const AnalysisSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AnalysisSectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalysisSectionContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
`;

const RelatedColumnItem = styled.div`
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RelatedColumnName = styled.div`
      font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
`;

const RelatedColumnDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const RelatedColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

const ColumnActionLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.added ? '#059669' : '#625df5'};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Chart widget for analysis panel
const ChartWidget = styled.div`
  background: #f8f9fa;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ChartTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ChartValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const ChartTrend = styled.div`
    font-size: 12px;
  color: ${props => props.positive ? '#059669' : '#dc2626'};
    font-weight: 500;
`;

const ChartArea = styled.div`
  height: 60px;
  background: transparent;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  padding: 0;
`;

// Selection summary at bottom of spreadsheet
const SelectionSummary = styled.div`
  position: fixed;
  bottom: 20px;
  left: 300px; // Positioned to align with spreadsheet content
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1f2937;
`;

const SummaryLabel = styled.span`
  font-weight: 500;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const SummaryArrow = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SummaryTooltip = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 12px;
`;

const TooltipItem = styled.div`
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TooltipLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const TooltipValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const MetricEditor = () => {
  const navigate = useNavigate();
  const { metricId, reportId } = useParams();
  const location = useLocation();
  
  // Selection state
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [selectedColumns, setSelectedColumns] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [isDraggingRow, setIsDraggingRow] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [columnDragStart, setColumnDragStart] = useState(null);
  const [rowDragStart, setRowDragStart] = useState(null);
  const [lastClickedCell, setLastClickedCell] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Column menu state
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [columnMenuPosition, setColumnMenuPosition] = useState({ x: 0, y: 0 });
  const [columnMenuTarget, setColumnMenuTarget] = useState(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  
  // Column reordering state
  const [columnOrder, setColumnOrder] = useState([]);
  const [isDraggingColumnReorder, setIsDraggingColumnReorder] = useState(false);
  const [dragSourceColumns, setDragSourceColumns] = useState([]);
  const [dragTargetIndex, setDragTargetIndex] = useState(null);
  
  // Analysis panel state
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [analysisColumns, setAnalysisColumns] = useState([]);
  const [addedColumns, setAddedColumns] = useState(new Set());
  
  // Selection summary tooltip state
  const [showSummaryTooltip, setShowSummaryTooltip] = useState(false);
  const [summaryTooltipPosition, setSummaryTooltipPosition] = useState({ x: 0, y: 0 });
  const [summaryTooltipWidth, setSummaryTooltipWidth] = useState(0);

  // Determine if this is a report or metric based on the URL
  const isReport = location.pathname.includes('/reports/') || location.pathname.includes('/data-studio/');
  const currentId = metricId || reportId;

  // Get the schema for the current metric/report
  const schema = useMemo(() => {
    if (isReport) {
      return REPORT_SCHEMAS[currentId] || [];
    } else {
      return METRIC_SCHEMAS[currentId] || [];
    }
  }, [currentId, isReport]);

  // Initialize column order when schema changes
  useEffect(() => {
    if (schema.length > 0) {
      setColumnOrder(schema.map(col => col.id));
    }
  }, [schema]);

  // Get ordered schema based on column order
  const orderedSchema = useMemo(() => {
    if (columnOrder.length === 0) return schema;
    
    const orderedCols = columnOrder.map(id => schema.find(col => col.id === id)).filter(Boolean);
    // Add any new columns that aren't in the order yet
    const newCols = schema.filter(col => !columnOrder.includes(col.id));
    
    // Get all available columns from all schemas for added columns
    const allAvailableColumns = [
      ...Object.values(METRIC_SCHEMAS).flat(),
      ...Object.values(REPORT_SCHEMAS).flat()
    ];
    
    // Add the dynamically added columns at the end
    const dynamicallyAddedCols = Array.from(addedColumns)
      .map(colId => allAvailableColumns.find(col => col.id === colId))
      .filter(Boolean);
    
    return [...orderedCols, ...newCols, ...dynamicallyAddedCols];
  }, [schema, columnOrder, addedColumns]);

  // Generate realistic data based on the schema
  const data = useMemo(() => {
    const generateCustomer = (id) => ({
      id,
      name: [
        'ApexCloud Solutions', 'DataForge Industries', 'SynthCore Systems', 'FlowState Technologies',
        'CoreVault Enterprises', 'StreamlineHQ', 'DeepMind Analytics', 'Quantum Dynamics',
        'CodeCraft Studios', 'NetLink Innovations', 'TechFlow Solutions', 'CloudBridge Corp',
        'DataStream Co', 'InnovateTech', 'ScaleUp Ventures', 'NextGen Solutions',
        'DigitalCore Inc', 'TechVault Systems', 'SmartScale Ltd', 'DataWorks Pro'
      ][id % 20],
      email: `contact${id}@company${id}.com`,
      plan: ['Basic', 'Professional', 'Enterprise', 'Custom'][id % 4],
      status: ['Active', 'Trial', 'Churned', 'Paused'][id % 4]
    });

    const generateData = () => {
      const rows = [];
      const numRows = 150;
      
      for (let i = 0; i < numRows; i++) {
        const customer = generateCustomer(i);
        const row = {};
        
        orderedSchema.forEach(column => {
          switch (column.id) {
    case 'date':
              const date = new Date();
              date.setDate(date.getDate() - (i * 7));
              // Use local date formatting to avoid timezone issues
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              row[column.id] = `${year}-${month}-${day}`;
              break;
            case 'name':
            case 'customer':
              row[column.id] = customer.name;
              break;
            case 'product':
            case 'plan':
              row[column.id] = customer.plan;
              break;
            case 'status':
              row[column.id] = customer.status;
              break;
            case 'amount':
            case 'current_mrr':
            case 'subscription_revenue':
            case 'usage_revenue':
            case 'add_on_revenue':
            case 'overage_revenue':
            case 'projected_ltv':
              row[column.id] = Math.floor(Math.random() * 50000) + 1000;
              break;
            case 'usage_growth':
              row[column.id] = (Math.random() * 200 - 50).toFixed(1);
              break;
            case 'included_units':
            case 'unitsUsed':
            case 'overageUnits':
            case 'customerCount':
              row[column.id] = Math.floor(Math.random() * 10000) + 100;
              break;
            case 'overageRate':
              row[column.id] = (Math.random() * 5).toFixed(3);
              break;
            case 'meter':
              row[column.id] = ['API Calls', 'Storage GB', 'Compute Hours', 'Bandwidth'][i % 4];
              break;
    default:
              // Generate data for added columns based on their type
              if (addedColumns.has(column.id)) {
                if (column.isCurrency) {
                  row[column.id] = Math.floor(Math.random() * 50000) + 1000;
                } else if (column.isNumber || column.dataType === 'number') {
                  row[column.id] = Math.floor(Math.random() * 10000) + 100;
                } else if (column.isTrend || column.dataType === 'percentage') {
                  row[column.id] = (Math.random() * 200 - 50).toFixed(1);
                } else if (column.dataType === 'date') {
                  const date = new Date();
                  date.setDate(date.getDate() - (i * 7));
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  row[column.id] = `${year}-${month}-${day}`;
                } else if (column.dataType === 'category') {
                  const categories = ['Active', 'Trial', 'Premium', 'Enterprise'];
                  row[column.id] = categories[i % categories.length];
                } else {
                  row[column.id] = `Value ${i + 1}`;
                }
              } else {
                row[column.id] = `Value ${i + 1}`;
              }
          }
        });
        
        rows.push(row);
      }
      
      return rows;
    };

    return generateData();
  }, [orderedSchema, addedColumns]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return data;
    }

    const column = orderedSchema.find(col => col.id === sortConfig.column);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];

      let comparison = 0;
      
      if (column.dataType === 'date') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        comparison = aDate.getTime() - bDate.getTime();
      } else if (column.isCurrency || column.isNumber || column.dataType === 'number' || column.isTrend) {
        const aNum = parseFloat(aVal) || 0;
        const bNum = parseFloat(bVal) || 0;
        comparison = aNum - bNum;
        } else {
        // String comparison
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig, orderedSchema]);

  // Helper functions for selection
  const getCellKey = (rowIndex, columnId) => `${rowIndex}-${columnId}`;
  
  const getCellsInRange = (start, end) => {
    const cells = new Set();
    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startColIndex = Math.min(start.colIndex, end.colIndex);
    const endColIndex = Math.max(start.colIndex, end.colIndex);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let colIndex = startColIndex; colIndex <= endColIndex; colIndex++) {
        const columnId = orderedSchema[colIndex]?.id;
        if (columnId) {
          cells.add(getCellKey(row, columnId));
        }
      }
    }
    return cells;
  };

  const getColumnsInRange = (startColIndex, endColIndex) => {
    const columns = new Set();
    const start = Math.min(startColIndex, endColIndex);
    const end = Math.max(startColIndex, endColIndex);
    
    for (let i = start; i <= end; i++) {
      const columnId = orderedSchema[i]?.id;
      if (columnId) {
        columns.add(columnId);
      }
    }
    return columns;
  };

  const getRowsInRange = (startRowIndex, endRowIndex) => {
    const rows = new Set();
    const start = Math.min(startRowIndex, endRowIndex);
    const end = Math.max(startRowIndex, endRowIndex);
    
    for (let i = start; i <= end; i++) {
      rows.add(i);
    }
    return rows;
  };

  // Calculate selection statistics
  const selectionStats = useMemo(() => {
    const selectedCellsArray = Array.from(selectedCells);
    const selectedColumnsArray = Array.from(selectedColumns);
    const selectedRowsArray = Array.from(selectedRows);
    
    if (selectedCellsArray.length === 0 && selectedColumnsArray.length === 0 && selectedRow === null && selectedRowsArray.length === 0) {
      return null;
    }

    const stats = {
      cellsSelected: selectedCellsArray.length,
      columnsInvolved: new Set(),
      aggregations: {}
    };

    // Handle multiple row selections
    if (selectedRowsArray.length > 0) {
      stats.cellsSelected = selectedRowsArray.length * orderedSchema.length;
      orderedSchema.forEach(column => {
        stats.columnsInvolved.add(column.id);
      });
    }
    // Handle single row selection
    else if (selectedRow !== null) {
      stats.cellsSelected = orderedSchema.length;
      orderedSchema.forEach(column => {
        stats.columnsInvolved.add(column.id);
      });
    }
    // Handle column-only selections
    else if (selectedColumnsArray.length > 0 && selectedCellsArray.length === 0) {
      stats.cellsSelected = selectedColumnsArray.length * sortedData.length;
      selectedColumnsArray.forEach(columnId => {
        stats.columnsInvolved.add(columnId);
      });
    } else {
      // Handle cell selections
      selectedCellsArray.forEach(cellKey => {
        const [rowIndex, columnId] = cellKey.split('-');
        stats.columnsInvolved.add(columnId);
      });
    }

    // Calculate aggregations for each involved column
    Array.from(stats.columnsInvolved).forEach(columnId => {
      const column = orderedSchema.find(col => col.id === columnId);
      if (!column) return;

      let values = [];
      
      if (selectedRowsArray.length > 0) {
        // Multiple rows are selected
        values = selectedRowsArray.map(rowIndex => sortedData[rowIndex]?.[columnId]).filter(val => val != null);
      } else if (selectedRow !== null) {
        // Entire row is selected - get the value for this column from the selected row
        values = [sortedData[selectedRow]?.[columnId]].filter(val => val != null);
      } else if (selectedColumnsArray.includes(columnId)) {
        // Entire column is selected
        values = sortedData.map(row => row[columnId]).filter(val => val != null);
      } else {
        // Only specific cells are selected
        values = selectedCellsArray
          .filter(cellKey => cellKey.endsWith(`-${columnId}`))
          .map(cellKey => {
            const [rowIndex] = cellKey.split('-');
            return sortedData[parseInt(rowIndex)]?.[columnId];
          })
          .filter(val => val != null);
      }

      if (values.length === 0) return;

      if (column.dataType === 'date') {
        // For date columns, show the range
        // Parse dates as local time to avoid timezone issues
        const dateValues = values.map(v => {
          const [year, month, day] = v.split('-').map(num => parseInt(num));
          return new Date(year, month - 1, day); // month is 0-indexed
        }).filter(d => !isNaN(d.getTime()));
        
        if (dateValues.length > 0) {
          const sortedDates = dateValues.sort((a, b) => a.getTime() - b.getTime());
          const startDate = sortedDates[0];
          const endDate = sortedDates[sortedDates.length - 1];
          
          stats.aggregations[columnId] = {
            type: 'dateRange',
            startDate,
            endDate,
            label: column.label
          };
        }
      } else if (column.isTrend || column.dataType === 'percentage' || column.label.toLowerCase().includes('trend') || column.label.toLowerCase().includes('%') || column.label.toLowerCase().includes('rate')) {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          stats.aggregations[columnId] = {
            type: 'average',
            value: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
            label: column.label,
            isPercentage: true
          };
        }
      } else if (column.isCurrency || column.isNumber || column.dataType === 'number') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          stats.aggregations[columnId] = {
            type: 'sum',
            value: numericValues.reduce((sum, val) => sum + val, 0),
            label: column.label,
            isCurrency: column.isCurrency
          };
        }
      } else if (column.dataType === 'category' || column.dataType === 'string') {
        const uniqueValues = new Set(values.filter(v => v !== ''));
        stats.aggregations[columnId] = {
          type: 'unique',
          value: uniqueValues.size,
          label: column.label
        };
      }
    });

    return stats;
  }, [selectedCells, selectedColumns, selectedRow, sortedData, orderedSchema]);

  // Determine columns involved in current selection for floating buttons
  const selectedColumnsForAnalysis = useMemo(() => {
    // Don't show buttons for row selections (single or multiple)
    if (selectedRow !== null || selectedRows.size > 0) return [];
    
    const columnsInvolved = new Set();
    
    // Add explicitly selected columns
    if (selectedColumns.size > 0) {
      selectedColumns.forEach(columnId => columnsInvolved.add(columnId));
    }
    
    // Add columns from selected cells
    selectedCells.forEach(cellKey => {
      const [rowIndex, columnId] = cellKey.split('-');
      columnsInvolved.add(columnId);
    });
    
    return Array.from(columnsInvolved);
  }, [selectedCells, selectedColumns, selectedRow, selectedRows]);

  // Check if current selection differs from what's being analyzed
  const selectionDiffersFromAnalysis = useMemo(() => {
    if (selectedColumnsForAnalysis.length === 0) return false;
    if (selectedColumnsForAnalysis.length !== analysisColumns.length) return true;
    
    // Check if the arrays contain the same elements
    const sortedSelected = [...selectedColumnsForAnalysis].sort();
    const sortedAnalyzed = [...analysisColumns].sort();
    
    return !sortedSelected.every((col, index) => col === sortedAnalyzed[index]);
  }, [selectedColumnsForAnalysis, analysisColumns]);

  // Show floating buttons when there's a selection and either panel is closed or selection differs
  const shouldShowFloatingButtons = selectedColumnsForAnalysis.length > 0 && 
    (!showAnalysisPanel || selectionDiffersFromAnalysis);

  // Get display title
  const getDisplayTitle = () => {
    if (isReport) {
      const reportNames = {
        'high-usage-growth': 'High Usage Growth',
        'monthly-sales': 'Monthly Sales',
        'new-subscribers': 'New Subscribers',
        'weekly-churned': 'Weekly Churned',
        'top-selling': 'Top Selling',
        'high-value': 'High Value',
        'new-products': 'New Products',
        'mrr-growth': 'MRR Growth',
        'upsell-opportunities': 'Upsell Opportunities',
        'new-free-trials': 'New Free Trials',
        'revenue-composition': 'Revenue Composition',
        'churn-risk': 'Churn Risk'
      };
      return reportNames[currentId] || 'Unknown Report';
    } else {
      const metric = standardizedMetrics[currentId] || Object.values(standardizedMetrics).find(m => m.id === currentId);
      return metric ? metric.title : 'Unknown Metric';
    }
  };

  // Format cell values
  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '';
    
    if (column.isCurrency) {
      return `$${Number(value).toLocaleString()}`;
    }
    
    if (column.isNumber) {
      return Number(value).toLocaleString();
    }
    
    if (column.isTrend) {
      const num = Number(value);
      return `${num > 0 ? '+' : ''}${num}%`;
    }
    
    return String(value);
  };

  // Event handlers
  const handleCellClick = (rowIndex, columnId, event) => {
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    
    if (event.shiftKey && lastClickedCell) {
      // Shift+click for range selection
      const newSelectedCells = getCellsInRange(lastClickedCell, { row: rowIndex, colIndex });
      setSelectedCells(newSelectedCells);
      setSelectedColumns(new Set());
      setSelectedCell(null);
      setSelectedColumn(null);
      setSelectedRow(null);
      setIsAllSelected(false);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click for multi-selection
      const cellKey = getCellKey(rowIndex, columnId);
      const newSelectedCells = new Set(selectedCells);
      if (newSelectedCells.has(cellKey)) {
        newSelectedCells.delete(cellKey);
      } else {
        newSelectedCells.add(cellKey);
      }
      setSelectedCells(newSelectedCells);
      setSelectedColumns(new Set());
      setSelectedCell(null);
      setSelectedColumn(null);
      setSelectedRow(null);
      setLastClickedCell({ row: rowIndex, colIndex });
      setIsAllSelected(false);
    } else {
      // Single cell selection
      setSelectedCell({ row: rowIndex, column: columnId });
      setSelectedCells(new Set([getCellKey(rowIndex, columnId)]));
      setSelectedColumns(new Set());
      setSelectedColumn(null);
      setSelectedRow(null);
      setLastClickedCell({ row: rowIndex, colIndex });
      setIsAllSelected(false);
    }
  };

  const handleColumnClick = (columnId, event) => {
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    
    if (event.shiftKey && selectedColumns.size > 0) {
      // Shift+click for column range selection
      const firstSelectedIndex = Math.min(...Array.from(selectedColumns).map(id => 
        orderedSchema.findIndex(col => col.id === id)
      ));
      const newSelectedColumns = getColumnsInRange(firstSelectedIndex, colIndex);
      setSelectedColumns(newSelectedColumns);
      setSelectedCells(new Set());
      setIsAllSelected(false);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click for multi-column selection
      const newSelectedColumns = new Set(selectedColumns);
      if (newSelectedColumns.has(columnId)) {
        newSelectedColumns.delete(columnId);
      } else {
        newSelectedColumns.add(columnId);
      }
      setSelectedColumns(newSelectedColumns);
      setSelectedCells(new Set());
      setIsAllSelected(false);
    } else {
      // Single column selection
      setSelectedColumn(columnId);
      setSelectedColumns(new Set([columnId]));
      setSelectedCells(new Set());
      setSelectedCell(null);
      setSelectedRow(null);
      setIsAllSelected(false);
    }
  };

  const handleColumnMouseDown = (columnId, event) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) return;
    
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    const isAlreadySelected = selectedColumns.has(columnId) || selectedColumn === columnId;
    
    if (isAlreadySelected) {
      // If column is already selected, initiate drag-to-reorder
      setIsDraggingColumnReorder(true);
      
      // Store which columns are being dragged
      const columnsToMove = selectedColumns.size > 0 
        ? Array.from(selectedColumns)
        : [selectedColumn || columnId];
      setDragSourceColumns(columnsToMove);
      
      // Don't change selection, keep current selected columns
      // Clear other types of selections
      setSelectedCell(null);
      setSelectedRow(null);
      setSelectedCells(new Set());
    } else {
      // If column is not selected, use existing selection logic
      setIsDraggingColumn(true);
      setColumnDragStart(colIndex);
      
      // Clear other selections
      setSelectedCell(null);
      setSelectedRow(null);
      setSelectedCells(new Set());
    }
    
    // Prevent text selection
    event.preventDefault();
  };

  const handleColumnMouseEnter = (columnId) => {
    // Only do range selection if we're in column selection mode (not reorder mode)
    if (isDraggingColumnReorder) {
      // Set the target position for reordering
      const targetIndex = orderedSchema.findIndex(col => col.id === columnId);
      setDragTargetIndex(targetIndex);
      return;
    }
    
    if (!isDraggingColumn || columnDragStart === null) return;
    
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    const newSelectedColumns = getColumnsInRange(columnDragStart, colIndex);
    setSelectedColumns(newSelectedColumns);
    setSelectedColumn(null);
  };

  const handleColumnMouseUp = () => {
    if (isDraggingColumnReorder) {
      // Handle drag-to-reorder completion
      if (dragTargetIndex !== null && dragSourceColumns.length > 0) {
        const newOrder = [...columnOrder];
        
        // Remove the dragged columns from their current positions
        const columnsToMove = dragSourceColumns.map(id => ({
          id,
          originalIndex: newOrder.indexOf(id)
        })).sort((a, b) => b.originalIndex - a.originalIndex); // Remove from back to front
        
        columnsToMove.forEach(({ originalIndex }) => {
          newOrder.splice(originalIndex, 1);
        });
        
        // Calculate the adjusted target index (accounting for removed columns)
        let adjustedTargetIndex = dragTargetIndex;
        columnsToMove.forEach(({ originalIndex }) => {
          if (originalIndex < dragTargetIndex) {
            adjustedTargetIndex--;
          }
        });
        
        // Insert the columns at the target position
        const columnIds = dragSourceColumns.map(id => id);
        newOrder.splice(adjustedTargetIndex, 0, ...columnIds);
        
        setColumnOrder(newOrder);
      }
      
      // Reset drag state
      setIsDraggingColumnReorder(false);
      setDragSourceColumns([]);
      setDragTargetIndex(null);
    } else {
      // Handle column selection completion
      setIsDraggingColumn(false);
      setColumnDragStart(null);
    }
  };

  const handleRowClick = (rowIndex) => {
    setSelectedRow(rowIndex);
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedColumns(new Set());
    setSelectedCells(new Set());
  };

  const handleRowNumberClick = (rowIndex, event) => {
    if (event.shiftKey && (selectedRow !== null || selectedRows.size > 0)) {
      // Shift+click for row range selection
      const startRow = selectedRow !== null ? selectedRow : Math.min(...Array.from(selectedRows));
      const newSelectedRows = getRowsInRange(startRow, rowIndex);
      setSelectedRows(newSelectedRows);
      setSelectedRow(null);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click for multi-row selection
      const newSelectedRows = new Set(selectedRows);
      if (newSelectedRows.has(rowIndex)) {
        newSelectedRows.delete(rowIndex);
      } else {
        newSelectedRows.add(rowIndex);
      }
      setSelectedRows(newSelectedRows);
      setSelectedRow(null);
    } else {
      // Single row selection
      setSelectedRow(rowIndex);
      setSelectedRows(new Set());
    }
    
    // Clear other selections
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedColumns(new Set());
    setSelectedCells(new Set());
    setIsAllSelected(false);
  };

  const handleRowNumberMouseDown = (rowIndex, event) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) return;
    
    setIsDraggingRow(true);
    setRowDragStart(rowIndex);
    
    // Clear other selections
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedColumns(new Set());
    setSelectedCells(new Set());
    setIsAllSelected(false);
    
    // Prevent text selection
    event.preventDefault();
  };

  const handleRowNumberMouseEnter = (rowIndex) => {
    if (!isDraggingRow || rowDragStart === null) return;
    
    const newSelectedRows = getRowsInRange(rowDragStart, rowIndex);
    setSelectedRows(newSelectedRows);
    setSelectedRow(null);
  };

  const handleMouseDown = (rowIndex, columnId, event) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) return;
    
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    setIsDragging(true);
    setDragStart({ row: rowIndex, colIndex });
    setDragEnd({ row: rowIndex, colIndex });
    
    // Clear other selections
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedRow(null);
    setSelectedColumns(new Set());
  };

  const handleMouseEnter = (rowIndex, columnId) => {
    if (!isDragging) return;
    
    const colIndex = orderedSchema.findIndex(col => col.id === columnId);
    setDragEnd({ row: rowIndex, colIndex });
    
    if (dragStart) {
      const newSelectedCells = getCellsInRange(dragStart, { row: rowIndex, colIndex });
      setSelectedCells(newSelectedCells);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingColumn(false);
    setIsDraggingColumnReorder(false);
    setIsDraggingRow(false);
    setDragStart(null);
    setDragEnd(null);
    setColumnDragStart(null);
    setRowDragStart(null);
    setDragSourceColumns([]);
    setDragTargetIndex(null);
  };

  // Add global mouse up listener
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearAllSelections();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Add click outside handler for deselection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't deselect if clicking in:
      // - Left panel
      // - Analysis panel
      // - Floating action buttons
      // - Column menu
      // - Spreadsheet table itself
      // - Summary component
      
      const leftPanel = event.target.closest('[data-panel="left"]');
      const analysisPanel = event.target.closest('[data-panel="analysis"]');
      const floatingButtons = event.target.closest('[data-floating-buttons]');
      const columnMenu = event.target.closest('[data-column-menu]');
      const spreadsheetTable = event.target.closest('table');
      const summaryComponent = event.target.closest('[data-summary-component]');
      
      if (!leftPanel && !analysisPanel && !floatingButtons && !columnMenu && !spreadsheetTable && !summaryComponent) {
        clearAllSelections();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    if (isReport) {
      navigate(`/data-studio/${currentId}`);
    } else {
      navigate(`/metrics/${currentId}`);
    }
  };

  const handleSave = () => {
    console.log('Save functionality to be implemented');
  };

  // Column menu handlers
  const handleChevronClick = (columnId, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setColumnMenuPosition({
      x: rect.left,
      y: rect.bottom + 4
    });
    setColumnMenuTarget(columnId);
    setShowColumnMenu(true);
  };

  const handleSort = (direction) => {
    if (columnMenuTarget) {
      setSortConfig({
        column: columnMenuTarget,
        direction: direction
      });
    }
    setShowColumnMenu(false);
  };

  const handleColumnReorderStart = (columnId, event) => {
    event.stopPropagation();
    setIsDraggingColumnReorder(true);
    // Implementation for column reordering will be added
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnMenu) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
      return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  // Analysis panel handlers
  const handleAnalyzeClick = () => {
    setAnalysisColumns(selectedColumnsForAnalysis);
    if (!showAnalysisPanel) {
      setShowAnalysisPanel(true);
    }
    // If panel is already open, just update the content (analysisColumns is already set above)
  };

  const handleCloseAnalysisPanel = () => {
    setShowAnalysisPanel(false);
    setAnalysisColumns([]);
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (isAllSelected) {
      // If already selected, deselect all
      setIsAllSelected(false);
      setSelectedColumns(new Set());
      setSelectedCell(null);
      setSelectedRow(null);
      setSelectedRows(new Set());
      setSelectedCells(new Set());
      setSelectedColumn(null);
    } else {
      // Select all
      setIsAllSelected(true);
      // Select all columns
      const allColumnIds = new Set(orderedSchema.map(col => col.id));
      setSelectedColumns(allColumnIds);
      
      // Clear other selections
      setSelectedCell(null);
      setSelectedRow(null);
      setSelectedRows(new Set());
      setSelectedCells(new Set());
      setSelectedColumn(null);
    }
  };

  // Function to clear all selections
  const clearAllSelections = () => {
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedRow(null);
    setSelectedRows(new Set());
    setSelectedCells(new Set());
    setSelectedColumns(new Set());
    setIsAllSelected(false);
  };

  // Get primary aggregation for summary display
  const getPrimaryAggregation = () => {
    if (!selectionStats || Object.keys(selectionStats.aggregations).length === 0) {
      return null;
    }

    // Get the leftmost column from the selection
    const columnsInvolved = Array.from(selectionStats.columnsInvolved);
    if (columnsInvolved.length === 0) return null;

    // Find the leftmost column by checking schema order
    let leftmostColumn = null;
    let leftmostIndex = Infinity;

    columnsInvolved.forEach(columnId => {
      const index = orderedSchema.findIndex(col => col.id === columnId);
      if (index !== -1 && index < leftmostIndex) {
        leftmostIndex = index;
        leftmostColumn = columnId;
      }
    });

    return leftmostColumn ? selectionStats.aggregations[leftmostColumn] : null;
  };

  // Handle summary tooltip
  const handleSummaryArrowClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSummaryTooltipPosition({
      x: rect.left,
      y: rect.top - 10 // Position above the arrow
    });
    setShowSummaryTooltip(!showSummaryTooltip);
  };

  // Handle summary hover
  const handleSummaryMouseEnter = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Estimate tooltip height (approximately 120px for multiple items)
    const estimatedTooltipHeight = 120;
    
    setSummaryTooltipPosition({
      x: rect.left,
      y: rect.top - estimatedTooltipHeight - 4 // 4px spacing above the component
    });
    
    setSummaryTooltipWidth(rect.width);
    setShowSummaryTooltip(true);
  };

  const handleSummaryMouseLeave = () => {
    setShowSummaryTooltip(false);
  };

  const handleSummaryClick = (event) => {
    // Prevent click from bubbling up to document handlers that might clear selections
    event.stopPropagation();
  };

  // Generate mock analysis content
  const getColumnDefinitions = (columnIds) => {
    const definitions = {
      'date': 'The timestamp when the record was created or updated. Used for temporal analysis and trend identification.',
      'name': 'The customer or company name associated with this record. Primary identifier for business entities.',
      'customer': 'Customer identification field linking to the primary customer database. Used for customer segmentation and analysis.',
      'amount': 'Monetary value in USD representing the transaction or subscription amount. Key metric for revenue analysis.',
      'current_mrr': 'Monthly Recurring Revenue for the current period. Critical SaaS metric tracking predictable revenue streams.',
      'subscription_revenue': 'Revenue generated from subscription-based services. Core component of recurring revenue models.',
      'usage_revenue': 'Revenue generated from usage-based billing beyond the base subscription. Variable revenue component.',
      'usage_growth': 'Percentage change in usage metrics period-over-period. Indicates customer engagement and potential upsell opportunities.',
      'plan': 'Service tier or subscription plan level. Determines feature access and pricing structure.',
      'status': 'Current account status (Active, Trial, Churned, Paused). Critical for customer lifecycle management.',
      'meter': 'Usage measurement unit (API Calls, Storage GB, etc.). Defines how usage-based billing is calculated.',
      'included_units': 'Number of units included in the base subscription plan before overage charges apply.',
      'unitsUsed': 'Actual units consumed during the billing period. Used to calculate overages and usage patterns.',
      'overageUnits': 'Units consumed beyond the included allowance. Directly impacts overage revenue calculations.',
      'overageRate': 'Price per unit for usage beyond included limits. Key driver of usage-based revenue expansion.'
    };
    
    return columnIds.map(id => ({
      id,
      label: orderedSchema.find(col => col.id === id)?.label || id,
      definition: definitions[id] || `Analysis metric for ${id}. Provides insights into business performance and customer behavior patterns.`
    }));
  };

  const getAIAnalysis = (columnIds) => {
    const singleColumnAnalysis = {
      'current_mrr': 'Monthly recurring revenue has increased by 2.4% this period, reaching $847K total. The growth trajectory shows strong momentum with enterprise accounts driving 67% of the expansion. Customer cohorts from Q2 demonstrate superior retention rates at 94%, indicating improved product-market fit. We recommend focusing on the $2K-$5K segment which shows the highest propensity for upgrades.',
      'usage_growth': 'Usage patterns reveal a 15.3% increase in average consumption over the last 30 days. Peak utilization occurs during business hours (9AM-5PM EST) with 73% of total volume. Several high-value accounts exceeded their included limits by 40%, presenting immediate upsell opportunities. The data suggests implementing tiered pricing could capture an additional $127K in quarterly revenue.',
      'amount': 'Transaction values have stabilized around three distinct pricing tiers with an average increase of 8.7% quarter-over-quarter. The $500-$2000 segment represents 52% of all deals and shows consistent growth patterns. Large enterprise transactions ($10K+) have grown by 23% but represent only 12% of volume. Consider introducing a mid-tier package to bridge the gap between standard and enterprise offerings.',
      'subscription_revenue': 'Subscription revenue demonstrates healthy 12.1% growth with minimal churn impact at just 3.2% monthly. The majority of revenue (78%) comes from customers with 12+ month tenure, indicating strong long-term value realization. New customer acquisition costs have decreased by 18% while lifetime value increased 31%. Focus on accelerating time-to-value for new accounts to improve early engagement metrics.',
      'status': 'Customer lifecycle analysis shows a 67% trial-to-paid conversion rate, exceeding industry benchmarks by 15 percentage points. Active accounts demonstrate high engagement with 89% utilizing core features weekly. Early warning signals identify 8% of accounts at risk for churn, primarily due to declining usage patterns. Proactive outreach to at-risk segments could prevent an estimated $230K in revenue loss.',
      'meter': 'Metering data reveals significant optimization opportunities with 34% of customers consistently under-utilizing their allocated resources. API call patterns show 2.7x higher usage during peak business periods compared to off-hours. Storage utilization has grown 156% year-over-year, indicating successful data platform adoption. Consider implementing usage-based alerts to help customers optimize their consumption patterns.',
      'plan': 'Plan distribution analysis shows 45% of customers on Basic tier with strong upgrade potential to Professional. Enterprise adoption has accelerated 28% this quarter, driven by enhanced security features and dedicated support. Custom plan requests have increased 67%, suggesting market demand for more flexible pricing options. Revenue per customer varies significantly by plan type, with Enterprise generating 8.2x more value than Basic.',
    };
    
    if (columnIds.length === 1) {
      const columnId = columnIds[0];
      return singleColumnAnalysis[columnId] || `Analysis shows positive performance trends for ${orderedSchema.find(col => col.id === columnId)?.label}. Key metrics indicate 18.5% growth over the previous period with strong correlation to customer success indicators. Data patterns suggest opportunities for optimization and revenue expansion through targeted initiatives. Consider implementing automated monitoring to track performance against established benchmarks.`;
    } else {
      const primaryMetric = columnIds[0];
      const metricLabel = orderedSchema.find(col => col.id === primaryMetric)?.label || 'selected metrics';
      return `Cross-metric analysis reveals strong correlations between ${columnIds.length} key performance indicators. The primary driver shows 14.2% improvement this period, with secondary metrics following similar upward trends. Customer segmentation data indicates high-value accounts (top 20%) contribute disproportionately to overall growth at 68% of total impact. Implementation of predictive analytics could improve forecasting accuracy by an estimated 23% based on these correlated patterns.`;
    }
  };

  const getRelatedColumns = (columnIds) => {
    // Get all available columns from all schemas
    const allAvailableColumns = [
      ...Object.values(METRIC_SCHEMAS).flat(),
      ...Object.values(REPORT_SCHEMAS).flat()
    ];
    
    // Get ONLY the original schema column IDs (not including added columns)
    const originalColumnIds = new Set(schema.map(col => col.id));
    
    // Also exclude columns that are semantically similar (different IDs but same meaning)
    const originalColumnLabels = new Set(schema.map(col => col.label?.toLowerCase()));
    const excludeSimilarColumns = (columnId) => {
      const column = allAvailableColumns.find(col => col.id === columnId);
      if (!column) return true; // Exclude if column not found
      
      // Check for semantic similarity with ORIGINAL schema only
      const label = column.label?.toLowerCase() || '';
      return originalColumnLabels.has(label) || 
             originalColumnLabels.has('mrr') && (label.includes('mrr') || label.includes('revenue')) ||
             originalColumnLabels.has('revenue') && label.includes('mrr') ||
             originalColumnLabels.has('customer') && label.includes('customer') ||
             originalColumnLabels.has('plan') && label.includes('plan') ||
             originalColumnLabels.has('date') && (label.includes('date') || label.includes('signup'));
    };
    
    const relationships = {
      'current_mrr': ['subscription_revenue', 'plan', 'status'],
      'usage_growth': ['unitsUsed', 'overageUnits', 'usage_revenue'],
      'subscription_revenue': ['current_mrr', 'plan', 'amount'],
      'usage_revenue': ['usage_growth', 'overageUnits', 'overageRate'],
      'amount': ['subscription_revenue', 'current_mrr', 'plan'],
      'plan': ['current_mrr', 'subscription_revenue', 'status'],
      'status': ['current_mrr', 'plan', 'customer'],
      'customer': ['current_mrr', 'subscription_revenue', 'plan'],
      'date': ['status', 'current_mrr', 'usage_growth'],
      'meter': ['unitsUsed', 'overageUnits', 'usage_revenue'],
      'unitsUsed': ['meter', 'overageUnits', 'usage_growth'],
      'overageUnits': ['unitsUsed', 'overageRate', 'usage_revenue'],
      'overageRate': ['overageUnits', 'usage_revenue', 'meter'],
      'included_units': ['unitsUsed', 'plan', 'meter'],
      'name': ['customer', 'plan', 'status']
    };
    
    const relatedIds = new Set();
    columnIds.forEach(id => {
      (relationships[id] || ['plan', 'status', 'usage_growth']).forEach(relatedId => {
        if (!originalColumnIds.has(relatedId) && !excludeSimilarColumns(relatedId)) {
          const relatedColumn = allAvailableColumns.find(col => col.id === relatedId);
          if (relatedColumn) {
            relatedIds.add(relatedId);
          }
        }
      });
    });
    
    // Ensure we always have 2-3 related columns
    let related = Array.from(relatedIds);
    if (related.length === 0) {
      // Fallback to columns from different schemas that aren't semantically similar
      const fallbackColumns = ['usage_growth', 'overageUnits', 'usage_revenue', 'meter', 'overageRate', 'included_units'];
      related = fallbackColumns.filter(id => 
        !originalColumnIds.has(id) && 
        !excludeSimilarColumns(id) && 
        allAvailableColumns.find(col => col.id === id)
      );
    }
    if (related.length === 1) {
      // Add one more column from usage/billing metrics
      const additional = ['usage_growth', 'overageUnits', 'meter', 'overageRate'].find(id => 
        !originalColumnIds.has(id) && 
        !related.includes(id) && 
        !excludeSimilarColumns(id) && 
        allAvailableColumns.find(col => col.id === id)
      );
      if (additional) related.push(additional);
    }
    
    // Limit to 3 columns
    related = related.slice(0, 3);
    
    return related.map(id => {
      const column = allAvailableColumns.find(col => col.id === id);
      return {
        id,
        label: column?.label || id,
        description: `Strongly correlated with ${columnIds.length === 1 ? orderedSchema.find(col => col.id === columnIds[0])?.label : 'selected metrics'} and impacts overall performance`
      };
    });
  };

  // Handle adding/removing columns
  const handleToggleColumn = (columnId) => {
    const newAddedColumns = new Set(addedColumns);
    if (newAddedColumns.has(columnId)) {
      newAddedColumns.delete(columnId);
    } else {
      newAddedColumns.add(columnId);
    }
    setAddedColumns(newAddedColumns);
  };

  // Generate chart data for visualization
  const generateChartData = (columnId) => {
    const dataPoints = 12; // 12 data points for trend
    
    // Base trend patterns for different metrics
    const trendPatterns = {
      'current_mrr': [820, 825, 830, 835, 838, 840, 843, 845, 847, 849, 850, 847], // Steady growth with slight dip
      'usage_growth': [12.1, 13.2, 14.5, 15.8, 16.2, 15.9, 15.1, 14.8, 15.3, 15.7, 16.1, 15.3], // Volatile growth
      'amount': [2180, 2210, 2245, 2280, 2310, 2330, 2345, 2360, 2340, 2355, 2370, 2347], // Steady increase
      'subscription_revenue': [1.05, 1.08, 1.12, 1.15, 1.18, 1.19, 1.20, 1.21, 1.20, 1.19, 1.21, 1.2], // M scale
      'status': [89.2, 91.1, 92.8, 93.5, 94.1, 94.8, 95.2, 94.9, 94.2, 94.6, 94.8, 94.2], // Percentage
      'meter': [2.1, 2.3, 2.4, 2.6, 2.5, 2.7, 2.8, 2.6, 2.7, 2.9, 2.8, 2.7], // Ratio
      'plan': [62, 64, 65, 66, 67, 68, 67, 66, 67, 68, 69, 67] // Percentage
    };
    
    const pattern = trendPatterns[columnId] || [10, 12, 14, 16, 18, 17, 15, 14, 16, 18, 19, 17];
    
    // Generate labels (last 12 periods)
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7)); // Weekly intervals
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Return chart data in the format expected by LineChart component
    return {
      labels,
      datasets: [
        {
          label: orderedSchema.find(col => col.id === columnId)?.label || columnId,
          data: pattern,
          borderColor: '#635bff',
          backgroundColor: 'rgba(99, 93, 255, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          fill: true
        }
      ]
    };
  };

  // Convert data points to SVG path
  const generateSVGPath = (data, width = 240, height = 44) => {
    if (data.length === 0) return '';
    
    const minY = Math.min(...data.map(d => d.y));
    const maxY = Math.max(...data.map(d => d.y));
    const range = maxY - minY || 1;
    
    // Convert to SVG coordinates with proper padding
    const padding = { top: 4, bottom: 4, left: 8, right: 8 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const points = data.map((d, index) => ({
      x: padding.left + (index / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((d.y - minY) / range) * chartHeight
    }));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // Area path (for filled area under curve)
    let areaPath = path + ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
    
    return { linePath: path, areaPath, points };
  };

  // Add click outside handler for tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the summary component itself
      if (!event.target.closest('[data-summary-tooltip]') && 
          !event.target.closest('[data-summary-component]')) {
        setShowSummaryTooltip(false);
      }
    };

    if (showSummaryTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSummaryTooltip]);

  return (
    <>
      <EditorContainer hasAnalysisPanel={showAnalysisPanel}>
        <LeftPanel data-panel="left">
          <InfoSection>
            <InfoItem>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>{isReport ? 'Report' : 'Metric'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Columns</InfoLabel>
              <InfoValue>{orderedSchema.length}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Rows</InfoLabel>
              <InfoValue>{sortedData.length}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Total Cells</InfoLabel>
              <InfoValue>{(orderedSchema.length * sortedData.length).toLocaleString()}</InfoValue>
            </InfoItem>
          </InfoSection>
        </LeftPanel>

        <SpreadsheetContainer>
          <SpreadsheetHeader>
            <HeaderTitle>{getDisplayTitle()}</HeaderTitle>
            <HeaderButtons>
              <DoneButton onClick={handleClose}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1746_99298)">
                    <path d="M3.75265 7.88639C4.00064 8.15697 3.98232 8.57736 3.71174 8.82535C3.44115 9.07335 3.02076 9.05503 2.77277 8.78445L0.174383 5.94933C-0.0584551 5.69528 -0.0584754 5.3054 0.174335 5.05133L2.77272 2.21561C3.02068 1.945 3.44107 1.92663 3.71168 2.1746C3.9823 2.42256 4.00066 2.84295 3.75269 3.11356L2.17465 4.83575L8.28435 4.83544C10.1196 4.83535 11.6074 6.32309 11.6074 8.15835V8.21752C11.6074 8.58455 11.3099 8.8821 10.9428 8.8821C10.5758 8.8821 10.2783 8.58455 10.2783 8.21752V8.15835C10.2783 7.05719 9.38557 6.16455 8.28442 6.1646L2.17491 6.16491L3.75265 7.88639Z" fill="#474E5A"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1746_99298">
                      <rect width="12" height="12" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </DoneButton>
            </HeaderButtons>
            <HeaderButtonsRight>
              <SaveButton onClick={handleSave}>Save</SaveButton>
            </HeaderButtonsRight>
          </SpreadsheetHeader>
          <SpreadsheetWrapper>
            {orderedSchema.length > 0 ? (
              <TableContainer>
                <SpreadsheetTable>
                  <thead>
                    <tr>
                      {/* Select all button */}
                      <th 
                        className={`select-all-button ${isAllSelected ? 'selected' : ''}`}
                        onClick={handleSelectAll}
                        title="Select all"
                      >
                        <svg viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="8" />
                            </svg>
                      </th>
                      {orderedSchema.map((column, index) => {
                        const isSelected = selectedColumns.has(column.id) || selectedColumn === column.id;
                        const isDraggingThis = isDraggingColumnReorder && isSelected;
                        const isDropTarget = isDraggingColumnReorder && 
                          dragTargetIndex === index && 
                          !dragSourceColumns.includes(column.id);
                        
                        return (
                          <th
                            key={column.id}
                            className={`
                              ${isSelected ? 'selected' : ''}
                              ${isDraggingThis ? 'dragging-reorder' : ''}
                              ${isDropTarget ? 'drop-target' : ''}
                            `.trim()}
                            onClick={(event) => handleColumnClick(column.id, event)}
                            onMouseDown={(event) => handleColumnMouseDown(column.id, event)}
                            onMouseEnter={() => handleColumnMouseEnter(column.id)}
                            onMouseUp={handleColumnMouseUp}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{column.label}</span>
                              <ColumnHeaderIcons style={{ opacity: isSelected ? 1 : 0 }}>
                                <ColumnIcon
                                  onClick={(event) => handleChevronClick(column.id, event)}
                                  title="Sort options"
                                >
                                  <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 101.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                                </ColumnIcon>
                                <ColumnIcon
                                  onClick={(event) => handleColumnReorderStart(column.id, event)}
                                  title="Drag to reorder"
                                  style={{ cursor: isDraggingColumnReorder ? 'grabbing' : 'grab' }}
                                >
                                  <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zM7 14a1 1 0 000 2h6a1 1 0 100-2H7z" />
                            </svg>
                                </ColumnIcon>
                              </ColumnHeaderIcons>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={selectedRow === rowIndex || selectedRows.has(rowIndex) ? 'selected' : ''}
                      >
                        {/* Row number cell */}
                        <td 
                          className={`row-number ${
                            selectedRow === rowIndex || selectedRows.has(rowIndex) ? 'selected' : ''
                          } ${
                            isAllSelected ? 'all-selected' : ''
                          }`}
                          onClick={(event) => handleRowNumberClick(rowIndex, event)}
                          onMouseDown={(event) => handleRowNumberMouseDown(rowIndex, event)}
                          onMouseEnter={() => handleRowNumberMouseEnter(rowIndex)}
                        >
                          {rowIndex + 1}
                        </td>
                        {orderedSchema.map((column) => {
                          const cellKey = getCellKey(rowIndex, column.id);
                          const isSelected = selectedCells.has(cellKey) || 
                            (selectedCell?.row === rowIndex && selectedCell?.column === column.id);
                          const isColumnSelected = selectedColumns.has(column.id);
                          const isRowSelected = selectedRow === rowIndex || selectedRows.has(rowIndex);
                    
                    return (
                            <td
                              key={`${rowIndex}-${column.id}`}
                              className={`
                                ${isSelected ? 'selected' : ''}
                                ${isColumnSelected ? 'column-selected' : ''}
                                ${isRowSelected ? 'column-selected' : ''}
                              `.trim()}
                              onClick={(event) => handleCellClick(rowIndex, column.id, event)}
                              onMouseDown={(event) => handleMouseDown(rowIndex, column.id, event)}
                              onMouseEnter={() => handleMouseEnter(rowIndex, column.id)}
                            >
                              {formatCellValue(row[column.id], column)}
                            </td>
                    );
                  })}
                      </tr>
                    ))}
                  </tbody>
                </SpreadsheetTable>
              </TableContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                fontSize: '16px', 
                color: '#6b7280' 
              }}>
                No schema found for metric "{currentId}". Available schemas: {Object.keys(METRIC_SCHEMAS).join(', ')}
              </div>
            )}
          </SpreadsheetWrapper>
        </SpreadsheetContainer>
      </EditorContainer>

      {/* Column Menu Popover */}
      {showColumnMenu && (
        <ColumnMenuPopover
          data-column-menu
                        style={{
            left: columnMenuPosition.x,
            top: columnMenuPosition.y
          }}
        >
          <ColumnMenuItem onClick={() => handleSort('asc')}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
            Sort Ascending
          </ColumnMenuItem>
          <ColumnMenuItem onClick={() => handleSort('desc')}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
            Sort Descending
          </ColumnMenuItem>
        </ColumnMenuPopover>
      )}

      {/* Floating Action Buttons */}
      {shouldShowFloatingButtons && (
        <FloatingActionContainer data-floating-buttons hasAnalysisPanel={showAnalysisPanel}>
          <FloatingActionButton onClick={handleAnalyzeClick}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
            {selectedColumnsForAnalysis.length === 1 
              ? `Analyze ${orderedSchema.find(col => col.id === selectedColumnsForAnalysis[0])?.label || selectedColumnsForAnalysis[0]}`
              : `Analyze ${selectedColumnsForAnalysis.length} columns`
            }
          </FloatingActionButton>
        </FloatingActionContainer>
      )}

      {/* Analysis Panel */}
      <AnalysisPanel isOpen={showAnalysisPanel} data-panel="analysis">
        <AnalysisPanelHeader>
          <AnalysisPanelTitle>
            {analysisColumns.length === 1 
              ? `Analysis: ${orderedSchema.find(col => col.id === analysisColumns[0])?.label || analysisColumns[0]}`
              : `Analysis: ${analysisColumns.length} columns`
            }
          </AnalysisPanelTitle>
          <AnalysisPanelClose onClick={handleCloseAnalysisPanel}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
          </AnalysisPanelClose>
        </AnalysisPanelHeader>
        
        <AnalysisPanelContent>
          {/* AI Analysis Section - First */}
          <AnalysisSection>
            <AnalysisSectionTitle>AI Analysis</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getAIAnalysis(analysisColumns)}
              
              {/* Chart Widget */}
              <ChartWidget>
                <ChartHeader>
                  <div>
                    <ChartTitle>
                      {analysisColumns.length === 1 
                        ? orderedSchema.find(col => col.id === analysisColumns[0])?.label 
                        : 'Combined Metrics'} Trend
                    </ChartTitle>
                    <ChartValue>
                      {analysisColumns.length === 1 && analysisColumns[0] === 'current_mrr' && '$847.2K'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'usage_growth' && '+15.3%'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'amount' && '$2,347'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'subscription_revenue' && '$1.2M'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'status' && '94.2%'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'meter' && '2.7x Peak'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'plan' && '67% Upgrade'}
                      {(analysisColumns.length > 1 || !['current_mrr', 'usage_growth', 'amount', 'subscription_revenue', 'status', 'meter', 'plan'].includes(analysisColumns[0])) && '+14.2%'}
                    </ChartValue>
                    <ChartTrend positive={true}>
                      {analysisColumns.length === 1 && analysisColumns[0] === 'current_mrr' && '+2.4% this period'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'usage_growth' && '+15.3% vs last month'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'amount' && '+8.7% QoQ'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'subscription_revenue' && '+12.1% growth'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'status' && '67% conversion rate'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'meter' && '+156% YoY growth'}
                      {analysisColumns.length === 1 && analysisColumns[0] === 'plan' && '+28% Enterprise adoption'}
                      {(analysisColumns.length > 1 || !['current_mrr', 'usage_growth', 'amount', 'subscription_revenue', 'status', 'meter', 'plan'].includes(analysisColumns[0])) && '+14.2% improvement'}
                    </ChartTrend>
                                    </div>
                </ChartHeader>
                <ChartArea>
                              {(() => {
                    const primaryColumn = analysisColumns[0] || 'default';
                    const chartData = generateChartData(primaryColumn);
                                
                                  return (
                      <LineChart 
                        data={chartData}
                        height={60}
                        showLegend={false}
                        showAxes={true}
                        type="area"
                        sparkline={false}
                        simplified={true}
                        unit={primaryColumn.includes('mrr') || primaryColumn.includes('amount') || primaryColumn.includes('revenue') ? 'currency' : 'number'}
                      />
                                );
                              })()}
                </ChartArea>
              </ChartWidget>
            </AnalysisSectionContent>
          </AnalysisSection>
          
          {/* Related Columns Section - Second */}
          <AnalysisSection>
            <AnalysisSectionTitle>Related Columns</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getRelatedColumns(analysisColumns).map(column => (
                <RelatedColumnItem key={column.id}>
                  <RelatedColumnHeader>
                    <RelatedColumnName>{column.label}</RelatedColumnName>
                    <ColumnActionLink 
                      added={addedColumns.has(column.id)}
                      onClick={() => handleToggleColumn(column.id)}
                    >
                      {addedColumns.has(column.id) ? 'Added' : '+ Add'}
                    </ColumnActionLink>
                  </RelatedColumnHeader>
                  <RelatedColumnDescription>{column.description}</RelatedColumnDescription>
                </RelatedColumnItem>
              ))}
              {getRelatedColumns(analysisColumns).length === 0 && (
                <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No related columns found for the current selection.
                </div>
                                  )}
            </AnalysisSectionContent>
          </AnalysisSection>
          
          {/* Definitions Section - Last */}
          <AnalysisSection>
            <AnalysisSectionTitle>Definitions</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getColumnDefinitions(analysisColumns).map(column => (
                <div key={column.id} style={{ marginBottom: '12px' }}>
                  <strong>{column.label}:</strong> {column.definition}
                                  </div>
              ))}
            </AnalysisSectionContent>
          </AnalysisSection>
        </AnalysisPanelContent>
      </AnalysisPanel>

      {/* Selection Summary */}
      {selectionStats && (
        <SelectionSummary 
          data-summary-component
          onMouseEnter={handleSummaryMouseEnter}
          onMouseLeave={handleSummaryMouseLeave}
          onClick={handleSummaryClick}
        >
          {(() => {
            const primaryAgg = getPrimaryAggregation();
            const hasMultipleAggregations = Object.keys(selectionStats.aggregations).length > 1;
            
            if (primaryAgg) {
                  return (
                <>
                  <SummaryLabel>{primaryAgg.label}</SummaryLabel>
                  <SummaryValue>
                    {primaryAgg.type === 'sum' && primaryAgg.isCurrency && 
                      `$${primaryAgg.value.toLocaleString()}`
                    }
                    {primaryAgg.type === 'sum' && !primaryAgg.isCurrency && 
                      primaryAgg.value.toLocaleString()
                    }
                    {primaryAgg.type === 'average' && primaryAgg.isPercentage && 
                      `Average: ${primaryAgg.value >= 0 ? '+' : ''}${primaryAgg.value.toFixed(1)}%`
                    }
                    {primaryAgg.type === 'average' && !primaryAgg.isPercentage && 
                      `Average: ${primaryAgg.value.toFixed(2)}`
                    }
                    {primaryAgg.type === 'dateRange' && 
                      `${primaryAgg.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${primaryAgg.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    }
                    {primaryAgg.type === 'unique' && 
                      `${primaryAgg.value} unique value${primaryAgg.value !== 1 ? 's' : ''}`
                    }
                  </SummaryValue>
                  {hasMultipleAggregations && (
                    <SummaryArrow>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </SummaryArrow>
                  )}
                </>
              );
            } else {
              // Fallback to cell count if no aggregations
              return (
                <>
                  <SummaryLabel>Cells Selected</SummaryLabel>
                  <SummaryValue>{selectionStats.cellsSelected.toLocaleString()}</SummaryValue>
                </>
              );
            }
          })()}
        </SelectionSummary>
      )}

      {/* Summary Tooltip */}
      {showSummaryTooltip && selectionStats && (
        <SummaryTooltip
          data-summary-tooltip
                    style={{ 
            left: summaryTooltipPosition.x,
            top: summaryTooltipPosition.y,
            width: summaryTooltipWidth
          }}
        >
          <TooltipItem>
            <TooltipLabel>Cells Selected</TooltipLabel>
            <TooltipValue>{selectionStats.cellsSelected.toLocaleString()}</TooltipValue>
          </TooltipItem>
          
          {selectedRow !== null && (
            <TooltipItem>
              <TooltipLabel>Selected Row</TooltipLabel>
              <TooltipValue>Row {selectedRow + 1}</TooltipValue>
            </TooltipItem>
          )}
          
          {Object.entries(selectionStats.aggregations).map(([columnId, agg]) => (
            <TooltipItem key={columnId}>
              <TooltipLabel>{agg.label}</TooltipLabel>
              <TooltipValue>
                {agg.type === 'sum' && agg.isCurrency && 
                  `$${agg.value.toLocaleString()}`
                }
                {agg.type === 'sum' && !agg.isCurrency && 
                  agg.value.toLocaleString()
                }
                {agg.type === 'average' && agg.isPercentage && 
                  `Average: ${agg.value >= 0 ? '+' : ''}${agg.value.toFixed(1)}%`
                }
                {agg.type === 'average' && !agg.isPercentage && 
                  `Average: ${agg.value.toFixed(2)}`
                }
                {agg.type === 'dateRange' && 
                  `${agg.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${agg.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
                {agg.type === 'unique' && 
                  `${agg.value} unique value${agg.value !== 1 ? 's' : ''}`
                }
              </TooltipValue>
            </TooltipItem>
          ))}
        </SummaryTooltip>
      )}
    </>
  );
};

export default MetricEditor;