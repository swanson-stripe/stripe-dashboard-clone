import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

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
  margin-top: 64px;
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

const ConfigModule = styled(ModuleContainer)`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
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

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
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

const PreviewContainer = styled.div`
  flex: 1;
  margin-top: 64px;
  padding: 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: white;
  background-image: url("/dot-grid-bg.svg");
  background-size: 20px 20px;
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(192, 200, 210, 0.2);
  max-width: 1000px;
  flex: 1;
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

const CodeViewContainer = styled.div`
  flex: 1;
  margin-top: 64px;
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

const MetricEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [currentId, setCurrentId] = useState(id || 'gross-volume');
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editorView, setEditorView] = useState('visual');
  const [aiPrompt, setAIPrompt] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sqlQuery, setSqlQuery] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    dataSource: 'stripe_payments',
    unit: 'currency',
    aggregation: 'sum',
    format: 'currency',
    timeRange: '30d'
  });

  // Schema selection state
  const [schemaSelection, setSchemaSelection] = useState({
    subscription_item_change_events: {
      expanded: true,
      fields: {
        event_timestamp: true,
        subscription_item_id: false,
        currency: false,
        customer_id: true,
        price_id: false,
        product_id: false
      }
    },
    customers: {
      expanded: false,
      fields: {
        id: false,
        name: true,
        email: false,
        currency: false
      }
    }
  });

  // Sample transaction data
  const [filteredTransactions] = useState([
    { id: 1, date: '2024-01-15', amount: '$2,450.00', customer: 'Acme Corp', status: 'Succeeded' },
    { id: 2, date: '2024-01-14', amount: '$1,200.00', customer: 'TechStart Inc', status: 'Succeeded' },
    { id: 3, date: '2024-01-14', amount: '$890.00', customer: 'Global Solutions', status: 'Failed' },
    { id: 4, date: '2024-01-13', amount: '$3,200.00', customer: 'Enterprise Co', status: 'Succeeded' },
    { id: 5, date: '2024-01-13', amount: '$750.00', customer: 'StartupXYZ', status: 'Refunded' },
    { id: 6, date: '2024-01-12', amount: '$1,800.00', customer: 'MegaCorp', status: 'Succeeded' },
    { id: 7, date: '2024-01-12', amount: '$950.00', customer: 'SmallBiz LLC', status: 'Succeeded' },
    { id: 8, date: '2024-01-11', amount: '$2,100.00', customer: 'TechGiant', status: 'Succeeded' },
    { id: 9, date: '2024-01-11', amount: '$650.00', customer: 'LocalShop', status: 'Failed' },
    { id: 10, date: '2024-01-10', amount: '$4,200.00', customer: 'BigClient Inc', status: 'Succeeded' }
  ]);

  // Pagination
  const transactionsPerPage = 10;
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCancel = () => {
    navigate(isEditingReport ? `/data-studio/${currentId}` : `/metrics/${currentId}`);
  };

  const handleAIPromptChange = (e) => {
    setAIPrompt(e.target.value);
  };

  const handleAIPromptSubmit = () => {
    console.log('AI Prompt submitted:', aiPrompt);
  };

  const toggleTableExpanded = (tableName) => {
    setSchemaSelection(prev => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        expanded: !prev[tableName].expanded
      }
    }));
  };

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

  const countSelectedFields = (tableName) => {
    return Object.values(schemaSelection[tableName].fields).filter(Boolean).length;
  };

  const getTotalFields = (tableName) => {
    return Object.keys(schemaSelection[tableName].fields).length;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSave = (e) => {
    e.preventDefault();
    navigate(isEditingReport ? `/data-studio/${currentId}` : `/metrics/${currentId}`);
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
    
    return `-- SQL Query for Data Analysis
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
  }, [schemaSelection, formData.timeRange]);

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
              <TabContent>
                <EditorForm>
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
          <PreviewContainer>
            <PreviewCard>
              <TransactionsSection>
                <TransactionsHeader>
                  <SectionTitle>
                    {currentId === 'new-customers' ? 'Recent Customers' : 'Recent Transactions'}
                  </SectionTitle>
                </TransactionsHeader>
                
                <TableContainer>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        {currentId !== 'new-customers' && <th>Amount</th>}
                        <th>Customer</th>
                        {currentId === 'new-customers' ? <th>Email</th> : <th>Status</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.date}</td>
                          {currentId !== 'new-customers' && <td>{transaction.amount}</td>}
                          <td>{transaction.customer}</td>
                          {currentId === 'new-customers' ? 
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
