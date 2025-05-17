import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
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
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;
  
  // Add state for reporting controls
  const [activePeriod, setActivePeriod] = useState('last_3_months');
  const [activeInterval, setActiveInterval] = useState('daily');
  const [activeComparison, setActiveComparison] = useState('previous_period');
  
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
    if (!metric) return '-';
    
    if (metric.isCurrency && metric.baseCurrencyValue !== undefined) {
      return formatCurrency(metric.baseCurrencyValue);
    } else if (metric.unit === 'percentage' && metric.baseNumberValue !== undefined) {
      return `${(metric.baseNumberValue).toFixed(1)}%`;
    } else if (metric.unit === 'days' && metric.baseNumberValue !== undefined) {
      const value = metric.baseNumberValue;
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    } else if (metric.baseNumberValue !== undefined) {
      return formatNumber(metric.baseNumberValue);
    } else if (metric.value) {
      // If metric.value is directly provided (as in some components)
      return metric.value;
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
  
  // Sample chart data based on metric type - improved error handling
  const generateChartData = () => {
    const labels = [];
    const today = new Date();
    
    // Create 14 labels for the past two weeks
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Generate data based on metric type
    let data = [];
    const isUptrend = metric.trend === 'up';
    
    try {
      if (metric.isCurrency) {
        // For currency metrics like MRR, gross volume, etc.
        const baseValue = metric.baseCurrencyValue || 10000;
        data = generateRealisticTrend(14, baseValue * 0.8, baseValue * 1.2, 0.07, isUptrend);
      } else if (metric.unit === 'percentage') {
        // For percentage metrics like conversion rate
        const baseValue = metric.baseNumberValue || 5;
        data = generateRealisticTrend(14, baseValue * 0.8, baseValue * 1.2, 0.05, isUptrend, false);
      } else {
        // For count metrics like active subscribers
        const baseValue = metric.baseNumberValue || 100;
        data = generateRealisticTrend(14, baseValue * 0.8, baseValue * 1.2, 0.06, isUptrend, false);
      }
    } catch (error) {
      console.error("Error generating chart data:", error);
      // Default data in case of error
      data = Array(14).fill(0).map(() => Math.floor(Math.random() * 100));
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          borderColor: '#635bff',
          backgroundColor: 'rgba(99, 91, 255, 0.1)',
          fill: true,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        },
      ],
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
  const chartData = generateChartData();
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    // Update chart data based on new period
    // This is a placeholder - implement actual data update logic
  };
  
  // Handle interval change
  const handleIntervalChange = (interval) => {
    setActiveInterval(interval);
    // Update chart data based on new interval
    // This is a placeholder - implement actual data update logic
  };
  
  // Handle comparison change
  const handleComparisonChange = (comparison) => {
    setActiveComparison(comparison);
    // Update chart data based on new comparison
    // This is a placeholder - implement actual data update logic
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
          <BreadcrumbCurrent>{metric.title}</BreadcrumbCurrent>
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
          className={metric.trend === 'up' ? 'positive' : metric.trend === 'down' ? 'negative' : ''}
          layoutId={`metric-trend-${metric.id}`}
        >
          {metric.trendValue}% compared to previous period
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
          <LineChart data={chartData} height={280} showLegend={false} />
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