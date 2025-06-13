import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { standardizedMetrics, getMetricData } from '../data/companyData';
import { METRIC_SCHEMAS, REPORT_SCHEMAS } from '../data/reportSchemas';
import { STRIPE_SCHEMA, findStripeMapping } from '../data/stripeSchema';
import LineChart from '../components/LineChart';

// Common columns organized by business packages
const COMMON_COLUMNS = {
  'Customers': {
    keyEntities: ['customer_id', 'email', 'created_at'],
    derivedFields: ['LTV', 'first_payment_date']
  },
  'Payments': {
    keyEntities: ['charge_id', 'amount', 'status'],
    derivedFields: ['net_revenue', 'success_rate']
  },
  'Balances & Payouts': {
    keyEntities: ['balance_transaction_id', 'payout_id', 'amount'],
    derivedFields: ['payout_frequency', 'settlement_time']
  },
  'Fraud Signals': {
    keyEntities: ['risk_level', 'fraud_score', 'charge_id'],
    derivedFields: ['avg_fraud_score', 'rule_trigger_rate']
  }
};

// Auto-mapping function to connect common column names to stripe schema objects
const findStripeSchemaMapping = (commonColumnId) => {
  let bestMatch = null;
  let bestTable = null;
  let bestScore = 0;

  Object.entries(STRIPE_SCHEMA).forEach(([sectionName, section]) => {
    Object.entries(section).forEach(([tableName, objects]) => {
      objects.forEach(obj => {
        let score = 0;
        
        // Direct ID match (highest priority)
        if (obj.id === commonColumnId) {
          score = 1000;
        }
        // Close pattern matches
        else if (commonColumnId === 'customer_id' && obj.id === 'customer' && tableName === 'charges') {
          score = 900;
        }
        else if (commonColumnId === 'customer_id' && obj.id === 'id' && tableName === 'customers') {
          score = 850;
        }
        else if (commonColumnId === 'charge_id' && obj.id === 'id' && tableName === 'charges') {
          score = 900;
        }
        else if (commonColumnId === 'invoice_id' && obj.id === 'id' && tableName === 'invoices') {
          score = 900;
        }
        else if (commonColumnId === 'subscription_id' && obj.id === 'id' && tableName === 'subscriptions') {
          score = 900;
        }
        else if (commonColumnId === 'product_id' && obj.id === 'id' && tableName === 'products') {
          score = 900;
        }
        else if (commonColumnId === 'plan_id' && obj.id === 'id' && tableName === 'prices') {
          score = 850;
        }
        else if (commonColumnId === 'refund_id' && obj.id === 'id' && tableName === 'refunds') {
          score = 900;
        }
        // Pattern-based matches
        else if (commonColumnId.includes('amount') && obj.id === 'amount') {
          score = 700;
        }
        else if (commonColumnId === 'created_at' && obj.id === 'created') {
          score = 800;
        }
        else if (commonColumnId === 'due_date' && obj.id === 'due_date') {
          score = 900;
        }
        else if (commonColumnId === 'subscription' && obj.id === 'subscription') {
          score = 800;
        }
        else if (commonColumnId === 'invoice' && obj.id === 'id' && tableName === 'invoices') {
          score = 700;
        }
        else if (commonColumnId === 'product' && obj.id === 'id' && tableName === 'products') {
          score = 700;
        }
        // Generic matches
        else if (obj.id.includes(commonColumnId.replace('_id', '').replace('_', ''))) {
          score = 200;
        }
        else if (commonColumnId.includes(obj.id)) {
          score = 100;
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = obj;
          bestTable = tableName;
        }
      });
    });
  });

  return { object: bestMatch, table: bestTable, score: bestScore };
};

// Convert common column items to objects with proper mapping
const createCommonColumnObjects = () => {
  const commonObjects = {};
  
  Object.entries(COMMON_COLUMNS).forEach(([packageName, { keyEntities, derivedFields }]) => {
    commonObjects[packageName] = [];
    
    // Process key entities
    keyEntities.forEach(columnId => {
      const mapping = findStripeSchemaMapping(columnId);
      
      if (mapping.object && mapping.score >= 200) {
        // Use stripe schema object properties
        commonObjects[packageName].push({
          id: mapping.object.id,
          label: mapping.object.label,
          humanLabel: mapping.object.label,
          objectName: mapping.object.id,
          tableName: mapping.object.id,
          dataType: getColumnDataTypeFromMapping(mapping.object),
          isCurrency: mapping.object.id.includes('amount') || mapping.object.id.includes('revenue') || mapping.object.id.includes('mrr'),
          isNumber: mapping.object.id.includes('count') || mapping.object.id.includes('quantity') || mapping.object.id.includes('units'),
          isTrend: mapping.object.id.includes('growth') || mapping.object.id.includes('rate'),
          isFromCommonColumns: true,
          originalCommonId: columnId
        });
      } else {
        // Create synthetic object for unmapped items
        commonObjects[packageName].push({
          id: columnId,
          label: createHumanLabel(columnId),
          humanLabel: createHumanLabel(columnId),
          objectName: columnId,
          tableName: packageName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          dataType: inferDataType(columnId),
          isCurrency: columnId.includes('amount') || columnId.includes('revenue') || columnId.includes('mrr'),
          isNumber: columnId.includes('count') || columnId.includes('quantity') || columnId.includes('id'),
          isTrend: columnId.includes('rate') || columnId.includes('percent'),
          isFromCommonColumns: true,
          originalCommonId: columnId
        });
      }
    });
    
    // Process derived fields
    derivedFields.forEach(columnId => {
      // Clean up the column ID (remove parentheses and extra info)
      const cleanId = columnId.replace(/\s*\([^)]*\)/, '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      
      commonObjects[packageName].push({
        id: cleanId,
        label: columnId, // Keep original label with parentheses
        humanLabel: columnId,
        objectName: cleanId,
        tableName: packageName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        dataType: inferDataType(cleanId),
        isCurrency: cleanId.includes('revenue') || cleanId.includes('mrr') || cleanId.includes('ltv') || cleanId.includes('aov'),
        isNumber: cleanId.includes('count') || cleanId.includes('size') || cleanId.includes('age'),
        isTrend: cleanId.includes('rate') || cleanId.includes('percent') || cleanId.includes('growth'),
        isFromCommonColumns: true,
        isDerived: true,
        originalCommonId: columnId
      });
    });
  });
  
  return commonObjects;
};

// Helper functions
const createHumanLabel = (columnId) => {
  return columnId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Id/g, 'ID')
    .replace(/Mrr/g, 'MRR')
    .replace(/Ltv/g, 'LTV');
};

const inferDataType = (columnId) => {
  if (columnId.includes('date') || columnId.includes('created') || columnId.includes('_at')) return 'date';
  if (columnId.includes('amount') || columnId.includes('revenue') || columnId.includes('mrr') || columnId.includes('ltv')) return 'currency';
  if (columnId.includes('status') || columnId.includes('type') || columnId.includes('method')) return 'category';
  if (columnId.includes('rate') || columnId.includes('percent') || columnId.includes('growth')) return 'percentage';
  if (columnId.includes('count') || columnId.includes('quantity') || columnId.includes('size') || columnId.includes('age')) return 'number';
  if (columnId.includes('id') || columnId.includes('email')) return 'text';
  return 'text';
};

const getColumnDataTypeFromMapping = (stripeObject) => {
  if (stripeObject.mappedTo.includes('date')) return 'date';
  if (stripeObject.mappedTo.includes('amount') || stripeObject.mappedTo.includes('current_mrr')) return 'currency';
  if (stripeObject.mappedTo.includes('status')) return 'category';
  if (stripeObject.mappedTo.includes('usage_growth') || stripeObject.mappedTo.includes('rate')) return 'percentage';
  if (stripeObject.mappedTo.includes('included_units') || stripeObject.mappedTo.includes('unitsUsed')) return 'number';
  if (stripeObject.mappedTo.includes('customer') || stripeObject.mappedTo.includes('name')) return 'text';
  if (stripeObject.mappedTo.includes('product') || stripeObject.mappedTo.includes('plan')) return 'category';
  return 'text';
};

// Main container for the entire editor
const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: ${props => props.hasAnalysisPanel ? `calc(100vw - ${props.leftPanelWidth || 260}px - ${props.analysisPanelWidth || 400}px)` : `calc(100vw - ${props.leftPanelWidth || 260}px)`};
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRjVGNkY4Ii8+CjxyZWN0IHg9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjRjVGNkY4Ii8+CjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGNUY2RjgiLz4KPHJlY3QgeT0iMTAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNGNUY2RjgiLz4KPC9zdmc+');
  background-size: 20px 20px;
  margin: 0;
  padding: 0;
  margin-left: ${props => props.leftPanelWidth || 260}px;
  transition: ${props => props.isResizing ? 'none' : 'margin-left 0.2s ease, width 0.2s ease'};
