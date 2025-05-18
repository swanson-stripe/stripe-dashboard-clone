import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import ReportingControls from '../components/ReportingControls';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

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
  
  // Initialize metric data from URL parameters or standardized metrics
  const [metric, setMetric] = useState(() => {
    // First try to get the metric from location state
    if (location.state?.metric) {
      return location.state.metric;
    }

    // Otherwise get it from the URL
    const params = new URLSearchParams(location.search);
    const metricId = params.get('id');
    
    // Check if metric exists in our standardized metrics
    if (metricId && standardizedMetrics[metricId]) {
      return standardizedMetrics[metricId];
    }
    
    // Default fallback metric if nothing is found
    return {
      id: 'gross-volume',
      title: 'Gross volume',
      baseCurrencyValue: 192457.32,
      baseNumberValue: 0,
      trendValue: 5.2,
      trend: 'up',
      isCurrency: true,
      unit: 'currency',
      source: 'dashboard'
    };
  });
  
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
  const generateChartData = useCallback(() => {
    // Use the centralized data service to get consistent data
    const metricId = metric.id.replace('-', ''); // Convert ID format to match data keys
    const metricData = getMetricData(metricId, activePeriod, activeInterval);
    
    // Format for chart component
    const chartData = {
      labels: metricData.labels,
      datasets: [
        {
          label: metric.title,
          data: metricData.currentData,
          borderColor: '#635bff',
          backgroundColor: 'rgba(99, 91, 255, 0.1)',
          tension: 0.4,
          pointRadius: activeInterval === PERIODS.MONTHLY ? 3 : 0,
          borderWidth: 2,
          fill: true
        }
      ]
    };
    
    // Only add comparison data if it's enabled
    if (activeComparison !== 'no-comparison' && metricData.previousData.some(val => val !== null)) {
      chartData.datasets.push({
        label: 'Previous period',
        data: metricData.previousData,
        borderColor: 'rgba(120, 120, 120, 0.6)',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
        borderDash: [4, 4]
      });
    }
    
    // Update headline metric to match the latest data point
    if (metricData.currentData.length > 0) {
      const latestValue = metricData.currentData[metricData.currentData.length - 1];
      
      // Update the metric with latest value based on type
      if (metric.isCurrency) {
        setMetric(prev => ({
          ...prev,
          baseCurrencyValue: latestValue
        }));
      } else {
        setMetric(prev => ({
          ...prev,
          baseNumberValue: latestValue
        }));
      }
      
      // Calculate trend if we have previous period data
      if (metricData.previousData.length > 0 && metricData.previousData[metricData.previousData.length - 1] !== null) {
        const previousValue = metricData.previousData[metricData.previousData.length - 1];
        if (previousValue > 0) {
          const trendPct = ((latestValue - previousValue) / previousValue) * 100;
          setMetric(prev => ({
            ...prev,
            trendValue: parseFloat(trendPct.toFixed(2)),
            trend: trendPct >= 0 ? 'up' : 'down'
          }));
        }
      }
    }
    
    return chartData;
  }, [metric.id, metric.title, metric.isCurrency, activePeriod, activeInterval, activeComparison]);
  
  // Regenerate chart data when controls change
  useEffect(() => {
    const data = generateChartData();
    setChartData(data);
  }, [generateChartData]);
  
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