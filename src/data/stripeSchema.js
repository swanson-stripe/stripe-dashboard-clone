// Comprehensive Stripe Schema mapping with existing schema references
export const STRIPE_SCHEMA = {
  'Core Objects': {
    'customers': [
      { id: 'id', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'email', label: 'Email Address', mappedTo: [] },
      { id: 'name', label: 'Customer Name', mappedTo: ['customer', 'name'] },
      { id: 'description', label: 'Description', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'default_source', label: 'Default Source', mappedTo: [] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'balance', label: 'Account Balance', mappedTo: ['amount'] },
      { id: 'address', label: 'Address', mappedTo: [] },
      { id: 'phone', label: 'Phone Number', mappedTo: [] }
    ],
    'subscriptions': [
      { id: 'id', label: 'Subscription ID', mappedTo: [] },
      { id: 'customer', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'status', label: 'Subscription Status', mappedTo: ['status'] },
      { id: 'current_period_start', label: 'Current Period Start', mappedTo: ['date'] },
      { id: 'current_period_end', label: 'Current Period End', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'plan', label: 'Plan ID', mappedTo: ['plan', 'product'] },
      { id: 'quantity', label: 'Quantity', mappedTo: ['included_units', 'includedUnits'] },
      { id: 'trial_start', label: 'Trial Start', mappedTo: [] },
      { id: 'trial_end', label: 'Trial End', mappedTo: [] },
      { id: 'canceled_at', label: 'Canceled At', mappedTo: [] },
      { id: 'ended_at', label: 'Ended At', mappedTo: [] }
    ],
    'invoices': [
      { id: 'id', label: 'Invoice ID', mappedTo: [] },
      { id: 'customer', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'subscription', label: 'Subscription ID', mappedTo: [] },
      { id: 'status', label: 'Invoice Status', mappedTo: ['status'] },
      { id: 'amount_due', label: 'Amount Due', mappedTo: ['amount'] },
      { id: 'amount_paid', label: 'Amount Paid', mappedTo: ['amount'] },
      { id: 'amount_remaining', label: 'Amount Remaining', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'due_date', label: 'Due Date', mappedTo: [] },
      { id: 'paid', label: 'Paid Status', mappedTo: [] },
      { id: 'period_start', label: 'Period Start', mappedTo: [] },
      { id: 'period_end', label: 'Period End', mappedTo: [] }
    ],
    'charges': [
      { id: 'id', label: 'Charge ID', mappedTo: [] },
      { id: 'customer', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'amount', label: 'Amount', mappedTo: ['amount'] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'status', label: 'Charge Status', mappedTo: ['status'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'description', label: 'Description', mappedTo: [] },
      { id: 'paid', label: 'Paid Status', mappedTo: [] },
      { id: 'refunded', label: 'Refunded Status', mappedTo: [] },
      { id: 'failure_code', label: 'Failure Code', mappedTo: [] },
      { id: 'failure_message', label: 'Failure Message', mappedTo: [] }
    ]
  },
  'Payment Objects': {
    'payment_intents': [
      { id: 'id', label: 'Payment Intent ID', mappedTo: [] },
      { id: 'customer', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'amount', label: 'Amount', mappedTo: ['amount'] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'status', label: 'Status', mappedTo: ['status'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'payment_method', label: 'Payment Method', mappedTo: ['product'] }
    ],
    'payment_methods': [
      { id: 'id', label: 'Payment Method ID', mappedTo: [] },
      { id: 'customer', label: 'Customer ID', mappedTo: ['customer', 'name'] },
      { id: 'type', label: 'Payment Type', mappedTo: ['product'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] }
    ],
    'refunds': [
      { id: 'id', label: 'Refund ID', mappedTo: [] },
      { id: 'charge', label: 'Charge ID', mappedTo: [] },
      { id: 'amount', label: 'Refund Amount', mappedTo: ['amount'] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'status', label: 'Refund Status', mappedTo: ['status'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'reason', label: 'Refund Reason', mappedTo: [] }
    ]
  },
  'Product & Pricing': {
    'products': [
      { id: 'id', label: 'Product ID', mappedTo: [] },
      { id: 'name', label: 'Product Name', mappedTo: ['product', 'plan'] },
      { id: 'description', label: 'Description', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'active', label: 'Active Status', mappedTo: ['status'] },
      { id: 'type', label: 'Product Type', mappedTo: [] }
    ],
    'prices': [
      { id: 'id', label: 'Price ID', mappedTo: [] },
      { id: 'product', label: 'Product ID', mappedTo: ['product', 'plan'] },
      { id: 'unit_amount', label: 'Unit Amount', mappedTo: ['amount', 'current_mrr'] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'recurring', label: 'Recurring Details', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'active', label: 'Active Status', mappedTo: ['status'] }
    ],
    'coupons': [
      { id: 'id', label: 'Coupon ID', mappedTo: [] },
      { id: 'percent_off', label: 'Percent Off', mappedTo: ['usage_growth'] },
      { id: 'amount_off', label: 'Amount Off', mappedTo: ['amount'] },
      { id: 'currency', label: 'Currency', mappedTo: [] },
      { id: 'duration', label: 'Duration', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] }
    ]
  },
  'Usage & Metering': {
    'usage_records': [
      { id: 'id', label: 'Usage Record ID', mappedTo: [] },
      { id: 'subscription_item', label: 'Subscription Item', mappedTo: [] },
      { id: 'quantity', label: 'Usage Quantity', mappedTo: ['unitsUsed', 'included_units'] },
      { id: 'timestamp', label: 'Usage Timestamp', mappedTo: ['date'] },
      { id: 'action', label: 'Usage Action', mappedTo: [] }
    ],
    'subscription_items': [
      { id: 'id', label: 'Subscription Item ID', mappedTo: [] },
      { id: 'subscription', label: 'Subscription ID', mappedTo: [] },
      { id: 'price', label: 'Price ID', mappedTo: [] },
      { id: 'quantity', label: 'Quantity', mappedTo: ['includedUnits', 'included_units'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] }
    ],
    'metering': [
      { id: 'meter_id', label: 'Meter ID', mappedTo: ['meter'] },
      { id: 'usage_count', label: 'Usage Count', mappedTo: ['unitsUsed'] },
      { id: 'overage_count', label: 'Overage Count', mappedTo: ['overageUnits'] },
      { id: 'overage_rate', label: 'Overage Rate', mappedTo: ['overageRate'] },
      { id: 'timestamp', label: 'Timestamp', mappedTo: ['date'] }
    ]
  },
  'Revenue & Analytics': {
    'revenue': [
      { id: 'mrr', label: 'Monthly Recurring Revenue', mappedTo: ['current_mrr', 'amount'] },
      { id: 'arr', label: 'Annual Recurring Revenue', mappedTo: [] },
      { id: 'ltv', label: 'Customer Lifetime Value', mappedTo: ['projected_ltv'] },
      { id: 'subscription_revenue', label: 'Subscription Revenue', mappedTo: ['subscription_revenue'] },
      { id: 'usage_revenue', label: 'Usage Revenue', mappedTo: ['usage_revenue', 'overage_revenue'] },
      { id: 'add_on_revenue', label: 'Add-on Revenue', mappedTo: ['add_on_revenue'] }
    ],
    'metrics': [
      { id: 'churn_rate', label: 'Churn Rate', mappedTo: ['rate'] },
      { id: 'growth_rate', label: 'Growth Rate', mappedTo: ['usage_growth'] },
      { id: 'conversion_rate', label: 'Conversion Rate', mappedTo: ['rate'] },
      { id: 'customer_count', label: 'Customer Count', mappedTo: ['customerCount'] },
      { id: 'trial_conversion', label: 'Trial Conversion', mappedTo: [] }
    ]
  },
  'Events & Webhooks': {
    'events': [
      { id: 'id', label: 'Event ID', mappedTo: [] },
      { id: 'type', label: 'Event Type', mappedTo: [] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] },
      { id: 'data', label: 'Event Data', mappedTo: [] },
      { id: 'pending_webhooks', label: 'Pending Webhooks', mappedTo: [] }
    ],
    'webhook_endpoints': [
      { id: 'id', label: 'Webhook Endpoint ID', mappedTo: [] },
      { id: 'url', label: 'URL', mappedTo: [] },
      { id: 'enabled_events', label: 'Enabled Events', mappedTo: [] },
      { id: 'status', label: 'Status', mappedTo: ['status'] },
      { id: 'created', label: 'Created Date', mappedTo: ['date'] }
    ]
  }
};

// Helper function to find which Stripe table a column belongs to
export const findStripeMapping = (columnId) => {
  let stripeTable = 'Unknown';
  let stripeObject = columnId;
  
  Object.entries(STRIPE_SCHEMA).forEach(([sectionName, section]) => {
    Object.entries(section).forEach(([tableName, objects]) => {
      const matchedObject = objects.find(obj => 
        obj.mappedTo.includes(columnId) || obj.id === columnId
      );
      if (matchedObject) {
        stripeTable = tableName;
        stripeObject = matchedObject.id;
      }
    });
  });

  return { stripeTable, stripeObject };
}; 