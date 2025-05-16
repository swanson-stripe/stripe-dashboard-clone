import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: white;
  background-image: url("/dot-grid-bg.svg");
  background-size: 20px 20px;
`;

const TopNavBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: ${props => props.side === 'right' ? 'absolute' : 'static'};
  right: ${props => props.side === 'right' ? '24px' : 'auto'};
  left: ${props => props.side === 'left' ? '24px' : 'auto'};
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: #f0f1f5;
  border-radius: 6px;
  padding: 4px;
`;

const ToggleButton = styled.button`
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${props => props.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #574ae2;
  }
`;

const CloseNavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f7fa;
    color: var(--text-color);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const EditorPanel = styled.div`
  margin-top: 64px; /* Make space for top nav bar */
  overflow-y: auto;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 0 0 24px;
  width: 320px;
  flex-shrink: 0;
`;

const ModuleContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 320px;
`;

const AIPromptContainer = styled(ModuleContainer)`
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  overflow: visible;
  border: 1px solid rgba(192, 200, 210, 0.2);
`;

const AIPromptLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  padding: 16px 16px 0;
`;

const AIPromptBox = styled.div`
  border: 1px solid rgba(192, 200, 210, 0.2);
  border-radius: 12px;
  overflow: visible;
  background-color: #F5F6F8;
  margin: 0 16px 16px;
  position: relative;
`;

const AIPromptInput = styled.textarea`
  width: 100%;
  padding: 9px 16px;
  border: none;
  resize: none;
  font-size: 14px;
  height: 38px;
  min-height: 38px;
  line-height: 20px;
  font-family: inherit;
  background: transparent;
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #6E7583;
  }
`;

const AIPromptFooter = styled.div`
  display: none;
`;

const AIPromptButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: #574ae2;
  }
  
  &:active {
    background-color: #4a3fd9;
  }
`;

const AIPromptHint = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  padding: 0 8px;
`;

const ConfigModule = styled(ModuleContainer)`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
`;

const Tab = styled.button`
  flex: 1;
  background: none;
  border: none;
  padding: 14px 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
    transition: background-color 0.2s ease;
  }
  
  &:hover:after {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'rgba(99, 91, 255, 0.1)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TabContent = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModuleTitle = styled.h3`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin-bottom: 16px;
`;

const SectionHeading = styled.h2`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-color);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 8px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: #574ae2;
    }
  }
  
  &.secondary {
    background-color: white;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: #f7f9fc;
    }
  }
  
  &.danger {
    background-color: white;
    color: var(--danger-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: #fff5f5;
    }
  }
`;

const PreviewContainer = styled.div`
  flex: 1;
  margin-top: 64px; /* Make space for top nav bar */
  padding: 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: white;
  background-image: url("/dot-grid-bg.svg");
  background-size: 20px 20px;
`;

// Add back the CodePanel and CodeBlock components (needed for SQL view)
const CodePanel = styled.div`
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  opacity: ${props => props.visible ? 1 : 0};
  height: ${props => props.visible ? 'auto' : 0};
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease, margin 0.3s ease;
  margin-bottom: ${props => props.visible ? '24px' : 0};
`;

const CodeBlock = styled.pre`
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2a2f45;
  overflow-x: auto;
  margin: 0;
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(192, 200, 210, 0.2);
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  max-width: 1000px;
  flex: 1;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const MetricTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  position: relative;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 8px;
  position: relative;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  position: relative;
  
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
  background: white;
  margin-bottom: 32px;
  height: 280px;
  position: relative;
`;

const MetricSummary = styled.div`
  margin-top: 24px;
  position: relative;
`;

const SectionWrapper = styled.div`
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 8px;
  margin: -8px;
  background-color: ${props => props.highlighted ? 'rgba(99, 91, 255, 0.08)' : 'transparent'};
  border: ${props => props.highlighted ? '2px solid var(--primary-color)' : '2px solid transparent'};
  box-shadow: ${props => props.highlighted ? '0 0 0 4px rgba(99, 91, 255, 0.05)' : 'none'};
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 24px;
  border: 1px solid rgba(192, 200, 210, 0.2);
  border-radius: 8px;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      font-weight: 500;
      color: var(--text-secondary);
      font-size: 14px;
      background-color: #f9fafc;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const PageNav = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-color)' : '#f5f7fa'};
  }
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
  font-weight: 500;
  margin: 0;