`;

// Minimal left panel for navigation controls only
const LeftPanel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.width || 300}px;
  background: white;
  border-right: 1px solid #e3e8ee;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  z-index: 100;
  transition: ${props => props.isResizing ? 'none' : 'width 0.2s ease'};

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

const LeftPanelResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 1001;
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
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  
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
  padding: 40px 40px 12px 40px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
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
`;

const HeaderButtonsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: absolute;
  right: 40px;
`;

const DoneButton = styled.button`
  background: white;
  color: #374151;
  border: 1px solid rgb(227, 232, 238);
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  
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
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  padding: 0 40px;
  overflow: hidden; /* Let TableContainer handle scrolling */
`;

// Table container for better overflow control
const TableContainer = styled.div`
  border: 1px solid rgb(227, 232, 238);
  border-radius: 8px;
  flex: 1;
  margin-bottom: 40px; /* 40px bottom spacing as requested */
  position: relative;
  overflow: auto;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  
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
  margin: 0; /* Remove bottom margin, handled by TableContainer */
  
  th, td {
    border-right: 1px solid #e3e8ee;
    border-bottom: 1px solid #e3e8ee;
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
    padding: 12px 16px;
  
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
    padding: 12px 8px;
    
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
    background: white;
    cursor: pointer;
    padding: 12px 16px;
  
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
  border: none;
  background: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  padding: 8px 12px;
  
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
    ? `calc(${props.leftPanelWidth || 260}px + (100vw - ${props.leftPanelWidth || 260}px - ${props.analysisPanelWidth || 400}px) / 2)` 
    : `calc(${props.leftPanelWidth || 260}px + (100vw - ${props.leftPanelWidth || 260}px) / 2)`};
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 8px;
  transition: ${props => props.isResizing ? 'none' : 'left 0.2s ease'};
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
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #5b56f0;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
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
  width: ${props => props.width || 400}px;
  height: 100vh;
  background: white;
  border-left: 1px solid #e3e8ee;
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

const AnalysisPanelResizeHandle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 1001;
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
  background: #f8f9fa;
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
  left: ${props => (props.leftPanelWidth || 260) + 40}px; // Positioned to align with spreadsheet content
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
  transition: ${props => props.isResizing ? 'none' : 'left 0.2s ease'};
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

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  /* border-bottom: 1px solid #e5e7eb; */
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 4px;
  cursor: pointer;
  
  &:hover {
    color: #374151;
  }
`;

const SectionToggle = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-left: 0;
  transform: ${props => props.isExpanded ? "rotate(90deg)" : "rotate(0deg)"};
  transition: transform 0.2s ease;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const ResetLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
  
  &:hover {
    color: #4b5563;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
  
  ${SectionTitle} {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ColumnList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const ColumnItem = styled.li`
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: none;
  border: none;
`;

const ColumnLabelRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const ColumnLabel = styled.div`
  font-size: 14px;
  color: #23272f;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ColumnMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  margin-top: 2px;
  letter-spacing: 0.01em;
`;

const ColumnIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SchemaSection = styled.div`
  margin-bottom: 20px;
`;

const SchemaTable = styled.div`
  margin-bottom: 16px;
`;

const SchemaTableHeader = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 4px;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 8px;
  &:hover {
    background-color: #f9fafb;
    border-radius: 4px;
    margin-left: -4px;
    margin-right: -4px;
    padding-left: 4px;
    padding-right: 4px;
  }
`;

const SchemaTableHeaderTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
`;

const SchemaTableToggle = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-left: 0;
  transform: ${props => props.isExpanded ? "rotate(90deg)" : "rotate(0deg)"};
  transition: transform 0.2s ease;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;
const SchemaObjectList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SchemaObjectItem = styled.li`
  background: ${props => props.isHighlighted ? '#f7f8fa' : 'none'};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: none;
  border: ${props => props.isHighlighted ? 'none' : '1px dotted #D8DEE4'};
`;
const SchemaObjectLabel = styled.div`
  color: #23272f;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
`;
const SchemaObjectMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  margin-top: 2px;
  letter-spacing: 0.01em;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const SchemaObjectCheckmark = styled.div`
  color: #10b981;
  margin-left: auto;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  svg {
    width: 12px;
    height: 12px;
  }

  &:hover svg {
    display: none;
  }

  &:hover::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.14775 3.35225C3.92808 3.13258 3.57192 3.13258 3.35225 3.35225C3.13258 3.57192 3.13258 3.92808 3.35225 4.14775L5.2045 6L3.35225 7.85225C3.13258 8.07192 3.13258 8.42808 3.35225 8.64775C3.57192 8.86742 3.92808 8.86742 4.14775 8.64775L6 6.79549L7.85225 8.64775C8.07192 8.86742 8.42808 8.86742 8.64775 8.64775C8.86742 8.42808 8.86742 8.07192 8.64775 7.85225L6.79549 6L8.64775 4.14775C8.86742 3.92808 8.86742 3.57192 8.64775 3.35225C8.42808 3.13258 8.07192 3.13258 7.85225 3.35225L6 5.2045L4.14775 3.35225Z' fill='%236C7688'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5.99999C12 9.31404 9.31405 12 6 12C2.68595 12 0 9.31404 0 5.99999C0 2.68595 2.68595 0 6 0C9.32231 0 12 2.68595 12 5.99999ZM10.875 5.99999C10.875 8.69272 8.69272 10.875 6 10.875C3.30728 10.875 1.125 8.69272 1.125 5.99999C1.125 3.30727 3.30727 1.125 6 1.125C8.69998 1.125 10.875 3.30626 10.875 5.99999Z' fill='%236C7688'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const SchemaTableSubheader = styled.div`
  font-size: 11px;
  color: #6b7280;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 4px;
  margin: 4px 0 8px 0;
  font-weight: 500;
`;

const SchemaObjectPin = styled.div`
  color: #675DFF;
  margin-left: auto;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  svg {
    width: 12px;
    height: 12px;
  }

  /* Show remove icon on hover for pinned items */
  &.pinned-item:hover svg {
    display: none;
  }

  &.pinned-item:hover::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.14775 3.35225C3.92808 3.13258 3.57192 3.13258 3.35225 3.35225C3.13258 3.57192 3.13258 3.92808 3.35225 4.14775L5.2045 6L3.35225 7.85225C3.13258 8.07192 3.13258 8.42808 3.35225 8.64775C3.57192 8.86742 3.92808 8.86742 4.14775 8.64775L6 6.79549L7.85225 8.64775C8.07192 8.86742 8.42808 8.86742 8.64775 8.64775C8.86742 8.42808 8.86742 8.07192 8.64775 7.85225L6.79549 6L8.64775 4.14775C8.86742 3.92808 8.86742 3.57192 8.64775 3.35225C8.42808 3.13258 8.07192 3.13258 7.85225 3.35225L6 5.2045L4.14775 3.35225Z' fill='%236C7688'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5.99999C12 9.31404 9.31405 12 6 12C2.68595 12 0 9.31404 0 5.99999C0 2.68595 2.68595 0 6 0C9.32231 0 12 2.68595 12 5.99999ZM10.875 5.99999C10.875 8.69272 8.69272 10.875 6 10.875C3.30728 10.875 1.125 8.69272 1.125 5.99999C1.125 3.30727 3.30727 1.125 6 1.125C8.69998 1.125 10.875 3.30626 10.875 5.99999Z' fill='%236C7688'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const SchemaObjectPlus = styled.div`
  color: #675DFF;
  margin-left: auto;
  display: flex;
  align-items: center;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SchemaObjectActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MetadataSeparator = styled.span`
  display: inline-block;
  vertical-align: middle;
  margin: 0 6px;
`;

const ColumnActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
`;

const SearchIcon = styled.div`
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
`;

const SubSectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  /* border-bottom: 1px solid #e5e7eb; */
`;

