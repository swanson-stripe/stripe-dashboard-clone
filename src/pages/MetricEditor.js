import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

// Dataset definitions based on the attached image
const DATASETS = {
  'payments-general': {
    name: 'Payments (General)',
    keyEntities: ['charge_id', 'amount', 'status', 'payment_method', 'currency', 'created_at', 'customer_id'],
    derivedFields: ['net_revenue', 'success_rate', 'retry_outcome'],
    columnCount: 10
  },
  'customers': {
    name: 'Customers',
    keyEntities: ['customer_id', 'email', 'created_at', 'metadata', 'default_payment_method', 'last_seen'],
    derivedFields: ['LTV', 'first_payment_date', 'churn_flag', 'MRR (if applicable)'],
    columnCount: 10
  },
  'payments-refunds-disputes': {
    name: 'Payments (Refunds & Disputes)',
    keyEntities: ['refund_id', 'dispute_id', 'status', 'reason', 'amount', 'charge_id'],
    derivedFields: ['refund_rate', 'dispute_rate', 'recovery_rate'],
    columnCount: 9
  },
  'orders-line-items': {
    name: 'Orders & Line Items',
    keyEntities: ['order_id', 'product_id', 'quantity', 'subtotal', 'tax', 'total', 'customer_id'],
    derivedFields: ['AOV (average_order_value)', 'SKU_level_revenue'],
    columnCount: 9
  },
  'revenue-summary': {
    name: 'Revenue Summary',
    keyEntities: ['payments', 'subscriptions', 'adjustments'],
    derivedFields: ['gross_revenue', 'net_revenue'],
    columnCount: 5
  },
  'mrr-customer-revenue': {
    name: 'MRR & Customer Revenue',
    keyEntities: ['subscription', 'invoice', 'product'],
    derivedFields: ['MRR', 'churned_MRR', 'upgrades_downgrades'],
    columnCount: 6
  },
  'invoices': {
    name: 'Invoices',
    keyEntities: ['invoice_id', 'due_date', 'paid', 'forgiven', 'subscription_id'],
    derivedFields: ['invoice_aging', 'collection_rate', 'average_invoice_size'],
    columnCount: 8
  },
  'products-plans': {
    name: 'Products & Plans',
    keyEntities: ['product_id', 'plan_id', 'amount', 'interval', 'tiers', 'metadata'],
    derivedFields: ['catalog_size', 'usage_type'],
    columnCount: 8
  },
  'payouts': {
    name: 'Payouts',
    keyEntities: ['payout_id', 'amount', 'method', 'status', 'arrival_date'],
    derivedFields: ['time_to_settle', 'payout_frequency'],
    columnCount: 7
  },
  'connected-accounts': {
    name: 'Connected Accounts',
    keyEntities: ['account_id', 'type', 'capabilities', 'charges_enabled', 'payouts_enabled'],
    derivedFields: ['onboarding_rate', 'active_accounts'],
    columnCount: 7
  },
  'transfers-payouts': {
    name: 'Transfers & Payouts',
    keyEntities: ['transfer_id', 'destination', 'amount', 'created_at', 'associated_charges'],
    derivedFields: ['transfer_margin', 'time_to_payout'],
    columnCount: 7
  },
  'fraud-signals-scores': {
    name: 'Fraud Signals & Scores',
    keyEntities: ['risk_level', 'fraud_score', 'rule_triggered', 'charge_id'],
    derivedFields: ['avg_score_by_country', 'rule_performance'],
    columnCount: 6
  },
  'rule-outcomes': {
    name: 'Rule Outcomes',
    keyEntities: ['rule_id', 'action_taken', 'false_positive', 'true_positive'],
    derivedFields: ['block_rate', 'rule_effectiveness'],
    columnCount: 6
  },
  'in-person-payments': {
    name: 'In-Person Payments',
    keyEntities: ['terminal_reader_id', 'location', 'payment_id', 'device_type'],
    derivedFields: ['in_person_revenue_share', 'location_performance'],
    columnCount: 6
  },
  'subscription-lifecycle': {
    name: 'Subscription Lifecycle',
    keyEntities: ['subscription_id', 'status', 'start', 'end', 'cancellation_reason'],
    derivedFields: ['subscription_age', 'lifecycle_stage', 'churn_trigger'],
    columnCount: 8
  },
  'subscription-events': {
    name: 'Subscription Events',
    keyEntities: ['subscription_schedule', 'subscription_item', 'phase'],
    derivedFields: ['plan_change_rate', 'average_plan_value_change'],
    columnCount: 6
  },
  'hybrid-billing-summary': {
    name: 'Hybrid Billing Summary',
    keyEntities: ['usage_record', 'invoice_line_item', 'subscription_item', 'plan'],
    derivedFields: ['MRR', 'usage_overage', 'effective_ARPU', 'blended_churn'],
    columnCount: 8
  }
};

