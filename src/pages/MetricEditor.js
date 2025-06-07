import React, { useState, useRef, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';
import { getColumnSchema, convertToMetricEditorFormat } from '../data/reportSchemas';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components including Tooltip
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

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
    'customer': 'Customer',
    'customer_id': 'Customer ID',
    'name': 'Customer',
    'date': 'Date',
    'payment_method': 'Payment method',
    'currency': 'Currency',
    'created_at': 'Created at',
    'net_revenue': 'Net revenue',
    'success_rate': 'Success rate',
    'retry_outcome': 'Retry outcome',
    'email': 'Email',
    'metadata': 'Metadata',
    'default_payment_method': 'Default payment method',
    'last_seen': 'Last seen',
    'LTV': 'LTV',
    'ltv': 'LTV',
    'projected_ltv': 'Projected LTV',
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

const EditorPanel = styled.div`
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 320px;
  background-color: #fafbfc;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  display: flex;
  flex-direction: column;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const PanelHeader = styled.div`
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
`;

const PanelSubtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 0;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1) 0%,
    rgba(248, 250, 252, 0.8) 25%,
    rgba(241, 245, 249, 0.6) 50%,
    rgba(248, 250, 252, 0.8) 75%,
    rgba(255, 255, 255, 1) 100%
  );
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  margin-left: 320px; /* Offset for the fixed panel */
  margin-top: 64px; /* Offset for the top nav */
  height: calc(100vh - 64px);
`;

const CanvasContent = styled.div`
  position: absolute;
  transform: translate(${props => props.panX}px, ${props => props.panY}px) scale(${props => props.zoom});
  transform-origin: 0 0;
  padding: 32px;
  min-width: calc(100vw - 320px);
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

const ModuleContainer = styled.div`
  background-color: white;
  border-radius: 0;
  overflow: hidden;
  width: 100%;
  margin: 0;
`;

const DatasetModule = styled(ModuleContainer)`
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: none;
  border: none;
  height: 100%;
  flex: 1;
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
  padding: 16px 24px;
  background-color: #f8f9fa;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
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
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #fafbfc;
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
  margin: 0;
  padding: 8px 0 16px 0;
  border-top: 1px solid #f0f0f0;
  background-color: #fafbfc;
`;

const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    background-color: #f5f7fa;
    color: var(--text-color);
  }
  
  .column-type {
    margin-left: auto;
    font-size: 11px;
    color: var(--text-secondary);
    background-color: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
  }
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

// New Column Module Components
const ColumnModulesContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 32px;
  min-height: 600px;
  position: relative;
  width: fit-content;
  min-width: 100%;
`;

const ColumnModule = styled.div`
  width: 280px;
  min-height: 400px;
  height: auto;
  border-radius: 12px;
  background: white;
  border: ${props => props.isDragging ? '2px solid rgba(99, 91, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props => props.isDragging ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)'};
  position: absolute;
  left: ${props => `${props.x || 0}px`};
  top: ${props => `${props.y || 0}px`};
  z-index: ${props => props.isDragging ? 1000 : 1};
  cursor: ${props => props.isDragging ? 'grabbing' : 'default'};
  transition: ${props => props.isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'};
  transform: ${props => {
    const scale = props.scale || 1;
    if (props.isDragging) {
      return `scale(${Math.max(scale, 1.02)})`;
    }
    return `scale(${scale})`;
  }};
  overflow: visible; /* Changed from hidden to visible */
  display: flex;
  flex-direction: column;
  
  /* Smooth transitions for position changes when not dragging */
  ${props => !props.isDragging && `
    transition-property: transform, box-shadow, border, left, top;
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  `}
  
  /* Hover effects when not dragging */
  ${props => !props.isDragging && `
    &:hover {
      transform: translateY(-2px) scale(${props.scale || 1});
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  `}
  
  /* Ensure immediate visual feedback during drag */
  ${props => props.isDragging && `
    will-change: transform, left, top;
    pointer-events: none; /* Prevent interference with drag events */
  `}
`;

const ColumnHeader = styled.div`
  padding: 16px 20px 12px 20px;
  cursor: grab;
  user-select: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 250, 252, 0.5);
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    background: rgba(248, 250, 252, 0.8);
  }
  
  /* Ensure all child elements inherit the grab cursor */
  * {
    cursor: inherit;
  }
`;

const ColumnTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ColumnTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const DataTypeIcon = styled.div`
  display: flex;
  align-items: center;
  color: #6B7280;
  
  span {
    color: #6B7280;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 80px;
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

const ColumnContent = styled.div`
  flex: 1;
  padding: 16px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DataRow = styled.div`
  padding: 6px 0;
  font-size: 13px;
  color: #374151;
  line-height: 1.3;
  
  &:hover {
    color: #1F2937;
  }
`;

// Connector System Components
const ConnectorOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
  overflow: visible;
`;

const ConnectorLine = styled.path`
  fill: none;
  stroke: #D8DEE4;
  stroke-width: 1;
  stroke-linecap: round;
`;

const AnchorPoint = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #D8DEE4;
  border: 1px solid white;
  transform: translate(-50%, -50%);
  z-index: 150;
`;

// Column Action Buttons
const ColumnActionContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 32px; /* Increased spacing from column to prevent overlap */
  padding: 8px 16px; /* Reduced padding */
  display: flex;
  gap: 12px; /* Increased gap between buttons */
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 1000;
  pointer-events: auto;
  align-items: center;
  justify-content: center;
`;

// SVG connector for curved button branches
const ButtonBranchConnector = styled.svg`
  position: absolute;
  top: -20px; /* Start above the buttons */
  left: 50%;
  transform: translateX(-50%);
  width: 300px; /* Fixed width to center properly */
  height: 40px;
  pointer-events: none;
  z-index: 999;
  overflow: visible;
`;

const ColumnActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px; /* Slightly smaller padding */
  background: ${props => props.isActive ? '#635DFF' : 'white'};
  color: ${props => props.isActive ? 'white' : '#374151'};
  border: ${props => props.isActive ? 'none' : '1px solid #E5E7EB'};
  border-radius: 20px; /* Slightly smaller border radius */
  font-size: 13px; /* Slightly smaller font */
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  min-width: fit-content; /* Ensure buttons don't overlap */
  flex-shrink: 0; /* Prevent shrinking */
  position: relative; /* For positioning */
  
  &:hover {
    background: ${props => props.isActive ? '#5A52E5' : '#F9FAFB'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    width: 14px; /* Slightly smaller icons */
    height: 14px;
    flex-shrink: 0;
  }
`;

// Insight Container Components
const InsightContainer = styled.div`
  width: ${props => props.type === 'definition' ? '380px' : 
              props.type === 'analysis' ? '420px' : 
              props.type === 'related' ? '360px' : '360px'};
  min-height: auto;
  height: auto;
  border-radius: 12px;
  background: white;
  border: ${props => props.isDragging ? '2px solid rgba(99, 91, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)'};
  box-shadow: ${props => props.isDragging ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)'};
  position: absolute;
  left: ${props => `${props.x || 0}px`};
  top: ${props => `${props.y || 0}px`};
  z-index: ${props => props.isDragging ? 1000 : 1};
  cursor: ${props => props.isDragging ? 'grabbing' : 'default'};
  transition: ${props => props.isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'};
  transform: ${props => {
    const scale = props.scale || 1;
    if (props.isDragging) {
      return `scale(${Math.max(scale, 1.02)})`;
    }
    return `scale(${scale})`;
  }};
  overflow: visible;
  display: flex;
  flex-direction: column;
`;

const InsightHeader = styled.div`
  padding: 16px 20px 12px 20px;
  cursor: grab;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:active {
    cursor: grabbing;
  }
`;

const InsightContent = styled.div`
  padding: 0 20px 20px 20px;
  flex: 1;
`;

const InsightTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const InsightCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f7fa;
    color: #374151;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const InsightText = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
`;

const RelatedColumnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RelatedColumnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RelatedColumnName = styled.span`
  font-weight: 500;
  color: #1F2937;
`;

const RelatedColumnDescription = styled.span`
  color: #6B7280;
  font-size: 12px;
`;

// Mock insight data
const COLUMN_DEFINITIONS = {
  'amount': {
    definition: 'The monetary value of a payment transaction, representing the total amount charged to a customer before fees and adjustments. This field is essential for revenue tracking, financial reporting, and understanding customer spending patterns across all payment methods.',
    schemaCount: 4,
    tables: ['payments', 'invoices', 'refunds', 'charges']
  },
  'customer_id': {
    definition: 'A unique identifier for each customer account, used to link transactions, subscriptions, and billing information across all systems. This primary key enables comprehensive customer analytics, cohort analysis, and relationship mapping between different data entities.',
    schemaCount: 8,
    tables: ['customers', 'payments', 'subscriptions', 'invoices', 'charges', 'refunds', 'usage_records', 'disputes']
  },
  'status': {
    definition: 'The current state of a transaction or process, indicating whether it succeeded, failed, is pending, or requires attention. This field is crucial for monitoring system health, identifying failure patterns, and automating retry logic for failed operations.',
    schemaCount: 6,
    tables: ['payments', 'invoices', 'subscriptions', 'disputes', 'refunds', 'charges']
  },
  'created_at': {
    definition: 'The timestamp when a record was first created in the system, used for chronological ordering and time-based analysis. This field enables time-series reporting, trend analysis, and understanding of business activity patterns across different time periods.',
    schemaCount: 12,
    tables: ['payments', 'customers', 'subscriptions', 'invoices', 'products', 'charges', 'refunds', 'disputes', 'usage_records', 'events', 'coupons', 'plans']
  },
  'ltv': {
    definition: 'Customer Lifetime Value represents the predicted total revenue a customer will generate throughout their relationship with the business. This metric is fundamental for customer acquisition cost optimization, marketing budget allocation, and identifying high-value customer segments.',
    schemaCount: 2,
    tables: ['customers', 'customer_analytics']
  },
  'projected_ltv': {
    definition: 'The forecasted lifetime value of a customer based on current usage patterns, plan tier, and predictive modeling algorithms. This forward-looking metric helps with capacity planning, pricing strategy optimization, and proactive customer success interventions.',
    schemaCount: 3,
    tables: ['customers', 'customer_analytics', 'forecasts']
  }
};

const COLUMN_ANALYSES = {
  'amount': 'Payment amount analysis reveals a 34% increase in average transaction value over the past quarter, driven primarily by enterprise customer upgrades and successful upselling campaigns. The distribution shows a healthy mix across all pricing tiers, with particularly strong performance in the $500-2000 range indicating effective mid-market penetration and pricing strategy alignment.',
  'customer_id': 'Customer engagement patterns show 67% of active users are concentrated in the professional tier, with strong retention indicators among early adopters who demonstrate higher feature adoption rates. Cross-analysis reveals that customers acquired through direct channels demonstrate 23% higher lifetime value compared to those from paid acquisition, suggesting the importance of organic growth channels.',
  'status': 'Transaction status distribution indicates a 96.2% success rate, with the majority of failures attributed to temporary payment method issues rather than systematic problems or integration bugs. Recent improvements to retry logic and payment orchestration have reduced permanent failures by 18% month-over-month, significantly improving customer experience.',
  'created_at': 'Temporal analysis shows peak activity during business hours (9AM-5PM UTC), with Tuesday-Thursday representing 45% of weekly transaction volume reflecting B2B usage patterns. Seasonal trends indicate 28% higher activity in Q4, aligning with budget cycle behaviors in enterprise segments and end-of-year purchasing decisions.',
  'ltv': 'LTV analysis across customer segments reveals that enterprise accounts demonstrate 3.2x higher lifetime value compared to starter plans, with the strongest predictor being API usage velocity within the first 30 days. Professional tier customers show the highest expansion potential, with 67% upgrading within 12 months when they exceed usage limits, indicating effective product-led growth mechanics.',
  'projected_ltv': 'Projected LTV modeling shows strong predictive accuracy with 89% confidence intervals across all customer segments, with API usage serving as the strongest leading indicator for account expansion. Machine learning models suggest focusing retention efforts on accounts with declining usage velocity, as intervention within 14 days of usage decline increases retention probability by 34%.'
};

const COLUMN_RELATIONSHIPS = {
  'amount': [
    { name: 'currency', description: 'Payment currency code', type: 'string' },
    { name: 'payment_method', description: 'Method used for payment', type: 'string' },
    { name: 'fee_amount', description: 'Processing fees charged', type: 'number' },
    { name: 'net_amount', description: 'Amount after fees and taxes', type: 'number' }
  ],
  'customer_id': [
    { name: 'customer_email', description: 'Customer email address', type: 'string' },
    { name: 'customer_name', description: 'Customer display name', type: 'string' },
    { name: 'account_type', description: 'Customer account tier', type: 'string' },
    { name: 'signup_date', description: 'Customer registration date', type: 'date' },
    { name: 'last_login', description: 'Most recent login timestamp', type: 'date' }
  ],
  'status': [
    { name: 'failure_reason', description: 'Reason for failed transactions', type: 'string' },
    { name: 'retry_count', description: 'Number of retry attempts', type: 'number' },
    { name: 'updated_at', description: 'Last status change timestamp', type: 'date' },
    { name: 'processor_response', description: 'Payment processor response code', type: 'string' }
  ],
  'created_at': [
    { name: 'updated_at', description: 'Last modification timestamp', type: 'date' },
    { name: 'processed_at', description: 'Processing completion time', type: 'date' },
    { name: 'timezone', description: 'Customer timezone for proper scheduling', type: 'string' },
    { name: 'date_range', description: 'Applicable date range for reports', type: 'string' }
  ],
  'date': [
    { name: 'created_at', description: 'Record creation timestamp', type: 'date' },
    { name: 'updated_at', description: 'Last modification time', type: 'date' },
    { name: 'processed_at', description: 'Processing completion timestamp', type: 'date' },
    { name: 'due_date', description: 'Expected completion date', type: 'date' }
  ],
  'customer': [
    { name: 'customer_id', description: 'Unique customer identifier', type: 'string' },
    { name: 'customer_email', description: 'Customer email address', type: 'string' },
    { name: 'account_type', description: 'Customer account tier', type: 'string' },
    { name: 'signup_date', description: 'Customer registration date', type: 'date' }
  ],
  'ltv': [
    { name: 'mrr', description: 'Monthly recurring revenue', type: 'number' },
    { name: 'churn_risk', description: 'Probability of customer churning', type: 'string' },
    { name: 'account_age', description: 'Duration as active customer', type: 'string' },
    { name: 'expansion_score', description: 'Likelihood of account growth', type: 'percentage' }
  ],
  'projected_ltv': [
    { name: 'current_ltv', description: 'Actual lifetime value to date', type: 'number' },
    { name: 'growth_rate', description: 'Revenue growth trajectory', type: 'percentage' },
    { name: 'usage_trend', description: 'Product usage trend analysis', type: 'string' },
    { name: 'retention_score', description: 'Customer retention probability', type: 'percentage' }
  ]
};

// Utility functions for insights

// Function to find which datasets contain a specific column
const getDatasetsForColumn = (columnKey) => {
  const datasetsWithColumn = [];
  
  // Create a mapping for better column matching
  const columnMappings = {
    'customer': ['customer_id', 'email'],
    'date': ['created_at', 'due_date', 'arrival_date'],
    'amount': ['amount', 'subtotal', 'total', 'net_revenue'],
    'status': ['status'],
    'current_mrr': ['MRR', 'MRR (if applicable)', 'churned_MRR'],
    'usage_growth': ['usage_record', 'usage_overage', 'usage_type'],
    'projected_ltv': ['LTV', 'effective_ARPU']
  };
  
  // Get possible column names for this key
  const possibleColumnNames = columnMappings[columnKey] || [columnKey];
  
  Object.entries(DATASETS).forEach(([datasetKey, dataset]) => {
    const allColumns = [...dataset.keyEntities, ...dataset.derivedFields];
    
    // Check if any of the possible column names exist in this dataset
    const hasColumn = possibleColumnNames.some(colName => 
      allColumns.some(datasetCol => 
        datasetCol.toLowerCase().includes(colName.toLowerCase()) ||
        colName.toLowerCase().includes(datasetCol.toLowerCase())
      )
    );
    
    if (hasColumn) {
      datasetsWithColumn.push({
        key: datasetKey,
        name: dataset.name,
        columnCount: dataset.columnCount
      });
    }
  });
  
  // Enhanced fallback if no exact matches found
  if (datasetsWithColumn.length === 0) {
    if (columnKey.includes('customer') || columnKey.includes('email')) {
      datasetsWithColumn.push({ 
        key: 'customers', 
        name: 'Customers', 
        columnCount: 10 
      });
      datasetsWithColumn.push({ 
        key: 'payments-general', 
        name: 'Payments (General)', 
        columnCount: 10 
      });
    } else if (columnKey.includes('amount') || columnKey.includes('payment') || columnKey.includes('mrr')) {
      datasetsWithColumn.push({ 
        key: 'payments-general', 
        name: 'Payments (General)', 
        columnCount: 10 
      });
      datasetsWithColumn.push({ 
        key: 'mrr-customer-revenue', 
        name: 'MRR & Customer Revenue', 
        columnCount: 6 
      });
    } else if (columnKey.includes('invoice')) {
      datasetsWithColumn.push({ 
        key: 'invoices', 
        name: 'Invoices', 
        columnCount: 8 
      });
    } else if (columnKey.includes('usage') || columnKey.includes('growth')) {
      datasetsWithColumn.push({ 
        key: 'hybrid-billing-summary', 
        name: 'Hybrid Billing Summary', 
        columnCount: 8 
      });
      datasetsWithColumn.push({ 
        key: 'subscription-lifecycle', 
        name: 'Subscription Lifecycle', 
        columnCount: 8 
      });
    } else if (columnKey.includes('ltv') || columnKey.includes('projected')) {
      datasetsWithColumn.push({ 
        key: 'customers', 
        name: 'Customers', 
        columnCount: 10 
      });
      datasetsWithColumn.push({ 
        key: 'mrr-customer-revenue', 
        name: 'MRR & Customer Revenue', 
        columnCount: 6 
      });
    } else {
      // Default fallback - add some common datasets
      datasetsWithColumn.push({ 
        key: 'payments-general', 
        name: 'Payments (General)', 
        columnCount: 10 
      });
      datasetsWithColumn.push({ 
        key: 'customers', 
        name: 'Customers', 
        columnCount: 10 
      });
    }
  }
  
  return datasetsWithColumn.slice(0, 3); // Limit to 3 datasets
};

// Function to generate chart type based on analysis text
const getChartTypeFromAnalysis = (analysisText) => {
  const text = analysisText.toLowerCase();
  
  if (text.includes('growth') || text.includes('trend') || text.includes('time') || text.includes('over')) {
    return 'line';
  } else if (text.includes('distribution') || text.includes('pattern') || text.includes('across')) {
    return 'bar';
  } else if (text.includes('comparison') || text.includes('versus') || text.includes('compare')) {
    return 'grouped-bar';
  } else if (text.includes('composition') || text.includes('breakdown') || text.includes('percentage')) {
    return 'pie';
  } else {
    return 'bar'; // Default
  }
};

// Function to generate chart data based on analysis and column data
const generateAnalysisChart = (analysisText, columnKey, data) => {
  const chartType = getChartTypeFromAnalysis(analysisText);
  
  switch (chartType) {
    case 'line':
      return {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: getHumanReadableColumnName(columnKey),
            data: [65, 59, 80, 81, 56, 75],
            borderColor: '#635DFF',
            backgroundColor: 'rgba(99, 93, 255, 0.1)',
            fill: true,
            tension: 0.4
          }]
        }
      };
    case 'grouped-bar':
    return {
      type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            {
              label: 'Current Year',
              data: [45, 52, 38, 67],
              backgroundColor: '#635DFF'
            },
            {
              label: 'Previous Year',
              data: [38, 45, 42, 58],
              backgroundColor: '#A5B4FC'
            }
          ]
        }
      };
    case 'pie':
      return {
        type: 'pie',
        data: {
          labels: ['Starter', 'Pro', 'Enterprise', 'Developer'],
        datasets: [{ 
            data: [30, 45, 15, 10],
            backgroundColor: ['#635DFF', '#A5B4FC', '#E0E7FF', '#F1F5F9']
        }] 
      }
    };
    default:
      return {
        type: 'bar',
        data: {
          labels: ['Category A', 'Category B', 'Category C', 'Category D'],
          datasets: [{
            label: getHumanReadableColumnName(columnKey),
            data: [25, 42, 35, 28],
            backgroundColor: '#635DFF'
          }]
        }
      };
  }
};

const getInsightData = (columnKey, type) => {
  switch (type) {
    case 'definition':
      const datasets = getDatasetsForColumn(columnKey);
      return {
        definition: COLUMN_DEFINITIONS[columnKey]?.definition || `${getHumanReadableColumnName(columnKey)} represents a key data point used for business analysis and reporting. This field provides essential information for understanding operational metrics and driving data-driven decision making.`,
        datasetCount: datasets.length,
        datasets: datasets.map(ds => ({ ...ds, name: ds.name })) // Remove column count from display
      };
    case 'analysis':
      return COLUMN_ANALYSES[columnKey] || `Analysis of ${getHumanReadableColumnName(columnKey)} shows consistent patterns with moderate growth trends and stable performance metrics across the reporting period. The data indicates healthy usage patterns with opportunities for optimization in key areas that could drive improved business outcomes.`;
    case 'related':
      // Enhanced fallback relationships based on common column patterns
      const commonRelationships = {
        'date': [
          { name: 'created_at', description: 'Record creation timestamp', type: 'date' },
          { name: 'updated_at', description: 'Last modification time', type: 'date' },
          { name: 'processed_at', description: 'Processing completion timestamp', type: 'date' },
          { name: 'due_date', description: 'Expected completion date', type: 'date' }
        ],
        'customer': [
          { name: 'customer_id', description: 'Unique customer identifier', type: 'string' },
          { name: 'customer_email', description: 'Customer email address', type: 'string' },
          { name: 'account_type', description: 'Customer account tier', type: 'string' },
          { name: 'signup_date', description: 'Customer registration date', type: 'date' }
        ],
        'amount': [
          { name: 'currency', description: 'Transaction currency code', type: 'string' },
          { name: 'payment_method', description: 'Payment processing method', type: 'string' },
          { name: 'fee_amount', description: 'Processing fees applied', type: 'number' },
          { name: 'net_amount', description: 'Amount after fees and taxes', type: 'number' }
        ],
        'status': [
          { name: 'failure_reason', description: 'Reason for failed transactions', type: 'string' },
          { name: 'retry_count', description: 'Number of retry attempts', type: 'number' },
          { name: 'updated_at', description: 'Status change timestamp', type: 'date' },
          { name: 'processor_response', description: 'Payment processor code', type: 'string' }
        ]
      };
      
      // Try to match based on column key patterns
      for (const [pattern, relationships] of Object.entries(commonRelationships)) {
        if (columnKey.toLowerCase().includes(pattern)) {
          return relationships;
        }
      }
      
      // Default fallback with realistic field names
      return COLUMN_RELATIONSHIPS[columnKey] || [
        { name: 'transaction_id', description: 'Primary transaction identifier', type: 'string' },
        { name: 'created_at', description: 'Record creation timestamp', type: 'date' },
        { name: 'source_system', description: 'Originating system reference', type: 'string' }
      ];
    default:
      return null;
  }
};

const calculateInsightPosition = (columnPosition, columnIndex, insightType, existingInsights) => {
  const baseX = columnPosition.x;
  
  // MUCH MORE REALISTIC COLUMN HEIGHT CALCULATION
  // Column has min-height: 400px but with header (44px) + content (16px padding top/bottom) + data rows
  // Typical column will be much taller - let's use a more realistic estimate
  const columnHeaderHeight = 44; // Header with padding
  const columnContentPadding = 36; // 16px top + 20px bottom
  const dataRowHeight = 25; // Each data row is about 25px (6px padding top/bottom + 13px font)
  const numberOfRows = 15; // Typical number of data rows shown
  const columnMinHeight = 400;
  
  // Calculate realistic column height
  const estimatedContentHeight = columnHeaderHeight + columnContentPadding + (dataRowHeight * numberOfRows);
  const actualColumnHeight = Math.max(columnMinHeight, estimatedContentHeight);
  
  // MUCH MORE SPACE for buttons area - they're positioned with top: 100% + margin-top: 4px + button height
  const buttonHeight = 44; // Button height + padding
  const buttonMargin = 4; // margin-top from styling
  const extraSpaceBuffer = 40; // Extra buffer to ensure no overlap
  const buttonAreaHeight = buttonHeight + buttonMargin + extraSpaceBuffer;
  
  const baseY = columnPosition.y + actualColumnHeight + buttonAreaHeight;
  
  console.log('🏗️ COLUMN HEIGHT CALCULATION:', {
    insightType,
    columnPosition,
    columnMinHeight,
    estimatedContentHeight,
    actualColumnHeight,
    buttonAreaHeight,
    totalSpaceFromTop: actualColumnHeight + buttonAreaHeight,
    baseY
  });
  
  // Offset based on insight type to avoid overlap
  const typeOffsets = {
    'definition': { x: -120, y: 0 },
    'analysis': { x: 0, y: 0 },
    'related': { x: 120, y: 0 }
  };
  
  const offset = typeOffsets[insightType] || { x: 0, y: 0 };
  
  // Initial position
  let finalX = baseX + offset.x;
  let finalY = baseY + offset.y;
  
  // DRAMATIC SPACING INCREASE - 120px gap instead of 40px
  const minGap = 120; // DRAMATICALLY INCREASED GAP
  
  console.log('🚀 DRAMATIC COLLISION DETECTION START:', {
    insightType,
    initialPosition: { x: finalX, y: finalY },
    existingContainers: Object.keys(existingInsights || {}),
    minGap
  });
  
  // Collision detection with existing containers
  if (existingInsights && Object.keys(existingInsights).length > 0) {
    const containerWidth = insightType === 'definition' ? 380 : 
                          insightType === 'analysis' ? 420 : 
                          insightType === 'dataset' ? 380 :
                          insightType === 'chart' ? 420 : 360;
    const containerHeight = insightType === 'dataset' ? 300 :
                           insightType === 'chart' ? 350 : 200;
    
    console.log('📏 Container dimensions:', {
      width: containerWidth,
      height: containerHeight,
      type: insightType
    });
    
    // SIMPLE APPROACH: Just stack everything vertically with big gaps
    let maxBottomY = finalY;
    
    for (const existing of Object.values(existingInsights)) {
      if (!existing.position) continue;
      
      const existingHeight = getContainerHeight(existing) || 200;
      const existingBottom = existing.position.y + existingHeight;
      
      console.log('📦 Checking existing container:', {
        id: existing.id,
        type: existing.type,
        position: existing.position,
        height: existingHeight,
        bottom: existingBottom
      });
      
      if (existingBottom > maxBottomY) {
        maxBottomY = existingBottom;
      }
    }
    
    // If there are existing containers, place this one well below the lowest one
    if (maxBottomY > finalY) {
      finalY = maxBottomY + minGap;
      console.log('📍 MOVED DOWN - New Y position:', finalY);
    }
    
    console.log('✅ FINAL POSITION CALCULATED:', {
      x: finalX,
      y: finalY,
      movedDown: maxBottomY > baseY + offset.y
    });
  }
  
  return {
    x: finalX,
    y: finalY
  };
};

// Helper function to get container height (moved up here for calculateInsightPosition to use)
const getContainerHeight = (container) => {
  if (!container) return 200;
  
  // Calculate actual heights based on content
  if (container.type === 'dataset') {
    // Header: 16px top + 12px bottom padding + text height ≈ 44px
    // Content per item: 8px top/bottom padding + 16px text ≈ 32px per row  
    // Section headers: 12px top + 4px bottom padding + text ≈ 24px each
    const headerHeight = 44;
    const sectionHeaderHeight = 24;
    const itemHeight = 32;
    const keyEntities = container.dataset?.keyEntities?.length || 0;
    const derivedFields = container.dataset?.derivedFields?.length || 0;
    
    let contentHeight = headerHeight;
    if (keyEntities > 0) {
      contentHeight += sectionHeaderHeight + (keyEntities * itemHeight);
    }
    if (derivedFields > 0) {
      contentHeight += sectionHeaderHeight + (derivedFields * itemHeight);
    }
    
    return Math.max(200, contentHeight + 20); // 20px bottom padding
  }
  
  if (container.type === 'chart') {
    // Header + chart visualization (250px) + footer info ≈ 350px
    return 350;
  }
  
  if (container.type === 'definition') {
    // Calculate based on text content length and dataset count
    const textLength = container.data?.definition?.length || 100;
    const datasetCount = container.data?.datasetCount || 0;
    const baseHeight = 120; // Header + padding
    const textHeight = Math.max(60, Math.ceil(textLength / 60) * 20); // Rough estimate
    const datasetRowsHeight = datasetCount * 50 + 30; // Each dataset row + header
    return baseHeight + textHeight + datasetRowsHeight;
  }
  
  if (container.type === 'analysis') {
    // Calculate based on analysis text length
    const textLength = container.data?.length || 200;
    const baseHeight = 120;
    const textHeight = Math.max(80, Math.ceil(textLength / 50) * 20);
    return baseHeight + textHeight;
  }
  
  if (container.type === 'related') {
    // Header + (number of items * item height) + padding
    const itemCount = container.data?.length || 3;
    return 120 + (itemCount * 60); // 60px per related column row
  }
  
  return 200; // Default fallback
};

// Mesh gradient generator
const generateMeshGradient = (index) => {
  const gradients = [
    `radial-gradient(at 40% 20%, hsla(228,100%,74%,1) 0px, transparent 50%),
     radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
     radial-gradient(at 40% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
     radial-gradient(at 90% 30%, hsla(340,100%,76%,1) 0px, transparent 50%),
     radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
     radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
     radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)`,
    
    `radial-gradient(at 20% 30%, hsla(191,100%,78%,1) 0px, transparent 50%),
     radial-gradient(at 70% 20%, hsla(329,100%,80%,1) 0px, transparent 50%),
     radial-gradient(at 30% 80%, hsla(270,100%,82%,1) 0px, transparent 50%),
     radial-gradient(at 80% 80%, hsla(45,100%,76%,1) 0px, transparent 50%),
     radial-gradient(at 10% 90%, hsla(200,100%,70%,1) 0px, transparent 50%),
     radial-gradient(at 90% 10%, hsla(310,100%,75%,1) 0px, transparent 50%)`,
    
    `radial-gradient(at 60% 10%, hsla(120,100%,75%,1) 0px, transparent 50%),
     radial-gradient(at 20% 60%, hsla(260,100%,78%,1) 0px, transparent 50%),
     radial-gradient(at 90% 50%, hsla(30,100%,80%,1) 0px, transparent 50%),
     radial-gradient(at 50% 90%, hsla(180,100%,70%,1) 0px, transparent 50%),
     radial-gradient(at 10% 20%, hsla(300,100%,72%,1) 0px, transparent 50%)`,
    
    `radial-gradient(at 30% 40%, hsla(150,100%,73%,1) 0px, transparent 50%),
     radial-gradient(at 80% 60%, hsla(210,100%,77%,1) 0px, transparent 50%),
     radial-gradient(at 10% 70%, hsla(60,100%,78%,1) 0px, transparent 50%),
     radial-gradient(at 70% 10%, hsla(330,100%,74%,1) 0px, transparent 50%),
     radial-gradient(at 50% 50%, hsla(240,100%,71%,1) 0px, transparent 50%)`,
     
    `radial-gradient(at 50% 20%, hsla(90,100%,76%,1) 0px, transparent 50%),
     radial-gradient(at 20% 80%, hsla(280,100%,79%,1) 0px, transparent 50%),
     radial-gradient(at 90% 70%, hsla(15,100%,75%,1) 0px, transparent 50%),
     radial-gradient(at 30% 30%, hsla(195,100%,73%,1) 0px, transparent 50%),
     radial-gradient(at 70% 90%, hsla(315,100%,77%,1) 0px, transparent 50%)`
  ];
  
  return gradients[index % gradients.length];
};

// Generate bezier curve path for connectors
const generateConnectorPath = (startPoint, endPoint) => {
  const { x: x1, y: y1 } = startPoint;
  const { x: x2, y: y2 } = endPoint;
  
  // For vertical connections (bottom to top), create proper S-curve with vertical control points
  const verticalDistance = Math.abs(y2 - y1);
  const verticalOffset = Math.min(verticalDistance * 0.4, 80); // Control the curve smoothness
  
  // Control points should have vertical offsets for clean S-curve
  const cp1x = x1;
  const cp1y = y1 + verticalOffset; // Move down from start point
  const cp2x = x2; 
  const cp2y = y2 - verticalOffset; // Move up from end point
  
  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
};

// Data type icon function from ReportDetail.js
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
  border-radius: 0;
  box-shadow: none;
  border: none;
  overflow: visible;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SchemaSearchContainer = styled.div`
  padding: 16px 24px;
  position: relative;
  border-bottom: 1px solid var(--border-color);
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
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
  left: 36px;
  top: 26px;
  color: var(--text-secondary);
`;

const TableList = styled.div`
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
`;

const TableItem = styled.div`
  margin-bottom: 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  width: 100%;
  
  span {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 500;
    font-size: 14px;
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
  padding: 16px 24px;
  background: none;
  border: none;
  color: #8257fe;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(130, 87, 254, 0.05);
  }
`;

const CodeViewContainer = styled.div`
  flex: 1;
  margin-left: 320px; /* Offset for the fixed panel */
  margin-top: 64px; /* Offset for the top nav */
  padding: 32px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1) 0%,
    rgba(248, 250, 252, 0.8) 25%,
    rgba(241, 245, 249, 0.6) 50%,
    rgba(248, 250, 252, 0.8) 75%,
    rgba(255, 255, 255, 1) 100%
  );
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