`;

// Add new styled components for the Schema tab
const SchemaContainer = styled.div`
  background-color: white;
  color: var(--text-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
  height: 100%;
`;

const SchemaSearchContainer = styled.div`
  padding: 16px;
  position: relative;
  border-bottom: 1px solid var(--border-color);
`;

const SchemaSearchInput = styled.input`
  width: 100%;
  background-color: #F5F6F8;
  border: 1px solid rgba(192, 200, 210, 0.2);
  border-radius: 8px;
  padding: 10px 16px 10px 40px;
  color: var(--text-color);
  font-size: 14px;
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 28px;
  top: 26px;
  color: var(--text-secondary);
`;

const TableList = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex-grow: 1;
`;

const TableItem = styled.div`
  margin-bottom: 24px;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  width: 100%;
  
  span {
    font-size: 14px;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SchemaCheckbox = styled.input`
  margin-right: 12px;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const TableExpander = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  flex-shrink: 1;
`;

const ExpanderIcon = styled.span`
  margin-right: 12px;
  color: var(--primary-color);
  font-weight: bold;
  display: inline-block;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
`;

const ColumnList = styled.div`
  margin-left: 36px;
`;

const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  
  span.column-type {
    margin-left: auto;
    color: var(--text-tertiary);
    font-size: 12px;
    flex-shrink: 0;
  }
`;

const ShowAllButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 36px;
  margin-bottom: 24px;
  cursor: pointer;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ShowAllTablesButton = styled.button`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  color: #8257fe;
  font-size: 18px;
  text-align: left;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(130, 87, 254, 0.05);
  }
`;

const CodeViewContainer = styled.div`
  flex: 1;
  margin-top: 64px; /* Make space for top nav bar */
  padding: 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: white;
  background-image: url("/dot-grid-bg.svg");
  background-size: 20px 20px;
`;

const SqlQueryContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(192, 200, 210, 0.2);
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  max-width: 1000px;
  margin-bottom: 24px;
`;

const SqlEditor = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2a2f45;
  background-color: #f5f7fa;
  border: none;
  border-radius: 6px;
  resize: vertical;
  outline: none;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(99, 91, 255, 0.2);
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0;
  }
`;

const QueryResultsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(192, 200, 210, 0.2);
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  max-width: 1000px;
`;

const SchemaModuleContainer = styled(ModuleContainer)`
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
  overflow: visible;
  margin-top: 16px;
  height: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 10px;
  
  select {
    flex: 1;
  }
`;

const FieldLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const MetricEditor = () => {
  const navigate = useNavigate();
  const { metricId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('structure');
  const [aiPrompt, setAiPrompt] = useState('');
  const [editorView, setEditorView] = useState('visual'); // 'visual' or 'code'
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(25);
  const [sqlQuery, setSqlQuery] = useState('');
  
  // Add state for persistent data
  const [baseTransactions, setBaseTransactions] = useState([]);
  const [chartBaseData, setChartBaseData] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);
  
  // Format currency helper function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Add state for schema selection
  const [schemaSelection, setSchemaSelection] = useState({
    subscription_item_change_events: {
      expanded: true,
      fields: {
        event_timestamp: true,
        subscription_item_id: true,
        currency: true,
        customer_id: true,
        price_id: true,
        product_id: true
      }
    },
    customers: {
      expanded: true,
      fields: {
        id: true,
        name: true,
        email: true,
        currency: true
      }
    }
  });
  
  // Function to toggle a table's expanded state
  const toggleTableExpanded = (tableName) => {
    setSchemaSelection(prev => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        expanded: !prev[tableName].expanded
      }
    }));
  };
  
  // Function to toggle a field's selected state
  const toggleFieldSelected = (tableName, fieldName) => {
    setSchemaSelection(prev => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        fields: {
          ...prev[tableName].fields,
          [fieldName]: !prev[tableName].fields[fieldName]
        }
      }
    }));
  };
  
  // Function to count selected fields
  const countSelectedFields = (tableName) => {
    const fields = schemaSelection[tableName]?.fields || {};
    return Object.values(fields).filter(selected => selected).length;
  };
  
  // Function to get total number of fields
  const getTotalFields = (tableName) => {
    const fields = schemaSelection[tableName]?.fields || {};
    return Object.keys(fields).length;
  };
  
  // Define preset metrics based on metricId
  const metricPresets = {
    'gross-volume': {
      title: 'Gross volume',
      description: 'Total volume of payments processed before fees and refunds',
      unit: 'currency',
      aggregation: 'sum',
      color: '#635bff',
      format: 'currency',
      metricValue: '$25,650.45',
      trendValue: 12.5,
      chartType: 'area',
      timeRange: '14d',
      dataSource: 'stripe_payments',
      xAxis: 'event_timestamp',
      yAxis: 'amount',
      generateBaseValue: (day, total) => 800 + (day * 30) + (Math.random() * 200 - 100)
    },
    'net-volume': {
      title: 'Net volume',
      description: 'Net volume of payments after fees and refunds',
      unit: 'currency',
      aggregation: 'sum',
      color: '#00c389',
      format: 'currency',
      metricValue: '$20,650.45',
      trendValue: 8.2,
      chartType: 'area',
      timeRange: '14d',
      dataSource: 'stripe_payments',
      xAxis: 'event_timestamp',
      yAxis: 'amount',
      generateBaseValue: (day, total) => 700 + (day * 25) + (Math.random() * 150 - 75)
    },
    'new-customers': {
      title: 'New customers',
      description: 'Number of new customers acquired',
      unit: 'number',
      aggregation: 'count',
      color: '#0a84ff',
      format: 'number',
      metricValue: '245',
      trendValue: 4.7,
      chartType: 'bar',
      timeRange: '30d',
      dataSource: 'stripe_customers',
      xAxis: 'event_timestamp',
      yAxis: 'count',
      generateBaseValue: (day, total) => 5 + (day * 0.5) + (Math.random() * 6 - 3)
    },
    'balance': {
      title: 'Balance',
      description: 'Current available balance in your Stripe account',
      unit: 'currency',
      aggregation: 'sum',
      color: '#ff9500',
      format: 'currency',
      metricValue: '$7,650.00',
      trendValue: -2.3,
      chartType: 'line',
      timeRange: '30d',
      dataSource: 'stripe_balance',
      xAxis: 'event_timestamp',
      yAxis: 'amount',
      generateBaseValue: (day, total) => 7000 + (day * 20) + (Math.random() * 100 - 50)
    },
    'default': {
      title: 'New metric',
      description: 'Description of your new metric',
      unit: 'currency',
      aggregation: 'sum',
      color: '#635bff',
      format: 'currency', 
      metricValue: '$0.00',
      trendValue: 0,
      chartType: 'line',
      timeRange: '14d',
      dataSource: 'stripe_payments',
      xAxis: 'event_timestamp',
      yAxis: 'amount',
      generateBaseValue: (day, total) => 500 + (day * 20) + (Math.random() * 100 - 50)
    }
  };
  
  // Get preset based on metricId, fall back to default if not found
  const getPreset = () => {
    if (metricPresets[metricId]) {
      return metricPresets[metricId];
    }
    return metricPresets.default;
  };
  
  // Initialize form data based on preset
  const [formData, setFormData] = useState(() => {
    const preset = getPreset();
    return {
      title: preset.title,
      description: preset.description,
      unit: preset.unit,
      aggregation: preset.aggregation,
      color: preset.color,
      format: preset.format,
      showTrend: true,
      showAverage: true,
      showTotal: true,
      chartType: preset.chartType,
      showLegend: true,
      timeRange: preset.timeRange,
      dataSource: preset.dataSource,
      xAxis: preset.xAxis,
      yAxis: preset.yAxis
    };
  });
  
  const structureRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef(null);
  
  const previewCardRef = useRef(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here would be API call to save the metric
    navigate(`/metrics/${metricId}`);
  };
  
  const handleCancel = () => {
    navigate(`/metrics/${metricId}`);
  };
  
  const handleAIPromptChange = (e) => {
    setAiPrompt(e.target.value);
  };
  
  const handleAIPromptSubmit = () => {
    // Handle AI prompt submission logic here
    console.log('AI prompt submitted:', aiPrompt);
    // In a real app, we would call an AI API here
  };
  
  const generateConfigCode = () => {
    const configObject = {
      title: formData.title,
      description: formData.description,
      chart: {
        type: formData.chartType,
        color: formData.color,
        showLegend: formData.showLegend,
        timeRange: formData.timeRange
      },
      data: {
        source: formData.dataSource,
        unit: formData.unit,
        aggregation: formData.aggregation,
        format: formData.format
      },
      display: {
        showTrend: formData.showTrend,
        showAverage: formData.showAverage,
        showTotal: formData.showTotal
      }
    };
    
    return JSON.stringify(configObject, null, 2);
  };
  
  // Initialize with customized data based on metric type
  useEffect(() => {
    const preset = getPreset();
    
    // Generate base transactions data appropriate for the metric type
    const transactions = generateBaseTransactions(preset);
    setBaseTransactions(transactions);
    setFilteredTransactions(transactions);
    
    // Generate base chart data
    const baseData = generateBaseChartData(preset);
    setChartBaseData(baseData);
    setChartData(baseData);
    
    // Apply initial filters
    updateFilteredData(transactions, baseData, formData);
  }, [metricId]);
  
  // Update filtered data when relevant controls change
  useEffect(() => {
    if (baseTransactions && baseTransactions.length > 0 && chartBaseData) {
      updateFilteredData(baseTransactions, chartBaseData, formData);
    }
  }, [formData.timeRange, formData.xAxis, formData.yAxis, formData.chartType, baseTransactions, chartBaseData]);
  
  const trendValue = getPreset().trendValue;
  
  const updateFilteredData = (transactions, baseData, formSettings) => {
    if (!transactions || !transactions.length || !baseData) {
      return; // Guard against missing data
    }
    
    // Filter transactions based on time range
    const filtered = filterTransactionsByTimeRange(transactions, formSettings.timeRange);
    setFilteredTransactions(filtered || []);
    
    // Update chart data based on settings
    const updatedChartData = updateChartData(baseData, formSettings);
    setChartData(updatedChartData);
  };
  
  const filterTransactionsByTimeRange = (transactions, timeRange) => {
    if (!transactions || !transactions.length) {
      return []; // Return empty array if no transactions
    }
    
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case '7d':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '14d':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        break;
      case '30d':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return transactions; // Return all transactions for "all time"
    }
    
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.fullDate);
      return txDate >= startDate;
    });
  };
  
  const updateChartData = (baseData, formSettings) => {
    if (!baseData || !baseData.labels || !baseData.datasets || !baseData.datasets[0] || !baseData.datasets[0].data) {
      // Return a safe default chart data structure
      return {
        labels: [],
        datasets: [{
          data: [],
          borderColor: formSettings.color || '#635bff',
          backgroundColor: `${formSettings.color || '#635bff'}19`,
          fill: formSettings.chartType === 'area',
          borderWidth: 2,
        }]
      };
    }
    
    const { timeRange, xAxis, yAxis, chartType } = formSettings;
    
    // If pie/donut chart, return specialized data
    if (chartType === 'pie' || chartType === 'donut') {
      return generatePieData();
    }
    
    // Otherwise filter line/bar/area chart data based on time range
    const numPoints = getDateRangePoints(timeRange);
    const filteredData = {
      labels: baseData.labels.slice(-numPoints),
      datasets: [
        {
          ...baseData.datasets[0],
          data: baseData.datasets[0].data.slice(-numPoints),
          borderColor: formSettings.color || '#635bff',
          backgroundColor: `${formSettings.color || '#635bff'}19`,
          fill: formSettings.chartType === 'area',
        }
      ]
    };
    
    return filteredData;
  };
  
  // Generate transactions specific to the metric type
  const generateBaseTransactions = (preset) => {
    const transactions = [];
    const statuses = ['Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Refunded', 'Failed', 'Pending'];
    const customers = [
      'John Smith', 'Jane Doe', 'Alice Johnson', 'Bob Brown', 'Charlie Davis', 
      'Diana Evans', 'Ethan Fox', 'Fiona Gallagher', 'George Harris', 'Hannah Miller',
      'Ian Jackson', 'Julia Kim', 'Kevin Lee', 'Lisa Martin', 'Mike Nelson',
      'Natalie Owens', 'Oscar Perez', 'Pamela Quinn', 'Robert Rice', 'Sarah Thompson',
      'Thomas Underwood', 'Uma Vance', 'Victor Williams', 'Wendy Xiao', 'Xavier Young'
    ];
    
    // Amounts depend on the metric type
    let amounts;
    if (metricId === 'gross-volume') {
      amounts = [99.99, 149.99, 199.99, 299.99, 499.99, 999.99];
    } else if (metricId === 'net-volume') {
      amounts = [89.99, 139.99, 179.99, 269.99, 449.99, 899.99];
    } else if (metricId === 'new-customers') {
      amounts = [0, 0, 0, 0, 0];  // Not applicable for this metric
    } else if (metricId === 'balance') {
      amounts = [19.99, 29.99, 49.99, 99.99];
    } else {
      amounts = [19.99, 29.99, 49.99, 99.99, 149.99, 199.99, 299.99];
    }
    
    // Generate 2 years of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    
    // Generate one transaction every 1-3 days
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const transactionDate = new Date(currentDate);
      
      // For 'new-customers' metrics, don't include amounts
      let transactionData = {
        id: `txn_${Math.random().toString(36).substr(2, 9)}`,
        date: transactionDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        fullDate: transactionDate.toISOString(),
        customer: customers[Math.floor(Math.random() * customers.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
      
      if (metricId !== 'new-customers') {
        transactionData.amount = `$${amounts[Math.floor(Math.random() * amounts.length)].toFixed(2)}`;
      } else {
        transactionData.email = `${transactionData.customer.toLowerCase().replace(' ', '.')}@example.com`;
        transactionData.action = 'Created account';
      }
      
      transactions.push(transactionData);
      
      // Add 1-3 days between transactions
      const daysToAdd = Math.floor(Math.random() * 3) + 1;
      currentDate.setDate(currentDate.getDate() + daysToAdd);
    }
    
    return transactions.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
  };
  
  // Generate chart data specific to the metric type
  const generateBaseChartData = (preset) => {
    const labels = [];
    const values = [];
    
    // Generate 2 years of daily data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    
    let currentDate = new Date(startDate);
    let days = 0;
    let previousValue = preset.metricId === 'new-customers' ? 5 : 1000; // Starting value
    
    while (currentDate <= endDate) {
      const label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(label);
      
      // Use the preset's base value generator
      const baseValue = preset.generateBaseValue ? 
        preset.generateBaseValue(days, previousValue) : 
        previousValue + (Math.random() - 0.4) * 100;
      
      previousValue = Math.max(0, Math.round(baseValue));
      values.push(previousValue);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      days++;
    }
    
    return {
      labels,
      datasets: [
        {
          data: values,
          borderColor: preset.color || '#635bff',
          backgroundColor: `${preset.color || '#635bff'}19`,
          fill: preset.chartType === 'area',
          borderWidth: 2,
        },
      ],
    };
  };
  
  // Generate data for pie/donut charts if needed
  const generatePieData = () => {
    const labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Other'];
    const values = [40, 25, 15, 10, 10];
    const backgroundColors = [
      '#635bff', '#00cc99', '#ff9933', '#cc3366', '#6699cc'
    ];
    
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1,
          borderColor: 'white',
        },
      ],
    };
  };
  
  // Helper to get number of data points based on date range
  const getDateRangePoints = (range) => {
    switch(range) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case '90d': return 30; // Scaled down for readability
      case 'ytd':
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.min(30, daysSinceStart); // Cap at 30 for readability
      case 'all':
      default:
        return 30; // Default to 30 points for "all time"
    }
  };
  
  // Get current transactions from filtered list
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'structure':
        return (
          <EditorForm onSubmit={handleSubmit}>
            <SectionHeading>General Information</SectionHeading>
            <FormGroup>
              <Label htmlFor="title">Metric Title</Label>
              <Input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
              />
            </FormGroup>
            
            <Divider />
            
            <SectionHeading>Display Options</SectionHeading>
            <FormGroup>
              <Checkbox>
                <input 
                  type="checkbox" 
                  id="showTrend" 
                  name="showTrend" 
                  checked={formData.showTrend} 
                  onChange={handleChange} 
                />
                <Label htmlFor="showTrend">Show trend indicator</Label>
              </Checkbox>
            </FormGroup>
            
            <FormGroup>
              <Checkbox>
                <input 
                  type="checkbox" 
                  id="showAverage" 
                  name="showAverage" 
                  checked={formData.showAverage} 
                  onChange={handleChange} 
                />
                <Label htmlFor="showAverage">Show average value</Label>
              </Checkbox>
            </FormGroup>
            
            <FormGroup>
              <Checkbox>
                <input 
                  type="checkbox" 
                  id="showTotal" 
                  name="showTotal" 
                  checked={formData.showTotal} 
                  onChange={handleChange} 
                />
                <Label htmlFor="showTotal">Show total value</Label>
              </Checkbox>
            </FormGroup>
          </EditorForm>
        );
      case 'chart':
        return (
          <EditorForm onSubmit={handleSubmit}>
            <SectionHeading>Chart Configuration</SectionHeading>
            <FormGroup>
              <Label htmlFor="chartType">Chart Type</Label>
              <Select 
                id="chartType" 
                name="chartType" 
                value={formData.chartType} 
                onChange={handleChange}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="donut">Donut Chart</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <FieldLabel>Axes</FieldLabel>
              <SelectGroup>
                <Select 
                  id="xAxis" 
                  name="xAxis" 
                  value={formData.xAxis} 
                  onChange={handleChange}
                  aria-label="X-Axis"
                >
                  <option value="">X-Axis</option>
                  <option value="event_timestamp">Date</option>
                  <option value="customer_id">Customer</option>
                  <option value="subscription_item_id">Subscription</option>
                  <option value="currency">Currency</option>
                  <option value="price_id">Price</option>
                  <option value="product_id">Product</option>
                </Select>
                
                <Select 
                  id="yAxis" 
                  name="yAxis" 
                  value={formData.yAxis} 
                  onChange={handleChange}
                  aria-label="Y-Axis"
                >
                  <option value="">Y-Axis</option>
                  <option value="amount">Amount</option>
                  <option value="count">Count</option>
                  <option value="price">Price</option>
                  <option value="discount">Discount</option>
                  <option value="tax">Tax</option>
                </Select>
              </SelectGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="timeRange">Date Range</Label>
              <Select 
                id="timeRange" 
                name="timeRange" 
                value={formData.timeRange} 
                onChange={handleChange}
              >
                <option value="7d">Last 7 days</option>
                <option value="14d">Last 14 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to date</option>
                <option value="all">All time</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Checkbox>
                <input 
                  type="checkbox" 
                  id="showLegend" 
                  name="showLegend" 
                  checked={formData.showLegend} 
                  onChange={handleChange} 
                />
                <Label htmlFor="showLegend">Show legend</Label>
              </Checkbox>
            </FormGroup>
          </EditorForm>
        );
      case 'data':
        return (
          <EditorForm onSubmit={handleSubmit}>
            <SectionHeading>Data Configuration</SectionHeading>
            <FormGroup>
              <Label htmlFor="dataSource">Data Source</Label>
              <Select 
                id="dataSource" 
                name="dataSource" 
                value={formData.dataSource} 
                onChange={handleChange}
              >
                <option value="stripe_payments">Stripe Payments</option>
                <option value="stripe_subscriptions">Stripe Subscriptions</option>
                <option value="stripe_customers">Stripe Customers</option>
                <option value="manual">Manual Data Entry</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="unit">Unit</Label>
              <Select 
                id="unit" 
                name="unit" 
                value={formData.unit} 
                onChange={handleChange}
              >
                <option value="currency">Currency</option>
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="aggregation">Aggregation</Label>
              <Select 
                id="aggregation" 
                name="aggregation" 
                value={formData.aggregation} 
                onChange={handleChange}
              >
                <option value="sum">Sum</option>
                <option value="average">Average</option>
                <option value="count">Count</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="format">Value Format</Label>
              <Select 
                id="format" 
                name="format" 
                value={formData.format} 
                onChange={handleChange}
              >
                <option value="currency">Currency ($)</option>
                <option value="number">Number</option>
                <option value="percentage">Percentage (%)</option>
                <option value="decimal">Decimal (0.00)</option>
              </Select>
            </FormGroup>
          </EditorForm>
        );
      default:
        return null;
    }
  };
  
  const handleSave = (e) => {
    e.preventDefault();
    // Here would be API call to save the metric
    
    // Prepare the metric data to pass to the detail page
    const metric = {
      id: metricId,
      title: formData.title,
      value: formData.format === 'currency' ? 
        formatCurrency(parseFloat(metricPresets[metricId]?.metricValue || metricPresets.default.metricValue.replace(/[$,]/g, ''))) : 
        metricPresets[metricId]?.metricValue || metricPresets.default.metricValue,
      trend: metricPresets[metricId]?.trendValue > 0 ? 'up' : 'down',
      trendValue: Math.abs(metricPresets[metricId]?.trendValue || 0),
      isCurrency: formData.format === 'currency',
      chartData: chartData
    };
    
    navigate(`/metrics/${metricId}`, { state: metric });
  };

  // Generate SQL statement based on selected fields
  const generateSqlStatement = () => {
    let columns = [];
    
    if (schemaSelection.subscription_item_change_events.fields.event_timestamp) {
      columns.push("  se.event_timestamp");
    }
    
    if (schemaSelection.subscription_item_change_events.fields.customer_id) {
      columns.push("  se.customer_id");
    }
    
    if (schemaSelection.subscription_item_change_events.fields.subscription_item_id) {
      columns.push("  se.subscription_item_id");
    }
    
    if (schemaSelection.subscription_item_change_events.fields.currency) {
      columns.push("  se.currency");
    }
    
    if (schemaSelection.customers.fields.name) {
      columns.push("  c.name as customer_name");
    } else {
      columns.push("  c.id");
    }
    
    const columnsStr = columns.join(",\n");
    
    // Build GROUP BY clause
    let groupByClause = "GROUP BY 1";
    const totalSelected = countSelectedFields('subscription_item_change_events') + countSelectedFields('customers');
    
    if (totalSelected > 1) groupByClause += ", 2";
    if (totalSelected > 2) groupByClause += ", 3";
    if (totalSelected > 3) groupByClause += ", 4";
    if (totalSelected > 4) groupByClause += ", 5";
    
    // Get interval based on time range
    let interval;
    switch(formData.timeRange) {
      case '7d': interval = '7 days'; break;
      case '14d': interval = '14 days'; break;
      case '30d': interval = '30 days'; break;
      default: interval = '90 days';
    }
    
    return `-- SQL Query for ${formData.title} Metric
SELECT 
${columnsStr}
FROM subscription_item_change_events se
JOIN customers c ON se.customer_id = c.id
WHERE 
  se.event_timestamp >= current_date - interval '${interval}'
${groupByClause}
ORDER BY 1 DESC;`;
  };
  
  // Update SQL query when schema selection changes
  useEffect(() => {
    setSqlQuery(generateSqlStatement());
  }, [schemaSelection, formData.title, formData.timeRange]);
  
  // Handle SQL query change
  const handleSqlQueryChange = (e) => {
    setSqlQuery(e.target.value);
  };

  return (
    <>
      <TopNavBar>
        <NavControls side="left">
          {/* Empty left side for balance */}
        </NavControls>
        
        <ViewToggle>
          <ToggleButton 
            active={editorView === 'visual'} 
            onClick={() => setEditorView('visual')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5L5 12M5 12L12 19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Visual
          </ToggleButton>
          <ToggleButton 
            active={editorView === 'code'} 
            onClick={() => setEditorView('code')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Code
          </ToggleButton>
        </ViewToggle>
        
        <NavControls side="right">
          <SaveButton onClick={handleSave}>
            Save
          </SaveButton>
          <CloseNavButton onClick={handleCancel}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseNavButton>
        </NavControls>
      </TopNavBar>
    
      <EditorContainer>
        <EditorPanel>
          <AIPromptContainer>
            <AIPromptLabel>
              Build with Assistant
            </AIPromptLabel>
            <AIPromptBox>
              <AIPromptInput 
                placeholder="What do you want to do" 
                value={aiPrompt} 
                onChange={handleAIPromptChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAIPromptSubmit();
                  }
                }}
              />
            </AIPromptBox>
          </AIPromptContainer>
          
          {editorView === 'visual' ? (
            <ConfigModule>
              <TabContainer>
                <Tab 
                  active={activeTab === 'structure'} 
                  onClick={() => setActiveTab('structure')}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Structure
                </Tab>
                <Tab 
                  active={activeTab === 'chart'} 
                  onClick={() => setActiveTab('chart')}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21H3V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 9L15 15L9 9L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Chart
                </Tab>
                <Tab 
                  active={activeTab === 'data'} 
                  onClick={() => setActiveTab('data')}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Data
                </Tab>
              </TabContainer>
              
              <TabContent>
                {renderTabContent()}
              </TabContent>
            </ConfigModule>
          ) : (
            <SchemaModuleContainer>
              <SchemaSearchContainer>
                <SearchIcon>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SearchIcon>
                <SchemaSearchInput type="text" placeholder="Search schema" />
              </SchemaSearchContainer>
              
              <TableList>
                {/* Subscription item change events table */}
                <TableItem>
                  <TableHeader>
                    <TableExpander onClick={() => toggleTableExpanded('subscription_item_change_events')}>
                      <ExpanderIcon>
                        {schemaSelection.subscription_item_change_events.expanded ? '-' : '+'}
                      </ExpanderIcon>
                      <strong>subscription_item_change_events</strong>
                    </TableExpander>
                    <span>{countSelectedFields('subscription_item_change_events')} of {getTotalFields('subscription_item_change_events')} selected</span>
                  </TableHeader>
                  
                  {schemaSelection.subscription_item_change_events.expanded && (
                    <ColumnList>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.event_timestamp} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'event_timestamp')} 
                        />
                        event_timestamp
                        <span className="column-type">Primary key</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.subscription_item_id} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'subscription_item_id')} 
                        />
                        subscription_item_id
                        <span className="column-type">Primary key</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.currency} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'currency')} 
                        />
                        currency
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.customer_id} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'customer_id')} 
                        />
                        customer_id
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.price_id} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'price_id')} 
                        />
                        price_id
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.subscription_item_change_events.fields.product_id} 
                          onChange={() => toggleFieldSelected('subscription_item_change_events', 'product_id')} 
                        />
                        product_id
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                    </ColumnList>
                  )}
                </TableItem>
                
                {/* Customers table */}
                <TableItem>
                  <TableHeader>
                    <TableExpander onClick={() => toggleTableExpanded('customers')}>
                      <ExpanderIcon>
                        {schemaSelection.customers.expanded ? '-' : '+'}
                      </ExpanderIcon>
                      <strong>customers</strong>
                    </TableExpander>
                    <span>{countSelectedFields('customers')} of {getTotalFields('customers')} selected</span>
                  </TableHeader>
                  
                  {schemaSelection.customers.expanded && (
                    <ColumnList>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.customers.fields.id} 
                          onChange={() => toggleFieldSelected('customers', 'id')} 
                        />
                        id
                        <span className="column-type">Primary key</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.customers.fields.name} 
                          onChange={() => toggleFieldSelected('customers', 'name')} 
                        />
                        name
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.customers.fields.email} 
                          onChange={() => toggleFieldSelected('customers', 'email')} 
                        />
                        email
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                      <ColumnItem>
                        <SchemaCheckbox 
                          type="checkbox" 
                          checked={schemaSelection.customers.fields.currency} 
                          onChange={() => toggleFieldSelected('customers', 'currency')} 
                        />
                        currency
                        <span className="column-type">Varchar</span>
                      </ColumnItem>
                    </ColumnList>
                  )}
                </TableItem>
                
                <ShowAllTablesButton>
                  Show all tables
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </ShowAllTablesButton>
              </TableList>
            </SchemaModuleContainer>
          )}
        </EditorPanel>
        
        {editorView === 'visual' ? (
          <PreviewContainer className="preview-container">
            <PreviewCard ref={previewCardRef}>
              <ReportHeader>
                <SectionWrapper highlighted={activeTab === 'structure'}>
                  <div ref={structureRef}>
                    <MetricTitle>{formData.title}</MetricTitle>
                    <MetricValue>{getPreset().metricValue}</MetricValue>
                    
                    {formData.showTrend && (
                      <TrendIndicator className={trendValue >= 0 ? "positive" : "negative"}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d={trendValue >= 0 ? 
                            "M12 19V5M12 5L5 12M12 5L19 12" : 
                            "M12 5V19M12 19L5 12M12 19L19 12"} 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {trendValue >= 0 ? '+' : ''}{trendValue}% compared to previous period
                      </TrendIndicator>
                    )}
                    
                    <MetricSummary>
                      <p>{formData.description}</p>
                      
                      {formData.showTotal && (
                        <div className="mt-3">
                          <h4>Total</h4>
                          <p>{getPreset().metricValue}</p>
                        </div>
                      )}
                      
                      {formData.showAverage && (
                        <div className="mt-3">
                          <h4>Average</h4>
                          <p>{metricId === 'new-customers' ? 
                            '8.2 per day' : 
                            formData.format === 'currency' ? 
                              '$1,760.75 per day' : 
                              '58.3 per day'}
                          </p>
                        </div>
                      )}
                    </MetricSummary>
                  </div>
                </SectionWrapper>
              </ReportHeader>
              
              <SectionWrapper highlighted={activeTab === 'chart'}>
                <div ref={chartRef}>
                  <ChartContainer>
                    <LineChart 
                      data={chartData || {
                        labels: [],
                        datasets: [{
                          data: [],
                          borderColor: formData.color || '#635bff',
                          backgroundColor: `${formData.color || '#635bff'}19`,
                          fill: formData.chartType === 'area',
                          borderWidth: 2
                        }]
                      }} 
                      type={formData.chartType}
                      height={280} 
                      showLegend={formData.showLegend} 
                    />
                  </ChartContainer>
                </div>
              </SectionWrapper>
              
              <SectionWrapper highlighted={activeTab === 'data'}>
                <div ref={dataRef}>
                  <TransactionsSection>
                    <TransactionsHeader>
                      <SectionTitle>
                        {metricId === 'new-customers' ? 'Recent Customers' : 'Recent Transactions'}
                      </SectionTitle>
                    </TransactionsHeader>
                    
                    <TableContainer>
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            {metricId !== 'new-customers' && <th>Amount</th>}
                            <th>Customer</th>
                            {metricId === 'new-customers' ? <th>Email</th> : <th>Status</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {currentTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>{transaction.date}</td>
                              {metricId !== 'new-customers' && <td>{transaction.amount}</td>}
                              <td>{transaction.customer}</td>
                              {metricId === 'new-customers' ? 
                                <td>{transaction.email}</td> :
                                <td>
                                  <span style={{ 
                                    color: transaction.status === 'Succeeded' ? 'var(--success-color)' : 
                                          transaction.status === 'Failed' ? 'var(--danger-color)' :
                                          transaction.status === 'Refunded' ? 'var(--warning-color)' : 
                                          'var(--text-secondary)'
                                  }}>
                                    {transaction.status}
                                  </span>
                                </td>
                              }
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableContainer>
                    
                    <Pagination>
                      <PageInfo>
                        Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                </div>
              </SectionWrapper>
            </PreviewCard>
          </PreviewContainer>
        ) : (
          <CodeViewContainer>
            <SqlQueryContainer>
              <SqlEditor 
                value={sqlQuery}
                onChange={handleSqlQueryChange}
                spellCheck="false"
              />
            </SqlQueryContainer>
            
            <QueryResultsContainer>
              <ResultsHeader>
                <h3>{filteredTransactions.length} results</h3>
              </ResultsHeader>
              
              <TableContainer>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.date}</td>
                        <td>{transaction.amount}</td>
                        <td>{transaction.customer}</td>
                        <td>
                          <span style={{ 
                            color: transaction.status === 'Succeeded' ? 'var(--success-color)' : 
                                  transaction.status === 'Failed' ? 'var(--danger-color)' :
                                  transaction.status === 'Refunded' ? 'var(--warning-color)' : 
                                  'var(--text-secondary)'
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableContainer>
              
              <Pagination>
                <PageInfo>
                  Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
            </QueryResultsContainer>
          </CodeViewContainer>
        )}
      </EditorContainer>
    </>
  );
};

export default MetricEditor; 