// Column mapping - maps dataset column names to display names and data keys
const COLUMN_MAPPING = {
  // Payments (General) columns
  'charge_id': { display: 'Charge ID', key: 'charge_id' },
  'amount': { display: 'Amount', key: 'amount' },
  'status': { display: 'Status', key: 'status' },
  'payment_method': { display: 'Payment Method', key: 'payment_method' },
  'currency': { display: 'Currency', key: 'currency' },
  'created_at': { display: 'Date', key: 'date' },
  'customer_id': { display: 'Customer ID', key: 'customer_id' },
  'net_revenue': { display: 'Net Revenue', key: 'net_revenue' },
  'success_rate': { display: 'Success Rate', key: 'success_rate' },
  'retry_outcome': { display: 'Retry Outcome', key: 'retry_outcome' },
  
  // Customers columns
  'email': { display: 'Email', key: 'email' },
  'metadata': { display: 'Metadata', key: 'metadata' },
  'default_payment_method': { display: 'Default Payment', key: 'default_payment_method' },
  'last_seen': { display: 'Last Seen', key: 'last_seen' },
  'LTV': { display: 'LTV', key: 'ltv' },
  'first_payment_date': { display: 'First Payment', key: 'first_payment_date' },
  'churn_flag': { display: 'Churn Flag', key: 'churn_flag' },
  'MRR (if applicable)': { display: 'MRR', key: 'mrr' },
  
  // Other dataset columns
  'refund_id': { display: 'Refund ID', key: 'refund_id' },
  'dispute_id': { display: 'Dispute ID', key: 'dispute_id' },
  'reason': { display: 'Reason', key: 'reason' },
  'order_id': { display: 'Order ID', key: 'order_id' },
  'product_id': { display: 'Product ID', key: 'product_id' },
  'quantity': { display: 'Quantity', key: 'quantity' },
  'subtotal': { display: 'Subtotal', key: 'subtotal' },
  'tax': { display: 'Tax', key: 'tax' },
  'total': { display: 'Total', key: 'total' }
};

