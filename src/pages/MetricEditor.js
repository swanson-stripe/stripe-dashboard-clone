import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData } from '../data/companyData';
import { METRIC_SCHEMAS, REPORT_SCHEMAS } from '../data/reportSchemas';

// Main container for the entire editor
const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background: #fafbfc;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  transition: margin-right 0.3s ease;
  margin-right: ${props => props.hasAnalysisPanel ? '400px' : '0'};
`;

// Minimal left panel for navigation controls only
const LeftPanel = styled.div`
  width: 200px;
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
  background: white;
  user-select: none;
`;

// Table styles
const SpreadsheetTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  margin: 0;
  
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
  
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #374151;
    position: sticky;
    top: 0;
    z-index: 10;
    cursor: pointer;
    user-select: none;
    margin: 0;
    
    &:hover {
      background: #f1f3f4;
    }
    
    &.selected {
      background: #dbeafe;
      color: #0369a1;
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
  
  // Row number column styles
  .row-number {
    background: #f8f9fa;
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
  left: 50%;
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

const MetricEditor = () => {
  const navigate = useNavigate();
  const { metricId, reportId } = useParams();
  const location = useLocation();
  
  // Selection state
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [selectedColumns, setSelectedColumns] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [columnDragStart, setColumnDragStart] = useState(null);
  const [lastClickedCell, setLastClickedCell] = useState(null);
  
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
    return [...orderedCols, ...newCols];
  }, [schema, columnOrder]);

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
              row[column.id] = `Value ${i + 1}`;
          }
        });
        
        rows.push(row);
      }
      
      return rows;
    };

    return generateData();
  }, [orderedSchema]);

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

  // Calculate selection statistics
  const selectionStats = useMemo(() => {
    const selectedCellsArray = Array.from(selectedCells);
    const selectedColumnsArray = Array.from(selectedColumns);
    
    if (selectedCellsArray.length === 0 && selectedColumnsArray.length === 0 && selectedRow === null) {
      return null;
    }

    const stats = {
      cellsSelected: selectedCellsArray.length,
      columnsInvolved: new Set(),
      aggregations: {}
    };

    // Handle row selection
    if (selectedRow !== null) {
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
      
      if (selectedRow !== null) {
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
    // Don't show buttons for row selections
    if (selectedRow !== null) return [];
    
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
  }, [selectedCells, selectedColumns, selectedRow]);

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
    } else {
      // Single cell selection
      setSelectedCell({ row: rowIndex, column: columnId });
      setSelectedCells(new Set([getCellKey(rowIndex, columnId)]));
      setSelectedColumns(new Set());
      setSelectedColumn(null);
      setSelectedRow(null);
      setLastClickedCell({ row: rowIndex, colIndex });
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
    } else {
      // Single column selection
      setSelectedColumn(columnId);
      setSelectedColumns(new Set([columnId]));
      setSelectedCells(new Set());
      setSelectedCell(null);
      setSelectedRow(null);
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
    if (event.shiftKey && selectedRow !== null) {
      // Shift+click for row range selection
      const startRow = Math.min(selectedRow, rowIndex);
      const endRow = Math.max(selectedRow, rowIndex);
      const selectedRows = new Set();
      for (let i = startRow; i <= endRow; i++) {
        selectedRows.add(i);
      }
      // For now, just select the clicked row since we don't have multi-row selection state
      setSelectedRow(rowIndex);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click for multi-row selection (future enhancement)
      setSelectedRow(rowIndex);
    } else {
      // Single row selection
      setSelectedRow(rowIndex);
    }
    
    // Clear other selections
    setSelectedCell(null);
    setSelectedColumn(null);
    setSelectedColumns(new Set());
    setSelectedCells(new Set());
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
    setDragStart(null);
    setDragEnd(null);
    setColumnDragStart(null);
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
    setShowAnalysisPanel(true);
  };

  const handleCloseAnalysisPanel = () => {
    setShowAnalysisPanel(false);
    setAnalysisColumns([]);
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
      'current_mrr': 'MRR shows strong upward momentum with a 23% quarter-over-quarter growth. The distribution indicates healthy customer expansion with 67% of accounts growing their MRR. Key opportunity: accounts in the $500-2000 range show highest expansion potential.',
      'usage_growth': 'Usage growth patterns reveal seasonal trends with peaks in Q1 and Q3. 34% of customers show consistent month-over-month growth above 15%. Recommendation: target customers with declining usage for retention campaigns.',
      'amount': 'Transaction amounts cluster around three distinct tiers, suggesting strong product-market fit across pricing segments. Average transaction size has increased 18% YoY, indicating successful value delivery.',
      'subscription_revenue': 'Subscription revenue demonstrates predictable growth with low churn impact. 89% of revenue comes from established customers (>6 months). Focus area: accelerate new customer onboarding to revenue realization.',
      'status': 'Customer status distribution shows healthy lifecycle progression. Trial-to-paid conversion rate of 67% exceeds industry benchmarks. Risk area: 12% of active accounts show early churn signals.',
    };
    
    if (columnIds.length === 1) {
      const columnId = columnIds[0];
      return singleColumnAnalysis[columnId] || `${orderedSchema.find(col => col.id === columnId)?.label} shows positive trends with opportunities for optimization. Data patterns suggest correlation with customer success metrics and revenue growth indicators.`;
    } else {
      return `Multi-column analysis reveals strong correlations between selected metrics. Cross-metric patterns indicate ${columnIds.length} key performance drivers working in tandem. Recommendation: monitor these metrics as a cohort for comprehensive business health assessment.`;
    }
  };

  const getRelatedColumns = (columnIds) => {
    const allColumns = orderedSchema.map(col => col.id);
    const relationships = {
      'current_mrr': ['subscription_revenue', 'plan', 'status', 'customer'],
      'usage_growth': ['unitsUsed', 'overageUnits', 'usage_revenue', 'meter'],
      'subscription_revenue': ['current_mrr', 'plan', 'amount', 'customer'],
      'usage_revenue': ['usage_growth', 'overageUnits', 'overageRate', 'unitsUsed'],
      'amount': ['subscription_revenue', 'current_mrr', 'plan', 'customer'],
      'plan': ['current_mrr', 'subscription_revenue', 'status', 'included_units'],
      'status': ['current_mrr', 'plan', 'customer', 'date'],
      'customer': ['current_mrr', 'subscription_revenue', 'plan', 'status'],
      'date': ['status', 'current_mrr', 'usage_growth', 'customer']
    };
    
    const relatedIds = new Set();
    columnIds.forEach(id => {
      (relationships[id] || []).forEach(relatedId => {
        if (!columnIds.includes(relatedId) && allColumns.includes(relatedId)) {
          relatedIds.add(relatedId);
        }
      });
    });
    
    // Limit to 4 related columns
    const related = Array.from(relatedIds).slice(0, 4);
    
    return related.map(id => {
      const column = orderedSchema.find(col => col.id === id);
      return {
        id,
        label: column?.label || id,
        description: `Correlated metric that influences ${columnIds.length === 1 ? orderedSchema.find(col => col.id === columnIds[0])?.label : 'selected columns'}`
      };
    });
  };

  return (
    <>
      <EditorContainer hasAnalysisPanel={showAnalysisPanel}>
        <LeftPanel>
          <LeftPanelHeader>
            <ControlRow>
              <CloseButton onClick={handleClose}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </CloseButton>
              <SaveButton onClick={handleSave}>Save</SaveButton>
            </ControlRow>
            <EditorTitle>{getDisplayTitle()}</EditorTitle>
          </LeftPanelHeader>
          
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
            
            {selectionStats && (
              <SelectionSection>
                <InfoItem>
                  <InfoLabel>Cells Selected</InfoLabel>
                  <InfoValue>{selectionStats.cellsSelected.toLocaleString()}</InfoValue>
                </InfoItem>
                
                {selectedRow !== null && (
                  <InfoItem>
                    <InfoLabel>Selected Row</InfoLabel>
                    <InfoValue>Row {selectedRow + 1}</InfoValue>
                  </InfoItem>
                )}
                
                {Object.entries(selectionStats.aggregations).map(([columnId, agg]) => (
                  <InfoItem key={columnId}>
                    <InfoLabel>{agg.label}</InfoLabel>
                    <InfoValue>
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
                    </InfoValue>
                  </InfoItem>
                ))}
              </SelectionSection>
            )}
          </InfoSection>
        </LeftPanel>

        <SpreadsheetContainer>
          <SpreadsheetWrapper>
            {orderedSchema.length > 0 ? (
              <SpreadsheetTable>
                <thead>
                  <tr>
                    {/* Row number header */}
                    <th className="row-number">#</th>
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
                            {isSelected && (
                              <ColumnHeaderIcons>
                                <ColumnIcon
                                  onClick={(event) => handleChevronClick(column.id, event)}
                                  title="Sort options"
                                >
                                  <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                            )}
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
                      className={selectedRow === rowIndex ? 'selected' : ''}
                    >
                      {/* Row number cell */}
                      <td 
                        className={`row-number ${selectedRow === rowIndex ? 'selected' : ''}`}
                        onClick={(event) => handleRowNumberClick(rowIndex, event)}
                      >
                        {rowIndex + 1}
                      </td>
                      {orderedSchema.map((column) => {
                        const cellKey = getCellKey(rowIndex, column.id);
                        const isSelected = selectedCells.has(cellKey) || 
                          (selectedCell?.row === rowIndex && selectedCell?.column === column.id);
                        const isColumnSelected = selectedColumns.has(column.id);
                        const isRowSelected = selectedRow === rowIndex;
                        
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
      {selectedColumnsForAnalysis.length > 0 && !showAnalysisPanel && (
        <FloatingActionContainer>
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
      <AnalysisPanel isOpen={showAnalysisPanel}>
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
          {/* Define Section */}
          <AnalysisSection>
            <AnalysisSectionTitle>Define</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getColumnDefinitions(analysisColumns).map(column => (
                <div key={column.id} style={{ marginBottom: '12px' }}>
                  <strong>{column.label}:</strong> {column.definition}
                </div>
              ))}
            </AnalysisSectionContent>
          </AnalysisSection>
          
          {/* Analyze Section */}
          <AnalysisSection>
            <AnalysisSectionTitle>AI Analysis</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getAIAnalysis(analysisColumns)}
            </AnalysisSectionContent>
          </AnalysisSection>
          
          {/* Related Columns Section */}
          <AnalysisSection>
            <AnalysisSectionTitle>Related Columns</AnalysisSectionTitle>
            <AnalysisSectionContent>
              {getRelatedColumns(analysisColumns).map(column => (
                <RelatedColumnItem key={column.id}>
                  <RelatedColumnName>{column.label}</RelatedColumnName>
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
        </AnalysisPanelContent>
      </AnalysisPanel>
    </>
  );
};

export default MetricEditor; 