// Helper for sentence case
function toSentenceCase(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase().replace(/\b([a-z])/g, function(match) { return match.toLowerCase(); });
}

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
  const [analysisPanelWidth, setAnalysisPanelWidth] = useState(400);
  const [isResizingAnalysisPanel, setIsResizingAnalysisPanel] = useState(false);
  
  // Left panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [isResizingLeftPanel, setIsResizingLeftPanel] = useState(false);
  
  // Schema table collapsible state - all collapsed by default
  const [collapsedTables, setCollapsedTables] = useState(() => {
    const allTables = new Set();
    Object.entries(STRIPE_SCHEMA).forEach(([sectionName, section]) => {
      Object.keys(section).forEach(tableName => {
        allTables.add(`${sectionName}-${tableName}`);
      });
    });
    return allTables;
  });
  const [addedColumns, setAddedColumns] = useState(new Set());
  
  // Track columns that have been explicitly removed from the base schema
  const [removedColumns, setRemovedColumns] = useState(new Set());
  
  // Common columns state for collapsible packages
  const [collapsedCommonTables, setCollapsedCommonTables] = useState(() => {
    // Collapse all common column packages by default
    const allPackages = new Set();
    Object.keys(COMMON_COLUMNS).forEach(packageName => {
      allPackages.add(packageName);
    });
    return allPackages;
  });
  
  // All (Stripe Schema) section state - collapsed by default
  const [isAllSectionCollapsed, setIsAllSectionCollapsed] = useState(true);
  
  // Selection summary tooltip state
  const [showSummaryTooltip, setShowSummaryTooltip] = useState(false);
  const [summaryTooltipPosition, setSummaryTooltipPosition] = useState({ x: 0, y: 0 });
  const [summaryTooltipWidth, setSummaryTooltipWidth] = useState(0);
  
  // Refs for tooltip hover management
  const tooltipTimeoutRef = useRef(null);

  // Column definitions for dynamically added columns
  const [columnDefinitions, setColumnDefinitions] = useState({});

  // Create common column objects for the UI
  const commonColumnObjects = useMemo(() => createCommonColumnObjects(), []);

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

  // Track the original schema state for reset functionality
  const [originalSchema, setOriginalSchema] = useState(null);

  // Initialize column order when schema changes
  useEffect(() => {
    if (schema.length > 0) {
      setColumnOrder(schema.map(col => col.id));
      // Reset removed columns when schema changes
      setRemovedColumns(new Set());
      // Store the original schema state
      setOriginalSchema(schema.map(col => col.id));
    }
  }, [schema]);

  // Get ordered schema based on column order
  const orderedSchema = useMemo(() => {
    if (columnOrder.length === 0) return schema.filter(col => !removedColumns.has(col.id));
    
    const orderedCols = columnOrder.map(id => schema.find(col => col.id === id)).filter(Boolean);
    // Add any new columns that aren't in the order yet, but exclude removed columns
    const newCols = schema.filter(col => !columnOrder.includes(col.id) && !removedColumns.has(col.id));
    
    // Get all available columns from all schemas for added columns
    const allAvailableColumns = [
      ...Object.values(METRIC_SCHEMAS).flat(),
      ...Object.values(REPORT_SCHEMAS).flat()
    ];
    
    // Add the dynamically added columns at the end using stored definitions
    const dynamicallyAddedCols = Array.from(addedColumns)
      .map(colId => {
        // First try to find in existing schemas
        const existingCol = allAvailableColumns.find(col => col.id === colId);
        if (existingCol) return existingCol;
        
        // Otherwise use our stored column definition
        return columnDefinitions[colId];
      })
      .filter(Boolean);
    
    return [...orderedCols, ...newCols, ...dynamicallyAddedCols];
  }, [schema, columnOrder, addedColumns, columnDefinitions, removedColumns]);

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
                const colDef = columnDefinitions[column.id] || column;
                
                if (colDef.isCurrency || colDef.dataType === 'currency') {
                  row[column.id] = Math.floor(Math.random() * 50000) + 1000;
                } else if (colDef.isNumber || colDef.dataType === 'number') {
                  row[column.id] = Math.floor(Math.random() * 10000) + 100;
                } else if (colDef.isTrend || colDef.dataType === 'percentage') {
                  row[column.id] = (Math.random() * 200 - 50).toFixed(1);
                } else if (colDef.dataType === 'date') {
                  const date = new Date();
                  date.setDate(date.getDate() - (i * 7));
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  row[column.id] = `${year}-${month}-${day}`;
                } else if (colDef.dataType === 'category') {
                  const categories = ['Active', 'Trial', 'Premium', 'Enterprise'];
                  row[column.id] = categories[i % categories.length];
                } else {
                  // Generate contextual data based on stripe object type
                  if (column.id.includes('customer') || column.id === 'name') {
                    row[column.id] = customer.name;
                  } else if (column.id.includes('email')) {
                    row[column.id] = customer.email;
                  } else if (column.id.includes('plan') || column.id.includes('product')) {
                    row[column.id] = customer.plan;
                  } else if (column.id.includes('status')) {
                    row[column.id] = customer.status;
                  } else if (column.id.includes('id')) {
                    row[column.id] = `${column.id}_${i + 1}`;
                  } else if (column.id.includes('currency')) {
                    row[column.id] = ['USD', 'EUR', 'GBP', 'CAD'][i % 4];
                  } else if (column.id.includes('type')) {
                    row[column.id] = ['card', 'bank_account', 'paypal', 'apple_pay'][i % 4];
                  } else {
                    row[column.id] = `${column.label} ${i + 1}`;
                  }
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
  }, [orderedSchema, addedColumns, columnDefinitions]);

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

  // Analysis panel resize handlers
  const handleAnalysisPanelResizeStart = (event) => {
    event.preventDefault();
    setIsResizingAnalysisPanel(true);
  };

  const handleAnalysisPanelResize = useCallback((event) => {
    if (!isResizingAnalysisPanel) return;
    
    const newWidth = window.innerWidth - event.clientX;
    const clampedWidth = Math.max(200, Math.min(600, newWidth));
    setAnalysisPanelWidth(clampedWidth);
  }, [isResizingAnalysisPanel]);

  const handleAnalysisPanelResizeEnd = useCallback(() => {
    setIsResizingAnalysisPanel(false);
  }, []);

  // Left panel resize handlers
  const handleLeftPanelResizeStart = (event) => {
    event.preventDefault();
    setIsResizingLeftPanel(true);
  };

  const handleLeftPanelResize = useCallback((event) => {
    if (!isResizingLeftPanel) return;
    
    const newWidth = event.clientX;
    const clampedWidth = Math.max(200, Math.min(600, newWidth));
    setLeftPanelWidth(clampedWidth);
  }, [isResizingLeftPanel]);

  const handleLeftPanelResizeEnd = useCallback(() => {
    setIsResizingLeftPanel(false);
  }, []);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizingAnalysisPanel) {
      document.addEventListener('mousemove', handleAnalysisPanelResize);
      document.addEventListener('mouseup', handleAnalysisPanelResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleAnalysisPanelResize);
        document.removeEventListener('mouseup', handleAnalysisPanelResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingAnalysisPanel, handleAnalysisPanelResize, handleAnalysisPanelResizeEnd]);

  // Add global mouse event listeners for left panel resize
  useEffect(() => {
    if (isResizingLeftPanel) {
      document.addEventListener('mousemove', handleLeftPanelResize);
      document.addEventListener('mouseup', handleLeftPanelResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleLeftPanelResize);
        document.removeEventListener('mouseup', handleLeftPanelResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingLeftPanel, handleLeftPanelResize, handleLeftPanelResizeEnd]);

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

  // Get selection icon based on selection type
  const getSelectionIcon = () => {
    // Single cell or entire row
    if (selectedCell || selectedRow !== null || selectedRows.size > 0) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 7.5V9H2V7.5H10ZM10.5 7V5C10.5 4.72386 10.2761 4.5 10 4.5H2C1.72386 4.5 1.5 4.72386 1.5 5V7C1.5 7.27614 1.72386 7.5 2 7.5V9L1.7959 8.98926C0.854347 8.8938 0.1062 8.14565 0.0107422 7.2041L0 7V5C0 3.96435 0.787223 3.113 1.7959 3.01074L2 3H10L10.2041 3.01074C11.2128 3.113 12 3.96435 12 5V7L11.9893 7.2041C11.8938 8.14565 11.1457 8.8938 10.2041 8.98926L10 9V7.5C10.2761 7.5 10.5 7.27614 10.5 7Z" fill="#6C7688"/>
        </svg>
      );
    }

    // Single column
    if (selectedColumns.size === 1 && selectedCells.size === 0) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 2H9V10H7.5L7.5 2ZM7 1.5H5C4.72386 1.5 4.5 1.72386 4.5 2L4.5 10C4.5 10.2761 4.72386 10.5 5 10.5H7C7.27614 10.5 7.5 10.2761 7.5 10H9L8.98926 10.2041C8.8938 11.1457 8.14565 11.8938 7.2041 11.9893L7 12H5C3.96435 12 3.113 11.2128 3.01074 10.2041L3 10L3 2L3.01074 1.7959C3.113 0.787223 3.96435 3.02034e-08 5 0H7L7.2041 0.0107422C8.14565 0.1062 8.8938 0.854346 8.98926 1.7959L9 2H7.5C7.5 1.72386 7.27614 1.5 7 1.5Z" fill="#6C7688"/>
        </svg>
      );
    }

    // Multi-cell selection - determine grid dimensions
    if (selectedCells.size > 0 || selectedColumns.size > 0) {
      const cols = selectedColumns.size > 0 ? selectedColumns.size : selectionStats?.columnsInvolved.size || 1;
      const cellsCount = selectionStats?.cellsSelected || selectedCells.size;
      const rows = Math.max(1, Math.ceil(cellsCount / cols) || 1);

      // Special logic for specific cases
      // When 1 column and 3 or more cells are selected, use the 1x3 SVG
      if (cols === 1 && cellsCount >= 3) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99341)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M12 5H0V3.5H12V5Z" fill="#6C7688"/>
              <path d="M12 8.5H0V7H12V8.5Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99341">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      }
      
      // When 1 row and 3 or more columns are selected, use the 3x1 SVG
      if (((selectedRow !== null || selectedRows.size > 0) && cols >= 3) || (rows === 1 && cols >= 3)) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99344)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M5 0L5 12H3.5L3.5 0H5Z" fill="#6C7688"/>
              <path d="M8.5 0V12H7L7 0H8.5Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99344">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      }

      // Determine icon based on grid size (columns x rows) for other cases
      if (cols === 1 && rows === 2) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99326)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M12 6.75H0V5.25H12V6.75Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99326">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      } else if (cols === 2 && rows === 1) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99334)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M6.75 0L6.75 12H5.25L5.25 0H6.75Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99334">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      } else if (cols === 2 && rows === 2) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99337)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M6.75 0L6.75 12H5.25L5.25 0H6.75Z" fill="#6C7688"/>
              <path d="M12 6.75H0L0 5.25H12V6.75Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99337">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      } else if (cols === 2 && rows === 3) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1773_99381)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M12 5H0V3.5H12V5Z" fill="#6C7688"/>
              <path d="M12 8.5H0V7H12V8.5Z" fill="#6C7688"/>
              <path d="M7 0L7 12H5.5L5.5 0H7Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1773_99381">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      } else if (cols === 3 && rows === 2) {
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1773_99385)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M5 0L5 12H3.5L3.5 0H5Z" fill="#6C7688"/>
              <path d="M8.5 0V12H7L7 0H8.5Z" fill="#6C7688"/>
              <path d="M12 7H0V5.5H12V7Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1773_99385">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      } else {
        // 3x3 or greater
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1767_99347)">
              <path d="M10 10.5V12H2V10.5H10ZM10.5 10V2C10.5 1.72386 10.2761 1.5 10 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5V12L1.7959 11.9893C0.854347 11.8938 0.1062 11.1457 0.0107422 10.2041L0 10V2C1.20813e-07 0.96435 0.787223 0.113005 1.7959 0.0107422L2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.96435 12 2V10L11.9893 10.2041C11.8938 11.1457 11.1457 11.8938 10.2041 11.9893L10 12V10.5C10.2761 10.5 10.5 10.2761 10.5 10Z" fill="#6C7688"/>
              <path d="M5 0L5 12H3.5L3.5 0H5Z" fill="#6C7688"/>
              <path d="M8.5 0V12H7L7 0H8.5Z" fill="#6C7688"/>
              <path d="M12 5H0V3.5H12V5Z" fill="#6C7688"/>
              <path d="M12 8.5H0V7H12V8.5Z" fill="#6C7688"/>
            </g>
            <defs>
              <clipPath id="clip0_1767_99347">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        );
      }
    }

    // Default fallback (should not happen)
    return null;
  };

  // Handle summary tooltip
  const handleSummaryArrowClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSummaryTooltipPosition({
      x: rect.left,
      bottom: window.innerHeight - rect.top + 4 // 4px spacing above the component
    });
    setShowSummaryTooltip(!showSummaryTooltip);
  };

  // Handle summary hover
  const handleSummaryMouseEnter = (event) => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    
    
    setSummaryTooltipPosition({
      x: rect.left,
      bottom: window.innerHeight - rect.top + 4 // 4px spacing above the component
    });
    
    setSummaryTooltipWidth(rect.width);
    
    // Small delay to prevent flicker
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowSummaryTooltip(true);
    }, 100);
  };

  const handleSummaryMouseLeave = () => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    // Delay hiding to allow moving to tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowSummaryTooltip(false);
    }, 150);
  };

  const handleSummaryClick = (event) => {
    // Prevent click from bubbling up to document handlers that might clear selections
    event.stopPropagation();
  };

  // Handle tooltip hover to keep it visible
  const handleTooltipMouseEnter = () => {
    // Clear any existing timeout to keep tooltip visible
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowSummaryTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    // Hide tooltip after delay
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowSummaryTooltip(false);
    }, 150);
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
    // Check if this is a dynamically added column
    if (addedColumns.has(columnId)) {
      // Remove from addedColumns
      const newAddedColumns = new Set(addedColumns);
      newAddedColumns.delete(columnId);
      setAddedColumns(newAddedColumns);
    } else {
      // This is a base schema column, add to removedColumns to hide it
      const newRemovedColumns = new Set(removedColumns);
      newRemovedColumns.add(columnId);
      setRemovedColumns(newRemovedColumns);
      
      // Also remove from columnOrder to maintain consistency
      const newColumnOrder = columnOrder.filter(id => id !== columnId);
      setColumnOrder(newColumnOrder);
    }
  };


  // Handle table collapse/expand toggle
  const handleTableToggle = (tableKey) => {
    setCollapsedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableKey)) {
        newSet.delete(tableKey);
      } else {
        newSet.add(tableKey);
      }
      return newSet;
    });
  };

  // Handle toggling common column packages
  const handleCommonTableToggle = (packageKey) => {
    setCollapsedCommonTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageKey)) {
        newSet.delete(packageKey);
      } else {
        newSet.add(packageKey);
      }
      return newSet;
    });
  };

  // Handle toggling the All (Stripe Schema) section
  const handleAllSectionToggle = () => {
    setIsAllSectionCollapsed(prev => !prev);
  };

  // Handle clicking on common column objects to add/remove columns
  const handleCommonColumnClick = (commonObject, packageName) => {
    const columnId = commonObject.id;
    
    setAddedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        // Remove the column
        newSet.delete(columnId);
      } else {
        // Add the column - create a proper column definition
        newSet.add(columnId);
      }
      return newSet;
    });
    
    // Store the column definition for later use
    setColumnDefinitions(prev => ({
      ...prev,
      [columnId]: {
        id: columnId,
        label: commonObject.label,
        dataType: commonObject.dataType,
        isCurrency: commonObject.isCurrency,
        isNumber: commonObject.isNumber,
        isTrend: commonObject.isTrend,
        stripeObject: commonObject.objectName,
        stripeTable: commonObject.tableName,
        isFromCommonColumns: true,
        originalCommonId: commonObject.originalCommonId
      }
    }));
  };

  // Handle clicking on stripe schema objects to add/remove columns
  const handleSchemaObjectClick = (stripeObject, tableName) => {
    const columnId = stripeObject.id;
    const objectKey = `${columnId}@${tableName}`;
    
    setAddedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        // Remove the column
        newSet.delete(columnId);
      } else {
        // Add the column - create a proper column definition
        const columnDef = {
          id: columnId,
          label: stripeObject.label,
          // Map to existing data types based on stripe object properties and mappedTo
          dataType: getColumnDataType(stripeObject),
          isCurrency: stripeObject.id.includes('amount') || stripeObject.id.includes('revenue') || stripeObject.id.includes('mrr') || stripeObject.id.includes('ltv'),
          isNumber: stripeObject.id.includes('count') || stripeObject.id.includes('quantity') || stripeObject.id.includes('units') || stripeObject.id.includes('rate'),
          isTrend: stripeObject.id.includes('growth') || stripeObject.id.includes('conversion'),
          stripeTable: tableName,
          stripeObject: stripeObject.id
        };
        
        // Store the column definition for use in data generation
        setColumnDefinitions(prev => ({
          ...prev,
          [columnId]: columnDef
        }));
        
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  // Helper function to determine column data type from stripe object
  const getColumnDataType = (stripeObject) => {
    // Check mappedTo array for existing types
    if (stripeObject.mappedTo.includes('date')) return 'date';
    if (stripeObject.mappedTo.includes('amount') || stripeObject.mappedTo.includes('current_mrr')) return 'currency';
    if (stripeObject.mappedTo.includes('status')) return 'category';
    if (stripeObject.mappedTo.includes('usage_growth') || stripeObject.mappedTo.includes('rate')) return 'percentage';
    if (stripeObject.mappedTo.includes('included_units') || stripeObject.mappedTo.includes('unitsUsed') || stripeObject.mappedTo.includes('customerCount')) return 'number';
    if (stripeObject.mappedTo.includes('customer') || stripeObject.mappedTo.includes('name')) return 'text';
    if (stripeObject.mappedTo.includes('product') || stripeObject.mappedTo.includes('plan')) return 'category';
    
    // Fallback based on stripe object id patterns
    if (stripeObject.id.includes('amount') || stripeObject.id.includes('revenue') || stripeObject.id.includes('mrr') || stripeObject.id.includes('ltv')) return 'currency';
    if (stripeObject.id.includes('created') || stripeObject.id.includes('date') || stripeObject.id.includes('timestamp')) return 'date';
    if (stripeObject.id.includes('status') || stripeObject.id.includes('type')) return 'category';
    if (stripeObject.id.includes('count') || stripeObject.id.includes('quantity') || stripeObject.id.includes('units')) return 'number';
    if (stripeObject.id.includes('rate') || stripeObject.id.includes('percent')) return 'percentage';
    if (stripeObject.id.includes('id')) return 'text';
    
    return 'text'; // default fallback
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Unified function to find column mapping that ensures consistency between 
  // current spreadsheet columns display and highlighting
  const findColumnMapping = (columnId) => {
    // First check if this is a dynamically added column with stored metadata
    if (columnDefinitions[columnId]) {
      const colDef = columnDefinitions[columnId];
      return {
        stripeObject: colDef.stripeObject,
        stripeTable: colDef.stripeTable,
        matchedObject: {
          id: colDef.stripeObject,
          label: colDef.label
        }
      };
    }
    
    // Fallback to original mapping logic for existing schema columns
    let bestMatch = null;
    let bestTable = 'Unknown';
    let bestScore = 0;
    
    Object.entries(STRIPE_SCHEMA).forEach(([sectionName, section]) => {
      Object.entries(section).forEach(([tableName, objects]) => {
        objects.forEach(obj => {
          if (!obj.mappedTo.includes(columnId)) return;
          
          let score = 0;
          
          switch(columnId) {
            case 'date':
              if (tableName === 'charges' && obj.id === 'created') score = 100;
              else if (tableName === 'subscriptions' && obj.id === 'created') score = 90;
              else if (tableName === 'invoices' && obj.id === 'created') score = 80;
              else if (obj.id === 'created') score = 20;
              else score = 10;
              break;
            case 'customer':
              if (tableName === 'payment_methods' && obj.id === 'customer') score = 100;
              else if (tableName === 'charges' && obj.id === 'customer') score = 95;
              else if (tableName === 'subscriptions' && obj.id === 'customer') score = 90;
              else if (tableName === 'customers' && obj.id === 'name') score = 30;
              else if (tableName === 'customers' && obj.id === 'id') score = 20;
              else score = 10;
              break;
            case 'status':
              if (tableName === 'charges' && obj.id === 'status') score = 100;
              else if (tableName === 'subscriptions' && obj.id === 'status') score = 90;
              else if (obj.id === 'status') score = 20;
              else score = 10;
              break;
            case 'amount':
              if (tableName === 'charges' && obj.id === 'amount') score = 100;
              else if (tableName === 'revenue' && obj.id === 'mrr') score = 90;
              else if (tableName === 'prices' && obj.id === 'unit_amount') score = 85;
              else score = 10;
              break;
            default:
              if (obj.id === columnId) score = 100;
              else score = 50;
              break;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = obj;
            bestTable = tableName;
          }
        });
      });
    });
    
    return {
      stripeObject: bestMatch?.id || columnId,
      stripeTable: bestTable,
      matchedObject: bestMatch
    };
  };

  // Helper function to get current spreadsheet columns with metadata
  const getCurrentSpreadsheetColumns = () => {
    return orderedSchema.map(column => {
      const mapping = findColumnMapping(column.id);
      
      return {
        id: column.id, // Add the actual column ID
        humanLabel: column.label,
        objectName: mapping.stripeObject,
        tableName: mapping.stripeTable
      };
    });
  };

  // Get the set of currently used Stripe objects for highlighting
  const currentlyUsedObjects = useMemo(() => {
    const usedObjects = new Set();
    
    // Only include objects that were explicitly added via clicking on stripe schema or common columns
    // Do NOT include objects that are just mapped from original schema columns
    addedColumns.forEach(columnId => {
      const colDef = columnDefinitions[columnId];
      if (colDef && colDef.stripeTable && colDef.stripeObject) {
        usedObjects.add(`${colDef.stripeObject}@${colDef.stripeTable}`);
      }
    });
    
    return usedObjects;
  }, [addedColumns, columnDefinitions]);

  // Add state for section expansion
  const [expandedSections, setExpandedSections] = useState({
    currentColumns: true,
    pinnedColumns: true,
    commonColumns: true,
    allColumns: false
  });

  // Add state for pinned columns with session persistence
  const [pinnedColumns, setPinnedColumns] = useState(() => {
    const saved = sessionStorage.getItem(`pinnedColumns_${currentId}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Save pinned columns to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(`pinnedColumns_${currentId}`, JSON.stringify([...pinnedColumns]));
  }, [pinnedColumns, currentId]);

  const handleSectionToggle = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Handle pin/unpin functionality
  const handlePinColumn = (columnId) => {
    setPinnedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
        
        // Store column metadata if not already stored and not in current columns
        const isInCurrentColumns = getCurrentSpreadsheetColumns().some(col => col.id === columnId);
        if (!isInCurrentColumns && !columnDefinitions[columnId]) {
          // Try to find metadata from common columns
          let foundMetadata = false;
          Object.entries(commonColumnObjects).forEach(([packageName, objects]) => {
            if (foundMetadata) return;
            const commonObj = objects.find(obj => obj.id === columnId);
            if (commonObj) {
              setColumnDefinitions(prev => ({
                ...prev,
                [columnId]: {
                  label: commonObj.label,
                  stripeObject: commonObj.objectName,
                  stripeTable: commonObj.tableName,
                  definition: commonObj.description || `${commonObj.label} from ${commonObj.tableName}`
                }
              }));
              foundMetadata = true;
            }
          });
          
          // If not found in common columns, try schema objects
          if (!foundMetadata) {
            Object.entries(METRIC_SCHEMAS[currentId] || {}).forEach(([tableName, tableData]) => {
              if (foundMetadata) return;
              const schemaObj = tableData.objects?.find(obj => obj.id === columnId);
              if (schemaObj) {
                setColumnDefinitions(prev => ({
                  ...prev,
                  [columnId]: {
                    label: createHumanLabel(columnId),
                    stripeObject: schemaObj.stripeObject,
                    stripeTable: tableName,
                    definition: `${createHumanLabel(columnId)} from ${tableName}`
                  }
                }));
                foundMetadata = true;
              }
            });
          }
        }
      }
      return newSet;
    });
  };

  // Get pinned columns with their metadata for display
  const getPinnedColumns = () => {
    const pinnedColumnsData = [];
    
    pinnedColumns.forEach(columnId => {
      // First check if it's in current spreadsheet columns
      const currentCol = getCurrentSpreadsheetColumns().find(col => col.id === columnId);
      if (currentCol) {
        pinnedColumnsData.push(currentCol);
        return;
      }
      
      // Check if it's in column definitions (from added columns)
      const colDef = columnDefinitions[columnId];
      if (colDef) {
        pinnedColumnsData.push({
          id: columnId,
          humanLabel: colDef.label,
          objectName: colDef.stripeObject,
          tableName: colDef.stripeTable
        });
        return;
      }
      
      // Check if it's in common columns
      let foundInCommon = false;
      Object.entries(commonColumnObjects).forEach(([packageName, objects]) => {
        if (foundInCommon) return;
        const commonObj = objects.find(obj => obj.id === columnId);
        if (commonObj) {
          pinnedColumnsData.push({
            id: columnId,
            humanLabel: commonObj.label,
            objectName: commonObj.objectName,
            tableName: commonObj.tableName
          });
          foundInCommon = true;
        }
      });
      
      if (foundInCommon) return;
      
      // Check if it's in schema objects (All section)
      Object.entries(METRIC_SCHEMAS[currentId] || {}).forEach(([tableName, tableData]) => {
        if (foundInCommon) return;
        const schemaObj = tableData.objects?.find(obj => obj.id === columnId);
        if (schemaObj) {
          pinnedColumnsData.push({
            id: columnId,
            humanLabel: createHumanLabel(columnId),
            objectName: schemaObj.stripeObject,
            tableName: tableName
          });
          foundInCommon = true;
        }
      });
      
      // If still not found, create a basic entry
      if (!foundInCommon) {
        pinnedColumnsData.push({
          id: columnId,
          humanLabel: createHumanLabel(columnId),
          objectName: columnId,
          tableName: 'Unknown'
        });
      }
    });
    
    return pinnedColumnsData;
  };

  // In the 'All' section, map section names to new display names
  const SECTION_DISPLAY_NAMES = {
    'Core Objects': 'Core',
    'Payment Objects': 'Payments',
    'Product & Pricing': 'Product & pricing',
    'Usage & Metering': 'Usage & metering',
    'Revenue & Analytics': 'Revenue & analytics',
    'Events & Webhooks': 'Events & webhooks',
  };

  // Check if the included section has been modified from its original state
  const isIncludedSectionModified = useMemo(() => {
    if (!originalSchema) return false;
    
    // Check if any columns have been added
    if (addedColumns.size > 0) return true;
    
    // Check if any columns have been removed
    if (removedColumns.size > 0) return true;
    
    // Check if column order has changed
    const currentOrder = orderedSchema.map(col => col.id);
    const filteredOriginalOrder = originalSchema.filter(id => !removedColumns.has(id));
    const originalOrderString = filteredOriginalOrder.join(',');
    const currentOrderString = currentOrder.filter(id => !addedColumns.has(id)).join(',');
    
    return originalOrderString !== currentOrderString;
  }, [originalSchema, addedColumns, removedColumns, orderedSchema]);

  // Reset the included section to its original state
  const handleResetIncluded = () => {
    if (originalSchema) {
      setColumnOrder(originalSchema);
      setAddedColumns(new Set());
      setRemovedColumns(new Set());
      setColumnDefinitions({});
    }
  };

  return (
    <>
      <EditorContainer hasAnalysisPanel={showAnalysisPanel} analysisPanelWidth={analysisPanelWidth} leftPanelWidth={leftPanelWidth} isResizing={isResizingLeftPanel}>
        <LeftPanel data-panel="left" width={leftPanelWidth} isResizing={isResizingLeftPanel}>
          <LeftPanelResizeHandle onMouseDown={handleLeftPanelResizeStart} />
          <InfoSection>
            <SectionHeader>
              <SectionTitle onClick={() => handleSectionToggle('currentColumns')}>
                Included
                <SectionToggle isExpanded={expandedSections.currentColumns}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SectionToggle>
              </SectionTitle>
              {isIncludedSectionModified && (
                <ResetLink onClick={handleResetIncluded}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.5 5.99999C1.5 3.36434 3.64916 1.6875 5.8125 1.6875C7.6144 1.6875 9.20157 2.8702 9.63406 4.875H6.75C6.38756 4.875 6.09375 5.16881 6.09375 5.53125C6.09375 5.89369 6.38756 6.1875 6.75 6.1875H11.1562C11.5187 6.1875 11.8125 5.89369 11.8125 5.53125V1.125C11.8125 0.762563 11.5187 0.46875 11.1562 0.46875C10.7938 0.46875 10.5 0.762563 10.5 1.125V3.3725C9.616 1.49569 7.79649 0.375 5.8125 0.375C3.02518 0.375 0.1875 2.54252 0.1875 5.99999C0.1875 9.45745 3.02518 11.5875 5.8125 11.5875C7.29702 11.5875 8.70439 11.0375 9.77718 9.96467C10.0335 9.70839 10.0335 9.29287 9.77718 9.03659C9.5209 8.78031 9.10538 8.78031 8.8491 9.03659C8.02531 9.86039 6.95298 10.3125 5.8125 10.3125C3.64916 10.3125 1.5 8.63564 1.5 5.99999Z" fill="#6C7688"/>
                  </svg>
                  Reset
                </ResetLink>
              )}
            </SectionHeader>
            {expandedSections.currentColumns && (
              <ColumnList>
                {getCurrentSpreadsheetColumns().map((col, index) => (
                  <ColumnItem key={index}>
                    <ColumnLabelRow>
                      <ColumnLabel>{col.humanLabel}</ColumnLabel>
                      <ColumnIcons>
                        {/* Pin icon */}
                        <SchemaObjectPin onClick={(e) => {
                          e.stopPropagation();
                          handlePinColumn(col.id);
                        }}>
                          {pinnedColumns.has(col.id) ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11.09 2.09014L9.90993 0.910061C9.61833 0.618453 9.2325 0.469651 8.84472 0.470709C8.53633 0.47155 8.2267 0.567169 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067L11.239 4.03785C11.4323 3.77421 11.5279 3.46571 11.5294 3.15829C11.5312 2.76952 11.3824 2.38248 11.09 2.09014Z" fill="#6C7688"/>
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M8.98555 7.11067L11.239 4.03785C11.4286 3.77924 11.5242 3.47745 11.5292 3.17587C11.5275 2.78121 11.3868 2.38689 11.09 2.09014L9.90993 0.910061C9.61906 0.619191 9.23445 0.470404 8.84766 0.470704C8.5383 0.470943 8.22754 0.566552 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067ZM5.69425 3.81937L8.1807 6.30582L10.3318 3.37256C10.4412 3.2233 10.4254 3.01651 10.2945 2.88564L9.11444 1.70556C8.98356 1.57468 8.77677 1.55886 8.62751 1.66832L5.69425 3.81937ZM3.98165 3.69777L2.51584 4.67497L7.32515 9.48428L8.30236 8.01847L3.98165 3.69777Z" fill="#675DFF"/>
                            </svg>
                          )}
                        </SchemaObjectPin>
                        {/* Check icon (reuse from SchemaObjectCheckmark) */}
                        <SchemaObjectCheckmark onClick={(e) => {
                          e.stopPropagation();
                          handleToggleColumn(col.id);
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.21025 3.91475C9.42992 4.13442 9.42992 4.49058 9.21025 4.71025L5.64775 8.27275C5.42808 8.49242 5.07192 8.49242 4.85225 8.27275L2.97725 6.39775C2.75758 6.17808 2.75758 5.82192 2.97725 5.60225C3.19692 5.38258 3.55308 5.38258 3.77275 5.60225L5.25 7.0795L8.41475 3.91475C8.63442 3.69508 8.99058 3.69508 9.21025 3.91475Z" fill="#6C7688"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M6 10.875C8.69272 10.875 10.875 8.69272 10.875 5.99999C10.875 3.30626 8.69998 1.125 6 1.125C3.30727 1.125 1.125 3.30727 1.125 5.99999C1.125 8.69272 3.30728 10.875 6 10.875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z" fill="#6C7688"/>
                          </svg>
                        </SchemaObjectCheckmark>
                      </ColumnIcons>
                    </ColumnLabelRow>
                    <ColumnMeta>
                      {col.tableName}
                      <span style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 6px' }}>
                        <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 0H4L2 8H0L2 0Z" fill="#99A5B8"/>
                        </svg>
                      </span>
                      {col.objectName}
                    </ColumnMeta>
                  </ColumnItem>
                ))}
              </ColumnList>
            )}
            
            <SectionTitle onClick={() => handleSectionToggle('pinnedColumns')}>
              Pinned
              <SectionToggle isExpanded={expandedSections.pinnedColumns}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SectionToggle>
            </SectionTitle>
            {expandedSections.pinnedColumns && (
              <ColumnList>
                {getPinnedColumns().map((col, index) => (
                  <ColumnItem key={index}>
                    <ColumnLabelRow>
                      <ColumnLabel>{col.humanLabel}</ColumnLabel>
                      <ColumnIcons>
                        {/* Pin icon - always filled for pinned columns, shows remove icon on hover */}
                        <SchemaObjectPin 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinColumn(col.id);
                          }}
                          style={{ position: 'relative' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.09 2.09014L9.90993 0.910061C9.61833 0.618453 9.2325 0.469651 8.84472 0.470709C8.53633 0.47155 8.2267 0.567169 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067L11.239 4.03785C11.4323 3.77421 11.5279 3.46571 11.5294 3.15829C11.5312 2.76952 11.3824 2.38248 11.09 2.09014Z" fill="#6C7688"/>
                          </svg>
                        </SchemaObjectPin>
                        {/* Check icon - only show if column is also in included */}
                        {getCurrentSpreadsheetColumns().some(includedCol => includedCol.id === col.id) ? (
                          <SchemaObjectCheckmark onClick={(e) => {
                            e.stopPropagation();
                            handleToggleColumn(col.id);
                          }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M9.21025 3.91475C9.42992 4.13442 9.42992 4.49058 9.21025 4.71025L5.64775 8.27275C5.42808 8.49242 5.07192 8.49242 4.85225 8.27275L2.97725 6.39775C2.75758 6.17808 2.75758 5.82192 2.97725 5.60225C3.19692 5.38258 3.55308 5.38258 3.77275 5.60225L5.25 7.0795L8.41475 3.91475C8.63442 3.69508 8.99058 3.69508 9.21025 3.91475Z" fill="#6C7688"/>
                              <path fillRule="evenodd" clipRule="evenodd" d="M6 10.875C8.69272 10.875 10.875 8.69272 10.875 5.99999C10.875 3.30626 8.69998 1.125 6 1.125C3.30727 1.125 1.125 3.30727 1.125 5.99999C1.125 8.69272 3.30728 10.875 6 10.875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z" fill="#6C7688"/>
                            </svg>
                          </SchemaObjectCheckmark>
                        ) : (
                          /* Plus icon - show if column is pinned but not included */
                          <SchemaObjectPlus onClick={(e) => {
                            e.stopPropagation();
                            handleToggleColumn(col.id);
                          }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.5625 3.1875C6.5625 2.87684 6.31066 2.625 6 2.625C5.68934 2.625 5.4375 2.87684 5.4375 3.1875V5.4375H3.1875C2.87684 5.4375 2.625 5.68934 2.625 6C2.625 6.31066 2.87684 6.5625 3.1875 6.5625H5.4375V8.8125C5.4375 9.12316 5.68934 9.375 6 9.375C6.31066 9.375 6.5625 9.12316 6.5625 8.8125V6.5625H8.8125C9.12316 6.5625 9.375 6.31066 9.375 6C9.375 5.68934 9.12316 5.4375 8.8125 5.4375H6.5625V3.1875Z" fill="#675DFF"/>
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 5.99999C12 9.31404 9.31405 12 6 12C2.68595 12 0 9.31404 0 5.99999C0 2.68595 2.68595 0 6 0C9.32231 0 12 2.68595 12 5.99999ZM10.875 5.99999C10.875 8.69272 8.69272 10.875 6 10.875C3.30728 10.875 1.125 8.69272 1.125 5.99999C1.125 3.30727 3.30727 1.125 6 1.125C8.69998 1.125 10.875 3.30626 10.875 5.99999Z" fill="#675DFF"/>
                            </svg>
                          </SchemaObjectPlus>
                        )}
                      </ColumnIcons>
                    </ColumnLabelRow>
                    <ColumnMeta>
                      {col.tableName && col.objectName ? (
                        <>
                          {col.tableName}
                          <span style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 6px' }}>
                            <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 0H4L2 8H0L2 0Z" fill="#99A5B8"/>
                            </svg>
                          </span>
                          {col.objectName}
                        </>
                      ) : (
                        <span style={{ color: '#99A5B8', fontStyle: 'italic' }}>
                          {col.tableName || col.objectName || 'Unknown source'}
                        </span>
                      )}
                    </ColumnMeta>
                  </ColumnItem>
                ))}
              </ColumnList>
            )}
            
            <SectionTitle onClick={() => handleSectionToggle('commonColumns')}>
              Commonly used
              <SectionToggle isExpanded={expandedSections.commonColumns}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SectionToggle>
            </SectionTitle>
            {expandedSections.commonColumns && (
              <>
                {Object.entries(commonColumnObjects).map(([packageName, objects]) => {
                  const packageKey = packageName;
                  const isExpanded = !collapsedCommonTables.has(packageKey);
                  
                  return (
                    <SchemaTable key={packageName}>
                      <SchemaTableHeader onClick={() => handleCommonTableToggle(packageKey)}>
                        <SchemaTableHeaderTitle>{packageName}</SchemaTableHeaderTitle>
                        <SchemaTableToggle isExpanded={isExpanded}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </SchemaTableToggle>
                      </SchemaTableHeader>
                      {isExpanded && (
                        <SchemaObjectList>
                          {objects.map((obj, index) => {
                            const isAdded = currentlyUsedObjects.has(`${obj.id}@${obj.tableName}`) || addedColumns.has(obj.id);
                            return (
                              <SchemaObjectItem 
                                key={index} 
                                isHighlighted={isAdded}
                                onClick={() => handleCommonColumnClick(obj, packageName)}
                                style={{ cursor: 'pointer' }}
                              >
                                <SchemaObjectLabel>
                                  <span>{obj.label}</span>
                                  <SchemaObjectActions>
                                    <SchemaObjectPin onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinColumn(obj.id);
                                    }}>
                                      {pinnedColumns.has(obj.id) ? (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M11.09 2.09014L9.90993 0.910061C9.61833 0.618453 9.2325 0.469651 8.84472 0.470709C8.53633 0.47155 8.2267 0.567169 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067L11.239 4.03785C11.4323 3.77421 11.5279 3.46571 11.5294 3.15829C11.5312 2.76952 11.3824 2.38248 11.09 2.09014Z" fill="#6C7688"/>
                                        </svg>
                                      ) : (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path fillRule="evenodd" clipRule="evenodd" d="M8.98555 7.11067L11.239 4.03785C11.4286 3.77924 11.5242 3.47745 11.5292 3.17587C11.5275 2.78121 11.3868 2.38689 11.09 2.09014L9.90993 0.910061C9.61906 0.619191 9.23445 0.470404 8.84766 0.470704C8.5383 0.470943 8.22754 0.566552 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067ZM5.69425 3.81937L8.1807 6.30582L10.3318 3.37256C10.4412 3.2233 10.4254 3.01651 10.2945 2.88564L9.11444 1.70556C8.98356 1.57468 8.77677 1.55886 8.62751 1.66832L5.69425 3.81937ZM3.98165 3.69777L2.51584 4.67497L7.32515 9.48428L8.30236 8.01847L3.98165 3.69777Z" fill="#675DFF"/>
                                        </svg>
                                      )}
                                    </SchemaObjectPin>
                                    {isAdded ? (
                                      <SchemaObjectCheckmark onClick={e => {
                                        e.stopPropagation();
                                        handleCommonColumnClick(obj, packageName);
                                      }}>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path fillRule="evenodd" clipRule="evenodd" d="M9.21025 3.91475C9.42992 4.13442 9.42992 4.49058 9.21025 4.71025L5.64775 8.27275C5.42808 8.49242 5.07192 8.49242 4.85225 8.27275L2.97725 6.39775C2.75758 6.17808 2.75758 5.82192 2.97725 5.60225C3.19692 5.38258 3.55308 5.38258 3.77275 5.60225L5.25 7.0795L8.41475 3.91475C8.63442 3.69508 8.99058 3.69508 9.21025 3.91475Z" fill="#6C7688"/>
                                          <path fillRule="evenodd" clipRule="evenodd" d="M6 10.875C8.69272 10.875 10.875 8.69272 10.875 5.99999C10.875 3.30626 8.69998 1.125 6 1.125C3.30727 1.125 1.125 3.30727 1.125 5.99999C1.125 8.69272 3.30728 10.875 6 10.875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z" fill="#6C7688"/>
                                        </svg>
                                      </SchemaObjectCheckmark>
                                    ) : (
                                      <SchemaObjectPlus>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M6.5625 3.1875C6.5625 2.87684 6.31066 2.625 6 2.625C5.68934 2.625 5.4375 2.87684 5.4375 3.1875V5.4375H3.1875C2.87684 5.4375 2.625 5.68934 2.625 6C2.625 6.31066 2.87684 6.5625 3.1875 6.5625H5.4375V8.8125C5.4375 9.12316 5.68934 9.375 6 9.375C6.31066 9.375 6.5625 9.12316 6.5625 8.8125V6.5625H8.8125C9.12316 6.5625 9.375 6.31066 9.375 6C9.375 5.68934 9.12316 5.4375 8.8125 5.4375H6.5625V3.1875Z" fill="#675DFF"/>
                                          <path fillRule="evenodd" clipRule="evenodd" d="M12 5.99999C12 9.31404 9.31405 12 6 12C2.68595 12 0 9.31404 0 5.99999C0 2.68595 2.68595 0 6 0C9.32231 0 12 2.68595 12 5.99999ZM10.875 5.99999C10.875 8.69272 8.69272 10.875 6 10.875C3.30728 10.875 1.125 8.69272 1.125 5.99999C1.125 3.30727 3.30727 1.125 6 1.125C8.69998 1.125 10.875 3.30626 10.875 5.99999Z" fill="#675DFF"/>
                                        </svg>
                                      </SchemaObjectPlus>
                                    )}
                                  </SchemaObjectActions>
                                </SchemaObjectLabel>
                                <SchemaObjectMeta>
                                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {obj.tableName}
                                    <MetadataSeparator>
                                      <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 0H4L2 8H0L2 0Z" fill="#99A5B8"/>
                                      </svg>
                                    </MetadataSeparator>
                                  </span>
                                  <span>{obj.objectName || obj.id}</span>
                                </SchemaObjectMeta>
                              </SchemaObjectItem>
                            );
                          })}
                        </SchemaObjectList>
                      )}
                    </SchemaTable>
                  );
                })}
              </>
            )}
            
            <SectionTitle onClick={() => handleSectionToggle('allColumns')}>
              All
              <SectionToggle isExpanded={expandedSections.allColumns}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SectionToggle>
            </SectionTitle>
            {expandedSections.allColumns && (
              <>
                {Object.entries(STRIPE_SCHEMA).map(([sectionName, section]) => {
                  // Sort tables to put highlighted ones first
                  const sortedTables = Object.entries(section).sort(([tableNameA, objectsA], [tableNameB, objectsB]) => {
                    const hasHighlightedA = objectsA.some(obj => currentlyUsedObjects.has(`${obj.id}@${tableNameA}`));
                    const hasHighlightedB = objectsB.some(obj => currentlyUsedObjects.has(`${obj.id}@${tableNameB}`));
                    
                    if (hasHighlightedA && !hasHighlightedB) return -1;
                    if (!hasHighlightedA && hasHighlightedB) return 1;
                    return 0;
                  });
                  
                  return (
                    <SchemaSection key={sectionName}>
                      <SubSectionTitle>{SECTION_DISPLAY_NAMES[sectionName] || sectionName}</SubSectionTitle>
                      {sortedTables.map(([tableName, objects]) => {
                        const tableKey = `${sectionName}-${tableName}`;
                        const isExpanded = !collapsedTables.has(tableKey);
                        
                        return (
                          <SchemaTable key={tableName}>
                            <SchemaTableHeader onClick={() => handleTableToggle(tableKey)}>
                              <SchemaTableHeaderTitle>{tableName}</SchemaTableHeaderTitle>
                              <SchemaTableToggle isExpanded={isExpanded}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 2L8 6L4 10" stroke="#474E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </SchemaTableToggle>
                            </SchemaTableHeader>
                            {isExpanded && (
                              <SchemaObjectList>
                                {objects.map((obj, index) => (
                                  <SchemaObjectItem 
                                    key={index} 
                                    isHighlighted={currentlyUsedObjects.has(`${obj.id}@${tableName}`)}
                                    onClick={() => handleSchemaObjectClick(obj, tableName)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <SchemaObjectLabel>
                                      <span>{obj.label}</span>
                                      <SchemaObjectActions>
                                        <SchemaObjectPin onClick={(e) => {
                                          e.stopPropagation();
                                          handlePinColumn(obj.id);
                                        }}>
                                          {pinnedColumns.has(obj.id) ? (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M11.09 2.09014L9.90993 0.910061C9.61833 0.618453 9.2325 0.469651 8.84472 0.470709C8.53633 0.47155 8.2267 0.567169 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067L11.239 4.03785C11.4323 3.77421 11.5279 3.46571 11.5294 3.15829C11.5312 2.76952 11.3824 2.38248 11.09 2.09014Z" fill="#6C7688"/>
                                              </svg>
                                            ) : (
                                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.98555 7.11067L11.239 4.03785C11.4286 3.77924 11.5242 3.47745 11.5292 3.17587C11.5275 2.78121 11.3868 2.38689 11.09 2.09014L9.90993 0.910061C9.61906 0.619191 9.23445 0.470404 8.84766 0.470704C8.5383 0.470943 8.22754 0.566552 7.96223 0.761113L4.8894 3.01452L4.55977 2.68489C4.30697 2.43209 3.91088 2.39287 3.61341 2.59118L1.5112 3.99265C1.11741 4.25518 1.06224 4.81236 1.3969 5.14702L3.72725 7.47737L0.539752 10.6649C0.429917 10.7747 0.375 10.9187 0.375 11.0626C0.375 11.2066 0.429917 11.3505 0.539752 11.4604C0.649587 11.5702 0.793544 11.6251 0.9375 11.6251C1.08146 11.6251 1.22541 11.5702 1.33525 11.4604L4.52275 8.27287L6.8531 10.6032C7.18776 10.9379 7.74494 10.8827 8.00747 10.4889L9.40894 8.38671C9.60725 8.08924 9.56803 7.69315 9.31523 7.44036L8.98555 7.11067ZM5.69425 3.81937L8.1807 6.30582L10.3318 3.37256C10.4412 3.2233 10.4254 3.01651 10.2945 2.88564L9.11444 1.70556C8.98356 1.57468 8.77677 1.55886 8.62751 1.66832L5.69425 3.81937ZM3.98165 3.69777L2.51584 4.67497L7.32515 9.48428L8.30236 8.01847L3.98165 3.69777Z" fill="#675DFF"/>
                                              </svg>
                                            )}
                                          </SchemaObjectPin>
                                          {currentlyUsedObjects.has(`${obj.id}@${tableName}`) ? (
                                            <SchemaObjectCheckmark onClick={e => {
                                              e.stopPropagation();
                                              setAddedColumns(prev => {
                                                const newSet = new Set(prev);
                                                newSet.delete(obj.id);
                                                return newSet;
                                              });
                                            }}>
                                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9.21025 3.91475C9.42992 4.13442 9.42992 4.49058 9.21025 4.71025L5.64775 8.27275C5.42808 8.49242 5.07192 8.49242 4.85225 8.27275L2.97725 6.39775C2.75758 6.17808 2.75758 5.82192 2.97725 5.60225C3.19692 5.38258 3.55308 5.38258 3.77275 5.60225L5.25 7.0795L8.41475 3.91475C8.63442 3.69508 8.99058 3.69508 9.21025 3.91475Z" fill="#6C7688"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M6 10.875C8.69272 10.875 10.875 8.69272 10.875 5.99999C10.875 3.30626 8.69998 1.125 6 1.125C3.30727 1.125 1.125 3.30727 1.125 5.99999C1.125 8.69272 3.30728 10.875 6 10.875ZM6 12C9.31405 12 12 9.31404 12 5.99999C12 2.68595 9.32231 0 6 0C2.68595 0 0 2.68595 0 5.99999C0 9.31404 2.68595 12 6 12Z" fill="#6C7688"/>
                                              </svg>
                                            </SchemaObjectCheckmark>
                                          ) : (
                                            <SchemaObjectPlus>
                                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6.5625 3.1875C6.5625 2.87684 6.31066 2.625 6 2.625C5.68934 2.625 5.4375 2.87684 5.4375 3.1875V5.4375H3.1875C2.87684 5.4375 2.625 5.68934 2.625 6C2.625 6.31066 2.87684 6.5625 3.1875 6.5625H5.4375V8.8125C5.4375 9.12316 5.68934 9.375 6 9.375C6.31066 9.375 6.5625 9.12316 6.5625 8.8125V6.5625H8.8125C9.12316 6.5625 9.375 6.31066 9.375 6C9.375 5.68934 9.12316 5.4375 8.8125 5.4375H6.5625V3.1875Z" fill="#675DFF"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M12 5.99999C12 9.31404 9.31405 12 6 12C2.68595 12 0 9.31404 0 5.99999C0 2.68595 2.68595 0 6 0C9.32231 0 12 2.68595 12 5.99999ZM10.875 5.99999C10.875 8.69272 8.69272 10.875 6 10.875C3.30728 10.875 1.125 8.69272 1.125 5.99999C1.125 3.30727 3.30727 1.125 6 1.125C8.69998 1.125 10.875 3.30626 10.875 5.99999Z" fill="#675DFF"/>
                                              </svg>
                                            </SchemaObjectPlus>
                                          )}
                                        </SchemaObjectActions>
                                      </SchemaObjectLabel>
                                      <SchemaObjectMeta>
                                        {tableName}
                                        <MetadataSeparator>
                                          <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 0H4L2 8H0L2 0Z" fill="#99A5B8"/>
                                          </svg>
                                        </MetadataSeparator>
                                        {obj.id}
                                      </SchemaObjectMeta>
                                    </SchemaObjectItem>
                                  ))}
                                </SchemaObjectList>
                              )}
                            </SchemaTable>
                          );
                        })}
                      </SchemaSection>
                    );
                  })}
                </>
              )}
            </InfoSection>
          </LeftPanel>

          {/* Main spreadsheet content container */}
          <SpreadsheetContainer>
            <SpreadsheetHeader>
              <HeaderButtons>
                <DoneButton onClick={handleClose} title="Close">
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
              
              <HeaderTitle>{getDisplayTitle()}</HeaderTitle>
              
              <HeaderButtonsRight>
                <SaveButton onClick={handleSave} title="Save">
                  Save
                </SaveButton>
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
                                ${isDraggingThis ? 'dragging' : ''}
                                ${isDropTarget ? 'drop-target' : ''}
                              `.trim()}
                              onClick={(event) => handleColumnClick(column.id, event)}
                              onMouseDown={(event) => handleColumnMouseDown(column.id, event)}
                              onMouseEnter={() => handleColumnMouseEnter(column.id)}
                              onMouseUp={handleColumnMouseUp}
                              style={{ 
                                position: 'relative',
                                userSelect: 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{column.label}</span>
                                <button 
                                  onClick={(event) => handleChevronClick(column.id, event)}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    padding: '2px',
                                    opacity: 0.6,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
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
                          onClick={() => handleRowClick(rowIndex)}
                        >
                          {/* Row number */}
                          <td 
                            className={`row-number ${selectedRow === rowIndex || selectedRows.has(rowIndex) ? 'selected' : ''}`}
                            onClick={(event) => handleRowNumberClick(rowIndex, event)}
                            onMouseDown={(event) => handleRowNumberMouseDown(rowIndex, event)}
                            onMouseEnter={() => handleRowNumberMouseEnter(rowIndex)}
                            style={{ 
                              position: 'relative',
                              userSelect: 'none'
                            }}
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
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Sort Descending
          </ColumnMenuItem>
        </ColumnMenuPopover>
      )}

      {/* Floating Action Buttons */}
      {shouldShowFloatingButtons && (
        <FloatingActionContainer data-floating-buttons hasAnalysisPanel={showAnalysisPanel} analysisPanelWidth={analysisPanelWidth} leftPanelWidth={leftPanelWidth} isResizing={isResizingLeftPanel}>
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
      <AnalysisPanel isOpen={showAnalysisPanel} width={analysisPanelWidth} data-panel="analysis">
        <AnalysisPanelResizeHandle onMouseDown={handleAnalysisPanelResizeStart} />
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
        leftPanelWidth={leftPanelWidth}
        isResizing={isResizingLeftPanel}
      >
        {/* Selection Icon */}
        {getSelectionIcon()}
        
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
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
        style={{ 
          left: summaryTooltipPosition.x,
          bottom: summaryTooltipPosition.bottom,
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