// Constants for time periods
const PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Company profile - fictional B2B SaaS company
const COMPANY_PROFILE = {
  name: 'PaymentFlow',
  establishedYear: 2020, // Relatively new company (3-4 years old)
  industryCategory: 'Payment Processing SaaS',
  targetCustomers: 'Small to mid-sized e-commerce businesses',
  pricingModel: 'Subscription + Transaction Fee',
  employeeCount: 47, // Early stage, small team
  stage: 'Series A', // Just raised Series A funding
  fundingAmount: '$8.5M'
};

// Base pricing tiers - realistic for early SaaS company
const PRICING_TIERS = {
  starter: {
    monthlyCost: 49,
    transactionFee: 0.019, // 1.9%
    features: ['Basic payment processing', 'Customer portal', 'Basic reporting']
  },
  professional: {
    monthlyCost: 99,
    transactionFee: 0.015, // 1.5%
    features: ['Advanced payment processing', 'Customer portal', 'Advanced reporting', 'Invoice automation']
  },
  enterprise: {
    monthlyCost: 249,
    transactionFee: 0.008, // 0.8%
    features: ['Complete payment suite', 'Customer portal', 'Custom reporting', 'Invoice automation', 'Dedicated support']
  }
};

// Key Metrics (calibrated for early-stage but healthy SaaS company)
const CURRENT_KEY_METRICS = {
  // Revenue metrics
  mrr: 187540.00, // $187K MRR is realistic for post Series A
  arr: 2250480.00, // $2.25M ARR (12x MRR)
  
  // Customer metrics
  customers: 1850, // Total customers
  activeSubscribers: 1724, // Active subscribers (93% of total customers)
  averageRevenuePerUser: 108.78, // ARPU
  customerAcquisitionCost: 498.25, // CAC
  customerLifetimeValue: 1623.84, // LTV (>3x CAC is healthy)
  
  // Growth and conversion metrics
  conversionRate: 2.87, // Website visitor to customer conversion
  churnRate: 2.35, // Monthly customer churn rate
  revenueChurnRate: 1.95, // Monthly revenue churn rate
  expansionRevenue: 6283.50, // Monthly expansion revenue
  netRetentionRate: 101.5, // Net revenue retention (slightly >100% is good for early stage)
  grossMargin: 82.3, // Gross margin percentage
  
  // Transaction metrics
  newCustomersMonthly: 89, // New customers last month
  averageContractValue: 108.78, // Average initial contract value (same as ARPU)
  successfulPayments: 1834, // Successful payments last month
  failedPayments: 68, // Failed payments last month
  refundRate: 1.75, // Refund rate percentage
  grossVolume: 656390.00, // Gross transaction volume (3.5x MRR)
  netVolume: 643922.68, // Net transaction volume (after refunds)
  
  // Growth rates
  mrrGrowthRate: 5.8, // Month-over-month MRR growth - healthy
  activationRate: 72.6, // User activation rate
  featureAdoptionRate: 68.5, // Feature adoption rate
  avgDaysToConvert: 14 // Average days to convert from free trial
};

