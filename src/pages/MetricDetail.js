import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
`;

const BreadcrumbLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: var(--text-secondary);
  margin: 0 8px;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  /* Add separators between items */
  & > *:not(:last-child)::after {
    content: '/';
    margin-left: 8px;
    color: var(--text-secondary);
  }
`;

const BreadcrumbCurrent = styled.span`
  color: var(--text-secondary);
`;

const MetricDetailContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 24px;
`;

const MetricDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const MetricDetailTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
`;

const EditButton = styled(Link)`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const MetricDetailValue = styled(motion.div)`
  font-size: 36px;
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const MetricTrend = styled(motion.div)`
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 24px;
  
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
  height: 280px;
  width: 100%;
  margin-bottom: 32px;
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
  font-weight: 600;
  margin: 0;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
`;

const PageInfo = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const PageNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#f7f9fc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ControlsContainer = styled.div`
  margin-bottom: 24px;
`;

const MetricDetail = () => {
  const { metricId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;
  
  // Add state for reporting controls
  const [activePeriod, setActivePeriod] = useState('last7days');
  const [activeInterval, setActiveInterval] = useState('daily');
  const [activeComparison, setActiveComparison] = useState('previous-period');
  const [chartData, setChartData] = useState(null);
  const [currentMetric, setCurrentMetric] = useState(null);
  
  // Log the location state for debugging
  console.log("Location state in MetricDetail:", location.state);
  
  // Get metric data from location state with improved fallback values
  const metric = React.useMemo(() => {
    // Use the location state if available
    if (location.state?.metric) {
      return location.state.metric;
    }

    // Fallback values based on metricId
    const defaultMetrics = {
      'mrr': {
        id: 'mrr',
        title: 'MRR',
        baseCurrencyValue: 295016.81,
        baseNumberValue: 0,
        trendValue: 5.2,
        trend: 'up',
        isCurrency: true,
        unit: 'currency'
      },
      'active-subscribers': {
        id: 'active-subscribers',
        title: 'Active subscribers',
        baseCurrencyValue: 0,
        baseNumberValue: 2483,
        trendValue: 4.2,
        trend: 'up',
        isCurrency: false,
        unit: 'number'
      },
      'mrr-growth': {
        id: 'mrr-growth',
        title: 'MRR growth',
        baseCurrencyValue: 12847.43,
        baseNumberValue: 0,
        trendValue: 3.8,
        trend: 'up',
        isCurrency: true,
        unit: 'currency'
      },
      'gross-volume': {
        id: 'gross-volume',
        title: 'Gross volume',
        baseCurrencyValue: 192457.32,
        baseNumberValue: 0,
        trendValue: 5.3,
        trend: 'up',
        isCurrency: true,
        unit: 'currency'
      },
      'net-volume': {
        id: 'net-volume',
        title: 'Net volume',
        baseCurrencyValue: 187245.89,
        baseNumberValue: 0,
        trendValue: 4.9,
        trend: 'up',
        isCurrency: true,
        unit: 'currency'
      },
      'subscriber-churn-rate': {
        id: 'subscriber-churn-rate',
        title: 'Subscriber churn rate',
        baseCurrencyValue: 0,
        baseNumberValue: 2.4,
        trendValue: 0.3,
        trend: 'down',
        isCurrency: false,
        unit: 'percentage'
      },
      'default': {
        id: metricId,
        title: metricId ? metricId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Metric Details',
        baseCurrencyValue: 0,
        baseNumberValue: 100,
        trendValue: 2.0,
        trend: 'up',
        isCurrency: false,
        unit: 'number'
      }
    };

    return defaultMetrics[metricId] || defaultMetrics.default;
  }, [metricId, location.state]);
  
  // Initialize currentMetric state when metric is first determined
  useEffect(() => {
    setCurrentMetric(metric);
  }, [metric]);
  
  // Determine the source page for breadcrumbs
  const sourcePage = location.state?.sourcePage || 'Home';
  const sourceTab = location.state?.sourceTab || '';
  
  // Create the correct return path including the tab if it's from Billing
  const sourcePagePath = React.useMemo(() => {
    if (sourcePage === 'Billing') {
      return sourceTab ? `/billing/${sourceTab}` : '/billing/overview';
    }
    return '/';
  }, [sourcePage, sourceTab]);
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format number values
  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };
  
  // Format the metric value based on its type - with enhanced null checking
  const getFormattedValue = () => {
    const displayMetric = currentMetric || metric;
    if (!displayMetric) return '-';
    
    if (displayMetric.isCurrency && displayMetric.baseCurrencyValue !== undefined) {
      return formatCurrency(displayMetric.baseCurrencyValue);
    } else if (displayMetric.unit === 'percentage' && displayMetric.baseNumberValue !== undefined) {
      return `${(displayMetric.baseNumberValue).toFixed(2)}%`;
    } else if (displayMetric.unit === 'days' && displayMetric.baseNumberValue !== undefined) {
      const value = displayMetric.baseNumberValue;
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    } else if (displayMetric.baseNumberValue !== undefined) {
      return formatNumber(displayMetric.baseNumberValue);
    } else if (displayMetric.value) {
      // If metric.value is directly provided (as in some components)
      return displayMetric.value;
    } else {
      return '-';
    }
  };
  
  // Generate realistic transaction data
  const generateTransactions = () => {
    const transactions = [];
    const statuses = ['Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Succeeded', 'Refunded', 'Failed', 'Pending'];
    const customers = [
      'John Smith', 'Jane Doe', 'Alice Johnson', 'Bob Brown', 'Charlie Davis', 
      'Diana Evans', 'Ethan Fox', 'Fiona Gallagher', 'George Harris', 'Hannah Miller',
      'Ian Jackson', 'Julia Kim', 'Kevin Lee', 'Lisa Martin', 'Mike Nelson',
      'Natalie Owens', 'Oscar Perez', 'Pamela Quinn', 'Robert Rice', 'Sarah Thompson',
      'Tyler Underwood', 'Victoria Wilson', 'William Young', 'Xavier Zhang', 'Yasmine Allen',
      'Zach Baker', 'Amanda Carter', 'Benjamin Davis', 'Catherine Edwards', 'David Franklin'
    ];
    
    const amounts = [19.99, 29.99, 49.99, 99.99, 149.99, 199.99, 299.99, 499.99, 999.99];
    
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      transactions.push({
        id: `txn_${Math.random().toString(36).substr(2, 9)}`,
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount: `$${amounts[Math.floor(Math.random() * amounts.length)].toFixed(2)}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  const transactions = generateTransactions();
  
  // Get current transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  
  // Generate chart data based on metric type
  const generateChartData = () => {
    const isUptrend = metric.trend === 'up';
    let data = [];
    let labels = [];
    
    try {
      // Generate labels based on period and interval
      switch(activePeriod) {
        case 'last7days':
          if (activeInterval === 'daily') {
            labels = Array(7).fill().map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
          } else {
            // For hourly interval in 7 day view
            labels = Array(7).fill().map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
          }
          break;
        case 'last30days':
          if (activeInterval === 'daily') {
            // Show every 3rd day for readability
            labels = Array(10).fill().map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (30 - i * 3));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
          } else if (activeInterval === 'weekly') {
            // Show weekly labels
            labels = Array(5).fill().map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (30 - i * 7));
              return `Week ${i + 1}`;
            });
          }
          break;
        case 'last90days':
          if (activeInterval === 'weekly') {
            labels = Array(13).fill().map((_, i) => {
              return `Week ${i + 1}`;
            });
          } else if (activeInterval === 'monthly') {
            labels = Array(3).fill().map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - (2 - i));
              return date.toLocaleDateString('en-US', { month: 'long' });
            });
          } else {
            // For daily interval in 90 day view, show every 10th day
            labels = Array(10).fill().map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (90 - i * 10));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
          }
          break;
        case 'thisYear':
          if (activeInterval === 'monthly') {
            const currentMonth = new Date().getMonth();
            labels = Array(currentMonth + 1).fill().map((_, i) => {
              const date = new Date();
              date.setMonth(i);
              return date.toLocaleDateString('en-US', { month: 'long' });
            });
          } else {
            // For weekly interval in year view
            const weeksInYear = Math.min(
              Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
              52
            );
            labels = Array(Math.min(12, weeksInYear)).fill().map((_, i) => {
              return `Week ${i + 1}`;
            });
          }
          break;
        default:
          labels = Array(7).fill().map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
      }
      
      // Generate appropriate number of data points based on labels
      const dataPointCount = labels.length;
      
      // Set appropriate base values and volatility based on period
      let baseValue, volatility;
      
      if (metric.isCurrency) {
        // For currency metrics like MRR, gross volume, etc.
        baseValue = metric.baseCurrencyValue || 10000;
        
        // Different time periods have different base values and volatility
        switch(activePeriod) {
          case 'last7days':
            volatility = 0.05; // Less volatility for shorter timeframe
            break;
          case 'last30days':
            baseValue *= 4; // Higher total for longer timeframe
            volatility = 0.07;
            break;
          case 'last90days':
            baseValue *= 12; // Even higher for 90 days
            volatility = 0.09;
            break;
          case 'thisYear':
            baseValue *= 48; // Yearly data has highest values
            volatility = 0.12;
            break;
          default:
            volatility = 0.07;
        }
        
        data = generateRealisticTrend(dataPointCount, baseValue * 0.8, baseValue * 1.2, volatility, isUptrend);
      } else if (metric.unit === 'percentage') {
        // For percentage metrics like conversion rate
        baseValue = metric.baseNumberValue || 5;
        
        // Percentage metrics don't scale as much with time periods
        switch(activePeriod) {
          case 'last7days':
            volatility = 0.03;
            break;
          case 'last30days':
            volatility = 0.05;
            break;
          case 'last90days':
            volatility = 0.08;
            break;
          case 'thisYear':
            volatility = 0.1;
            break;
          default:
            volatility = 0.05;
        }
        
        data = generateRealisticTrend(dataPointCount, baseValue * 0.8, baseValue * 1.2, volatility, isUptrend, false);
      } else {
        // For count metrics like active subscribers
        baseValue = metric.baseNumberValue || 100;
        
        // Count metrics scale with time periods
        switch(activePeriod) {
          case 'last7days':
            volatility = 0.04;
            break;
          case 'last30days':
            baseValue *= 3;
            volatility = 0.06;
            break;
          case 'last90days':
            baseValue *= 8;
            volatility = 0.09;
            break;
          case 'thisYear':
            baseValue *= 30;
            volatility = 0.12;
            break;
          default:
            volatility = 0.06;
        }
        
        data = generateRealisticTrend(dataPointCount, baseValue * 0.8, baseValue * 1.2, volatility, isUptrend, false);
      }
    } catch (error) {
      console.error("Error generating chart data:", error);
      // Default data in case of error
      labels = Array(7).fill().map((_, i) => `Day ${i + 1}`);
      data = Array(7).fill(0).map(() => Math.floor(Math.random() * 100));
    }
    
    // Calculate comparison data if needed
    let comparisonData = null;
    if (activeComparison !== 'no-comparison') {
      comparisonData = data.map(value => value * (Math.random() * 0.4 + 0.6)); // 60-100% of current value
    }
    
    // Create dataset configuration
    const datasets = [{
      data,
      borderColor: '#635bff',
      backgroundColor: 'rgba(99, 91, 255, 0.1)',
      fill: true,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#635bff',
      label: 'Current Period'
    }];
    
    // Add comparison dataset if needed
    if (comparisonData && activeComparison !== 'no-comparison') {
      datasets.push({
        data: comparisonData,
        borderColor: '#adb5bd',
        backgroundColor: 'transparent',
        fill: false,
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 0,
        label: 'Previous Period'
      });
    }
    
    return {
      labels,
      datasets,
      currentData: data,
      previousData: comparisonData || []
    };
  };
  
  // Generate realistic trend data
  const generateRealisticTrend = (count, min, max, volatility, isUptrend, isCurrency = true) => {
    const result = [];
    let current = min + (Math.random() * (max - min) / 2); // Start somewhere in the lower half of the range
    
    for (let i = 0; i < count; i++) {
      // Add some randomness
      const changePercent = (Math.random() * volatility * 2) - volatility; // -volatility to +volatility
      
      // Add trend direction - uptrend metrics slowly increase, downtrend slowly decrease
      const trendFactor = isUptrend ? 1.01 : 0.99;
      
      current = current * (1 + changePercent) * trendFactor;
      
      // Keep within bounds
      current = Math.max(min, Math.min(max, current));
      
      // Round currency values to 2 decimals, whole number for counts
      result.push(isCurrency ? parseFloat(current.toFixed(2)) : Math.round(current));
    }
    
    return result;
  };
  
  // Use our dynamic chart data generator
  useEffect(() => {
    const newChartData = generateChartData();
    setChartData(newChartData);
    
    // Update the metric value to match the last data point
    if (newChartData.currentData && newChartData.currentData.length > 0) {
      const latestValue = newChartData.currentData[newChartData.currentData.length - 1];
      
      // Calculate trend value based on comparison data
      let calculatedTrendValue = metric.trendValue;
      
      // Only calculate if we have comparison data
      if (newChartData.previousData && newChartData.previousData.length > 0) {
        const previousValue = newChartData.previousData[newChartData.previousData.length - 1];
        if (previousValue > 0) {
          const percentChange = ((latestValue - previousValue) / previousValue) * 100;
          calculatedTrendValue = parseFloat(percentChange.toFixed(2));
        }
      }
      
      // Determine trend direction based on the calculated value
      const trendDirection = calculatedTrendValue > 0 ? 'up' : calculatedTrendValue < 0 ? 'down' : 'neutral';
      
      // Create a copy of the metric with the updated value
      const updatedMetric = {
        ...metric,
        baseCurrencyValue: metric.isCurrency ? latestValue : metric.baseCurrencyValue,
        baseNumberValue: !metric.isCurrency ? latestValue : metric.baseNumberValue,
        trendValue: Math.abs(calculatedTrendValue), // Store absolute value
        trend: trendDirection
      };
      
      // Apply the update
      setCurrentMetric(updatedMetric);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeriod, activeInterval, activeComparison]);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    // Chart data will update when component rerenders
  };
  
  // Handle interval change
  const handleIntervalChange = (interval) => {
    setActiveInterval(interval);
    // Chart data will update when component rerenders  
  };
  
  // Handle comparison change
  const handleComparisonChange = (comparison) => {
    setActiveComparison(comparison);
    // Chart data will update when component rerenders
  };
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BreadcrumbNav>
        <Breadcrumbs>
          <BreadcrumbLink to={sourcePagePath}>{sourcePage}</BreadcrumbLink>
        </Breadcrumbs>
      </BreadcrumbNav>
      
      <MetricDetailContainer>
        <MetricDetailHeader>
          <MetricDetailTitle>{metric.title}</MetricDetailTitle>
          <EditButton to={`/metrics/${metricId}/edit`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit
          </EditButton>
        </MetricDetailHeader>
        
        <MetricDetailValue layoutId={`metric-value-${metric.id}`}>
          {getFormattedValue()}
        </MetricDetailValue>
        
        <MetricTrend 
          className={currentMetric?.trend === 'up' ? 'positive' : currentMetric?.trend === 'down' ? 'negative' : ''}
          layoutId={`metric-trend-${metric.id}`}
        >
          {currentMetric ? currentMetric.trendValue.toFixed(2) : metric.trendValue.toFixed(2)}% compared to previous period
        </MetricTrend>
        
        <ControlsContainer>
          <ReportingControls 
            initialPeriod={activePeriod}
            initialInterval={activeInterval}
            initialComparison={activeComparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
          />
        </ControlsContainer>
        
        <ChartContainer>
          <LineChart data={chartData || generateChartData()} height={280} showLegend={false} />
        </ChartContainer>
        
        <TransactionsSection>
          <TransactionsHeader>
            <SectionTitle>Recent Transactions</SectionTitle>
          </TransactionsHeader>
          
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
              Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
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
      </MetricDetailContainer>
    </Container>
  );
};

export default MetricDetail; 