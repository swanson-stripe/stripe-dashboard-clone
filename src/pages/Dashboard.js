import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';
import DatePicker from '../components/DatePicker';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const WelcomeMessage = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 16px;
  }
`;

const ActionButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #574ae2;
  }
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricBox = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
`;

const MetricLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  
  &:hover ${MetricBox} {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const MetricTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
  
  &.positive {
    color: var(--success-color);
  }
  
  &.negative {
    color: var(--danger-color);
  }
  
  svg {
    margin-right: 4px;
  }
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const ChartContainer = styled.div`
  height: 360px;
`;

const PaymentsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const PaymentsCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TableTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-secondary);
`;

const ViewAllLink = styled(Link)`
  font-size: 14px;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    endDate: new Date() 
  });
  const [activePeriod, setActivePeriod] = useState('last7days');
  
  const handleDateChange = (period, range) => {
    setActivePeriod(period);
    if (range) {
      setDateRange(range);
    }
  };
  
  // Sample metrics data
  const metrics = [
    {
      id: 'gross-volume',
      title: 'Gross volume',
      value: '$25,650.45',
      trend: 'up',
      trendValue: 12.5,
    },
    {
      id: 'net-volume',
      title: 'Net volume',
      value: '$20,650.45',
      trend: 'up',
      trendValue: 8.2,
    },
    {
      id: 'new-customers',
      title: 'New customers',
      value: '245',
      trend: 'up',
      trendValue: 4.7,
    },
    {
      id: 'balance',
      title: 'Balance',
      value: '$7,650.00',
      trend: 'down',
      trendValue: 2.3,
    },
  ];
  
  // Sample chart data
  const generateChartData = (period) => {
    let labels = [];
    let data = [];
    
    switch(period) {
      case 'last7days':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = [1250, 1730, 1400, 1800, 1600, 2100, 2400];
        break;
      case 'last4weeks':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = [7500, 8200, 9100, 10800];
        break;
      case 'last12months':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = [25000, 28000, 27000, 30000, 32000, 35000, 37000, 36000, 39000, 42000, 45000, 48000];
        break;
      default:
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = [1250, 1730, 1400, 1800, 1600, 2100, 2400];
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
        },
      ],
    };
  };
  
  const chartData = generateChartData(activePeriod);
  
  // Sample transactions data
  const transactions = [
    { id: 1, date: '14 Apr 2023', amount: '$123.45', customer: 'John Smith', type: 'Payment', status: 'Succeeded' },
    { id: 2, date: '13 Apr 2023', amount: '$567.89', customer: 'Jane Doe', type: 'Payment', status: 'Succeeded' },
    { id: 3, date: '13 Apr 2023', amount: '$50.00', customer: 'Alice Johnson', type: 'Refund', status: 'Succeeded' },
    { id: 4, date: '12 Apr 2023', amount: '$240.00', customer: 'Bob Brown', type: 'Payment', status: 'Succeeded' },
    { id: 5, date: '12 Apr 2023', amount: '$99.99', customer: 'Charlie Davis', type: 'Payment', status: 'Failed' },
  ];
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeMessage>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your account.</p>
        </WelcomeMessage>
        
        <ActionButton>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Create New
        </ActionButton>
      </DashboardHeader>
      
      <DatePicker 
        activePeriod={activePeriod}
        onChange={handleDateChange}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
      
      <MetricsRow>
        {metrics.map(metric => (
          <MetricLink to={`/metrics/${metric.id}`} key={metric.id} state={metric}>
            <MetricBox
              layoutId={`metric-box-${metric.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{metric.title}</h3>
              <MetricValue layoutId={`metric-value-${metric.id}`}>{metric.value}</MetricValue>
              <MetricTrend 
                className={metric.trend === 'up' ? 'positive' : 'negative'}
                layoutId={`metric-trend-${metric.id}`}
              >
                {metric.trend === 'up' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {metric.trend === 'up' ? '+' : ''}{metric.trendValue}%
              </MetricTrend>
            </MetricBox>
          </MetricLink>
        ))}
      </MetricsRow>
      
      <ChartSection>
        <ChartHeader>
          <ChartTitle>Revenue Overview</ChartTitle>
        </ChartHeader>
        <ChartContainer>
          <LineChart data={chartData} height={300} />
        </ChartContainer>
      </ChartSection>
      
      <PaymentsSection>
        <SectionTitle>Recent Activity</SectionTitle>
        <PaymentsCard>
          <TableHeader>
            <TableTitle>Payments</TableTitle>
            <ViewAllLink to="/transactions">View all payments</ViewAllLink>
          </TableHeader>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.customer}</td>
                  <td>{transaction.type}</td>
                  <td>
                    <span style={{ color: transaction.status === 'Succeeded' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PaymentsCard>
      </PaymentsSection>
    </DashboardContainer>
  );
};

export default Dashboard; 