// Generate monthly data (past 12 months)
const generateMonthlyData = () => {
  // Start from 12 months ago and work forward
  // Using realistic growth patterns for a Series A SaaS company
  // Starting with lower metrics and showing growth
  
  const monthlyData = [];
  const MONTHS = 12;
  
  const growthRates = {
    mrr: { base: 0.056, variance: 0.015 }, // ~5.6% monthly growth with variance
    customers: { base: 0.062, variance: 0.018 }, // ~6.2% growth in customers
    churn: { base: 0.021, decay: 0.0018 }, // Churn starts higher and improves
    conversion: { base: 0.028, improvement: 0.0008 }, // Conversion improves slightly
    refund: { base: 0.015, decay: 0.0005 }, // Refund rate improves over time
    overagerev: { base: 0.045, variance: 0.02 } // Overage revenue growth with higher variance
  };
  
  // Start with base metrics from a year ago (about 50% of current)
  let currentMetrics = {
    mrr: CURRENT_KEY_METRICS.mrr * 0.51, // 51% of current MRR
    customers: Math.round(CURRENT_KEY_METRICS.customers * 0.52), // 52% of current customers
    churnRate: CURRENT_KEY_METRICS.churnRate + 1.2, // Higher churn a year ago
    conversionRate: CURRENT_KEY_METRICS.conversionRate - 0.7, // Lower conversion rate
    refundRate: CURRENT_KEY_METRICS.refundRate + 0.65, // Higher refund rate
    newCustomers: Math.round(CURRENT_KEY_METRICS.newCustomersMonthly * 0.6),
    grossVolume: CURRENT_KEY_METRICS.grossVolume * 0.51, // Same ratio as MRR
    netVolume: CURRENT_KEY_METRICS.netVolume * 0.51,  // Same ratio as MRR
    overagerevenue: 7500 // Starting value for overage revenue
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
    
    // Special growth for overage revenue - spike in last month
    let overageGrowth = growthRates.overagerev.base + (Math.random() * growthRates.overagerev.variance - growthRates.overagerev.variance / 2);
    if (i === MONTHS - 1) {
      // Big spike in the last month (40% increase)
      overageGrowth = 0.4;
    } else if (i === MONTHS - 2) {
      // Smaller spike in second-to-last month (20% increase)
      overageGrowth = 0.2;
    }
    
    // Calculate metrics for this month
    currentMetrics.mrr *= (1 + mrrGrowth);
    currentMetrics.customers = Math.round(currentMetrics.customers * (1 + customerGrowth - currentMetrics.churnRate / 100));
    currentMetrics.churnRate = Math.max(CURRENT_KEY_METRICS.churnRate, currentMetrics.churnRate - churnImprovement);
    currentMetrics.conversionRate = Math.min(CURRENT_KEY_METRICS.conversionRate, currentMetrics.conversionRate + conversionImprovement);
    currentMetrics.refundRate = Math.max(CURRENT_KEY_METRICS.refundRate, currentMetrics.refundRate - refundImprovement);
    currentMetrics.overagerevenue *= (1 + overageGrowth);
    
    // Other related metrics
    currentMetrics.newCustomers = Math.round(currentMetrics.newCustomers * (1 + Math.random() * 0.07));
    currentMetrics.grossVolume = currentMetrics.mrr * (3.5 + Math.random() * 0.2); // Transaction volume is ~3.5x MRR
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
        mrrGrowthRate: parseFloat((mrrGrowth * 100).toFixed(2)),
        activeSubscribers: Math.round(currentMetrics.customers * 0.93),
        arpu: parseFloat((currentMetrics.mrr / (currentMetrics.customers * 0.93)).toFixed(2)),
        revenue: parseFloat((currentMetrics.mrr).toFixed(2)),
        successfulPayments: Math.round(currentMetrics.customers * 1.05),
        failedPayments: Math.round(currentMetrics.customers * 0.04),
        averageOrderValue: parseFloat((currentMetrics.grossVolume / (currentMetrics.customers * 1.05)).toFixed(2)),
        overagerevenue: parseFloat(currentMetrics.overagerevenue.toFixed(2))
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
      
      // For the last month, add a progressive spike in overage revenue for weeks 3 and 4
      let overageRevenueFactor = weekFactor;
      if (monthIndex === monthlyData.length - 1) {
        if (week === 2) {
          overageRevenueFactor = 1.15; // 15% higher in week 3 of last month
        } else if (week === 3) {
          overageRevenueFactor = 1.4; // 40% higher in week 4 of last month
        }
      }
      
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
          mrrGrowthRate: parseFloat((monthData.metrics.mrrGrowthRate / weeksInMonth * weekFactor).toFixed(2)),
          overagerevenue: parseFloat((monthData.metrics.overagerevenue / weeksInMonth * overageRevenueFactor).toFixed(2))
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
      
      // For the last week or two, add spike in overage revenue for last few days
      let overageRevenueFactor = dayFactor;
      if (weekIndex === weeklyData.length - 1) {
        if (day >= 5) {
          // Last two days of last week get a big spike
          overageRevenueFactor = 1 + (day - 4) * 0.2; // 20% higher on day 5, 40% higher on day 6
        }
      } else if (weekIndex === weeklyData.length - 2 && day >= 5) {
        // Last two days of second-to-last week get a smaller spike
        overageRevenueFactor = 1 + (day - 4) * 0.1; // 10% higher on day 5, 20% higher on day 6
      }
      
      dailyData.push({
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        metrics: {
          mrr: parseFloat((weekData.metrics.mrr / daysInWeek * dayFactor).toFixed(2)),
          customers: Math.round(weekData.metrics.customers),
          churnRate: parseFloat((weekData.metrics.churnRate / daysInWeek * dayFactor).toFixed(2)),
          conversionRate: parseFloat((weekData.metrics.conversionRate * dayFactor).toFixed(2)),
          refundRate: parseFloat((weekData.metrics.refundRate * dayFactor).toFixed(2)),
          newCustomers: Math.round(weekData.metrics.newCustomers / daysInWeek * dayFactor),
          grossVolume: parseFloat((weekData.metrics.grossVolume / daysInWeek * dayFactor).toFixed(2)),
          netVolume: parseFloat((weekData.metrics.netVolume / daysInWeek * dayFactor).toFixed(2)),
          successfulPayments: Math.round(weekData.metrics.newCustomers * 2 * dayFactor),
          failedPayments: Math.round(weekData.metrics.newCustomers * 0.1 * dayFactor),
          mrrGrowthRate: parseFloat((weekData.metrics.mrrGrowthRate / daysInWeek * dayFactor).toFixed(2)),
          overagerevenue: parseFloat((weekData.metrics.overagerevenue / daysInWeek * overageRevenueFactor).toFixed(2))
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
  
  // Make sure we have at least some data points
  if (relevantData.length === 0) {
    console.warn(`No data available for ${metricName} with period ${period} and interval ${interval}`);
    // Generate dummy data for testing
    return generateDummyData(metricName, period, interval);
  }
  
  // Extract the specific metric values and format for chart data
  const labels = relevantData.map(d => d.label);
  const values = relevantData.map(d => {
    // Handle nested metrics
    if (typeof d.metrics[metricName] !== 'undefined') {
      return d.metrics[metricName];
    }
    return null;
  }).filter(v => v !== null);
  
  // If we don't have any valid values after filtering, generate dummy data
  if (values.length === 0) {
    console.warn(`No valid metric values for ${metricName}`);
    return generateDummyData(metricName, period, interval);
  }
  
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
  
  const result = {
    labels,
    currentData: values,
    previousData: paddedPreviousValues,
    metricName
  };
  
  console.log(`Generated chart data for ${metricName}:`, result);
  return result;
};

// Generate dummy data for testing when real data is missing
const generateDummyData = (metricName, period, interval) => {
  // For overage revenue, return specific shape with a spike at the end
  if (metricName === 'overagerevenue') {
    const daysCount = period === 'last7days' ? 7 : 
                      period === 'last30days' ? 30 : 
                      period === 'last90days' ? 90 : 12;
                        
    // Use fixed dates to match the reference image (June 11-17)
    const fixedDates = [];
    const baseDate = new Date(2023, 5, 11); // June 11, 2023
    
    // Generate fixed dates for the period
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      fixedDates.push(date);
    }
    
    const labels = [];
    
    // Create specific pattern for overage revenue
    const baseValue = 14750; // Base value from standardizedMetrics
    
    // Pattern: steady growth with spike at the end
    let pattern;
    if (daysCount <= 7) {
      // Use specific values from the reference image for 7 days
      pattern = [962.31, 962.38, 961.70, 970.60, 969.99, 1151.13, 1342.99];
    } else if (daysCount <= 30) {
      // Create a 30-day pattern with growth and spike at end
      pattern = [];
      for (let i = 0; i < daysCount; i++) {
        if (i >= daysCount - 2) {
          pattern.push(1.0 + (i - (daysCount - 3)) * 0.2); // Last 2 days spike
        } else {
          pattern.push(0.7 + (i / (daysCount - 2)) * 0.3); // Gradual growth
        }
      }
    } else {
      // Longer period - create pattern with gradual growth and spike
      pattern = [];
      for (let i = 0; i < daysCount; i++) {
        if (i >= daysCount - 2) {
          pattern.push(1.0 + (i - (daysCount - 3)) * 0.2); // Last 2 days spike
        } else {
          pattern.push(0.7 + (i / (daysCount - 2)) * 0.3); // Gradual growth
        }
      }
    }
    
    // Generate labels and data points
    const currentData = [];
    const previousData = [];
    
    for (let i = 0; i < daysCount; i++) {
      const date = fixedDates[i];
      
      if (interval === PERIODS.MONTHLY) {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      } else if (interval === PERIODS.WEEKLY) {
        labels.push(`Week ${Math.floor(i/7) + 1}, ${date.toLocaleDateString('en-US', { month: 'short' })}`);
      } else {
        // Format to match "Jun 11" pattern seen in the reference image
        labels.push(`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
      
      if (daysCount <= 7 && pattern.length === 7) {
        // Use exact values from the pattern if we have 7 days
        currentData.push(pattern[i]);
        // Previous values from reference image
        const prevValues = [776.37, 792.60, 780.42, 783.22, 787.45, 866.77, 945.57];
        previousData.push(prevValues[i]);
      } else {
        // Add some small random variation to make it look natural
        const randomFactor = 1 + (Math.random() * 0.04 - 0.02); // ±2% random variation
        currentData.push(baseValue * pattern[Math.min(i, pattern.length - 1)] * randomFactor);
        
        // Previous period's data (about 80% of current)
        previousData.push(baseValue * pattern[Math.min(i, pattern.length - 1)] * 0.8 * randomFactor);
      }
    }
    
    return {
      labels,
      currentData,
      previousData,
      metricName
    };
  }
  
  // Default dummy data generation for other metrics
  const daysCount = period === 'last7days' ? 7 : 
                    period === 'last30days' ? 30 : 
                    period === 'last90days' ? 90 : 12;
                    
  const today = new Date();
  const labels = [];
  const currentData = [];
  const previousData = [];
  
  // Generate labels and dummy data based on the interval
  for (let i = 0; i < daysCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (daysCount - i));
    
    if (interval === PERIODS.MONTHLY) {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    } else if (interval === PERIODS.WEEKLY) {
      labels.push(`Week ${Math.floor(i/7) + 1}, ${date.toLocaleDateString('en-US', { month: 'short' })}`);
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Get the matching standardized metric for base value
    const metric = standardizedMetrics[metricName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()];
    let baseValue = 100;
    
    if (metric) {
      baseValue = metric.isCurrency ? metric.baseCurrencyValue : metric.baseNumberValue;
    }
    
    // Generate semi-random but realistic-looking data
    const variance = 0.05; // 5% variance day to day
    const randomFactor = 1 + (Math.random() * variance * 2 - variance);
    
    // Make value depend on the day to create a realistic trend
    const trendFactor = 1 + (i * 0.01); // 1% increase per day
    const value = baseValue * randomFactor * trendFactor;
    
    // Previous period is slightly lower
    const previousValue = value * 0.9;
    
    currentData.push(value);
    previousData.push(previousValue);
  }
  
  return {
    labels,
    currentData,
    previousData,
    metricName
  };
};

// Convert to standardized metrics map - consistent with Dashboard.js and BillingOverview.js
const standardizedMetrics = {
  'gross-volume': {
    id: 'gross-volume',
    title: 'Gross volume',
    baseCurrencyValue: CURRENT_KEY_METRICS.grossVolume,
    baseNumberValue: 0,
    trendValue: 5.8,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'net-volume': {
    id: 'net-volume',
    title: 'Net volume',
    baseCurrencyValue: CURRENT_KEY_METRICS.netVolume,
    baseNumberValue: 0,
    trendValue: 5.6,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'overage-revenue': {
    id: 'overage-revenue',
    title: 'Overage revenue',
    description: 'Revenue from usage beyond committed quantities',
    group: 'billing',
    section: 'usage',
    baseCurrencyValue: 5422.00,
    trendValue: 14.8,
    trend: 'up',
    unit: 'currency',
    isCurrency: true,
    hasAnomaly: true
  },
  'usage-overage-revenue': {
    id: 'usage-overage-revenue',
    title: 'Overage revenue',
    description: 'Revenue from usage exceeding included quotas',
    baseCurrencyValue: 14750,
    baseNumberValue: 0,
    trendValue: 14.8,
    trend: 'up',
    isCurrency: true,
    unit: 'currency',
    hasAnomaly: true
  },
  'new-customers': {
    id: 'new-customers',
    title: 'New customers',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.newCustomersMonthly,
    trendValue: 6.2,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'successful-payments': {
    id: 'successful-payments',
    title: 'Successful payments',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.successfulPayments,
    trendValue: 4.8,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'conversion-rate': {
    id: 'conversion-rate',
    title: 'Conversion rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.conversionRate,
    trendValue: 0.28,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'average-order': {
    id: 'average-order',
    title: 'Average order',
    baseCurrencyValue: CURRENT_KEY_METRICS.averageContractValue,
    baseNumberValue: 0,
    trendValue: 1.9,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'revenue-per-customer': {
    id: 'revenue-per-customer',
    title: 'Revenue per customer',
    baseCurrencyValue: CURRENT_KEY_METRICS.averageRevenuePerUser,
    baseNumberValue: 0,
    trendValue: 1.7,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'refund-rate': {
    id: 'refund-rate',
    title: 'Refund rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.refundRate,
    trendValue: 0.15,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
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
    trendValue: 0.18,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'active-subscribers': {
    id: 'active-subscribers',
    title: 'Active subscribers',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.activeSubscribers,
    trendValue: 5.8,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'mrr-growth': {
    id: 'mrr-growth',
    title: 'MRR growth',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * (CURRENT_KEY_METRICS.mrrGrowthRate / 100),
    baseNumberValue: 0,
    trendValue: 0.8,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'mrr-growth-rate': {
    id: 'mrr-growth-rate',
    title: 'MRR growth rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.mrrGrowthRate,
    trendValue: 0.6,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'total-revenue': {
    id: 'total-revenue',
    title: 'Total revenue',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * 1.32, // MRR plus usage and other revenue
    baseNumberValue: 0,
    trendValue: 6.2,
    trend: 'up',
    isCurrency: true,
    unit: 'currency',
    showCents: true
  },
  'active-subscribers-growth': {
    id: 'active-subscribers-growth',
    title: 'Active subscribers growth',
    baseCurrencyValue: 0,
    baseNumberValue: 6.4,
    trendValue: 0.7,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'new-subscribers': {
    id: 'new-subscribers',
    title: 'New subscribers',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.newCustomersMonthly,
    trendValue: 6.2,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'churned-subscribers': {
    id: 'churned-subscribers',
    title: 'Churned subscribers',
    baseCurrencyValue: 0,
    baseNumberValue: Math.round(CURRENT_KEY_METRICS.activeSubscribers * (CURRENT_KEY_METRICS.churnRate / 100)),
    trendValue: 0.4,
    trend: 'down',
    isCurrency: false,
    unit: 'number'
  },
  'arpu': {
    id: 'arpu',
    title: 'Average revenue per user',
    baseCurrencyValue: CURRENT_KEY_METRICS.averageRevenuePerUser,
    baseNumberValue: 0,
    trendValue: 1.8,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'subscriber-ltv': {
    id: 'subscriber-ltv',
    title: 'Subscriber lifetime value',
    baseCurrencyValue: CURRENT_KEY_METRICS.customerLifetimeValue,
    baseNumberValue: 0,
    trendValue: 2.3,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  }
};

// Additional metrics specifically for the Billing section
const billingMetrics = {
  'invoice-revenue': {
    id: 'invoice-revenue',
    title: 'Invoice revenue',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * 0.98,
    baseNumberValue: 0,
    trendValue: 5.6,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'past-due-invoice-volume': {
    id: 'past-due-invoice-volume',
    title: 'Past due invoice volume',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * 0.105,
    baseNumberValue: 0,
    trendValue: 0.8,
    trend: 'down',
    isCurrency: true,
    unit: 'currency'
  },
  'past-due-invoice-payment-rate': {
    id: 'past-due-invoice-payment-rate',
    title: 'Past due invoice payment rate',
    baseCurrencyValue: 0,
    baseNumberValue: 78.5,
    trendValue: 2.7,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'avg-invoice-payment-length': {
    id: 'avg-invoice-payment-length',
    title: 'Average invoice payment length',
    baseCurrencyValue: 0,
    baseNumberValue: 3.8,
    trendValue: 0.3,
    trend: 'down',
    isCurrency: false,
    unit: 'days'
  },
  'usage-revenue': {
    id: 'usage-revenue',
    title: 'Usage revenue',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * 0.32,
    baseNumberValue: 0,
    trendValue: 7.2,
    trend: 'up',
    isCurrency: true,
    unit: 'currency'
  },
  'usage-count': {
    id: 'usage-count',
    title: 'Usage count',
    baseCurrencyValue: 0,
    baseNumberValue: 486250,
    trendValue: 8.4,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'subscriber-churn-rate': {
    id: 'subscriber-churn-rate',
    title: 'Subscriber churn rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.churnRate,
    trendValue: 0.18,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'churned-revenue': {
    id: 'churned-revenue',
    title: 'Churned revenue',
    baseCurrencyValue: CURRENT_KEY_METRICS.mrr * (CURRENT_KEY_METRICS.revenueChurnRate / 100),
    baseNumberValue: 0,
    trendValue: 0.5,
    trend: 'down',
    isCurrency: true,
    unit: 'currency'
  },
  'gross-mrr-churn-rate': {
    id: 'gross-mrr-churn-rate',
    title: 'Gross MRR churn rate',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.revenueChurnRate,
    trendValue: 0.15,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'net-mrr-churn-rate': {
    id: 'net-mrr-churn-rate',
    title: 'Net MRR churn rate',
    baseCurrencyValue: 0,
    baseNumberValue: -1.5, // Negative indicates expansion > churn
    trendValue: 0.25,
    trend: 'down',
    isCurrency: false,
    unit: 'percentage'
  },
  'new-trials': {
    id: 'new-trials',
    title: 'New trials',
    baseCurrencyValue: 0,
    baseNumberValue: Math.round(CURRENT_KEY_METRICS.newCustomersMonthly * 2.3),
    trendValue: 7.8,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'trial-conversion-rate': {
    id: 'trial-conversion-rate',
    title: 'Trial conversion rate',
    baseCurrencyValue: 0,
    baseNumberValue: 43.5,
    trendValue: 2.4,
    trend: 'up',
    isCurrency: false,
    unit: 'percentage'
  },
  'active-trials': {
    id: 'active-trials',
    title: 'Active trials',
    baseCurrencyValue: 0,
    baseNumberValue: Math.round(CURRENT_KEY_METRICS.newCustomersMonthly * 2.3 * 1.8),
    trendValue: 5.2,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  },
  'converted-trials': {
    id: 'converted-trials',
    title: 'Converted trials',
    baseCurrencyValue: 0,
    baseNumberValue: CURRENT_KEY_METRICS.newCustomersMonthly,
    trendValue: 4.3,
    trend: 'up',
    isCurrency: false,
    unit: 'number'
  }
};

// Merge billing metrics into standardized metrics
Object.assign(standardizedMetrics, billingMetrics);

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