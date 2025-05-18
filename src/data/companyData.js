// Constants for time periods
const PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Company profile - fictional B2B SaaS company
const COMPANY_PROFILE = {
  name: 'PaymentFlow',
  establishedYear: 2018,
  industryCategory: 'Payment Processing SaaS',
  targetCustomers: 'Small to mid-sized e-commerce businesses',
  pricingModel: 'Subscription + Transaction Fee',
  employeeCount: 142,
  stage: 'Growth'
};

// Base pricing tiers
const PRICING_TIERS = {
  starter: {
    monthlyCost: 49,
    transactionFee: 0.015, // 1.5%
    features: ['Basic payment processing', 'Customer portal', 'Basic reporting']
  },
  professional: {
    monthlyCost: 129,
    transactionFee: 0.01, // 1.0%
    features: ['Advanced payment processing', 'Customer portal', 'Advanced reporting', 'Invoice automation']
  },
  enterprise: {
    monthlyCost: 299,
    transactionFee: 0.005, // 0.5%
    features: ['Complete payment suite', 'Customer portal', 'Custom reporting', 'Invoice automation', 'Dedicated support']
  }
};

// Key Metrics (as of last month)
const CURRENT_KEY_METRICS = {
  mrr: 295016.81, // Monthly Recurring Revenue
  arr: 3540201.72, // Annual Recurring Revenue
  customers: 3482, // Total customers
  activeSubscribers: 3247, // Active subscribers
  averageRevenuePerUser: 86.12, // ARPU
  customerAcquisitionCost: 432.67, // CAC
  customerLifetimeValue: 2874.36, // LTV
  
  // These are typical values in a successful SaaS business
  conversionRate: 2.43, // Website visitor to customer conversion
  churnRate: 0.87, // Monthly customer churn
  revenueChurnRate: 0.67, // Monthly revenue churn
  expansionRevenue: 14523.76, // Monthly expansion revenue
  netRetentionRate: 103.2, // Net revenue retention (> 100% means growing revenue from existing customers)
  grossMargin: 84.6, // Gross margin percentage
  
  // Additional metrics
  newCustomersMonthly: 147, // New customers last month
  averageContractValue: 245.62, // Average initial contract value
  successfulPayments: 3421, // Successful payments last month
  failedPayments: 156, // Failed payments last month
  refundRate: 0.87, // Refund rate percentage
  grossVolume: 192457.32, // Gross transaction volume
  netVolume: 187245.89, // Net transaction volume
  
  mrrGrowthRate: 4.2, // Month-over-month MRR growth
  activationRate: 68.4, // User activation rate
  featureAdoptionRate: 72.3, // Feature adoption rate
  avgDaysToConvert: 18 // Average days to convert from free trial
};

