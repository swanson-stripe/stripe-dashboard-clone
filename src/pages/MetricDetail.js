import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  text-decoration: none;
  
  &:hover {
    color: var(--primary-color);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const MetricDetailContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
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
  font-size: 24px;
  font-weight: 600;
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

const MetricDetail = () => {
  const { metricId } = useParams();
  const location = useLocation();
  
  // Get metric data from location state or use default values
  const metric = location.state || {
    id: metricId,
    title: 'Metric Details',
    value: '$0.00',
    trend: 'neutral',
    trendValue: 0,
  };
  
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
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BackLink to="/">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Dashboard
      </BackLink>
      
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
          {metric.value}
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
        
        <div className="transactions-table">
          <h3 className="mb-2">Recent Transactions</h3>
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
              <tr>
                <td>14 Apr 2023</td>
                <td>$123.45</td>
                <td>John Smith</td>
                <td><span style={{ color: 'var(--success-color)' }}>Succeeded</span></td>
              </tr>
              <tr>
                <td>13 Apr 2023</td>
                <td>$567.89</td>
                <td>Jane Doe</td>
                <td><span style={{ color: 'var(--success-color)' }}>Succeeded</span></td>
              </tr>
              <tr>
                <td>13 Apr 2023</td>
                <td>$50.00</td>
                <td>Alice Johnson</td>
                <td><span style={{ color: 'var(--success-color)' }}>Refunded</span></td>
              </tr>
              <tr>
                <td>12 Apr 2023</td>
                <td>$240.00</td>
                <td>Bob Brown</td>
                <td><span style={{ color: 'var(--success-color)' }}>Succeeded</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </MetricDetailContainer>
    </Container>
  );
};

export default MetricDetail; 