// Helper function to calculate median
const calculateMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Chart data generation functions
const generateTimeSeriesData = (values) => {
  const timePoints = ['Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28'];
  const dataPoints = [45, 52, 38, 67, 43, 71, 58];
  
  return {
    labels: timePoints,
    datasets: [{
      data: dataPoints,
      borderColor: '#D8DEE4',
      backgroundColor: 'rgba(216, 222, 228, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 4,
      borderWidth: 2,
      pointBackgroundColor: '#D8DEE4',
      pointBorderColor: '#D8DEE4'
    }]
  };
};

const generateCategoryChartData = (categoryCount) => {
  const entries = Object.entries(categoryCount).slice(0, 4);
  if (entries.length === 0) {
    // Fallback data
    return {
      labels: ['Enterprise', 'Pro', 'Starter', 'Developer'],
      datasets: [{
        data: [8, 12, 6, 4],
        backgroundColor: '#D8DEE4',
        borderRadius: 2,
        borderWidth: 0
      }]
    };
  }
  
  return {
    labels: entries.map(([cat]) => cat),
    datasets: [{
      data: entries.map(([, count]) => count),
      backgroundColor: '#D8DEE4',
      borderRadius: 2,
      borderWidth: 0
    }]
  };
};

const generateNumberDistributionData = (values, min, max) => {
  // Simplified histogram with static data for now
  const histogram = [5, 12, 18, 25, 15, 8, 3];
  
  return {
    labels: ['0-50', '50-100', '100-150', '150-200', '200-250', '250-300', '300+'],
    datasets: [{
      data: histogram,
      backgroundColor: '#635DFF',
      borderRadius: 2,
      borderWidth: 0
    }]
  };
};
// Enhanced analysis function matching ReportDetail.js
const analyzeColumnData = (column, data) => {
  console.log('🎯 START analyzeColumnData - function called!');
  console.log('🔍 Analyzing column:', column?.display, 'Type:', column?.type, 'DataType:', column?.dataType);
  console.log('📊 Data sample:', data?.slice(0, 2));
  
  if (!data || !Array.isArray(data) || !column) {
    console.log('❌ No data or column available');
    return {
      type: 'bar',
      summary: 'No data available',
      chartData: { 
        labels: ['No data'], 
        datasets: [{ data: [0], backgroundColor: '#F5F6F8' }] 
      }
    };
  }

  const values = data.map(row => row && row[column.key]).filter(val => val !== null && val !== undefined);
  console.log('📈 Extracted values:', values.slice(0, 5), 'Total:', values.length);
  
  if (values.length === 0) {
    console.log('❌ No values found');
    return {
      type: 'bar',
      summary: '0 values',
      chartData: { 
        labels: ['No data'], 
        datasets: [{ data: [0], backgroundColor: '#F5F6F8' }] 
      }
    };
  }
  
  const columnType = column.dataType || column.type || 'string';
  console.log('🎯 Using column type:', columnType);
  
  switch (columnType) {
    case 'string':
      const uniqueCount = new Set(values).size;
      console.log('📝 String analysis:', uniqueCount, 'unique values');
      return {
        type: 'line',
        summary: `${uniqueCount} unique values`,
        chartData: generateTimeSeriesData(values)
      };
      
    case 'category':
      const categoryCount = {};
      values.forEach(val => {
        categoryCount[val] = (categoryCount[val] || 0) + 1;
      });
      
      const filteredCategoryCount = new Set(values).size;
      console.log('📋 Category analysis:', filteredCategoryCount, 'categories', categoryCount);
      return {
        type: 'category',
        summary: `${filteredCategoryCount} ${filteredCategoryCount === 1 ? 'category' : 'categories'}`,
        chartData: generateCategoryChartData(categoryCount),
        rawData: categoryCount
      };
      
    case 'number':
    case 'currency':
      const numericValues = values.filter(val => typeof val === 'number' && !isNaN(val));
      console.log('🔢 Numeric analysis:', numericValues.length, 'numeric values');
      
      if (numericValues.length === 0) {
        return {
          type: 'bar',
          summary: '0 numeric values',
          chartData: { 
            labels: ['No data'], 
            datasets: [{ data: [0], backgroundColor: '#F5F6F8' }] 
          }
        };
      }
      
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const medianValue = calculateMedian(numericValues);
      
      let summaryText = `${numericValues.length} values`;
      let medianText = '';
      
      if (columnType === 'currency' || column.isCurrency) {
        medianText = `median $${medianValue.toLocaleString()}`;
      } else {
          medianText = `median ${Math.round(medianValue).toLocaleString()}`;
      }
      
      return {
        type: 'bar',
        summary: summaryText,
        median: medianText,
        chartData: generateNumberDistributionData(numericValues, min, max)
      };
      
    case 'date':
      console.log('📅 Date analysis:', values.length, 'dates');
      return {
        type: 'line',
        summary: `${values.length} dates`,
        chartData: generateTimeSeriesData(values)
      };
      
    default:
      console.log('❓ Default analysis for type:', columnType);
      return {
        type: 'bar',
        summary: `${values.length} items`,
        chartData: { 
          labels: ['Data'], 
          datasets: [{ 
            data: [values.length], 
            backgroundColor: '#635DFF',
            borderRadius: 2
          }] 
        }
      };
  }

  // Fallback to ensure we always return something
  console.log('🆘 Fallback return triggered');
  return {
    type: 'bar',
    summary: 'Fallback data',
    chartData: { 
      labels: ['Fallback'], 
      datasets: [{ 
        data: [1], 
        backgroundColor: '#635DFF',
        borderRadius: 2
      }] 
    }
  };
};