// Historical data (past 12 months)
const generateMonthlyData = () => {
  // Start from 12 months ago and work forward
  // Using realistic growth patterns for a Series B SaaS company
  // Starting with lower metrics and showing growth
  
  const monthlyData = [];
  const MONTHS = 12;
  
  const growthRates = {
    mrr: { base: 0.028, variance: 0.012 }, // ~3% monthly growth with variance
    customers: { base: 0.035, variance: 0.01 }, // ~3.5% growth in customers
    churn: { base: 0.01, decay: 0.001 }, // Churn starts higher and improves
    conversion: { base: 0.023, improvement: 0.0005 }, // Conversion improves slightly
    refund: { base: 0.01, decay: 0.0003 } // Refund rate improves over time
  };
  
  // Start with base metrics from a year ago (lower than current)
  let currentMetrics = {
    mrr: CURRENT_KEY_METRICS.mrr * 0.65, // 65% of current MRR
    customers: Math.round(CURRENT_KEY_METRICS.customers * 0.7), // 70% of current customers
    churnRate: CURRENT_KEY_METRICS.churnRate + 0.4, // Higher churn a year ago
    conversionRate: CURRENT_KEY_METRICS.conversionRate - 0.35, // Lower conversion rate
    refundRate: CURRENT_KEY_METRICS.refundRate + 0.25, // Higher refund rate
    newCustomers: Math.round(CURRENT_KEY_METRICS.newCustomersMonthly * 0.75),
    grossVolume: CURRENT_KEY_METRICS.grossVolume * 0.6,
    netVolume: CURRENT_KEY_METRICS.netVolume * 0.6
  };
  
  // Generate data for each month
  for (let i = 0; i < MONTHS; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - (MONTHS - i - 1));
    
    // Calculate growth with some variance to make data realistic
    const mrrGrowth = growthRates.mrr.base + (Math.random() * growthRates.mrr.variance - growthRates.mrr.variance / 2);
    const customerGrowth = growthRates.customers.base + (Math.random() * growthRates.customers.variance - growthRates.customers.variance / 2);
    
    // Improve metrics over time
    const churnImprovement = Math.max(0, growthRates.churn.base - (growthRates.churn.decay * i));
    const conversionImprovement = growthRates.conversion.improvement * i;
    const refundImprovement = Math.max(0, growthRates.refund.base - (growthRates.refund.decay * i));
    
    // Calculate metrics for this month
    currentMetrics.mrr *= (1 + mrrGrowth);
    currentMetrics.customers = Math.round(currentMetrics.customers * (1 + customerGrowth - currentMetrics.churnRate / 100));
    currentMetrics.churnRate = Math.max(CURRENT_KEY_METRICS.churnRate, currentMetrics.churnRate - churnImprovement);
    currentMetrics.conversionRate = Math.min(CURRENT_KEY_METRICS.conversionRate, currentMetrics.conversionRate + conversionImprovement);
    currentMetrics.refundRate = Math.max(CURRENT_KEY_METRICS.refundRate, currentMetrics.refundRate - refundImprovement);
    
    // Other related metrics
    currentMetrics.newCustomers = Math.round(currentMetrics.newCustomers * (1 + Math.random() * 0.05));
    currentMetrics.grossVolume = currentMetrics.mrr * (3.5 + Math.random() * 0.5); // Transaction volume is ~3.5-4x MRR
    currentMetrics.netVolume = currentMetrics.grossVolume * (1 - currentMetrics.refundRate / 100);
    
    // Add to monthly data array
    monthlyData.push({
      date: month,
      label: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      metrics: {
        mrr: parseFloat(currentMetrics.mrr.toFixed(2)),
        customers: currentMetrics.customers,
        churnRate: parseFloat(currentMetrics.churnRate.toFixed(2)),
        conversionRate: parseFloat(currentMetrics.conversionRate.toFixed(2)),
        refundRate: parseFloat(currentMetrics.refundRate.toFixed(2)),
        newCustomers: currentMetrics.newCustomers,
        grossVolume: parseFloat(currentMetrics.grossVolume.toFixed(2)),
        netVolume: parseFloat(currentMetrics.netVolume.toFixed(2)),
        mrrGrowthRate: parseFloat((mrrGrowth * 100).toFixed(2))
      }
    });
  }
  
  return monthlyData;
};

