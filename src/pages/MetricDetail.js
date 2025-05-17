import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';

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

const MetricDetail = () => {
  const { metricId } = useParams();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 25;
  
  // Get metric data from location state or use default values
  const metric = location.state?.metric || {
    id: metricId,
    title: 'Metric Details',
    value: '-',
    trend: 'up',
    trendValue: 0,
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 100 ? 2 : 0,
      maximumFractionDigits: value < 100 ? 2 : 0
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
  
  // Format the metric value based on its type
  const getFormattedValue = () => {
    if (!metric) return '-';
    
    if (metric.isCurrency) {
      return formatCurrency(metric.baseCurrencyValue || 0);
    } else if (metric.unit === 'percentage') {
      return `${(metric.baseNumberValue || 0).toFixed(1)}%`;
    } else if (metric.unit === 'days') {
      const value = metric.baseNumberValue || 0;
      return `${value} ${value === 1 ? 'day' : 'days'}`;
    } else {
      return formatNumber(metric.baseNumberValue || 0);
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
  
  // Sample chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [1250, 1730, 1400, 1800, 1600, 2100, 2400, 2200, 2500, 2300, 2600, 2800, 2900, 3000],
        borderColor: '#635bff',
        backgroundColor: 'rgba(99, 91, 255, 0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BreadcrumbNav>
        <BreadcrumbLink to="/">
          Home
        </BreadcrumbLink>
        <BreadcrumbSeparator>
          /
        </BreadcrumbSeparator>
        <span>{metric.title}</span>
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
          {metric.trend === 'up' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : metric.trend === 'down' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : null}
          {metric.trend === 'up' ? '+' : ''}{metric.trendValue}% compared to previous period
        </MetricTrend>
        
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