// Function to convert column names to human readable format
const getHumanReadableColumnName = (columnName) => {
  const mapping = {
    'charge_id': 'Charge ID',
    'amount': 'Amount',
    'status': 'Status',
    'payment_method': 'Payment method',
    'currency': 'Currency',
    'created_at': 'Created at',
    'customer_id': 'Customer ID',
    'net_revenue': 'Net revenue',
    'success_rate': 'Success rate',
    'retry_outcome': 'Retry outcome',
    'email': 'Email',
    'metadata': 'Metadata',
    'default_payment_method': 'Default payment method',
    'last_seen': 'Last seen',
    'LTV': 'LTV',
    'first_payment_date': 'First payment date',
    'churn_flag': 'Churn flag',
    'MRR (if applicable)': 'MRR (if applicable)',
    'refund_id': 'Refund ID',
    'dispute_id': 'Dispute ID',
    'reason': 'Reason',
    'refund_rate': 'Refund rate',
    'dispute_rate': 'Dispute rate',
    'recovery_rate': 'Recovery rate',
    'order_id': 'Order ID',
    'product_id': 'Product ID',
    'quantity': 'Quantity',
    'subtotal': 'Subtotal',
    'tax': 'Tax',
    'total': 'Total',
    'AOV (average_order_value)': 'AOV (average order value)',
    'SKU_level_revenue': 'SKU level revenue',
    'payments': 'Payments',
    'subscriptions': 'Subscriptions',
    'adjustments': 'Adjustments',
    'gross_revenue': 'Gross revenue',
    'subscription': 'Subscription',
    'invoice': 'Invoice',
    'product': 'Product',
    'MRR': 'MRR',
    'churned_MRR': 'Churned MRR',
    'upgrades_downgrades': 'Upgrades/downgrades',
    'invoice_id': 'Invoice ID',
    'due_date': 'Due date',
    'paid': 'Paid',
    'forgiven': 'Forgiven',
    'subscription_id': 'Subscription ID',
    'invoice_aging': 'Invoice aging',
    'collection_rate': 'Collection rate',
    'average_invoice_size': 'Average invoice size',
    'plan_id': 'Plan ID',
    'interval': 'Interval',
    'tiers': 'Tiers',
    'catalog_size': 'Catalog size',
    'usage_type': 'Usage type',
    'payout_id': 'Payout ID',
    'method': 'Method',
    'arrival_date': 'Arrival date',
    'time_to_settle': 'Time to settle',
    'payout_frequency': 'Payout frequency',
    'account_id': 'Account ID',
    'type': 'Type',
    'capabilities': 'Capabilities',
    'charges_enabled': 'Charges enabled',
    'payouts_enabled': 'Payouts enabled',
    'onboarding_rate': 'Onboarding rate',
    'active_accounts': 'Active accounts',
    'transfer_id': 'Transfer ID',
    'destination': 'Destination',
    'associated_charges': 'Associated charges',
    'transfer_margin': 'Transfer margin',
    'time_to_payout': 'Time to payout',
    'risk_level': 'Risk level',
    'fraud_score': 'Fraud score',
    'rule_triggered': 'Rule triggered',
    'avg_score_by_country': 'Avg score by country',
    'rule_performance': 'Rule performance',
    'rule_id': 'Rule ID',
    'action_taken': 'Action taken',
    'false_positive': 'False positive',
    'true_positive': 'True positive',
    'block_rate': 'Block rate',
    'rule_effectiveness': 'Rule effectiveness',
    'terminal_reader_id': 'Terminal reader ID',
    'location': 'Location',
    'payment_id': 'Payment ID',
    'device_type': 'Device type',
    'in_person_revenue_share': 'In-person revenue share',
    'location_performance': 'Location performance',
    'start': 'Start',
    'end': 'End',
    'cancellation_reason': 'Cancellation reason',
    'subscription_age': 'Subscription age',
    'lifecycle_stage': 'Lifecycle stage',
    'churn_trigger': 'Churn trigger',
    'subscription_schedule': 'Subscription schedule',
    'subscription_item': 'Subscription item',
    'phase': 'Phase',
    'plan_change_rate': 'Plan change rate',
    'average_plan_value_change': 'Average plan value change',
    'usage_record': 'Usage record',
    'invoice_line_item': 'Invoice line item',
    'plan': 'Plan',
    'usage_overage': 'Usage overage',
    'effective_ARPU': 'Effective ARPU',
    'blended_churn': 'Blended churn'
  };
  
  return mapping[columnName] || columnName;
};

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: white;
  position: relative;
  overflow: hidden;
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
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TitleSeparator = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
  margin: 0 16px;
`;

const PageTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #374151;
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

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: white;
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: ${props => 20 * props.zoom}px ${props => 20 * props.zoom}px;
  background-position: ${props => props.panX}px ${props => props.panY}px;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
`;