// Generate weekly data based on monthly trends
const generateWeeklyData = (monthlyData) => {
  const weeklyData = [];
  
  monthlyData.forEach((monthData, monthIndex) => {
    const weeksInMonth = 4; // Simplified to 4 weeks per month
    
    for (let week = 0; week < weeksInMonth; week++) {
      // Create weekly fluctuations around the monthly values
      const weekFactor = 1 + (Math.random() * 0.06 - 0.03); // ±3% random variation
      
      const date = new Date(monthData.date);
      date.setDate(date.getDate() + (week * 7));
      
      weeklyData.push({
        date: date,
        label: `Week ${week + 1}, ${date.toLocaleDateString('en-US', { month: 'short' })}`,
        metrics: {
          mrr: parseFloat((monthData.metrics.mrr / weeksInMonth * weekFactor).toFixed(2)),
          customers: Math.round(monthData.metrics.customers + (week * monthData.metrics.newCustomers / weeksInMonth)),
          churnRate: parseFloat((monthData.metrics.churnRate / weeksInMonth * weekFactor).toFixed(2)),
          conversionRate: parseFloat((monthData.metrics.conversionRate * weekFactor).toFixed(2)),
          refundRate: parseFloat((monthData.metrics.refundRate * weekFactor).toFixed(2)),
          newCustomers: Math.round(monthData.metrics.newCustomers / weeksInMonth * weekFactor),
          grossVolume: parseFloat((monthData.metrics.grossVolume / weeksInMonth * weekFactor).toFixed(2)),
          netVolume: parseFloat((monthData.metrics.netVolume / weeksInMonth * weekFactor).toFixed(2)),
          mrrGrowthRate: parseFloat((monthData.metrics.mrrGrowthRate / weeksInMonth * weekFactor).toFixed(2))
        }
      });
    }
  });
  
  return weeklyData;
};

// Generate daily data based on weekly trends
const generateDailyData = (weeklyData) => {
  const dailyData = [];
  
  weeklyData.forEach((weekData, weekIndex) => {
    const daysInWeek = 7;
    
    for (let day = 0; day < daysInWeek; day++) {
      // Create daily fluctuations around the weekly values
      const dayFactor = 1 + (Math.random() * 0.04 - 0.02); // ±2% random variation
      
      const date = new Date(weekData.date);
      date.setDate(date.getDate() + day);
      
      // Skip weekends for some metrics (like conversion) to simulate business hours
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendFactor = isWeekend ? 0.6 : 1.1; // Lower on weekends, higher on weekdays
      
      dailyData.push({
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        metrics: {
          mrr: parseFloat((weekData.metrics.mrr / daysInWeek * dayFactor).toFixed(2)),
          customers: weekData.metrics.customers + Math.round(day * weekData.metrics.newCustomers / daysInWeek),
          churnRate: parseFloat((weekData.metrics.churnRate / daysInWeek * dayFactor).toFixed(2)),
          conversionRate: parseFloat((weekData.metrics.conversionRate * dayFactor * weekendFactor).toFixed(2)),
          refundRate: parseFloat((weekData.metrics.refundRate * dayFactor).toFixed(2)),
          newCustomers: Math.round(weekData.metrics.newCustomers / daysInWeek * dayFactor * weekendFactor),
          grossVolume: parseFloat((weekData.metrics.grossVolume / daysInWeek * dayFactor * weekendFactor).toFixed(2)),
          netVolume: parseFloat((weekData.metrics.netVolume / daysInWeek * dayFactor * weekendFactor).toFixed(2)),
          mrrGrowthRate: parseFloat((weekData.metrics.mrrGrowthRate / daysInWeek * dayFactor).toFixed(2))
        }
      });
    }
  });
  
  return dailyData;
};

// Generate consistent data sets
const monthlyData = generateMonthlyData();
const weeklyData = generateWeeklyData(monthlyData);
const dailyData = generateDailyData(weeklyData);

