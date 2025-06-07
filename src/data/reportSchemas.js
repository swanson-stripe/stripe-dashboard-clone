// Shared schemas for reports and metrics
// This file contains all column definitions used by both ReportDetail and MetricEditor

// Report column schemas - extracted from ReportDetail.js
export const REPORT_SCHEMAS = {
  'high-usage-growth': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'usage_growth', label: 'Usage Growth %', sortable: true, isTrend: true, isPositive: true, dataType: 'number' },
    { id: 'overage_revenue', label: 'Overage Revenue', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'monthly-sales': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'Revenue', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'new-subscribers': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'included_units', label: 'Units', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'weekly-churned': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'usage_growth', label: 'Usage Trend', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'current_mrr', label: 'Lost MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'top-selling': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'high-value': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Lifetime Value', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'new-products': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'New Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'New MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'included_units', label: 'Included Units', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'mrr-growth': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'usage_growth', label: 'Growth Rate', sortable: true, isTrend: true, isPositive: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'upsell-opportunities': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Current Plan', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'Current MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Potential LTV', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'new-free-trials': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Trial Plan', sortable: true, dataType: 'category' },
    { id: 'included_units', label: 'Trial Units', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Potential Value', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'revenue-composition': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'subscription_revenue', label: 'Subscription', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'usage_revenue', label: 'Usage', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'add_on_revenue', label: 'Add-ons', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'current_mrr', label: 'Total MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'churn-risk': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'MRR at Risk', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'usage_growth', label: 'Usage Trend', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Potential LTV Loss', sortable: true, isCurrency: true, dataType: 'number' }
  ],

  // Additional report schemas
  'subscription-downgrades': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Product', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'MRR at Risk', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'usage_growth', label: 'Usage Trend', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'projected_ltv', label: 'Potential LTV Loss', sortable: true, isCurrency: true, dataType: 'number' }
  ],

  'customer-lifetime-value': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'projected_ltv', label: 'LTV', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'included_units', label: 'Months Active', sortable: true, isNumber: true, dataType: 'number' }
  ],

  'payment-failures': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Payment Method', sortable: true, dataType: 'category' },
    { id: 'usage_growth', label: 'Failure Reason', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'Amount', sortable: true, isCurrency: true, dataType: 'number' }
  ],

  'trial-conversion': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Trial Plan', sortable: true, dataType: 'category' },
    { id: 'usage_growth', label: 'Conversion Status', sortable: true, dataType: 'category' },
    { id: 'included_units', label: 'Trial Days', sortable: true, isNumber: true, dataType: 'number' }
  ],

  'api-usage-trends': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'included_units', label: 'API Calls', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'product', label: 'Endpoint', sortable: true, dataType: 'category' },
    { id: 'usage_growth', label: 'Usage Trend %', sortable: true, isTrend: true, dataType: 'number' }
  ],

  'geographic-revenue': [
    { id: 'name', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'product', label: 'Country', sortable: true, dataType: 'category' },
    { id: 'current_mrr', label: 'Revenue', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'usage_growth', label: 'Growth Rate %', sortable: true, isTrend: true, dataType: 'number' }
  ]
};

// Metric column schemas - matched to MetricDetail.js actual column structure
export const METRIC_SCHEMAS = {
  'mrr': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' },
    { id: 'customerCount', label: 'Customer count', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'overage-revenue': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'customer', label: 'Customer name', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'meter', label: 'Meter', sortable: true, dataType: 'category' },
    { id: 'includedUnits', label: 'Included units', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'unitsUsed', label: 'Units used', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'overageUnits', label: 'Overage units', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'overageRate', label: 'Overage rate', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'amount', label: 'Overage revenue', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'usage-revenue': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'customer', label: 'Customer name', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'meter', label: 'Meter', sortable: true, dataType: 'category' },
    { id: 'includedUnits', label: 'Included units', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'unitsUsed', label: 'Units used', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'overageUnits', label: 'Overage units', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'overageRate', label: 'Overage rate', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'amount', label: 'Usage revenue', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'gross-volume': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'Gross Volume', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' }
  ],
  
  'net-volume': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'Net Volume', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' }
  ],
  
  'total-revenue': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'Total Revenue', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' }
  ],
  
  'invoice-revenue': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'Invoice Revenue', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' }
  ],
  
  'new-customers': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'new-subscribers': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'active-subscribers': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'churned-subscribers': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Churn Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR Lost', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'churned-revenue': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Churn Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'MRR Lost', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'successful-payments': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'amount', label: 'Amount', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'status', label: 'Payment Method', sortable: true, dataType: 'category' }
  ],
  
  'conversion-rate': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'rate', label: 'Conversion Rate', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'totalEvents', label: 'Total Events', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'convertedEvents', label: 'Converted Events', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'refund-rate': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'rate', label: 'Refund Rate', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'totalEvents', label: 'Total Events', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'convertedEvents', label: 'Refunded Events', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'churn-rate': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'rate', label: 'Churn Rate', sortable: true, isTrend: true, dataType: 'number' },
    { id: 'totalEvents', label: 'Total Events', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'convertedEvents', label: 'Churned Events', sortable: true, isNumber: true, dataType: 'number' }
  ],
  
  'average-order': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'amount', label: 'Average Order', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' }
  ],
  
  'arpu': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'amount', label: 'ARPU', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' }
  ],
  
  'subscriber-ltv': [
    { id: 'customer', label: 'Customer', sortable: true, dataType: 'string' },
    { id: 'amount', label: 'Subscriber LTV', sortable: true, isCurrency: true, dataType: 'number' },
    { id: 'plan', label: 'Plan', sortable: true, dataType: 'category' },
    { id: 'date', label: 'Signup Date', sortable: true, dataType: 'date' }
  ],
  
  'payments-status': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' },
    { id: 'transactionCount', label: 'Count', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'amount', label: 'Amount', sortable: true, isCurrency: true, dataType: 'number' }
  ],
  
  'invoices-status': [
    { id: 'date', label: 'Date', sortable: true, dataType: 'date' },
    { id: 'status', label: 'Status', sortable: true, dataType: 'category' },
    { id: 'transactionCount', label: 'Count', sortable: true, isNumber: true, dataType: 'number' },
    { id: 'amount', label: 'Amount', sortable: true, isCurrency: true, dataType: 'number' }
  ]
};

// Helper function to get columns for reports or metrics
export const getColumnSchema = (id, isReport = true) => {
  if (isReport) {
    return REPORT_SCHEMAS[id] || REPORT_SCHEMAS['churn-risk']; // Default to churn-risk if not found
  } else {
    return METRIC_SCHEMAS[id] || [];
  }
};

// Helper function to convert ReportDetail format to MetricEditor format
export const convertToMetricEditorFormat = (columns) => {
  return columns.map(col => ({
    key: col.id,
    display: col.label,
    type: col.isCurrency ? 'currency' : 
          col.dataType === 'date' ? 'date' :
          col.dataType === 'category' ? 'category' :
          col.dataType === 'number' ? 'number' : 'string',
    isCurrency: col.isCurrency || false,
    isPercentage: col.isTrend || false
  }));
};

// Helper function to convert MetricEditor format to ReportDetail format
export const convertToReportDetailFormat = (columns) => {
  return columns.map(col => ({
    id: col.key,
    label: col.display,
    sortable: true,
    dataType: col.type === 'currency' ? 'number' : col.type,
    isCurrency: col.isCurrency || false,
    isTrend: col.isPercentage || false,
    isNumber: col.type === 'number' && !col.isCurrency
  }));
}; 