const MetricEditor = () => {
  console.log('🚀 MetricEditor component rendering...');
  
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  // Extract the correct ID based on whether this is a metric or report
  // Routes: /metrics/:metricId/edit and /data-studio/:reportId/edit
  const isEditingReport = location.pathname.includes('/data-studio/');
  const currentId = isEditingReport ? params.reportId : params.metricId;

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
  
  // Column module state
  const [columnPositions, setColumnPositions] = useState({});
  const [draggingColumn, setDraggingColumn] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isColumnDragging, setIsColumnDragging] = useState(false);
  
  // Column action button hover state
  const [hoveredColumn, setHoveredColumn] = useState(null);
  
  // Insight containers state
  const [insightContainers, setInsightContainers] = useState({});
  const [draggingInsight, setDraggingInsight] = useState(null);
  const [insightDragOffset, setInsightDragOffset] = useState({ x: 0, y: 0 });
  const [isInsightDragging, setIsInsightDragging] = useState(false);
  
  // Enhanced container states for the connector system
  const [datasetContainers, setDatasetContainers] = useState({});
  const [chartContainers, setChartContainers] = useState({});
  const [insightHoverStates, setInsightHoverStates] = useState({});
  const [draggingDataset, setDraggingDataset] = useState(null);
  const [draggingChart, setDraggingChart] = useState(null);
  const [isDatasetDragging, setIsDatasetDragging] = useState(false);
  const [isChartDragging, setIsChartDragging] = useState(false);
  const [datasetDragOffset, setDatasetDragOffset] = useState({ x: 0, y: 0 });
  const [chartDragOffset, setChartDragOffset] = useState({ x: 0, y: 0 });
  const [containerConnections, setContainerConnections] = useState({}); // Track parent-child relationships
  
  // Debug wrapper for setHoveredColumn
  const setHoveredColumnDebug = useCallback((columnKey) => {
    console.log('🔄 setHoveredColumn called:', columnKey, 'previous:', hoveredColumn);
    setHoveredColumn(columnKey);
  }, [hoveredColumn]);
  
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

  // Tooltip management functions (from MetricDetail)
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

  // Clean up tooltips on unmount
  useEffect(() => {
    return () => {
      hideAllTooltips();
    };
  }, [hideAllTooltips]);

  // Chart options with tooltip functionality (from MetricDetail)
  const getChartOptions = useCallback((type, column = null) => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'point'
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
          borderWidth: 0,
          borderRadius: 2
        }
      },
      animation: { duration: 0 }
    };
  }, [showCustomTooltip, hideAllTooltips]);

  // Helper function to render data visualization based on analysis
  const renderDataVisualization = useCallback((analysis, column) => {
    if (!analysis || !analysis.chartData) {
      return <div style={{ width: '100%', height: '80px', background: '#F5F6F8', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9CA3AF' }}>No chart data</div>;
    }
    
    try {
      switch (analysis.type) {
        case 'line':
          return (
            <Line
              data={analysis.chartData}
              options={getChartOptions('line', column)}
            />
          );
        case 'bar':
          return (
            <Bar
              data={analysis.chartData}
              options={getChartOptions('bar', column)}
            />
          );
        case 'category':
          return (
            <Bar
              data={analysis.chartData}
              options={getChartOptions('bar', column)}
            />
          );
        default:
          return (
            <Bar
              data={analysis.chartData}
              options={getChartOptions('bar', column)}
            />
          );
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
      // Fallback to simple visualization
      return (
        <div style={{ 
          width: '100%', 
          height: '80px', 
          background: 'linear-gradient(45deg, #635DFF 0%, rgba(99, 93, 255, 0.1) 100%)', 
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px'
          }} />
        </div>
      );
    }
  }, [getChartOptions]);

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
    if (isColumnDragging) return;
    if (e.target === canvasRef.current || canvasRef.current?.contains(e.target)) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isColumnDragging]);

  const handleMouseMove = useCallback((e) => {
    if (isColumnDragging) return;
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos, isColumnDragging]);

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

  // Column hover detection function
  const checkColumnHover = useCallback((e, columnKey, columnElement) => {
    if (isColumnDragging) return false;
    
    const rect = columnElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is within hover zones:
    // - Within 30px of left, top, or right edges
    // - Within 100px of bottom edge
    const nearLeftEdge = mouseX <= 30;
    const nearTopEdge = mouseY <= 30;
    const nearRightEdge = mouseX >= rect.width - 30;
    const nearBottomEdge = mouseY >= rect.height - 100;
    
    const shouldShow = nearLeftEdge || nearTopEdge || nearRightEdge || nearBottomEdge;
    
    console.log('🎯 Hover detection for', columnKey, {
      mouseX: Math.round(mouseX),
      mouseY: Math.round(mouseY),
      width: rect.width,
      height: rect.height,
      nearLeftEdge,
      nearTopEdge,
      nearRightEdge,
      nearBottomEdge,
      shouldShow
    });
    
    return shouldShow;
  }, [isColumnDragging]);

  // Column mouse event handlers
  const handleColumnHoverEnter = useCallback((e, columnKey) => {
    if (isColumnDragging) {
      console.log('🚫 Hover enter blocked - column dragging');
          return;
        }
        
    console.log('🎯 Mouse entered column:', columnKey, 'current hoveredColumn:', hoveredColumn);
    const columnElement = e.currentTarget;
    if (checkColumnHover(e, columnKey, columnElement)) {
      console.log('✅ Setting hovered column to:', columnKey);
      setHoveredColumnDebug(columnKey);
    } else {
      console.log('❌ Hover check failed for:', columnKey);
    }
  }, [isColumnDragging, checkColumnHover, hoveredColumn, setHoveredColumnDebug]);

  const handleColumnHoverMove = useCallback((e, columnKey) => {
    if (isColumnDragging) return;
    
    const columnElement = e.currentTarget;
    const shouldShowButtons = checkColumnHover(e, columnKey, columnElement);
    
    console.log('🔄 Mouse move on column:', columnKey, 'shouldShow:', shouldShowButtons, 'currentHovered:', hoveredColumn);
    
    if (shouldShowButtons && hoveredColumn !== columnKey) {
      console.log('✅ Setting hovered column to:', columnKey, '(from move)');
      setHoveredColumnDebug(columnKey);
    } else if (!shouldShowButtons && hoveredColumn === columnKey) {
      console.log('❌ Clearing hovered column from:', columnKey, '(from move)');
      setHoveredColumnDebug(null);
    }
  }, [isColumnDragging, checkColumnHover, hoveredColumn, setHoveredColumnDebug]);

  const handleColumnHoverLeave = useCallback((e, columnKey) => {
    console.log('🎯 Mouse left column:', columnKey, 'current hoveredColumn:', hoveredColumn);
    // Small delay to allow moving to buttons
    setTimeout(() => {
      console.log('🕐 Timeout executing for leave:', columnKey, 'current hoveredColumn:', hoveredColumn);
      if (hoveredColumn === columnKey) {
        console.log('❌ Clearing hovered column from:', columnKey, '(from leave)');
        setHoveredColumnDebug(null);
      }
    }, 100);
  }, [hoveredColumn, setHoveredColumnDebug]);

  // Button action handlers (placeholder for now)
  const handleDefineClick = useCallback((columnKey) => {
    console.log('🎯 DEFINE BUTTON CLICKED for column:', columnKey);
    const columnPosition = columnPositions[columnKey];
    if (!columnPosition) return;
    
    const insightId = `${columnKey}-definition`;
    
    // Check if insight already exists
    if (insightContainers[insightId]) {
      console.log('Definition insight already exists for column:', columnKey);
      return;
    }
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      // Pass ALL existing containers for collision detection
      const allExistingContainers = {
        ...insightContainers,
        ...datasetContainers,
        ...chartContainers
      };
      
      console.log('🔍 ALL EXISTING CONTAINERS:', Object.keys(allExistingContainers));
      
      const position = calculateInsightPosition(columnPosition, 0, 'definition', allExistingContainers);
      const insightData = getInsightData(columnKey, 'definition');
      
      console.log('📍 CREATING DEFINITION CONTAINER AT:', position);
      
      setInsightContainers(prev => ({
        ...prev,
        [insightId]: {
          id: insightId,
          type: 'definition',
          columnKey,
          title: 'Definition',
          data: insightData,
          position,
          contentWidth: 380
        }
      }));
    }, 50); // Small delay to ensure state consistency
  }, [columnPositions, insightContainers, datasetContainers, chartContainers]);

  const handleAnalyzeClick = useCallback((columnKey) => {
    console.log('🎯 ANALYZE BUTTON CLICKED for column:', columnKey);
    const columnPosition = columnPositions[columnKey];
    if (!columnPosition) return;
    
    const insightId = `${columnKey}-analysis`;
    
    // Check if insight already exists
    if (insightContainers[insightId]) {
      console.log('Analysis insight already exists for column:', columnKey);
      return;
    }
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      // Pass ALL existing containers for collision detection
      const allExistingContainers = {
        ...insightContainers,
        ...datasetContainers,
        ...chartContainers
      };
      
      console.log('🔍 ALL EXISTING CONTAINERS:', Object.keys(allExistingContainers));
      
      const position = calculateInsightPosition(columnPosition, 0, 'analysis', allExistingContainers);
      const insightData = getInsightData(columnKey, 'analysis');
      
      console.log('📍 CREATING ANALYSIS CONTAINER AT:', position);
      
      setInsightContainers(prev => ({
        ...prev,
        [insightId]: {
          id: insightId,
          type: 'analysis',
          columnKey,
          title: 'Analysis',
          data: insightData,
          position,
          contentWidth: 420
        }
      }));
    }, 50); // Small delay to ensure state consistency
  }, [columnPositions, insightContainers, datasetContainers, chartContainers]);

  const handleRelatedClick = useCallback((columnKey) => {
    console.log('Related clicked for column:', columnKey);
    const columnPosition = columnPositions[columnKey];
    if (!columnPosition) return;
    
    const insightId = `${columnKey}-related`;
    
    // Check if insight already exists
    if (insightContainers[insightId]) {
      console.log('Related insight already exists for column:', columnKey);
      return;
    }
    
    // Pass ALL existing containers for collision detection
    const allExistingContainers = {
      ...insightContainers,
      ...datasetContainers,
      ...chartContainers
    };
    
    const position = calculateInsightPosition(columnPosition, 0, 'related', allExistingContainers);
    const insightData = getInsightData(columnKey, 'related');
    
    setInsightContainers(prev => ({
      ...prev,
      [insightId]: {
        id: insightId,
        type: 'related',
        columnKey,
        title: 'Related',
        data: insightData,
        position,
        contentWidth: 360
      }
    }));
  }, [columnPositions, insightContainers, datasetContainers, chartContainers]);

  // Insight management functions
  const handleInsightClose = useCallback((insightId) => {
    setInsightContainers(prev => {
      const newContainers = { ...prev };
      delete newContainers[insightId];
      return newContainers;
    });
  }, []);

  // Insight drag handlers
  const handleInsightMouseDown = useCallback((e, insightId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const insight = insightContainers[insightId];
    if (!insight) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseInCanvas = {
      x: (e.clientX - canvasRect.left - panX) / zoom,
      y: (e.clientY - canvasRect.top - panY) / zoom
    };
    
    const offset = {
      x: mouseInCanvas.x - insight.position.x,
      y: mouseInCanvas.y - insight.position.y
    };
    
    setDraggingInsight(insightId);
    setIsInsightDragging(true);
    setInsightDragOffset(offset);
  }, [insightContainers, panX, panY, zoom]);

  const handleInsightMouseMove = useCallback((e) => {
    if (!isInsightDragging || !draggingInsight) return;
    
    const now = performance.now();
    if (now - lastDragUpdateRef.current < dragUpdateThreshold) {
      return;
    }
    lastDragUpdateRef.current = now;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseInCanvas = {
      x: (e.clientX - canvasRect.left - panX) / zoom,
      y: (e.clientY - canvasRect.top - panY) / zoom
    };
    
    const newPosition = {
      x: mouseInCanvas.x - insightDragOffset.x,
      y: mouseInCanvas.y - insightDragOffset.y
    };
    
    setInsightContainers(prev => ({
      ...prev,
      [draggingInsight]: {
        ...prev[draggingInsight],
        position: newPosition
      }
    }));
  }, [isInsightDragging, draggingInsight, insightDragOffset, panX, panY, zoom]);

  const handleInsightMouseUp = useCallback(() => {
    setIsInsightDragging(false);
    setDraggingInsight(null);
    setInsightDragOffset({ x: 0, y: 0 });
  }, []);

  // Format cell values based on column type
  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    if (column.isCurrency || column.type === 'currency') {
      const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
      return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (column.isPercentage || column.type === 'percentage') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return `${numValue.toFixed(1)}%`;
    } else if (column.type === 'number') {
      const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;
      if (isNaN(numValue)) return value;
      return numValue.toLocaleString('en-US');
    } else if (column.type === 'date') {
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit' 
          });
        }
      }
      return value;
    } else if (column.key === 'overage_rate' || (typeof value === 'string' && value.startsWith('$') && value.includes('per'))) {
      return value; // Keep rate strings as-is (e.g., "$0.001 per call")
    }
    
    return value;
  };

  // Function to get all currently selected columns for the table - updated to use context
  const getCurrentTableColumns = () => {
    // Start with the base context columns
    const baseColumns = [...contextColumns];
    
    // Add dynamically created columns from container connections
    const dynamicColumns = Object.values(containerConnections)
      .filter(connection => connection.childType === 'column' && connection.addedColumn)
      .map(connection => connection.addedColumn);
    
    // Combine and return all columns
    const allColumns = [...baseColumns, ...dynamicColumns];
    console.log('📊 getCurrentTableColumns:', {
      baseColumns: baseColumns.length,
      dynamicColumns: dynamicColumns.length,
      total: allColumns.length
    });
    
    return allColumns;
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
      case 'fee_amount':
        return transaction.fee_amount || `$${(parseFloat(transaction.amount.replace('$', '')) * 0.029).toFixed(2)}`;
      case 'processor_response':
        return transaction.processor_response || (transaction.status === 'Succeeded' ? 'approved' : 'declined');
      case 'retry_count':
        return transaction.retry_count || (transaction.status === 'Failed' ? Math.floor(Math.random() * 3) : 0);
      case 'failure_reason':
        return transaction.failure_reason || (transaction.status === 'Failed' ? 
          ['insufficient_funds', 'card_declined', 'expired_card'][Math.floor(Math.random() * 3)] : null);
      case 'created_at':
        return transaction.created_at || transaction.date;
      case 'updated_at':
        return transaction.updated_at || transaction.date;
      case 'processed_at':
        return transaction.processed_at || transaction.date;
      case 'due_date':
        const baseDate = new Date(transaction.date);
        baseDate.setDate(baseDate.getDate() + 30);
        return baseDate.toLocaleDateString();
      case 'customer_email':
        return `${transaction.customer.toLowerCase().replace(/[^a-z]/g, '')}@company.com`;
      case 'account_type':
        return ['starter', 'pro', 'enterprise'][Math.floor(Math.random() * 3)];
      case 'signup_date':
        const signupDate = new Date(transaction.date);
        signupDate.setDate(signupDate.getDate() - Math.floor(Math.random() * 365));
        return signupDate.toLocaleDateString();
      case 'transaction_id':
        return `txn_${transaction.id}`;
      case 'source_system':
        return ['stripe', 'paypal', 'square', 'manual'][Math.floor(Math.random() * 4)];
      case 'net_amount':
        const amount = parseFloat(transaction.amount.replace('$', ''));
        const fee = amount * 0.029;
        return `$${(amount - fee).toFixed(2)}`;
      
      // Handle dynamically added columns
      default:
        // Check if this is a dynamically added column
        const connection = Object.values(containerConnections).find(
          conn => conn.childType === 'column' && conn.addedColumn?.key === columnKey
        );
        
        if (connection) {
          // Generate realistic data based on column name patterns
          const columnName = connection.addedColumn.display.toLowerCase();
          const originalKey = connection.addedColumn.key;
          
          // Specific patterns for common related columns
          switch (originalKey) {
            case 'currency':
              return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'][Math.floor(Math.random() * 5)];
            case 'payment_method':
              return ['visa', 'mastercard', 'amex', 'discover', 'apple_pay', 'google_pay'][Math.floor(Math.random() * 6)];
            case 'fee_amount':
              const baseAmount = parseFloat(transaction.amount.replace('$', ''));
              return `$${(baseAmount * 0.029 + 0.30).toFixed(2)}`; // Stripe-like fees
            case 'net_amount':
              const amount = parseFloat(transaction.amount.replace('$', ''));
              const fee = amount * 0.029 + 0.30;
              return `$${(amount - fee).toFixed(2)}`;
            case 'failure_reason':
              return transaction.status === 'Failed' ? 
                ['insufficient_funds', 'card_declined', 'expired_card', 'incorrect_cvc', 'processing_error'][Math.floor(Math.random() * 5)] : null;
            case 'retry_count':
              return transaction.status === 'Failed' ? Math.floor(Math.random() * 4) : 0;
            case 'processor_response':
              return transaction.status === 'Succeeded' ? 'approved' : 
                     transaction.status === 'Failed' ? 'decline_code_' + Math.floor(Math.random() * 100) : 'pending';
            case 'customer_email':
              return `${transaction.customer.toLowerCase().replace(/[^a-z]/g, '')}@${['gmail.com', 'company.com', 'enterprise.org', 'startup.io'][Math.floor(Math.random() * 4)]}`;
            case 'customer_name':
              return transaction.customer;
            case 'account_type':
              return ['starter', 'professional', 'enterprise', 'premium'][Math.floor(Math.random() * 4)];
            case 'signup_date':
              const signupDate = new Date(transaction.date);
              signupDate.setDate(signupDate.getDate() - Math.floor(Math.random() * 730)); // Up to 2 years ago
              return signupDate.toLocaleDateString();
            case 'last_login':
              const loginDate = new Date(transaction.date);
              loginDate.setHours(loginDate.getHours() - Math.floor(Math.random() * 72)); // Within last 3 days
              return loginDate.toLocaleDateString() + ' ' + loginDate.toLocaleTimeString().slice(0, 5);
            case 'transaction_id':
              return `txn_${transaction.id.replace('charge_', '')}`;
            case 'source_system':
              return ['stripe_connect', 'paypal_express', 'square_pos', 'manual_entry', 'api_direct'][Math.floor(Math.random() * 5)];
            case 'timezone':
              return ['UTC', 'EST', 'PST', 'CET', 'JST'][Math.floor(Math.random() * 5)];
            case 'date_range':
              return 'Q' + (Math.floor(Math.random() * 4) + 1) + ' 2024';
            case 'mrr':
              const mrrBase = [29, 99, 199, 499, 999][Math.floor(Math.random() * 5)];
              return `$${mrrBase}.00`;
            case 'churn_risk':
              return ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
            case 'account_age':
              const ageMonths = Math.floor(Math.random() * 36) + 1;
              return `${ageMonths} months`;
            case 'expansion_score':
              return (Math.random() * 100).toFixed(1) + '%';
            case 'current_ltv':
              const currentLtv = Math.floor(Math.random() * 5000) + 500;
              return `$${currentLtv.toLocaleString()}`;
            case 'growth_rate':
              const growth = (Math.random() * 50 - 10).toFixed(1); // -10% to +40%
              return growth + '%';
            case 'usage_trend':
              return ['increasing', 'stable', 'decreasing', 'volatile'][Math.floor(Math.random() * 4)];
            case 'retention_score':
              return (Math.random() * 40 + 60).toFixed(1) + '%'; // 60-100%
          }
          
          // General pattern matching for other columns
          if (columnName.includes('email')) {
            const domains = ['gmail.com', 'company.com', 'enterprise.org', 'startup.io'];
            return `${transaction.customer.toLowerCase().replace(/[^a-z]/g, '')}@${domains[Math.floor(Math.random() * domains.length)]}`;
          }
          if (columnName.includes('id') || columnName.includes('identifier')) {
            return `${originalKey}_${transaction.id.replace('charge_', '')}`;
          }
          if (columnName.includes('date') || columnName.includes('time')) {
            if (columnName.includes('created') || columnName.includes('signup')) {
              const pastDate = new Date(transaction.date);
              pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 365));
              return pastDate.toLocaleDateString();
            }
            if (columnName.includes('updated') || columnName.includes('processed')) {
              return transaction.date;
            }
            if (columnName.includes('due')) {
              const futureDate = new Date(transaction.date);
              futureDate.setDate(futureDate.getDate() + 30);
              return futureDate.toLocaleDateString();
            }
            return transaction.date;
          }
          if (columnName.includes('amount') || columnName.includes('price') || columnName.includes('cost') || columnName.includes('fee')) {
            const baseAmount = parseFloat(transaction.amount.replace('$', ''));
            if (columnName.includes('fee')) {
              return `$${(baseAmount * 0.029 + 0.30).toFixed(2)}`;
            }
            if (columnName.includes('net')) {
              const fee = baseAmount * 0.029 + 0.30;
              return `$${(baseAmount - fee).toFixed(2)}`;
            }
            const variance = (Math.random() - 0.5) * baseAmount * 0.3; // ±15% variance
            return `$${Math.max(0, baseAmount + variance).toFixed(2)}`;
          }
          if (columnName.includes('count') || columnName.includes('number') || columnName.includes('retry')) {
            if (columnName.includes('retry') && transaction.status !== 'Failed') return 0;
            return Math.floor(Math.random() * 10) + 1;
          }
          if (columnName.includes('status') || columnName.includes('state')) {
            if (columnName.includes('failure') && transaction.status !== 'Failed') return null;
            return ['active', 'pending', 'completed', 'cancelled', 'processing'][Math.floor(Math.random() * 5)];
          }
          if (columnName.includes('type') || columnName.includes('category') || columnName.includes('tier')) {
            return ['premium', 'standard', 'basic', 'enterprise'][Math.floor(Math.random() * 4)];
          }
          if (columnName.includes('name') || columnName.includes('title')) {
            return `${connection.addedColumn.display} ${Math.floor(Math.random() * 100) + 1}`;
          }
          if (columnName.includes('method')) {
            return ['card', 'bank_transfer', 'digital_wallet', 'cash'][Math.floor(Math.random() * 4)];
          }
          if (columnName.includes('response') || columnName.includes('code')) {
            return transaction.status === 'Succeeded' ? 'success_00' : `error_${Math.floor(Math.random() * 100)}`;
          }
          if (columnName.includes('score') || columnName.includes('rating')) {
            return (Math.random() * 100).toFixed(1) + '%';
          }
          if (columnName.includes('risk')) {
            return ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
          }
          
          // Default realistic value based on column display name
          const displayWords = connection.addedColumn.display.toLowerCase().split(' ');
          const lastWord = displayWords[displayWords.length - 1];
          return `${lastWord}_${Math.floor(Math.random() * 1000) + 1}`;
        }
        
        // Default fallback
        return transaction[columnKey] || '-';
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
    
    // Add dataset to selectedDatasets if not already there and we're adding a column
    const currentColumns = selectedColumns[datasetKey] || [];
    const isAdding = !currentColumns.includes(columnName);
    
    if (isAdding && !selectedDatasets.includes(datasetKey)) {
      setSelectedDatasets(prev => [...prev, datasetKey]);
    }
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

  // Generate context-appropriate data based on the metric/report being edited
  // This replicates the exact same data generation logic from ReportDetail.js
  const generateContextData = useCallback(() => {
    if (!currentId) return [];
    
    if (isEditingReport) {
      // Report-specific data generation
      const reportSamples = {
        'high-usage-growth': { count: 1500, trend: 24.8, isNegative: false },
        'monthly-sales': { count: 342, trend: 12.3, isNegative: false },
        'new-subscribers': { count: 89, trend: 15.7, isNegative: false },
        'weekly-churned': { count: 23, trend: -8.2, isNegative: true },
        'top-selling': { count: 156, trend: 8.9, isNegative: false },
        'high-value': { count: 78, trend: 6.4, isNegative: false },
        'new-products': { count: 234, trend: 18.5, isNegative: false },
        'mrr-growth': { count: 284, trend: 4.8, isNegative: false },
        'upsell-opportunities': { count: 167, trend: 11.2, isNegative: false },
        'new-free-trials': { count: 413, trend: 22.1, isNegative: false },
        'revenue-composition': { count: 892, trend: 9.6, isNegative: false },
        'subscription-downgrades': { count: 23, trend: -73.3, isNegative: true },
        'churn-risk': { count: 45, trend: 12.4, isNegative: false },
        'customer-lifetime-value': { count: 234, trend: 8.7, isNegative: false },
        'payment-failures': { count: 67, trend: -15.2, isNegative: true },
        'trial-conversion': { count: 156, trend: 23.8, isNegative: false },
        'api-usage-trends': { count: 789, trend: 34.2, isNegative: false },
        'geographic-revenue': { count: 145, trend: 16.5, isNegative: false }
      };

      const count = reportSamples[currentId]?.count || 413;
      
      // Base customer generator
      const generateCustomer = (id) => ({
        id,
        name: `Customer ${id}`,
        current_mrr: 100 + Math.floor(Math.random() * 600),
        projected_ltv: 3000 + Math.floor(Math.random() * 15000),
        product: ['Starter', 'Pro', 'Developer', 'Enterprise'][Math.floor(Math.random() * 4)],
        overage_revenue: 40 + Math.floor(Math.random() * 180),
        usage_growth: Math.floor(Math.random() * 100) - 50,
        included_units: 500000 + Math.floor(Math.random() * 1500000),
        trial_plan: ['Starter', 'Pro', 'Developer', 'Enterprise'][Math.floor(Math.random() * 4)],
        trial_units: 500000,
        potential_value: 3000 + Math.floor(Math.random() * 15000),
        signup_date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        churn_risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        segment: ['SMB', 'Mid-Market', 'Enterprise'][Math.floor(Math.random() * 3)],
        expansion_score: Math.floor(Math.random() * 100)
      });

      const predefinedNames = [
        'ApexCloud', 'SynthCore', 'FunnelPilot', 'Lexio AI', 'InsightLoop',
        'BrightNova', 'ComposeAI', 'CloudNova', 'DataSpring', 'OrbitML',
        'PixelWave', 'QuantumLink', 'CyberSphere', 'VelocityAI', 'PulsarTech'
      ];

      const baseCustomers = Array.from({ length: Math.min(count, 50) }, (_, i) => {
        const customer = generateCustomer(i + 1);
        
        if (i < predefinedNames.length) {
          customer.name = predefinedNames[i];
        } else {
          const prefixes = ['Tech', 'Data', 'Cloud', 'AI', 'Cyber', 'Digital', 'Net', 'Web', 'Dev', 'Soft'];
          const suffixes = ['Systems', 'Solutions', 'Labs', 'Works', 'Tech', 'Group', 'Inc', 'Logic', 'Hub', 'Core'];
          customer.name = `${prefixes[i % 10]}${suffixes[Math.floor(i / 10) % 10]}`;
        }
        
        return customer;
      });

      // Apply report-specific modifications
      switch (currentId) {
        case 'high-usage-growth':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            product: customer.product,
            usage_growth: Math.floor(Math.random() * 200) + 50, // 50-250%
            overage_revenue: Math.floor(Math.random() * 2000) + 100, // $100-2100
            mrr: customer.current_mrr
          }));
          
        case 'new-free-trials':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.trial_plan,
            signup_date: customer.signup_date,
            trial_status: ['Active', 'Active', 'Active', 'Expired', 'Converted'][Math.floor(Math.random() * 5)],
            days_remaining: Math.floor(Math.random() * 30) + 1
          }));
          
        case 'monthly-sales':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            product: customer.product,
            revenue: customer.current_mrr * 1.2,
            date: customer.signup_date
          }));
          
        case 'new-subscribers':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            signup_date: customer.signup_date,
            mrr: customer.current_mrr
          }));
          
        case 'weekly-churned':
          return baseCustomers.slice(0, 23).map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            churn_date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            mrr_lost: customer.current_mrr,
            churn_reason: ['Payment Failed', 'Voluntary', 'Support Issue', 'Competitor'][Math.floor(Math.random() * 4)]
          }));
          
        case 'top-selling':
          return baseCustomers.map(customer => ({
            ...customer,
            product_name: ['API Pro', 'Analytics Plus', 'Enterprise Suite', 'Starter Pack'][Math.floor(Math.random() * 4)],
            units_sold: Math.floor(Math.random() * 100) + 20,
            revenue: Math.floor(Math.random() * 50000) + 5000
          }));
          
        case 'high-value':
          return baseCustomers.filter(c => c.current_mrr > 400).map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            mrr: customer.current_mrr,
            ltv: customer.projected_ltv
          }));
          
        case 'upsell-opportunities':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            current_plan: customer.product,
            current_mrr: customer.current_mrr,
            potential_ltv: customer.projected_ltv
          }));
          
        case 'subscription-downgrades':
          return baseCustomers.slice(0, 23).map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            mrr: customer.current_mrr,
            ltv: customer.projected_ltv
          }));
          
        case 'churn-risk':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            churn_score: Math.floor(Math.random() * 100),
            risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
          }));
          
        case 'customer-lifetime-value':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            plan: customer.product,
            ltv: customer.projected_ltv,
            months_active: Math.floor(Math.random() * 24) + 1
          }));
          
        case 'payment-failures':
          return baseCustomers.slice(0, 67).map(customer => ({
            ...customer,
            customer: customer.name,
            payment_method: ['Card', 'ACH', 'Bank Transfer'][Math.floor(Math.random() * 3)],
            failure_reason: ['Insufficient Funds', 'Expired Card', 'Declined', 'Network Error'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 500) + 50
          }));
          
        case 'trial-conversion':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            trial_plan: customer.product,
            conversion_status: ['Converted', 'Expired', 'Active'][Math.floor(Math.random() * 3)],
            trial_days: Math.floor(Math.random() * 30) + 1
          }));
          
        case 'api-usage-trends':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            api_calls: Math.floor(Math.random() * 10000) + 1000,
            endpoint: ['charges', 'customers', 'subscriptions', 'invoices'][Math.floor(Math.random() * 4)],
            usage_trend: Math.floor(Math.random() * 200) - 50
          }));
          
        case 'geographic-revenue':
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
            revenue: Math.floor(Math.random() * 10000) + 1000,
            growth_rate: Math.floor(Math.random() * 50) + 5
          }));
          
        default:
          return baseCustomers.map(customer => ({
            ...customer,
            customer: customer.name,
            product: customer.product,
            mrr: customer.current_mrr,
            ltv: customer.projected_ltv
          }));
      }
    } else {
      // Metric-specific data generation
      const metric = standardizedMetrics[currentId];
      if (!metric) return [];
      
      const customers = [
        'Yasmine Allen', 'John Smith', 'Catherine Edwards', 'Zach Baker', 'Julia Kim',
        'Michael Chen', 'Sarah Johnson', 'David Rodriguez', 'Emily Davis', 'Alex Thompson',
        'Lisa Wang', 'Robert Brown', 'Maria Garcia', 'James Wilson', 'Jennifer Davis',
        'William Miller', 'Patricia Taylor', 'Richard Anderson', 'Linda Thomas', 'Charles Jackson'
      ];
      
      const generateTransactionDate = (i) => {
        const baseDate = new Date(2025, 5, 5); // Jun 05, 2025
        return new Date(baseDate.getTime() - (i * 24 * 60 * 60 * 1000));
      };

      // Handle specific metrics
      switch (currentId) {
        case 'mrr':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: [499.99, 19.99, 199.99, 149.99, 49.99, 299.99, 399.99, 99.99, 249.99, 79.99][i] || (Math.random() * 400 + 50),
            customer: customers[i] || `Customer ${i + 1}`,
            status: ['Succeeded', 'Pending', 'Refunded', 'Succeeded', 'Succeeded', 'Failed', 'Succeeded'][i % 7] || 'Succeeded',
            customerCount: [48.0, 25.0, 59.0, 36.0, 28.0, 42.0, 35.0, 31.0, 67.0, 29.0][i] || (Math.random() * 50 + 20)
          }));
          
        case 'overage-revenue':
        case 'usage-revenue':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            customer: customers[i] || `Customer ${i + 1}`,
            plan: ['Pro', 'Starter', 'Enterprise', 'Developer'][i % 4],
            meter: ['API Calls', 'Storage', 'Bandwidth', 'Transactions'][i % 4],
            includedUnits: Math.floor(Math.random() * 500000) + 100000,
            unitsUsed: Math.floor(Math.random() * 600000) + 100000,
            overageUnits: Math.floor(Math.random() * 100000) + 10000,
            overageRate: Math.random() * 0.1 + 0.01,
            amount: Math.floor(Math.random() * 2000) + 100
          }));
          
        case 'gross-volume':
        case 'net-volume':
        case 'total-revenue':
        case 'invoice-revenue':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: Math.round((metric.baseCurrencyValue || 50000) * (0.8 + Math.random() * 0.4)),
            customer: customers[i] || `Customer ${i + 1}`,
            status: ['Succeeded', 'Succeeded', 'Succeeded', 'Failed', 'Refunded'][i % 5]
          }));
          
        case 'new-customers':
        case 'new-subscribers':
        case 'active-subscribers':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            customer: customers[i] || `Customer ${i + 1}`,
            plan: ['Starter', 'Pro', 'Enterprise'][i % 3],
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 500) + 50
          }));
          
        case 'churned-subscribers':
        case 'churned-revenue':
          return Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            customer: customers[i] || `Customer ${i + 1}`,
            plan: ['Pro', 'Starter', 'Enterprise'][i % 3],
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 300) + 100
          }));
          
        case 'successful-payments':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 1000) + 50,
            customer: customers[i] || `Customer ${i + 1}`,
            status: ['Card', 'ACH', 'Apple Pay', 'Google Pay'][i % 4]
          }));
          
        case 'conversion-rate':
        case 'refund-rate':
        case 'churn-rate':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            rate: Math.floor(Math.random() * 20) + 5,
            totalEvents: Math.floor(Math.random() * 500) + 100,
            convertedEvents: Math.floor(Math.random() * 400) + 50
          }));
          
        case 'average-order':
        case 'arpu':
        case 'subscriber-ltv':
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            customer: customers[i] || `Customer ${i + 1}`,
            amount: Math.floor(Math.random() * 500) + 100,
            plan: ['Starter', 'Pro', 'Enterprise'][i % 3],
            date: generateTransactionDate(i).toISOString().split('T')[0]
          }));
          
        case 'payments-status':
        case 'invoices-status':
          // For status-based metrics, return simple status tracking data
          const statusTypes = metric.meterData ? 
            metric.meterData.map(item => item.label) :
            ['Succeeded', 'Failed', 'Pending', 'Refunded'];
            
          return Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            status: statusTypes[i % statusTypes.length],
            transactionCount: Math.floor(Math.random() * 50) + 10,
            amount: Math.floor(Math.random() * 1000) + 50,
            customer: customers[i] || `Customer ${i + 1}`
          }));
          
        default:
          // Generic metric data
          return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            date: generateTransactionDate(i).toISOString().split('T')[0],
            amount: Math.round((metric.baseCurrencyValue || metric.baseNumberValue || 100) * (0.8 + Math.random() * 0.4)),
            customer: customers[i] || `Customer ${i + 1}`,
            status: ['Active', 'Pending', 'Completed'][i % 3]
          }));
      }
    }
  }, [currentId, isEditingReport]);

  // Get context-appropriate columns based on the data and report/metric type
  const getContextColumns = useCallback(() => {
    if (isEditingReport) {
      // For reports, get columns from shared schema and convert format
      const schemaColumns = getColumnSchema(currentId, true);
      return convertToMetricEditorFormat(schemaColumns);
    } else {
      // For metrics, get columns from shared schema and convert format  
      const schemaColumns = getColumnSchema(currentId, false);
      return convertToMetricEditorFormat(schemaColumns);
    }
  }, [currentId, isEditingReport]);

  // Use context-aware data instead of static data - FIXED to respond to changes
  const filteredTransactions = useMemo(() => {
    console.log('🔍 MetricEditor Data Generation Debug:');
    console.log('- currentId:', currentId);
    console.log('- isEditingReport:', isEditingReport);
    console.log('- pathname:', location.pathname);
    console.log('- params:', params);
    
    const data = generateContextData();
    console.log('- Generated data length:', data.length);
    console.log('- Sample data:', data[0]);
    
    return data;
  }, [currentId, isEditingReport, location.pathname, params, generateContextData]);

  // Also use useMemo for columns to ensure they update with context changes
  const contextColumns = useMemo(() => {
    const columns = getContextColumns();
    console.log('- Generated columns:', columns);
    return columns;
  }, [currentId, isEditingReport, getContextColumns]);

  // Pagination
  const transactionsPerPage = 10;
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handleCancel = () => {
    // Navigate back to the source based on the current URL path
    if (isEditingReport) {
      navigate(`/data-studio/${currentId}`);
      } else {
      navigate(`/metrics/${currentId}`);
    }
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
    // Navigate back to the source based on the current URL path
    if (isEditingReport) {
      navigate(`/data-studio/${currentId}`);
      } else {
      navigate(`/metrics/${currentId}`);
    }
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

  // Get the display title for the current metric or report
  const getDisplayTitle = useCallback(() => {
    if (!currentId) return 'Editor';
    
    if (isEditingReport) {
      // Report titles
      const reportTitles = {
        'high-usage-growth': 'High usage growth',
        'monthly-sales': 'Monthly sales',
        'new-subscribers': 'New subscribers', 
        'weekly-churned': 'Weekly churned',
        'top-selling': 'Top selling',
        'high-value': 'High value',
        'new-products': 'New products',
        'mrr-growth': 'MRR growth',
        'upsell-opportunities': 'Upsell opportunities',
        'new-free-trials': 'New free trials',
        'revenue-composition': 'Revenue composition',
        'subscription-downgrades': 'Subscription Downgrades',
        'churn-risk': 'Churn risk',
        'customer-lifetime-value': 'Customer lifetime value',
        'payment-failures': 'Payment failures',
        'trial-conversion': 'Trial conversion',
        'api-usage-trends': 'API usage trends',
        'geographic-revenue': 'Geographic revenue'
      };
      
      return reportTitles[currentId] || currentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else {
      // For metrics, use the standardized metric title
      const metric = standardizedMetrics[currentId];
      return metric?.title || currentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }, [currentId, isEditingReport]);

  // Initialize column positions when columns change
  useEffect(() => {
    const columns = getCurrentTableColumns();
    const newPositions = {};
    
    columns.forEach((column, index) => {
      if (!columnPositions[column.key]) {
        newPositions[column.key] = {
          x: index * 304, // 280px width + 24px gap
          y: 0,
          order: index
        };
      }
    });
    
    if (Object.keys(newPositions).length > 0) {
      setColumnPositions(prev => ({ ...prev, ...newPositions }));
    }
  }, [contextColumns]);

  // Column drag handlers - Enhanced for precision and smoothness
  const handleColumnMouseDown = useCallback((e, columnKey) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get current stored position
    const currentPosition = columnPositions[columnKey] || { x: 0, y: 0 };
    
    // Calculate mouse position in canvas space
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseInCanvas = {
      x: (e.clientX - canvasRect.left - panX) / zoom,
      y: (e.clientY - canvasRect.top - panY) / zoom
    };
    
    // Calculate offset from mouse to column's current position
    const offset = {
      x: mouseInCanvas.x - currentPosition.x,
      y: mouseInCanvas.y - currentPosition.y
    };
    
    setDraggingColumn(columnKey);
    setIsColumnDragging(true);
    setDragOffset(offset);
  }, [columnPositions, panX, panY, zoom]);

  // State for throttling drag updates
  const lastDragUpdateRef = useRef(0);
  const dragUpdateThreshold = 16; // ~60fps

  const handleColumnMouseMove = useCallback((e) => {
    if (!isColumnDragging || !draggingColumn) return;
    
    // Throttle updates for better performance
    const now = performance.now();
    if (now - lastDragUpdateRef.current < dragUpdateThreshold) {
      return;
    }
    lastDragUpdateRef.current = now;
    
    // Calculate new position directly from mouse position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseInCanvas = {
      x: (e.clientX - canvasRect.left - panX) / zoom,
      y: (e.clientY - canvasRect.top - panY) / zoom
    };
    
    // Apply the offset to get the column's new position
    const newPosition = {
      x: mouseInCanvas.x - dragOffset.x,
      y: mouseInCanvas.y - dragOffset.y
    };
    
    // Update position immediately for responsive feedback
    setColumnPositions(prev => ({
      ...prev,
      [draggingColumn]: {
        ...prev[draggingColumn],
        x: newPosition.x,
        y: newPosition.y
      }
    }));
  }, [isColumnDragging, draggingColumn, dragOffset, panX, panY, zoom]);

  const handleColumnMouseUp = useCallback(() => {
    setIsColumnDragging(false);
    setDraggingColumn(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add column mouse event listeners with improved event handling
  useEffect(() => {
    if (isColumnDragging) {
      // Set global cursor and prevent user selection during drag
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      const handleMouseMoveGlobal = (e) => {
        e.preventDefault(); // Prevent text selection during drag
        handleColumnMouseMove(e);
      };
      
      const handleMouseUpGlobal = (e) => {
        e.preventDefault();
        handleColumnMouseUp(e);
      };
      
      // Prevent context menu during drag
      const preventContextMenu = (e) => e.preventDefault();
      
      // Use capture to ensure we get events even if cursor goes outside elements
      document.addEventListener('mousemove', handleMouseMoveGlobal, { capture: true, passive: false });
      document.addEventListener('mouseup', handleMouseUpGlobal, { capture: true, passive: false });
      document.addEventListener('contextmenu', preventContextMenu, { capture: true });
      
      return () => {
        // Restore cursor and selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        document.removeEventListener('mousemove', handleMouseMoveGlobal, { capture: true });
        document.removeEventListener('mouseup', handleMouseUpGlobal, { capture: true });
        document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      };
    }
  }, [isColumnDragging, handleColumnMouseMove, handleColumnMouseUp]);

  // Add insight mouse event listeners
  useEffect(() => {
    if (isInsightDragging) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      const handleMouseMoveGlobal = (e) => {
        e.preventDefault();
        handleInsightMouseMove(e);
      };
      
      const handleMouseUpGlobal = (e) => {
        e.preventDefault();
        handleInsightMouseUp(e);
      };
      
      const preventContextMenu = (e) => e.preventDefault();
      
      document.addEventListener('mousemove', handleMouseMoveGlobal, { capture: true, passive: false });
      document.addEventListener('mouseup', handleMouseUpGlobal, { capture: true, passive: false });
      document.addEventListener('contextmenu', preventContextMenu, { capture: true });
      
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        document.removeEventListener('mousemove', handleMouseMoveGlobal, { capture: true });
        document.removeEventListener('mouseup', handleMouseUpGlobal, { capture: true });
        document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      };
    }
  }, [isInsightDragging, handleInsightMouseMove, handleInsightMouseUp]);

  // Function to animate new column addition
  const animateNewColumn = useCallback((columnKey) => {
    console.log('🎬 Animating new column:', columnKey);
    
    // Get current position or calculate new one
    const currentPosition = columnPositions[columnKey];
    if (!currentPosition) {
      console.log('❌ No position found for column:', columnKey);
      return;
    }
    
    const newX = currentPosition.x;
    
    // Set initial position off-screen to the right with scale 0
    setColumnPositions(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        x: newX + 400, // Further off-screen
        scale: 0.3 // Start small
      }
    }));
    
    // First animation step - slide in and scale up
    setTimeout(() => {
      setColumnPositions(prev => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          x: newX,
          scale: 1
        }
      }));
    }, 100);
    
    // Second step - smooth canvas pan to center new column
    setTimeout(() => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        // Calculate target pan to center the new column
        const columnCenterX = newX + 140; // 280px width / 2
        const viewportCenterX = (canvasRect.width - 320) / 2; // Subtract sidebar width
        const targetPanX = viewportCenterX - (columnCenterX * zoom);
        
        // Smoothly animate canvas pan
        const startPanX = panX;
        const panDuration = 800;
        const startTime = Date.now();
        
        const animatePan = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / panDuration, 1);
          
          // Easing function for smooth animation
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentPanX = startPanX + (targetPanX - startPanX) * easeOut;
          
          setPanX(currentPanX);
          
          if (progress < 1) {
            requestAnimationFrame(animatePan);
          }
        };
        
        requestAnimationFrame(animatePan);
      }
    }, 300);
    
    // Final step - subtle bounce effect
    setTimeout(() => {
      setColumnPositions(prev => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          scale: 1.05
        }
      }));
      
      // Return to normal scale
      setTimeout(() => {
        setColumnPositions(prev => ({
          ...prev,
          [columnKey]: {
            ...prev[columnKey],
            scale: 1
          }
        }));
      }, 150);
    }, 500);
  }, [zoom, panX, columnPositions]);

  // Update canvas mouse handlers to not interfere with column dragging
  const handleCanvasMouseDown = useCallback((e) => {
    if (isColumnDragging || isInsightDragging || isDatasetDragging || isChartDragging) return;
    if (e.target === canvasRef.current || canvasRef.current?.contains(e.target)) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isColumnDragging, isInsightDragging, isDatasetDragging, isChartDragging]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isColumnDragging || isInsightDragging || isDatasetDragging || isChartDragging) return;
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos, isColumnDragging, isInsightDragging, isDatasetDragging, isChartDragging]);

  // Enhanced connector system handlers
  const handleDatasetClick = useCallback((columnKey, dataset, parentInsightId) => {
    console.log('🔍 Dataset button clicked:', {
      columnKey,
      dataset: dataset?.name,
      datasetKey: dataset?.key,
      parentInsightId,
      insightExists: !!insightContainers[parentInsightId]
    });
    
    const parentInsight = insightContainers[parentInsightId];
    if (!parentInsight) {
      console.log('❌ Parent insight not found:', parentInsightId);
      return;
    }
    
    const datasetId = `${columnKey}-dataset-${dataset.key}`;
    console.log('🆔 Generated dataset ID:', datasetId);
    
    // Check if dataset container already exists
    if (datasetContainers[datasetId]) {
      console.log('⚠️ Dataset container already exists:', datasetId);
      return;
    }
    
    // Get the full dataset structure from DATASETS
    const fullDataset = DATASETS[dataset.key];
    if (!fullDataset) {
      console.log('❌ Full dataset not found for key:', dataset.key);
      return;
    }
    
    // Calculate position using collision detection
    const parentPosition = parentInsight.position;
    const basePosition = {
      x: parentPosition.x + 200, // Position to the right of parent
      y: parentPosition.y + 100  // Slightly below parent
    };
    
    console.log('📍 Parent position:', parentPosition);
    console.log('📍 Base position:', basePosition);
    
    const position = calculateInsightPosition(basePosition, 0, 'dataset', { 
      ...insightContainers, 
      ...datasetContainers, 
      ...chartContainers 
    });
    
    console.log('📍 Final position:', position);
    
    const newContainer = {
      id: datasetId,
      type: 'dataset',
      columnKey,
      datasetKey: dataset.key,
      parentId: parentInsightId,
      dataset: fullDataset,
      title: dataset.name,
      position,
      contentWidth: 380
    };
    
    console.log('🆕 Creating dataset container:', newContainer);
    
    // Create dataset container
    setDatasetContainers(prev => ({
      ...prev,
      [datasetId]: newContainer
    }));
    
    // Track parent-child relationship
    setContainerConnections(prev => ({
      ...prev,
      [datasetId]: {
        parentId: parentInsightId,
        parentType: 'insight',
        childType: 'dataset'
      }
    }));
    
    console.log('✅ Dataset container created successfully');
  }, [insightContainers, datasetContainers, chartContainers]);

  const handleChartClick = useCallback((columnKey, analysisData, parentInsightId) => {
    console.log('📊 Chart button clicked:', {
      columnKey,
      analysisData: typeof analysisData,
      parentInsightId,
      insightExists: !!insightContainers[parentInsightId]
    });
    
    const parentInsight = insightContainers[parentInsightId];
    if (!parentInsight) {
      console.log('❌ Parent insight not found for chart:', parentInsightId);
      return;
    }
    
    const chartId = `${columnKey}-chart`;
    console.log('🆔 Generated chart ID:', chartId);
    
    // Check if chart container already exists
    if (chartContainers[chartId]) {
      console.log('⚠️ Chart container already exists:', chartId);
      return;
    }
    
    // Generate chart data based on analysis
    const chartData = generateAnalysisChart(analysisData, columnKey, filteredTransactions);
    console.log('📈 Generated chart data:', chartData);
    
    // Generate descriptive chart title based on column type and analysis
    const generateChartTitle = (columnKey, analysisText, chartType) => {
      const humanName = getHumanReadableColumnName(columnKey);
      const lowerAnalysis = analysisText.toLowerCase();
      
      let title;
      
      // Pattern-based title generation
      if (lowerAnalysis.includes('trend') || lowerAnalysis.includes('growth')) {
        title = `${humanName} trend over time`;
      } else if (lowerAnalysis.includes('distribution') || lowerAnalysis.includes('category')) {
        title = `${humanName} distribution`;
      } else if (lowerAnalysis.includes('comparison') || lowerAnalysis.includes('compare')) {
        title = `${humanName} comparison`;
      } else if (lowerAnalysis.includes('performance') || lowerAnalysis.includes('metric')) {
        title = `${humanName} performance`;
      } else if (columnKey.includes('date') || columnKey.includes('time')) {
        title = `${humanName} timeline`;
      } else if (columnKey.includes('amount') || columnKey.includes('revenue') || columnKey.includes('payment')) {
        title = `${humanName} analysis`;
      } else if (columnKey.includes('customer') || columnKey.includes('user')) {
        title = `${humanName} breakdown`;
    } else {
        // Default based on chart type
        switch (chartType) {
          case 'line': title = `${humanName} over time`; break;
          case 'bar': title = `${humanName} by category`; break;
          case 'pie': title = `${humanName} distribution`; break;
          default: title = `${humanName} analysis`; break;
        }
      }
      
      // Convert to sentence case (first letter capitalized, rest lowercase)
      return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    };
    
    const chartTitle = generateChartTitle(columnKey, analysisData, chartData?.type);
    
    // Calculate position using collision detection
    const parentPosition = parentInsight.position;
    const basePosition = {
      x: parentPosition.x + 250, // Position to the right of parent
      y: parentPosition.y - 50   // Slightly above parent
    };
    
    console.log('📍 Chart parent position:', parentPosition);
    console.log('📍 Chart base position:', basePosition);
    
    const position = calculateInsightPosition(basePosition, 0, 'chart', { 
      ...insightContainers, 
      ...datasetContainers, 
      ...chartContainers 
    });
    
    console.log('📍 Chart final position:', position);
    
    const newChartContainer = {
      id: chartId,
      type: 'chart',
      columnKey,
      parentId: parentInsightId,
      title: chartTitle,
      chartData: chartData,
      position,
      contentWidth: 420
    };
    
    console.log('🆕 Creating chart container:', newChartContainer);
    
    // Create chart container
    setChartContainers(prev => ({
      ...prev,
      [chartId]: newChartContainer
    }));
    
    // Track parent-child relationship
    setContainerConnections(prev => ({
      ...prev,
      [chartId]: {
        parentId: parentInsightId,
        parentType: 'insight',
        childType: 'chart'
      }
    }));
    
    console.log('✅ Chart container created successfully');
  }, [insightContainers, chartContainers, datasetContainers, filteredTransactions]);

  // Utility function to determine data type based on column name
  const getColumnDataType = (columnName) => {
    const name = columnName.toLowerCase();
    
    // Date/time fields
    if (name.includes('date') || name.includes('time') || name.includes('created') || 
        name.includes('updated') || name.includes('processed') || name.includes('signup') || 
        name.includes('login')) {
      return 'date';
    }
    
    // Numeric fields
    if (name.includes('amount') || name.includes('price') || name.includes('cost') || 
        name.includes('fee') || name.includes('revenue') || name.includes('ltv') || 
        name.includes('mrr') || name.includes('count') || name.includes('retry') || 
        name.includes('age')) {
      return 'number';
    }
    
    // Percentage/score fields
    if (name.includes('score') || name.includes('rate') || name.includes('ratio') || 
        name.includes('percent')) {
      return 'percentage';
    }
    
    // Boolean-like fields
    if (name.includes('is_') || name.includes('has_') || name.includes('can_')) {
      return 'boolean';
    }
    
    // Default to string for all other fields
    return 'string';
  };

  const handleRelatedColumnClick = useCallback((columnKey, relatedColumn, parentInsightId) => {
    console.log('🔗 Related column button clicked:', {
      columnKey,
      relatedColumn: relatedColumn.name,
      parentInsightId,
      currentColumns: Object.keys(columnPositions)
    });
    
    // Find the rightmost column position
    const columns = getCurrentTableColumns();
    const rightmostPosition = Math.max(...Object.values(columnPositions).map(pos => pos.x), 0);
    const newColumnKey = relatedColumn.name.toLowerCase().replace(/\s+/g, '_');
    const newColumnPosition = {
      x: rightmostPosition + 304, // 280px width + 24px gap
      y: 0,
      order: columns.length,
      scale: 1
    };
    
    console.log('📍 New column position:', newColumnPosition);
    
    // Create new column data structure
    const newColumn = {
      key: newColumnKey,
      display: getHumanReadableColumnName(relatedColumn.name), // Use human readable name
      type: getColumnDataType(relatedColumn.name),
      dataType: getColumnDataType(relatedColumn.name)
    };
    
    console.log('🆕 Creating new column:', newColumn);
    
    // Add to column positions first
    setColumnPositions(prev => {
      const updated = {
        ...prev,
        [newColumn.key]: newColumnPosition
      };
      console.log('📊 Updated column positions:', updated);
      return updated;
    });
    
    // Track the relationship
    setContainerConnections(prev => ({
      ...prev,
      [`column-${newColumn.key}`]: {
        parentId: parentInsightId,
        parentType: 'insight',
        childType: 'column',
        addedColumn: newColumn
      }
    }));
    
    // Animate the new column with proper timing
    setTimeout(() => {
      console.log('🎬 Starting column animation for:', newColumn.key);
      animateNewColumn(newColumn.key);
    }, 100);
    
    console.log('✅ Related column click handled successfully');
  }, [columnPositions, animateNewColumn, getCurrentTableColumns]);

  // Enhanced close handler that removes child containers
  const handleEnhancedInsightClose = useCallback((insightId) => {
    // Find all child containers
    const childContainers = Object.entries(containerConnections)
      .filter(([_, connection]) => connection.parentId === insightId)
      .map(([childId]) => childId);
    
    // Remove child dataset containers
    if (childContainers.some(id => id.includes('dataset'))) {
      setDatasetContainers(prev => {
        const newContainers = { ...prev };
        childContainers.forEach(childId => {
          if (childId.includes('dataset')) {
            delete newContainers[childId];
          }
        });
        return newContainers;
      });
    }
    
    // Remove child chart containers
    if (childContainers.some(id => id.includes('chart'))) {
      setChartContainers(prev => {
        const newContainers = { ...prev };
        childContainers.forEach(childId => {
          if (childId.includes('chart')) {
            delete newContainers[childId];
          }
        });
        return newContainers;
      });
    }
    
    // Remove added columns
    childContainers.forEach(childId => {
      const connection = containerConnections[childId];
      if (connection?.childType === 'column' && connection.addedColumn) {
        setColumnPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[connection.addedColumn.key];
          return newPositions;
        });
      }
    });
    
    // Remove connections
    setContainerConnections(prev => {
      const newConnections = { ...prev };
      childContainers.forEach(childId => {
        delete newConnections[childId];
      });
      return newConnections;
    });
    
    // Remove the parent insight
    setInsightContainers(prev => {
      const newContainers = { ...prev };
      delete newContainers[insightId];
      return newContainers;
    });
  }, [containerConnections]);

  // Dataset container handlers
  const handleDatasetClose = useCallback((datasetId) => {
    setDatasetContainers(prev => {
      const newContainers = { ...prev };
      delete newContainers[datasetId];
      return newContainers;
    });
    
    // Remove connection
    setContainerConnections(prev => {
      const newConnections = { ...prev };
      delete newConnections[datasetId];
      return newConnections;
    });
  }, []);

  // Chart container handlers
  const handleChartClose = useCallback((chartId) => {
    setChartContainers(prev => {
      const newContainers = { ...prev };
      delete newContainers[chartId];
      return newContainers;
    });
    
    // Remove connection
    setContainerConnections(prev => {
      const newConnections = { ...prev };
      delete newConnections[chartId];
      return newConnections;
    });
  }, []);

  // Enhanced column selection handler for dataset containers
  const handleDatasetColumnToggle = useCallback((datasetId, columnName) => {
    console.log('🔗 Dataset column button clicked:', {
      datasetId,
      columnName,
      currentColumns: Object.keys(columnPositions)
    });
    
    const dataset = datasetContainers[datasetId];
    if (!dataset) {
      console.log('❌ Dataset not found:', datasetId);
      return;
    }
    
    // Find the rightmost column position
    const columns = getCurrentTableColumns();
    const rightmostPosition = Math.max(...Object.values(columnPositions).map(pos => pos.x), 0);
    const newColumnKey = columnName.toLowerCase().replace(/\s+/g, '_');
    const newColumnPosition = {
      x: rightmostPosition + 304, // 280px width + 24px gap
      y: 0,
      order: columns.length,
      scale: 1
    };
    
    console.log('📍 New column position:', newColumnPosition);
    
    // Create new column data structure
    const newColumn = {
      key: newColumnKey,
      display: getHumanReadableColumnName(columnName),
      type: getColumnDataType(columnName),
      dataType: getColumnDataType(columnName)
    };
    
    console.log('🆕 Creating new column:', newColumn);
    
    // Add to column positions first
    setColumnPositions(prev => {
      const updated = {
        ...prev,
        [newColumn.key]: newColumnPosition
      };
      console.log('📊 Updated column positions:', updated);
      return updated;
    });
    
    // Track the relationship
    setContainerConnections(prev => ({
      ...prev,
      [`column-${newColumn.key}`]: {
        parentId: datasetId,
        parentType: 'dataset',
        childType: 'column',
        addedColumn: newColumn
      }
    }));
    
    // Animate the new column with proper timing
    setTimeout(() => {
      console.log('🎬 Starting column animation for:', newColumn.key);
      animateNewColumn(newColumn.key);
    }, 100);
    
    console.log('✅ Dataset column click handled successfully');
  }, [datasetContainers, columnPositions, animateNewColumn, getCurrentTableColumns]);

  // Dataset Container Components
  const DatasetContainerComponent = styled.div`
    width: 380px;
    min-height: auto;
    height: auto;
    border-radius: 12px;
    background: white;
    border: ${props => props.isDragging ? '2px solid rgba(99, 91, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)'};
    box-shadow: ${props => props.isDragging ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)'};
    position: absolute;
    left: ${props => `${props.x || 0}px`};
    top: ${props => `${props.y || 0}px`};
    z-index: ${props => props.isDragging ? 1000 : 1};
    cursor: ${props => props.isDragging ? 'grabbing' : 'default'};
    transition: ${props => props.isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'};
    transform: ${props => {
      const scale = props.scale || 1;
      if (props.isDragging) {
        return `scale(${Math.max(scale, 1.02)})`;
      }
      return `scale(${scale})`;
    }};
    overflow: visible;
    display: flex;
    flex-direction: column;
  `;

  const DatasetHeaderComponent = styled.div`
    padding: 16px 20px 12px 20px;
    cursor: grab;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:active {
      cursor: grabbing;
    }
  `;

  const DatasetContentComponent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
  `;

  const DatasetColumnsListComponent = styled.div`
    display: flex;
    flex-direction: column;
  `;

  const DatasetColumnItemComponent = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 8px;
    cursor: pointer;
    border-bottom: 1px solid #F1F5F9;
    transition: background-color 0.15s ease;
    
    &:hover {
      background-color: #F8FAFC;
    }
    
    &:last-child {
      border-bottom: none;
    }
  `;

  const DatasetColumnNameComponent = styled.span`
    font-weight: 500;
    color: #1F2937;
  `;

  const DatasetColumnCheckboxComponent = styled.input`
    width: 14px;
    height: 14px;
    cursor: pointer;
  `;

  // Chart Container Components  
  const ChartContainerComponent = styled.div`
    width: 420px;
    min-height: auto;
    height: auto;
    border-radius: 12px;
    background: white;
    border: ${props => props.isDragging ? '2px solid rgba(99, 91, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)'};
    box-shadow: ${props => props.isDragging ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)'};
    position: absolute;
    left: ${props => `${props.x || 0}px`};
    top: ${props => `${props.y || 0}px`};
    z-index: ${props => props.isDragging ? 1000 : 1};
    cursor: ${props => props.isDragging ? 'grabbing' : 'default'};
    transition: ${props => props.isDragging ? 'none' : 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'};
    transform: ${props => {
      const scale = props.scale || 1;
      if (props.isDragging) {
        return `scale(${Math.max(scale, 1.02)})`;
      }
      return `scale(${scale})`;
    }};
    overflow: visible;
    display: flex;
    flex-direction: column;
  `;

  const ChartHeaderComponent = styled.div`
    padding: 16px 20px 12px 20px;
    cursor: grab;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:active {
      cursor: grabbing;
    }
  `;

  const ChartContentComponent = styled.div`
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;

  const ChartVisualizationComponent = styled.div`
    width: 100%;
    height: 250px;
    position: relative;
  `;

  // Dataset container drag handlers
  const handleDatasetMouseDown = useCallback((e, datasetId) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    e.preventDefault();
    e.stopPropagation();
    
    setDraggingDataset(datasetId);
    setIsDatasetDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDatasetDragOffset({ x: offsetX, y: offsetY });
  }, []);

  const handleDatasetMouseMove = useCallback((e) => {
    if (!isDatasetDragging || !draggingDataset) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const newX = (e.clientX - canvasRect.left - panX - datasetDragOffset.x) / zoom;
    const newY = (e.clientY - canvasRect.top - panY - datasetDragOffset.y) / zoom;
    
    setDatasetContainers(prev => ({
      ...prev,
      [draggingDataset]: {
        ...prev[draggingDataset],
        position: { x: newX, y: newY }
      }
    }));
  }, [isDatasetDragging, draggingDataset, panX, panY, zoom, datasetDragOffset]);

  const handleDatasetMouseUp = useCallback(() => {
    setIsDatasetDragging(false);
    setDraggingDataset(null);
    setDatasetDragOffset({ x: 0, y: 0 });
  }, []);

  // Chart container drag handlers
  const handleChartMouseDown = useCallback((e, chartId) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    e.preventDefault();
    e.stopPropagation();
    
    setDraggingChart(chartId);
    setIsChartDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setChartDragOffset({ x: offsetX, y: offsetY });
  }, []);

  const handleChartMouseMove = useCallback((e) => {
    if (!isChartDragging || !draggingChart) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const newX = (e.clientX - canvasRect.left - panX - chartDragOffset.x) / zoom;
    const newY = (e.clientY - canvasRect.top - panY - chartDragOffset.y) / zoom;
    
    setChartContainers(prev => ({
      ...prev,
      [draggingChart]: {
        ...prev[draggingChart],
        position: { x: newX, y: newY }
      }
    }));
  }, [isChartDragging, draggingChart, panX, panY, zoom, chartDragOffset]);

  const handleChartMouseUp = useCallback(() => {
    setIsChartDragging(false);
    setDraggingChart(null);
    setChartDragOffset({ x: 0, y: 0 });
  }, []);

  // Add dataset container mouse event listeners
  useEffect(() => {
    if (isDatasetDragging) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      const handleMouseMoveGlobal = (e) => {
        e.preventDefault();
        handleDatasetMouseMove(e);
      };
      
      const handleMouseUpGlobal = (e) => {
        e.preventDefault();
        handleDatasetMouseUp(e);
      };
      
      const preventContextMenu = (e) => e.preventDefault();
      
      document.addEventListener('mousemove', handleMouseMoveGlobal, { capture: true, passive: false });
      document.addEventListener('mouseup', handleMouseUpGlobal, { capture: true, passive: false });
      document.addEventListener('contextmenu', preventContextMenu, { capture: true });
      
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        document.removeEventListener('mousemove', handleMouseMoveGlobal, { capture: true });
        document.removeEventListener('mouseup', handleMouseUpGlobal, { capture: true });
        document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      };
    }
  }, [isDatasetDragging, handleDatasetMouseMove, handleDatasetMouseUp]);

  // Add chart container mouse event listeners
  useEffect(() => {
    if (isChartDragging) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      const handleMouseMoveGlobal = (e) => {
        e.preventDefault();
        handleChartMouseMove(e);
      };
      
      const handleMouseUpGlobal = (e) => {
        e.preventDefault();
        handleChartMouseUp(e);
      };
      
      const preventContextMenu = (e) => e.preventDefault();
      
      document.addEventListener('mousemove', handleMouseMoveGlobal, { capture: true, passive: false });
      document.addEventListener('mouseup', handleMouseUpGlobal, { capture: true, passive: false });
      document.addEventListener('contextmenu', preventContextMenu, { capture: true });
      
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        document.removeEventListener('mousemove', handleMouseMoveGlobal, { capture: true });
        document.removeEventListener('mouseup', handleMouseUpGlobal, { capture: true });
        document.removeEventListener('contextmenu', preventContextMenu, { capture: true });
      };
    }
  }, [isChartDragging, handleChartMouseMove, handleChartMouseUp]);

  // Debug logging for container states
  useEffect(() => {
    console.log('🏠 Container states updated:', {
      insightContainers: Object.keys(insightContainers).length,
      datasetContainers: Object.keys(datasetContainers).length,
      chartContainers: Object.keys(chartContainers).length,
      containerConnections: Object.keys(containerConnections).length
    });
    console.log('📊 Dataset containers:', datasetContainers);
    console.log('📈 Chart containers:', chartContainers);
  }, [insightContainers, datasetContainers, chartContainers, containerConnections]);

  // Function to get column descriptions for dataset columns
  const getColumnDescription = (columnName) => {
    const descriptions = {
      'order_id': 'Unique identifier for each order',
      'product_id': 'Product identifier reference',
      'quantity': 'Number of items ordered',
      'subtotal': 'Pre-tax order amount',
      'tax': 'Applied tax amount',
      'total': 'Final order total including tax',
      'customer_id': 'Customer account identifier',
      'charge_id': 'Payment transaction reference',
      'amount': 'Transaction monetary value',
      'status': 'Current transaction state',
      'payment_method': 'Payment processing method',
      'currency': 'Transaction currency code',
      'created_at': 'Record creation timestamp',
      'net_revenue': 'Revenue after fees and taxes',
      'email': 'Customer email address',
      'subscription_id': 'Recurring payment identifier',
      'invoice_id': 'Billing document reference',
      'plan_id': 'Subscription plan reference',
      'mrr': 'Monthly recurring revenue',
      'ltv': 'Customer lifetime value',
      'churn_flag': 'Customer retention indicator',
      'usage_type': 'Resource consumption category',
      'fee_amount': 'Processing fee charged',
      'refund_id': 'Payment reversal identifier',
      'dispute_id': 'Chargeback case reference',
      'aov_average_order_value': 'Average order value metric',
      'sku_level_revenue': 'Product-level revenue breakdown'
    };
    
    // Clean column name for lookup
    const cleanName = columnName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return descriptions[cleanName] || descriptions[columnName] || 'Dataset column field';
  };

  // Function to get all columns from a dataset (combining key entities and derived fields)
  const getAllDatasetColumns = (dataset) => {
    const keyEntities = (dataset.keyEntities || []).map(col => ({ name: col, type: 'key' }));
    const derivedFields = (dataset.derivedFields || []).map(col => ({ name: col, type: 'derived' }));
    return [...keyEntities, ...derivedFields];
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
            {getDisplayTitle()}
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
          <PanelHeader>
            <PanelTitle>Datasets</PanelTitle>
            <PanelSubtitle>Configure data sources for your {isEditingReport ? 'report' : 'metric'}</PanelSubtitle>
          </PanelHeader>
          <PanelContent>
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
                                <ColumnItem 
                                  key={column}
                                  onClick={() => toggleColumnSelection(key, column)}
                                >
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
                                <ColumnItem 
                                  key={column}
                                  onClick={() => toggleColumnSelection(key, column)}
                                >
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
          </PanelContent>
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
              <ColumnModulesContainer>
                {/* Connector overlay for bezier curves */}
                <ConnectorOverlay>
                  {getCurrentTableColumns().slice(0, -1).map((column, index) => {
                    const currentPosition = columnPositions[column.key] || { x: index * 304, y: 0 };
                    const nextColumn = getCurrentTableColumns()[index + 1];
                    const nextPosition = columnPositions[nextColumn.key] || { x: (index + 1) * 304, y: 0 };
                    
                    // Calculate anchor points (right edge of current, left edge of next)
                    const startPoint = {
                      x: currentPosition.x + 280, // Right edge of column (280px width)
                      y: currentPosition.y + 24   // 24px from top
                    };
                    
                    const endPoint = {
                      x: nextPosition.x,          // Left edge of next column
                      y: nextPosition.y + 24     // 24px from top
                    };
                    
                    const pathData = generateConnectorPath(startPoint, endPoint);
                    
                    return (
                      <ConnectorLine
                        key={`connector-${index}`}
                        d={pathData}
                      />
                    );
                  })}
                  
                  {/* Connectors from columns to insights */}
                  {Object.values(insightContainers).map((insight) => {
                    const columnPosition = columnPositions[insight.columnKey];
                    if (!columnPosition) return null;
                    
                    // Determine attachment point based on insight type
                    let attachmentX;
                    switch (insight.type) {
                      case 'definition':
                        attachmentX = columnPosition.x + 56; // Bottom-left (20% from left edge)
                        break;
                      case 'analysis':
                        attachmentX = columnPosition.x + 224; // Bottom-right (80% from left edge)
                        break;
                      case 'related':
                        attachmentX = columnPosition.x + 140; // Bottom-center (50% from left edge)
                        break;
                      default:
                        attachmentX = columnPosition.x + 140; // Default to center
                    }
                    
                    const startPoint = {
                      x: attachmentX,
                      y: columnPosition.y + 550  // Actual column bottom position
                    };
                    
                    const endPoint = {
                      x: insight.position.x + (insight.contentWidth / 2), // Center of insight
                      y: insight.position.y      // Top edge of insight
                    };
                    
                    const pathData = generateConnectorPath(startPoint, endPoint);
                    
                    return (
                      <ConnectorLine
                        key={`insight-connector-${insight.id}`}
                        d={pathData}
                      />
                    );
                  })}
                </ConnectorOverlay>
                
                {/* Anchor points positioned absolutely */}
                {getCurrentTableColumns().map((column, index) => {
                  const position = columnPositions[column.key] || { x: index * 304, y: 0 };
                  return (
                    <Fragment key={`anchors-${column.key}`}>
                      {/* Left anchor point (except for first column) */}
                      {index > 0 && (
                        <AnchorPoint 
              style={{
                            left: `${position.x}px`,
                            top: `${position.y + 24}px`
                          }}
                        />
                      )}
                      {/* Right anchor point (except for last column) */}
                      {index < getCurrentTableColumns().length - 1 && (
                        <AnchorPoint 
              style={{
                            left: `${position.x + 280}px`,
                            top: `${position.y + 24}px`
                          }}
                        />
                      )}
                    </Fragment>
                  );
                })}
                
                {/* Anchor points for insight connectors */}
                {Object.values(insightContainers).map((insight) => {
                  const columnPosition = columnPositions[insight.columnKey];
                  if (!columnPosition) return null;
                  
                  // Calculate attachment point based on insight type
                  let attachmentX;
                  switch (insight.type) {
                    case 'definition':
                      attachmentX = columnPosition.x + 56; // Bottom-left
                      break;
                    case 'analysis':
                      attachmentX = columnPosition.x + 224; // Bottom-right
                      break;
                    case 'related':
                      attachmentX = columnPosition.x + 140; // Bottom-center
                      break;
                    default:
                      attachmentX = columnPosition.x + 140;
                  }
                  
                  return (
                    <Fragment key={`insight-anchors-${insight.id}`}>
                      {/* Anchor at column bottom */}
                      <AnchorPoint 
                        style={{
                          left: `${attachmentX}px`,
                          top: `${columnPosition.y + 550}px` // Actual column bottom position
                        }}
                      />
                      {/* Anchor at insight top */}
                      <AnchorPoint 
                        style={{
                          left: `${insight.position.x + (insight.contentWidth / 2)}px`,
                          top: `${insight.position.y}px`
                        }}
                      />
                    </Fragment>
                  );
                })}
                
                {getCurrentTableColumns().map((column, index) => {
                  console.log(`🔍 Rendering column ${index}:`, column.display, column);
                  console.log(`📊 filteredTransactions:`, filteredTransactions ? filteredTransactions.length : 'undefined', filteredTransactions?.[0]);
                  
                  const position = columnPositions[column.key] || { x: index * 304, y: 0 };
                  
                  let analysis;
                  try {
                    analysis = analyzeColumnData(column, filteredTransactions);
                    console.log(`📊 Analysis result for ${column.display}:`, analysis);
                  } catch (error) {
                    console.error(`❌ Error analyzing ${column.display}:`, error);
                    analysis = {
                      type: 'bar',
                      summary: 'Error loading chart',
                      chartData: { 
                        labels: ['Error'], 
                        datasets: [{ data: [0], backgroundColor: '#FF6B6B' }] 
                      }
                    };
                  }
                  
                  const isDragging = draggingColumn === column.key;
                  const isHovered = hoveredColumn === column.key;
                  
                  // Enhanced debug logging for hover state
                  console.log('🔍 Column render debug:', {
                    columnKey: column.key,
                    hoveredColumn,
                    isHovered,
                    isDragging,
                    comparison: `${hoveredColumn} === ${column.key} = ${hoveredColumn === column.key}`
                  });
                  
                  return (
                    <ColumnModule
                      key={column.key}
                      data-column-key={column.key}
                      isDragging={isDragging}
                      x={position.x}
                      y={position.y}
                      scale={position.scale || 1}
                      onMouseDown={(e) => handleColumnMouseDown(e, column.key)}
                      onMouseEnter={(e) => handleColumnHoverEnter(e, column.key)}
                      onMouseMove={(e) => handleColumnHoverMove(e, column.key)}
                      onMouseLeave={(e) => handleColumnHoverLeave(e, column.key)}
                    >
                      <ColumnHeader onMouseDown={(e) => handleColumnMouseDown(e, column.key)}>
                        <ColumnTitleRow>
                          <ColumnTitle>{column.display}</ColumnTitle>
                          <DataTypeIcon>
                            {getDataTypeIcon(column.dataType || column.type)}
                          </DataTypeIcon>
                        </ColumnTitleRow>
                        <ChartContainer>
                          {renderDataVisualization(analysis, column)}
                        </ChartContainer>
                        <SummaryText>
                          <SummaryTextLeft>{analysis.summary}</SummaryTextLeft>
                          {analysis.median && <SummaryTextRight>{analysis.median}</SummaryTextRight>}
                        </SummaryText>
                      </ColumnHeader>
                      
                      <ColumnContent>
                        {currentTransactions.slice(0, 10).map((transaction, rowIndex) => {
                          const value = transaction[column.key];
                          const formattedValue = formatCellValue(value, column);
                          return (
                            <DataRow key={`${transaction.id}-${column.key}`}>
                              {formattedValue}
                            </DataRow>
                          );
                        })}
                      </ColumnContent>
                      
                      {/* Action buttons container */}
                      <ColumnActionContainer 
                        visible={isHovered}
                        onMouseEnter={() => {
                          console.log('🎯 Mouse entered button container for:', column.key);
                          setHoveredColumnDebug(column.key);
                        }}
                        onMouseLeave={() => {
                          console.log('🎯 Mouse left button container for:', column.key);
                          setHoveredColumnDebug(null);
                        }}
                      >
                        {/* SVG Curved Branch Connectors */}
                        <ButtonBranchConnector>
                          {(() => {
                            // Determine which buttons are visible
                            const hasDefine = !insightContainers[`${column.key}-definition`];
                            const hasAnalyze = !insightContainers[`${column.key}-analysis`];
                            const hasRelated = !insightContainers[`${column.key}-related`];
                            
                            const visibleButtons = [];
                            if (hasDefine) visibleButtons.push({ type: 'define', x: 75 });
                            if (hasAnalyze) visibleButtons.push({ type: 'analyze', x: 150 });
                            if (hasRelated) visibleButtons.push({ type: 'related', x: 225 });
                            
                            // If only one button, just show straight vertical line
                            if (visibleButtons.length === 1) {
                              return (
                                <line 
                                  x1="150" 
                                  y1="0" 
                                  x2={visibleButtons[0].x} 
                                  y2="22" 
                                  stroke="#D8DEE4" 
                                  strokeWidth="1.5"
                                />
                              );
                            }
                            
                            // For multiple buttons, create adaptive tree
                            const leftmost = Math.min(...visibleButtons.map(b => b.x));
                            const rightmost = Math.max(...visibleButtons.map(b => b.x));
                            
                            return (
                              <>
                                {/* Main vertical stem */}
                                <line 
                                  x1="150" 
                                  y1="0" 
                                  x2="150" 
                                  y2="12" 
                                  stroke="#D8DEE4" 
                                  strokeWidth="1.5"
                                />
                                
                                {/* Horizontal line only between visible buttons */}
                                <line 
                                  x1={leftmost} 
                                  y1="12" 
                                  x2={rightmost} 
                                  y2="12" 
                                  stroke="#D8DEE4" 
                                  strokeWidth="1.5"
                                />
                                
                                {/* Individual branches to each visible button */}
                                {visibleButtons.map(button => (
                                  <g key={button.type}>
                                    {button.x === 150 ? (
                                      // Center button - straight line
                                      <line 
                                        x1="150" 
                                        y1="12" 
                                        x2="150" 
                                        y2="22" 
                                        stroke="#D8DEE4" 
                                        strokeWidth="1.5"
                                      />
                                    ) : (
                                      // Side buttons - curved corners
                                      <path 
                                        d={`M ${button.x} 12 L ${button.x} 15 Q ${button.x} 18, ${button.x} 18 L ${button.x} 22`}
                                        stroke="#D8DEE4" 
                                        strokeWidth="1.5" 
                                        fill="none"
                                      />
                                    )}
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </ButtonBranchConnector>
                        
                        {console.log('🔥 Rendering buttons for column:', column.key, 'isHovered:', isHovered, 'visible:', isHovered)}
                        
                        {/* Only show Define button if definition insight doesn't exist */}
                        {!insightContainers[`${column.key}-definition`] && (
                          <ColumnActionButton onClick={() => handleDefineClick(column.key)}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Define
                          </ColumnActionButton>
                        )}
                        
                        {/* Only show Analyze button if analysis insight doesn't exist */}
                        {!insightContainers[`${column.key}-analysis`] && (
                          <ColumnActionButton isActive={true} onClick={() => handleAnalyzeClick(column.key)}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 9L12 6L16 10L20 6L22 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Analyze
                          </ColumnActionButton>
                        )}
                        
                        {/* Only show Related button if related insight doesn't exist */}
                        {!insightContainers[`${column.key}-related`] && (
                          <ColumnActionButton onClick={() => handleRelatedClick(column.key)}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Related
                          </ColumnActionButton>
                        )}
                      </ColumnActionContainer>
                    </ColumnModule>
                  );
                })}
                
                {/* Insight Containers */}
                {Object.values(insightContainers).map((insight) => {
                  const isDragging = draggingInsight === insight.id;
                  const isHovered = insightHoverStates[insight.id];
                  
                  console.log('🏠 Rendering insight:', {
                    id: insight.id,
                    type: insight.type,
                    isHovered,
                    hasDatasets: insight.type === 'definition' && insight.data?.datasets?.length > 0,
                    datasetCount: insight.data?.datasets?.length || 0
                  });
                  
                  return (
                    <InsightContainer
                      key={insight.id}
                      isDragging={isDragging}
                      x={insight.position.x}
                      y={insight.position.y}
                      contentWidth={insight.contentWidth}
                      onMouseDown={(e) => handleInsightMouseDown(e, insight.id)}
                      onMouseEnter={(e) => {
                        console.log('🟢 Insight container hover enter:', insight.id);
                        setInsightHoverStates(prev => ({ ...prev, [insight.id]: true }));
                      }}
                      onMouseLeave={(e) => {
                        console.log('🟡 Insight container hover leave:', insight.id);
                        // Only hide if not moving to the buttons area
                        const rect = e.currentTarget.getBoundingClientRect();
                        const buttonsAreaTop = rect.bottom;
                        const buttonsAreaBottom = rect.bottom + 100; // Approximate buttons area
                        const mouseY = e.clientY;
                        
                        // If mouse is moving toward the buttons area, delay hiding
                        if (mouseY >= buttonsAreaTop && mouseY <= buttonsAreaBottom) {
                          console.log('🎯 Mouse moving toward buttons area, delaying hide');
                          setTimeout(() => {
                            // Double-check hover state after delay
                            setInsightHoverStates(prev => {
                              // Only hide if no explicit hover state was set by buttons
                              if (!prev[insight.id + '_locked']) {
                                return { ...prev, [insight.id]: false };
                              }
                              return prev;
                            });
                          }, 300);
                        } else {
                          setInsightHoverStates(prev => ({ ...prev, [insight.id]: false }));
                        }
                      }}
                    >
                      <InsightHeader onMouseDown={(e) => handleInsightMouseDown(e, insight.id)}>
                        <InsightTitle>
                          {insight.type === 'definition' 
                            ? `${getHumanReadableColumnName(insight.columnKey)} definition`
                            : insight.title
                          }
                        </InsightTitle>
                        <InsightCloseButton onClick={() => handleEnhancedInsightClose(insight.id)}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </InsightCloseButton>
                      </InsightHeader>
                      
                      <InsightContent>
                        {insight.type === 'definition' && (
                          <>
                            <div style={{ padding: '16px', paddingBottom: '12px' }}>
                              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginBottom: '16px' }}>
                                {insight.data.definition}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
                                Appears in {insight.data.datasetCount} datasets
                              </div>
          </div>

                            {/* Dataset rows */}
                            <div style={{ borderTop: '1px solid #F1F5F9' }}>
                              {insight.data.datasets.map((dataset, index) => {
                                // Check if this dataset has already been added
                                const datasetExists = Object.values(datasetContainers).some(
                                  container => container.datasetKey === dataset.key && 
                                  containerConnections[container.id]?.parentId === insight.id
                                );
                                
                                return (
                                  <div
                                    key={dataset.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                                      padding: '8px 16px',
                gap: '8px',
                                      cursor: datasetExists ? 'default' : 'pointer',
                                      borderBottom: index < insight.data.datasets.length - 1 ? '1px solid #F1F5F9' : 'none',
                                      transition: 'background-color 0.15s ease',
                                      backgroundColor: datasetExists ? '#F8FAFC' : 'transparent'
                                    }}
                                    onClick={datasetExists ? undefined : () => handleDatasetClick(insight.columnKey, dataset, insight.id)}
                                    onMouseEnter={(e) => {
                                      if (!datasetExists) {
                                        e.target.style.backgroundColor = '#F8FAFC';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!datasetExists) {
                                        e.target.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    <div style={{ flex: 1 }}>
                                      <span style={{ fontSize: '13px', color: '#374151' }}>
                                        {dataset.name}
                                      </span>
                                    </div>
                                    
                                    {datasetExists ? (
              <div style={{
                    display: 'flex',
                    alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#10B981',
                                        fontWeight: '500'
                                      }}>
                                        <svg 
                                          viewBox="0 0 20 20" 
                                          fill="currentColor" 
                                          style={{ width: '14px', height: '14px' }}
                                        >
                                          <path 
                                            fillRule="evenodd" 
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                            clipRule="evenodd" 
                                          />
                                        </svg>
                                        Showing
                                      </div>
                                    ) : (
                                      <div style={{
                    display: 'flex',
                    alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#6B7280',
                                        fontWeight: '500'
                                      }}>
                                        <svg 
                                          viewBox="0 0 24 24" 
                                          fill="none" 
                                          xmlns="http://www.w3.org/2000/svg" 
                                          style={{ width: '14px', height: '14px' }}
                                        >
                                          <path 
                                            d="M12 5V19" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          />
                                          <path 
                                            d="M5 12H19" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        Show
              </div>
            )}
          </div>
                                );
                              })}
        </div>
                          </>
                        )}
                        
                        {insight.type === 'analysis' && (
                          <>
                            <InsightText>{insight.data}</InsightText>
                            
                            {/* Chart Button */}
      <div style={{
                              padding: '12px 16px',
                              borderTop: '1px solid #F1F5F9',
                              display: 'flex',
                              justifyContent: 'center'
                            }}>
                              {(() => {
                                // Check if chart container already exists for this insight
                                const chartId = `${insight.columnKey}-chart`;
                                const chartExists = chartContainers[chartId];
                                
                                if (chartExists) {
                                  return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '8px 16px',
                                      background: '#F0FDF4',
                                      color: '#10B981',
                                      border: '1px solid #D1FAE5',
                                      borderRadius: '20px',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      whiteSpace: 'nowrap',
                                      minWidth: 'fit-content'
                                    }}>
                                      <svg 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor" 
                                        style={{ width: '14px', height: '14px' }}
                                      >
                                        <path 
                                          fillRule="evenodd" 
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                          clipRule="evenodd" 
                                        />
                                      </svg>
                                      Chart added
                </div>
                                  );
                                }
                                
                                return (
                <button
                  style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                    padding: '8px 16px',
                                      background: 'white',
                                      color: '#374151',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '20px',
                    fontSize: '13px',
                                      fontWeight: '500',
                    cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                      whiteSpace: 'nowrap',
                                      minWidth: 'fit-content'
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleChartClick(insight.columnKey, insight.data, insight.id);
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = '#F9FAFB';
                                      e.target.style.transform = 'translateY(-1px)';
                                      e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = 'white';
                                      e.target.style.transform = 'translateY(0)';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  >
                                    <svg 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      style={{ width: '14px', height: '14px' }}
                                    >
                                      <path 
                                        d="M3 3V21H21" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                      <path 
                                        d="M9 9L12 6L16 10L20 6L22 8" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Show chart
                </button>
                                );
                              })()}
              </div>
                          </>
                        )}
                        
                        {insight.type === 'related' && (
                          <div>
                            {insight.data.map((relatedColumn, index) => {
                              // Check if this column has already been added - improved detection
                              const columnKey = relatedColumn.name.toLowerCase().replace(/\s+/g, '_');
                              const columnExists = getCurrentTableColumns().some(
                                col => col.key === columnKey || 
                                       col.display.toLowerCase() === relatedColumn.name.toLowerCase() ||
                                       col.key.includes(columnKey) ||
                                       columnKey.includes(col.key)
                              );
                              
                              return (
                                <div
                                  key={index}
                                  style={{
              display: 'flex',
              alignItems: 'center',
                                    padding: '12px 16px',
                                    gap: '8px',
                                    cursor: columnExists ? 'default' : 'pointer',
                                    borderBottom: index < insight.data.length - 1 ? '1px solid #F1F5F9' : 'none',
                                    transition: 'background-color 0.15s ease',
                                    backgroundColor: columnExists ? '#F8FAFC' : 'transparent'
                                  }}
                                  onClick={columnExists ? undefined : () => handleRelatedColumnClick(insight.columnKey, relatedColumn, insight.id)}
                                  onMouseEnter={(e) => {
                                    if (!columnExists) {
                                      e.target.style.backgroundColor = '#F8FAFC';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!columnExists) {
                                      e.target.style.backgroundColor = 'transparent';
                                    }
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: '500', marginBottom: '2px' }}>
                                      {relatedColumn.name}
            </div>
                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                      {relatedColumn.description}
                                    </div>
          </div>
          
                                  {columnExists ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
                                      gap: '4px',
                                      fontSize: '12px',
                                      color: '#10B981',
                                      fontWeight: '500'
                                    }}>
                                      <svg 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor" 
                                        style={{ width: '14px', height: '14px' }}
                                      >
                                        <path 
                                          fillRule="evenodd" 
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                          clipRule="evenodd" 
                                        />
                                      </svg>
                                      Added
              </div>
                                  ) : (
              <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '12px',
                                      color: '#6B7280',
                                      fontWeight: '500'
                                    }}>
                                      <svg 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        style={{ width: '14px', height: '14px' }}
                                      >
                                        <path 
                                          d="M12 5V19" 
                                          stroke="currentColor" 
                                          strokeWidth="2" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"
                                        />
                                        <path 
                                          d="M5 12H19" 
                                          stroke="currentColor" 
                                          strokeWidth="2" 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      Add to table
                </div>
                                  )}
              </div>
                              );
                            })}
                          </div>
                        )}
                      </InsightContent>
                    </InsightContainer>
                  );
                })}
                
                {/* Dataset Containers */}
                {Object.values(datasetContainers).map((dataset) => {
                  const isDragging = draggingDataset === dataset.id;
                  
                  return (
                    <DatasetContainerComponent
                      key={dataset.id}
                      isDragging={isDragging}
                      x={dataset.position.x}
                      y={dataset.position.y}
                      scale={zoom}
                    >
                      <DatasetHeaderComponent
                        onMouseDown={(e) => handleDatasetMouseDown(e, dataset.id)}
                      >
                        <InsightTitle>{dataset.title}</InsightTitle>
                        <InsightCloseButton onClick={() => handleDatasetClose(dataset.id)}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </InsightCloseButton>
                      </DatasetHeaderComponent>
                      
                      <DatasetContentComponent>
                        {/* Columns List - Updated to match related columns layout */}
                        <div>
                          {getAllDatasetColumns(dataset.dataset).map((column, index) => {
                            // Check if this column has already been added
                            const columnKey = column.name.toLowerCase().replace(/\s+/g, '_');
                            const columnExists = getCurrentTableColumns().some(
                              col => col.key === columnKey || 
                                     col.display.toLowerCase() === column.name.toLowerCase() ||
                                     col.key.includes(columnKey) ||
                                     columnKey.includes(col.key)
                            );
                            
                            return (
                              <div
                                key={`${column.type}-${column.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                                  padding: '12px 16px',
                                  gap: '8px',
                                  cursor: columnExists ? 'default' : 'pointer',
                                  borderBottom: index < getAllDatasetColumns(dataset.dataset).length - 1 ? '1px solid #F1F5F9' : 'none',
                                  transition: 'background-color 0.15s ease',
                                  backgroundColor: columnExists ? '#F8FAFC' : 'transparent'
                                }}
                                onClick={columnExists ? undefined : (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDatasetColumnToggle(dataset.id, column.name);
                                }}
                                onMouseEnter={(e) => {
                                  if (!columnExists) {
                                    e.target.style.backgroundColor = '#F8FAFC';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!columnExists) {
                                    e.target.style.backgroundColor = 'transparent';
                                  }
                                }}
                  >
                    <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: '500', marginBottom: '2px' }}>
                                    {getHumanReadableColumnName(column.name)}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                    {getColumnDescription(column.name)}
                                  </div>
                                </div>
                                
                                {columnExists ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                                    gap: '4px',
                          fontSize: '12px',
                                    color: '#10B981',
                                    fontWeight: '500'
                                  }}>
                                    <svg 
                                      viewBox="0 0 20 20" 
                                      fill="currentColor" 
                                      style={{ width: '14px', height: '14px' }}
                                    >
                                      <path 
                                        fillRule="evenodd" 
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                        clipRule="evenodd" 
                                      />
                                    </svg>
                                    Added
                  </div>
                                ) : (
                      <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    color: '#6B7280',
                                    fontWeight: '500'
                                  }}>
                                    <svg 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      style={{ width: '14px', height: '14px' }}
                                    >
                                      <path 
                                        d="M12 5V19" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                      <path 
                                        d="M5 12H19" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    Add to table
                    </div>
                  )}
                </div>
                            );
                          })}
          </div>
                      </DatasetContentComponent>
                    </DatasetContainerComponent>
                  );
                })}
                
                {/* Chart Containers */}
                {Object.values(chartContainers).map((chart) => {
                  const isDragging = draggingChart === chart.id;
                  
                  return (
                    <ChartContainerComponent
                      key={chart.id}
                      isDragging={isDragging}
                      x={chart.position.x}
                      y={chart.position.y}
                      scale={zoom}
                    >
                      <ChartHeaderComponent
                        onMouseDown={(e) => handleChartMouseDown(e, chart.id)}
                      >
                        <InsightTitle>{chart.title}</InsightTitle>
                        <InsightCloseButton onClick={() => handleChartClose(chart.id)}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </InsightCloseButton>
                      </ChartHeaderComponent>
                      
                      <ChartContentComponent>
                        <ChartVisualizationComponent>
                          {chart.chartData && (
                            <div style={{ width: '100%', height: '250px', padding: '8px' }}>
                              {chart.chartData.type === 'line' && (
                                <Line
                                  data={chart.chartData.data}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        display: false
                                      },
                                      tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: '#635DFF',
                                        borderWidth: 1
                                      }
                                    },
                                    scales: {
                                      x: {
                                        grid: {
                                          color: '#E2E8F0'
                                        },
                                        ticks: {
                                          color: '#64748B',
                                          fontSize: 10
                                        }
                                      },
                                      y: {
                                        grid: {
                                          color: '#E2E8F0'
                                        },
                                        ticks: {
                                          color: '#64748B',
                                          fontSize: 10
                                        }
                                      }
                                    }
                                  }}
                                />
                              )}
                              {chart.chartData.type === 'bar' && (
                                <Bar
                                  data={chart.chartData.data}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        display: false
                                      },
                                      tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: '#635DFF',
                                        borderWidth: 1
                                      }
                                    },
                                    scales: {
                                      x: {
                                        grid: {
                                          color: '#E2E8F0'
                                        },
                                        ticks: {
                                          color: '#64748B',
                                          fontSize: 10
                                        }
                                      },
                                      y: {
                                        grid: {
                                          color: '#E2E8F0'
                                        },
                                        ticks: {
                                          color: '#64748B',
                                          fontSize: 10
                                        }
                                      }
                                    }
                                  }}
                                />
                              )}
                              {chart.chartData.type === 'pie' && (
                                <Pie
                                  data={chart.chartData.data}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'bottom',
                                        labels: {
                                          color: '#64748B',
                                          fontSize: 10,
                                          padding: 10
                                        }
                                      },
                                      tooltip: {
                                        enabled: true,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: '#635DFF',
                                        borderWidth: 1
                                      }
                                    }
                                  }}
                                />
                              )}
              </div>
            )}
                        </ChartVisualizationComponent>
                        
                        {chart.chartData && (
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            padding: '12px 16px' 
                          }}>
                            <button
                    style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                background: 'white',
                                color: '#374151',
                                border: '1px solid #E5E7EB',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '500',
                      cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
                                height: '32px'
                              }}
                              onClick={() => {
                                console.log('📌 Pin chart clicked for:', chart.title);
                                // TODO: Implement pin chart functionality
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#F9FAFB';
                      e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                              onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)';
                              }}
                            >
                              <svg 
                                aria-hidden="true" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ width: '14px', height: '14px' }}
                              >
                                <path 
                                  fillRule="evenodd" 
                                  clipRule="evenodd" 
                                  d="m11.98 9.48 3.005-4.096a2 2 0 0 0 .387-1.15 2.042 2.042 0 0 0-.585-1.447l-1.574-1.574a1.997 1.997 0 0 0-2.597-.198L6.52 4.019l-.44-.44a1 1 0 0 0-1.261-.124L2.015 5.323a1 1 0 0 0-.152 1.54L4.97 9.97.72 14.22a.748.748 0 0 0 0 1.06.747.747 0 0 0 1.06 0l4.25-4.25 3.107 3.107a1 1 0 0 0 1.54-.152l1.868-2.803a1 1 0 0 0-.125-1.262l-.44-.44ZM7.593 5.093l3.316 3.316 2.868-3.911a.5.5 0 0 0-.05-.65l-1.573-1.573a.5.5 0 0 0-.65-.05l-3.91 2.868ZM5.31 4.93 3.354 6.233l6.413 6.413 1.303-1.955-5.761-5.76Z" 
                                  fill="currentColor"
                                />
                              </svg>
                              Pin chart to dashboard
                            </button>
              </div>
            )}
                      </ChartContentComponent>
                    </ChartContainerComponent>
                  );
                })}
                
                {/* Enhanced Connector Lines */}
                <ConnectorOverlay>
                  {Object.entries(containerConnections).map(([childId, connection]) => {
                    let parentContainer, childContainer, startPoint, endPoint;
                    
                    // Find parent container
                    if (connection.parentType === 'insight') {
                      parentContainer = insightContainers[connection.parentId];
                    } else if (connection.parentType === 'dataset') {
                      parentContainer = datasetContainers[connection.parentId];
                    }
                    
                    // Find child container or column
                    if (connection.childType === 'dataset') {
                      childContainer = datasetContainers[childId];
                    } else if (connection.childType === 'chart') {
                      childContainer = chartContainers[childId];
                    } else if (connection.childType === 'column') {
                      // Handle related column connections
                      const columnKey = connection.addedColumn?.key;
                      const columnPosition = columnPositions[columnKey];
                      if (columnPosition) {
                        childContainer = {
                          position: columnPosition,
                          contentWidth: 280,
                          type: 'column'
                        };
                      }
                    }
                    
                    if (!parentContainer || !childContainer) return null;
                    
                    // Calculate connection points - start from bottom center of parent, end at top center of child
                    
                    if (connection.childType === 'column') {
                      // Special positioning for column connections
                      startPoint = {
                        x: parentContainer.position.x + (parentContainer.contentWidth || 320) / 2,
                        y: parentContainer.position.y + getContainerHeight(parentContainer)
                      };
                      
                      endPoint = {
                        x: childContainer.position.x + (childContainer.contentWidth || 280) / 2,
                        y: childContainer.position.y - 20 // Connect above the column
                      };
                    } else {
                      startPoint = {
                        x: parentContainer.position.x + (parentContainer.contentWidth || 320) / 2,
                        y: parentContainer.position.y + getContainerHeight(parentContainer)
                      };
                      
                      endPoint = {
                        x: childContainer.position.x + (childContainer.contentWidth || 380) / 2,
                        y: childContainer.position.y
                      };
                    }
                    
                    const pathData = generateConnectorPath(startPoint, endPoint);
                    
                    return (
                      <g key={childId}>
                        {/* Connector line */}
                        <ConnectorLine
                          d={pathData}
                          stroke="#D8DEE4"
                          strokeWidth="2"
                          fill="none"
                          opacity="0.8"
                        />
                        {/* Start anchor dot */}
                        <circle
                          cx={startPoint.x}
                          cy={startPoint.y}
                          r="8"
                          fill="#D8DEE4"
                          opacity="1"
                        />
                        {/* End anchor dot */}
                        <circle
                          cx={endPoint.x}
                          cy={endPoint.y}
                          r="8"
                          fill="#D8DEE4"
                          opacity="1"
                        />
                      </g>
                    );
                  })}
                </ConnectorOverlay>
              </ColumnModulesContainer>
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
          
          {/* Debug button to test column animation */}
          <ZoomButton 
            onClick={() => {
              const columns = getCurrentTableColumns();
              if (columns.length > 0) {
                animateNewColumn(columns[0].key + '_new');
              }
            }}
            style={{ marginLeft: '8px', fontSize: '12px' }}
          >
            Test ✨
          </ZoomButton>
        </ZoomControls>
      </EditorContainer>
    </>
  );
};

export default MetricEditor;