const CanvasContent = styled.div`
  position: absolute;
  transform: translate(${props => props.panX}px, ${props => props.panY}px) scale(${props => props.zoom});
  transform-origin: 0 0;
  margin-top: 64px;
  padding: 32px;
  min-width: 100vw;
  min-height: calc(100vh - 64px);
  pointer-events: ${props => props.isDragging ? 'none' : 'auto'};
`;

const ZoomControls = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ZoomButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f7fa;
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

const DatasetModule = styled(ModuleContainer)`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
  height: auto;
  min-height: 300px;
  max-height: calc(100vh - 160px);
`;

const DatasetSection = styled.div`
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const SectionHeader = styled.div`
  padding: 16px;
  background-color: #f9fafc;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  
  &.expandable {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    &:hover {
      background-color: #f1f3f4;
    }
  }
`;

const SectionContent = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &.collapsed {
    display: none;
  }
`;

const DatasetItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DatasetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const DatasetName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: var(--text-color);
  flex: 1;
`;

const DatasetMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const DatasetTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const DatasetTag = styled.span`
  background-color: #f1f3f4;
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
`;

const ExpandIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  svg {
    width: 12px;
    height: 12px;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }
  
  &:hover svg {
    color: var(--primary-color);
  }
  
  &.expanded svg {
    transform: rotate(90deg);
  }
`;

const ColumnList = styled.div`
  margin: 8px 0 0 28px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
`;

const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--text-secondary);
`;

const ColumnCheckbox = styled.input`
  width: 14px;
  height: 14px;
  cursor: pointer;
`;

const BulkActionLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 8px;
  
  &:hover {
    color: #574ae2;
  }
`;

const PreviewCard = styled.div`
  background: transparent;
  border-radius: 8px;
  padding: 0;
  width: fit-content;
  min-width: 400px;
`;

const TableContainer = styled.div`
  width: fit-content;
  overflow: visible;
  border-radius: 8px;
  background: white;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  border: 1px solid rgba(192, 200, 210, 0.2);
  
  table {
    width: auto;
    border-collapse: collapse;
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      min-width: fit-content;
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

const TransactionsSection = styled.div`
  margin-top: 0;
`;

// Schema module components for code view
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
  margin-top: 64px;
  padding: 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: white;
  background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
`;

const SqlQueryContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
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

const QueryResultsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0px 2px 6px rgba(110, 117, 131, 0.2);
  max-width: 1000px;
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
  
  // Canvas pan/zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  // Current table columns for matching
  const currentTableColumns = ['date', 'amount', 'customer', 'status'];
  
  // Dataset state - only include datasets that have default selected columns
  const [selectedDatasets, setSelectedDatasets] = useState(['payments-general', 'customers']);
  const [expandedDatasets, setExpandedDatasets] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({
    'payments-general': ['created_at', 'amount', 'customer_id', 'status'],
    'customers': ['customer_id']
  });
  const [moreDatasetsSectionExpanded, setMoreDatasetsSectionExpanded] = useState(false);

  // Schema selection state (keeping for code view)
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

  // Zoom intervals - 10% increments
  const ZOOM_LEVELS = [0.25, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.5, 4.0];

  // Canvas pan/zoom functions
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (e.metaKey || e.ctrlKey) {
      // Zoom with smooth increments for mouse wheel
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.25), 4));
    } else {
      // Pan
      setPanX(prev => prev - e.deltaX);
      setPanY(prev => prev - e.deltaY);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current || canvasRef.current?.contains(e.target)) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getNextZoomLevel = (currentZoom, direction) => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level >= currentZoom);
    
    if (direction === 'in') {
      // Zoom in - get next higher level
      if (currentIndex === -1) return ZOOM_LEVELS[0];
      return ZOOM_LEVELS[Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1)] || currentZoom;
    } else {
      // Zoom out - get next lower level
      if (currentIndex === -1) return ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
      if (currentIndex === 0) return ZOOM_LEVELS[0];
      return ZOOM_LEVELS[Math.max(currentIndex - 1, 0)] || currentZoom;
    }
  };

  const zoomIn = () => {
    setZoom(prev => getNextZoomLevel(prev, 'in'));
  };

  const zoomOut = () => {
    setZoom(prev => getNextZoomLevel(prev, 'out'));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.shiftKey && e.key === '1') {
        e.preventDefault();
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Canvas event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Function to get all currently selected columns for the table
  const getCurrentTableColumns = () => {
    const columns = [];
    
    selectedDatasets.forEach(datasetKey => {
      const datasetColumns = selectedColumns[datasetKey] || [];
      datasetColumns.forEach(columnName => {
        const mapping = COLUMN_MAPPING[columnName];
        if (mapping) {
          columns.push({
            datasetKey,
            columnName,
            display: mapping.display,
            key: mapping.key
          });
        }
      });
    });
    
    return columns;
  };

  // Function to get cell value for a given column
  const getCellValue = (transaction, columnKey) => {
    switch (columnKey) {
      case 'date':
        return transaction.date;
      case 'amount':
        return transaction.amount;
      case 'customer_id':
        return transaction.customer;
      case 'status':
        return transaction.status;
      case 'charge_id':
        return transaction.id;
      case 'payment_method':
        return transaction.payment_method || 'Card';
      case 'currency':
        return transaction.currency || 'USD';
      case 'email':
        return transaction.email || `${transaction.customer.toLowerCase().replace(/[^a-z]/g, '')}@company.com`;
      case 'net_revenue':
        return transaction.net_revenue || transaction.amount;
      case 'success_rate':
        return transaction.success_rate || (transaction.status === 'Succeeded' ? '100%' : '0%');
      case 'ltv':
        return transaction.ltv || '$12,500';
      case 'first_payment_date':
        return transaction.first_payment_date || '2023-08-15';
      case 'churn_flag':
        return transaction.churn_flag || 'No';
      case 'mrr':
        return transaction.mrr || '$500';
      default:
        return '-';
    }
  };

  // Get datasets in use vs more datasets - only show datasets with selected columns in first section
  const getDatasetsInUse = () => {
    return Object.entries(DATASETS).filter(([key, dataset]) => 
      selectedDatasets.includes(key) && selectedColumns[key] && selectedColumns[key].length > 0
    );
  };

  const getMoreDatasets = () => {
    const inUseKeys = getDatasetsInUse().map(([key]) => key);
    return Object.entries(DATASETS).filter(([key]) => !inUseKeys.includes(key));
  };

  const toggleDatasetSelection = (datasetKey) => {
    setSelectedDatasets(prev => {
      if (prev.includes(datasetKey)) {
        return prev.filter(key => key !== datasetKey);
      } else {
        return [...prev, datasetKey];
      }
    });
    
    // Also add some default columns when selecting a dataset
    if (!selectedDatasets.includes(datasetKey)) {
      const dataset = DATASETS[datasetKey];
      if (dataset) {
        const defaultColumns = dataset.keyEntities.slice(0, 3); // Take first 3 key entities as defaults
        setSelectedColumns(prev => ({
          ...prev,
          [datasetKey]: defaultColumns
        }));
      }
    }
  };

  const toggleDatasetExpanded = (datasetKey) => {
    setExpandedDatasets(prev => ({
      ...prev,
      [datasetKey]: !prev[datasetKey]
    }));
  };

  const toggleColumnSelection = (datasetKey, columnName) => {
    setSelectedColumns(prev => ({
      ...prev,
      [datasetKey]: prev[datasetKey] 
        ? prev[datasetKey].includes(columnName)
          ? prev[datasetKey].filter(col => col !== columnName)
          : [...prev[datasetKey], columnName]
        : [columnName]
    }));
  };

  // Bulk actions
  const handleBulkAction = (datasetKey, dataset) => {
    const currentColumns = selectedColumns[datasetKey] || [];
    const allColumns = [...dataset.keyEntities, ...dataset.derivedFields];
    
    if (currentColumns.length === allColumns.length) {
      // Remove all
      setSelectedColumns(prev => ({
        ...prev,
        [datasetKey]: []
      }));
    } else {
      // Add all
      setSelectedColumns(prev => ({
        ...prev,
        [datasetKey]: allColumns
      }));
      
      // Also add to selected datasets if not already there
      if (!selectedDatasets.includes(datasetKey)) {
        setSelectedDatasets(prev => [...prev, datasetKey]);
      }
    }
  };

  const getBulkActionText = (datasetKey, dataset) => {
    const currentColumns = selectedColumns[datasetKey] || [];
    const allColumns = [...dataset.keyEntities, ...dataset.derivedFields];
    
    if (currentColumns.length === allColumns.length) {
      return 'Remove all';
    } else {
      return 'Add all';
    }
  };

  const getColumnCountText = (datasetKey, dataset) => {
    const currentColumns = selectedColumns[datasetKey] || [];
    const totalColumns = dataset.columnCount;
    
    if (currentColumns.length > 0) {
      return `${currentColumns.length} of ${totalColumns} columns`;
    } else {
      return `${totalColumns} columns`;
    }
  };

  // Enhanced sample transaction data with more fields
  const [filteredTransactions] = useState([
    { 
      id: 'ch_1234', 
      date: '2024-01-15', 
      amount: '$2,450.00', 
      customer: 'Acme Corp', 
      status: 'Succeeded',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$2,350.00',
      success_rate: '100%',
      ltv: '$15,000',
      first_payment_date: '2023-08-15',
      churn_flag: 'No',
      mrr: '$750'
    },
    { 
      id: 'ch_1235', 
      date: '2024-01-14', 
      amount: '$1,200.00', 
      customer: 'TechStart Inc', 
      status: 'Succeeded',
      payment_method: 'ACH',
      currency: 'USD',
      net_revenue: '$1,150.00',
      success_rate: '100%',
      ltv: '$8,500',
      first_payment_date: '2023-10-20',
      churn_flag: 'No',
      mrr: '$400'
    },
    { 
      id: 'ch_1236', 
      date: '2024-01-14', 
      amount: '$890.00', 
      customer: 'Global Solutions', 
      status: 'Failed',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$0.00',
      success_rate: '0%',
      ltv: '$0',
      first_payment_date: '2024-01-14',
      churn_flag: 'Yes',
      mrr: '$0'
    },
    { 
      id: 'ch_1237', 
      date: '2024-01-13', 
      amount: '$3,200.00', 
      customer: 'Enterprise Co', 
      status: 'Succeeded',
      payment_method: 'Wire',
      currency: 'USD',
      net_revenue: '$3,100.00',
      success_rate: '100%',
      ltv: '$25,000',
      first_payment_date: '2022-05-10',
      churn_flag: 'No',
      mrr: '$1,200'
    },
    { 
      id: 'ch_1238', 
      date: '2024-01-13', 
      amount: '$750.00', 
      customer: 'StartupXYZ', 
      status: 'Refunded',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$0.00',
      success_rate: '0%',
      ltv: '$2,200',
      first_payment_date: '2023-12-01',
      churn_flag: 'No',
      mrr: '$250'
    },
    { 
      id: 'ch_1239', 
      date: '2024-01-12', 
      amount: '$1,800.00', 
      customer: 'MegaCorp', 
      status: 'Succeeded',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$1,720.00',
      success_rate: '100%',
      ltv: '$18,000',
      first_payment_date: '2021-03-15',
      churn_flag: 'No',
      mrr: '$600'
    },
    { 
      id: 'ch_1240', 
      date: '2024-01-12', 
      amount: '$950.00', 
      customer: 'SmallBiz LLC', 
      status: 'Succeeded',
      payment_method: 'ACH',
      currency: 'USD',
      net_revenue: '$920.00',
      success_rate: '100%',
      ltv: '$4,800',
      first_payment_date: '2023-09-22',
      churn_flag: 'No',
      mrr: '$320'
    },
    { 
      id: 'ch_1241', 
      date: '2024-01-11', 
      amount: '$2,100.00', 
      customer: 'TechGiant', 
      status: 'Succeeded',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$2,020.00',
      success_rate: '100%',
      ltv: '$22,000',
      first_payment_date: '2020-11-08',
      churn_flag: 'No',
      mrr: '$850'
    },
    { 
      id: 'ch_1242', 
      date: '2024-01-11', 
      amount: '$650.00', 
      customer: 'LocalShop', 
      status: 'Failed',
      payment_method: 'Card',
      currency: 'USD',
      net_revenue: '$0.00',
      success_rate: '0%',
      ltv: '$1,200',
      first_payment_date: '2023-11-30',
      churn_flag: 'Yes',
      mrr: '$0'
    },
    { 
      id: 'ch_1243', 
      date: '2024-01-10', 
      amount: '$4,200.00', 
      customer: 'BigClient Inc', 
      status: 'Succeeded',
      payment_method: 'Wire',
      currency: 'USD',
      net_revenue: '$4,050.00',
      success_rate: '100%',
      ltv: '$35,000',
      first_payment_date: '2019-07-12',
      churn_flag: 'No',
      mrr: '$1,500'
    }
  ]);

  // Pagination
  const transactionsPerPage = 10;
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

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
    
    return `-- SQL Query for Data Analysis
SELECT 
${columnsStr}
FROM subscription_item_change_events se
JOIN customers c ON se.customer_id = c.id
WHERE 
  se.event_timestamp >= current_date - interval '30 days'
${groupByClause}
ORDER BY 1 DESC;`;
  };

  // Update SQL query when schema selection changes
  useEffect(() => {
    setSqlQuery(generateSqlStatement());
  }, [schemaSelection]);

  // Handle SQL query change
  const handleSqlQueryChange = (e) => {
    setSqlQuery(e.target.value);
  };

  return (
    <>
      <TopNavBar>
        <NavControls>
          <CloseNavButton onClick={handleCancel}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseNavButton>
          <TitleSeparator />
          <PageTitle>
            {currentId === 'new-customers' ? 'Recent Customers' : 'Recent Transactions'}
          </PageTitle>
        </NavControls>
        
        <NavControls>
          <SaveButton onClick={handleSave}>
            Save
          </SaveButton>
        </NavControls>
      </TopNavBar>
    
      <EditorContainer>
        <EditorPanel>
          {editorView === 'visual' ? (
            <DatasetModule>
              <DatasetSection>
                <SectionHeader>Datasets in use</SectionHeader>
                <SectionContent>
                  {getDatasetsInUse().map(([key, dataset]) => (
                    <DatasetItem key={key}>
                      <DatasetHeader>
                        <DatasetName>{dataset.name}</DatasetName>
                        <ExpandIcon 
                          className={expandedDatasets[key] ? 'expanded' : ''}
                          onClick={() => toggleDatasetExpanded(key)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </ExpandIcon>
                      </DatasetHeader>
                      <DatasetMeta>{getColumnCountText(key, dataset)}</DatasetMeta>
                      <DatasetTags>
                        {dataset.keyEntities.slice(0, 2).map(entity => (
                          <DatasetTag key={entity}>{entity}</DatasetTag>
                        ))}
                        {dataset.derivedFields.length > 0 && (
                          <DatasetTag>{dataset.derivedFields[0]}</DatasetTag>
                        )}
                      </DatasetTags>
                      
                      {expandedDatasets[key] && (
                        <>
                          <BulkActionLink onClick={() => handleBulkAction(key, dataset)}>
                            {getBulkActionText(key, dataset)}
                          </BulkActionLink>
                          <ColumnList>
                            {[...dataset.keyEntities, ...dataset.derivedFields].map(column => (
                              <ColumnItem key={column}>
                                <ColumnCheckbox 
                                  type="checkbox"
                                  checked={selectedColumns[key]?.includes(column) || false}
                                  onChange={() => toggleColumnSelection(key, column)}
                                />
                                {getHumanReadableColumnName(column)}
                              </ColumnItem>
                            ))}
                          </ColumnList>
                        </>
                      )}
                    </DatasetItem>
                  ))}
                </SectionContent>
              </DatasetSection>
              
              <DatasetSection>
                <SectionHeader 
                  className="expandable"
                  onClick={() => setMoreDatasetsSectionExpanded(!moreDatasetsSectionExpanded)}
                >
                  More datasets
                  <ExpandIcon className={moreDatasetsSectionExpanded ? 'expanded' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ExpandIcon>
                </SectionHeader>
                <SectionContent className={moreDatasetsSectionExpanded ? '' : 'collapsed'}>
                  {getMoreDatasets().map(([key, dataset]) => (
                    <DatasetItem key={key}>
                      <DatasetHeader onClick={() => toggleDatasetExpanded(key)}>
                        <DatasetName>{dataset.name}</DatasetName>
                        <ExpandIcon 
                          className={expandedDatasets[key] ? 'expanded' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDatasetExpanded(key);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </ExpandIcon>
                      </DatasetHeader>
                      <DatasetMeta>{getColumnCountText(key, dataset)}</DatasetMeta>
                      <DatasetTags>
                        {dataset.keyEntities.slice(0, 2).map(entity => (
                          <DatasetTag key={entity}>{entity}</DatasetTag>
                        ))}
                        {dataset.derivedFields.length > 0 && (
                          <DatasetTag>{dataset.derivedFields[0]}</DatasetTag>
                        )}
                      </DatasetTags>
                      
                      {expandedDatasets[key] && (
                        <>
                          <BulkActionLink onClick={() => handleBulkAction(key, dataset)}>
                            {getBulkActionText(key, dataset)}
                          </BulkActionLink>
                          <ColumnList>
                            {[...dataset.keyEntities, ...dataset.derivedFields].map(column => (
                              <ColumnItem key={column}>
                                <ColumnCheckbox 
                                  type="checkbox"
                                  checked={selectedColumns[key]?.includes(column) || false}
                                  onChange={() => toggleColumnSelection(key, column)}
                                />
                                {getHumanReadableColumnName(column)}
                              </ColumnItem>
                            ))}
                          </ColumnList>
                        </>
                      )}
                    </DatasetItem>
                  ))}
                </SectionContent>
              </DatasetSection>
            </DatasetModule>
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
          <CanvasContainer 
            ref={canvasRef}
            zoom={zoom}
            panX={panX}
            panY={panY}
            isDragging={isDragging}
          >
            <CanvasContent 
              zoom={zoom}
              panX={panX}
              panY={panY}
              isDragging={isDragging}
            >
              <PreviewCard>
                <TransactionsSection>
                  <TableContainer>
                    <table>
                      <thead>
                        <tr>
                          {getCurrentTableColumns().map((column, index) => (
                            <th key={`${column.datasetKey}-${column.columnName}-${index}`}>
                              {column.display}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            {getCurrentTableColumns().map((column, index) => {
                              const value = getCellValue(transaction, column.key);
                              return (
                                <td key={`${column.datasetKey}-${column.columnName}-${index}`}>
                                  {column.key === 'status' ? (
                                    <span style={{ 
                                      color: value === 'Succeeded' ? 'var(--success-color)' : 
                                            value === 'Failed' ? 'var(--danger-color)' :
                                            value === 'Refunded' ? 'var(--warning-color)' : 
                                            'var(--text-secondary)'
                                    }}>
                                      {value}
                                    </span>
                                  ) : (
                                    value
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableContainer>
                </TransactionsSection>
              </PreviewCard>
            </CanvasContent>
          </CanvasContainer>
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
            </QueryResultsContainer>
          </CodeViewContainer>
        )}

        <ZoomControls>
          <ZoomButton onClick={zoomOut}>−</ZoomButton>
          <span>{Math.round(zoom * 100)}%</span>
          <ZoomButton onClick={zoomIn}>+</ZoomButton>
        </ZoomControls>
      </EditorContainer>
    </>
  );
};

export default MetricEditor; 