// Helper function to get data for a specific period and interval
const getMetricData = (metricName, period, interval) => {
  let dataSource;
  let startIndex = 0;
  
  switch (interval) {
    case PERIODS.MONTHLY:
      dataSource = monthlyData;
      break;
    case PERIODS.WEEKLY:
      dataSource = weeklyData;
      break;
    case PERIODS.DAILY:
    default:
      dataSource = dailyData;
      break;
  }
  
  // Determine start index based on the period
  switch (period) {
    case 'last7days':
      startIndex = dataSource === dailyData ? dataSource.length - 7 : 0;
      break;
    case 'last30days':
      startIndex = dataSource === dailyData ? dataSource.length - 30 : 
                   dataSource === weeklyData ? dataSource.length - 4 : 0;
      break;
    case 'last90days':
      startIndex = dataSource === dailyData ? dataSource.length - 90 : 
                   dataSource === weeklyData ? dataSource.length - 13 : 
                   dataSource.length - 3;
      break;
    case 'thisYear':
      startIndex = 0; // All data is within the current year
      break;
    default:
      startIndex = Math.max(0, dataSource.length - 7);
  }
  
  startIndex = Math.max(0, startIndex);
  const relevantData = dataSource.slice(startIndex);
  
  // Extract the specific metric values and format for chart data
  const labels = relevantData.map(d => d.label);
  const values = relevantData.map(d => {
    // Handle nested metrics
    if (typeof d.metrics[metricName] !== 'undefined') {
      return d.metrics[metricName];
    }
    return null;
  }).filter(v => v !== null);
  
  // Generate comparison data (previous period)
  const previousStartIndex = Math.max(0, startIndex - relevantData.length);
  const previousEndIndex = startIndex;
  const previousData = previousStartIndex < previousEndIndex 
    ? dataSource.slice(previousStartIndex, previousEndIndex)
    : [];
  
  const previousValues = previousData.map(d => {
    if (typeof d.metrics[metricName] !== 'undefined') {
      return d.metrics[metricName];
    }
    return null;
  }).filter(v => v !== null);
  
  // Ensure previous values array is same length as current
  const paddedPreviousValues = previousValues.length >= values.length 
    ? previousValues.slice(0, values.length) 
    : [...Array(values.length - previousValues.length).fill(null), ...previousValues].slice(0, values.length);
  
  return {
    labels,
    currentData: values,
    previousData: paddedPreviousValues,
    metricName
  };
};

// Convert to standardized metrics map - consistent with Dashboard.js baseMetrics
const standardizedMetrics = {
  'gross-volume': {
    id: 'gross-volume',
    title: 'Gross volume',
    baseCurrencyValue: CURRENT_KEY_METRICS.grossVolume,
    baseNumberValue: 0,
    trendValue: 5.2,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'new-customers': {
    id: 'new-customers',
    title: 'New customers',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.newCustomersMonthly,
    trendValue: 3.8,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'successful-payments': {
    id: 'successful-payments',
    title: 'Successful payments',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.successfulPayments,
    trendValue: 2.8,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'conversion-rate': {
    id: 'conversion-rate',
    title: 'Conversion rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.conversionRate,
    trendValue: 0.18,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'average-order': {
    id: 'average-order',
    title: 'Average order',
    baseCurrencyValue: CURRENT_KEY_METRICS.averageContractValue,
    baseNumberValue: 0,
    trendValue: 1.2,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'revenue-per-customer': {
    id: 'revenue-per-customer',
    title: 'Revenue per customer',
    baseCurrencyValue: CURRENT_KEY_METRICS.averageRevenuePerUser,
    baseNumberValue: 0,
    trendValue: 0.9,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'refund-rate': {
    id: 'refund-rate',
    title: 'Refund rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.refundRate,
    trendValue: 0.05,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'net-volume': {
    id: 'net-volume',
    title: 'Net volume',
    baseCurrencyValue: CURRENT_KEY_METRICS.netVolume,
    baseNumberValue: 0,
    trendValue: 4.9,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'mrr': {
    id: 'mrr',
    title: 'MRR',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr,
    baseNumberValue: 0,
    trendValue: CURRENT_KEY_METRICS.mrrGrowthRate,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'churn-rate': {
    id: 'churn-rate',
    title: 'Churn rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.churnRate,
    trendValue: 0.08,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'active-subscribers': {
    id: 'active-subscribers',
    title: 'Active subscribers',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.activeSubscribers,
    trendValue: 3.1,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  }
};

// Export the company data
export {
  COMPANY_PROFILE,
  PRICING_TIERS,
  CURRENT_KEY_METRICS,
  standardizedMetrics,
  monthlyData,
  weeklyData,
  dailyData,
  getMetricData,
  PERIODS
}; 