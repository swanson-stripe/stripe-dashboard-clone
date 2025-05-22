import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReportingControls from '../components/ReportingControls';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
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

const ReportDetailContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
`;

const ReportDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ReportDetailTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.primary ? '#5a51e5' : '#f7f9fc'};
  }
`;

const MoreButton = styled.button`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const ReportDetailValue = styled(motion.div)`
  font-size: 36px;
  font-weight: 700;
  margin-top: 8px;
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

const ControlsContainer = styled.div`
  margin-bottom: 24px;
`;

const ResultsSection = styled.div`
  margin-top: 24px;
`;

const ResultsHeader = styled.div`
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

const ExportButton = styled.button`
  padding: 8px 12px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 13px;
    position: relative;
    cursor: pointer;
    
    &:hover {
      color: var(--text-color);
    }
  }
  
  tr:not(thead tr) {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
  
  td {
    font-size: 14px;
  }
`;

const SortIndicator = styled.span`
  margin-left: 4px;
`;

const UsageValue = styled.div`
  color: ${props => props.negative ? 'var(--danger-color)' : 'inherit'};
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

// Sample report data
const reportSamples = {
  'churn-risk': {
    id: 'churn-risk',
    title: 'Churn risk',
    count: 413,
    trend: 3.5,
    isNegative: true,
    description: 'Customers at risk of churning based on usage patterns and engagement metrics'
  },
  'upsell-opportunities': {
    id: 'upsell-opportunities',
    title: 'Upsell opportunities',
    count: 875,
    trend: 6.7,
    isNegative: false,
    description: 'Customers who may benefit from additional services or higher tiers'
  },
  'revenue-composition': {
    id: 'revenue-composition',
    title: 'Revenue composition',
    count: 56400,
    trend: 0.4,
    isNegative: false,
    description: 'Breakdown of revenue sources across products and customer segments'
  },
  'new-free-trials': {
    id: 'new-free-trials',
    title: 'New free trials',
    count: 1500,
    trend: 2.3,
    isNegative: false,
    description: 'New customers who signed up for a free trial in the selected period'
  },
  'high-usage-growth': {
    id: 'high-usage-growth',
    title: 'High usage growth',
    count: 276,
    trend: 8.2,
    isNegative: false,
    description: 'Customers with significant increases in usage compared to previous period'
  },
  'monthly-sales': {
    id: 'monthly-sales',
    title: 'Monthly sales',
    count: 1238,
    trend: 5.4,
    isNegative: false,
    description: 'Monthly sales trends across all products and services'
  },
  'new-subscribers': {
    id: 'new-subscribers',
    title: 'New subscribers past 7 days',
    count: 93,
    trend: -2.1,
    isNegative: true,
    description: 'Users who subscribed to a paid plan in the last 7 days'
  },
  'weekly-churned': {
    id: 'weekly-churned',
    title: 'Weekly churned subscribers',
    count: 47,
    trend: -12.5,
    isNegative: false,
    description: 'Subscribers who canceled their subscription in the past week'
  },
  'top-selling': {
    id: 'top-selling',
    title: 'Top selling products of the week',
    count: 15,
    trend: 3.3,
    isNegative: false,
    description: 'Products with the highest sales volume in the past week'
  },
  'high-value': {
    id: 'high-value',
    title: 'High value customers',
    count: 164,
    trend: 1.9,
    isNegative: false,
    description: 'Customers with high lifetime value and consistent spending patterns'
  },
  'new-products': {
    id: 'new-products',
    title: 'New products adoption',
    count: 329,
    trend: 17.5,
    isNegative: false,
    description: 'Customers who have adopted newly released products or features'
  },
  'mrr-growth': {
    id: 'mrr-growth',
    title: 'MRR growth drivers',
    count: 284,
    trend: 4.8,
    isNegative: false,
    description: 'Analysis of the factors contributing to MRR (Monthly Recurring Revenue) growth'
  }
};

const ReportDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Get report-specific data
  const getReportData = useMemo(() => {
    // Find the report from our samples
    const report = reportSamples[params.reportId] || {
      title: "Report",
      count: 0,
      trend: 0,
      isNegative: false,
      description: "No description available"
    };

    // Define columns based on report type
    let columns = [];
    
    switch (params.reportId) {
      case 'high-usage-growth':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'usage_growth', label: 'Usage Growth %', sortable: true, isTrend: true, isPositive: true },
          { id: 'overage_revenue', label: 'Overage Revenue', sortable: true, isCurrency: true },
          { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'monthly-sales':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'current_mrr', label: 'Revenue', sortable: true, isCurrency: true },
          { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'new-subscribers':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Plan', sortable: true },
          { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true },
          { id: 'included_units', label: 'Units', sortable: true, isNumber: true }
        ];
        break;
        
      case 'weekly-churned':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'usage_growth', label: 'Usage Trend', sortable: true, isTrend: true },
          { id: 'current_mrr', label: 'Lost MRR', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'top-selling':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true },
          { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'high-value':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true },
          { id: 'projected_ltv', label: 'Lifetime Value', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'new-products':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'New Product', sortable: true },
          { id: 'current_mrr', label: 'New MRR', sortable: true, isCurrency: true },
          { id: 'included_units', label: 'Included Units', sortable: true, isNumber: true }
        ];
        break;
        
      case 'mrr-growth':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'current_mrr', label: 'MRR', sortable: true, isCurrency: true },
          { id: 'usage_growth', label: 'Growth Rate', sortable: true, isTrend: true, isPositive: true },
          { id: 'projected_ltv', label: 'Projected LTV', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'upsell-opportunities':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Current Plan', sortable: true },
          { id: 'current_mrr', label: 'Current MRR', sortable: true, isCurrency: true },
          { id: 'projected_ltv', label: 'Potential LTV', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'new-free-trials':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Trial Plan', sortable: true },
          { id: 'included_units', label: 'Trial Units', sortable: true, isNumber: true },
          { id: 'projected_ltv', label: 'Potential Value', sortable: true, isCurrency: true }
        ];
        break;
        
      case 'revenue-composition':
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'subscription_revenue', label: 'Subscription', sortable: true, isCurrency: true },
          { id: 'usage_revenue', label: 'Usage', sortable: true, isCurrency: true },
          { id: 'add_on_revenue', label: 'Add-ons', sortable: true, isCurrency: true },
          { id: 'current_mrr', label: 'Total MRR', sortable: true, isCurrency: true }
        ];
        break;
        
      default: // churn-risk or any other
        columns = [
          { id: 'name', label: 'Customer', sortable: true },
          { id: 'product', label: 'Product', sortable: true },
          { id: 'current_mrr', label: 'MRR at Risk', sortable: true, isCurrency: true },
          { id: 'usage_growth', label: 'Usage Trend', sortable: true, isTrend: true },
          { id: 'projected_ltv', label: 'Potential LTV Loss', sortable: true, isCurrency: true }
        ];
        break;
    }

    return {
      ...report,
      columns
    };
  }, [params.reportId]);
  
  // Reporting controls
  const [reportingControls, setReportingControls] = useState({
    period: 'last_7_days',
    interval: 'daily',
    comparison: 'previous_period'
  });
  
  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('current_mrr');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;
  
  // Generate sample customer data
  const customerData = useMemo(() => {
    // Get the count from the report sample
    const count = reportSamples[params.reportId]?.count || 413;
    
    // Generate a base template for a customer
    const generateCustomer = (id) => ({
      id,
      name: `Customer ${id}`,
      current_mrr: 100 + Math.floor(Math.random() * 600),
      projected_ltv: 3000 + Math.floor(Math.random() * 15000),
      product: ['Starter', 'Pro', 'Developer', 'Enterprise'][Math.floor(Math.random() * 4)],
      overage_revenue: 40 + Math.floor(Math.random() * 180),
      usage_growth: Math.floor(Math.random() * 100) - 50,
      included_units: 500000 + Math.floor(Math.random() * 1500000)
    });
    
    // Create a list of base customers with enough entries to match the count
    const baseCustomers = Array.from({ length: count }, (_, i) => {
      // Use predefined names for the first 15 customers for consistency
      const predefinedNames = [
        'ApexCloud', 'SynthCore', 'FunnelPilot', 'Lexio AI', 'InsightLoop',
        'BrightNova', 'ComposeAI', 'CloudNova', 'DataSpring', 'OrbitML',
        'PixelWave', 'QuantumLink', 'CyberSphere', 'VelocityAI', 'PulsarTech'
      ];
      
      const customer = generateCustomer(i + 1);
      
      // Use predefined names for first 15 customers
      if (i < predefinedNames.length) {
        customer.name = predefinedNames[i];
      } else {
        // Generate company names for remaining customers
        const prefixes = ['Tech', 'Data', 'Cloud', 'AI', 'Cyber', 'Digital', 'Net', 'Web', 'Dev', 'Soft'];
        const suffixes = ['Systems', 'Solutions', 'Labs', 'Works', 'Tech', 'Group', 'Inc', 'Logic', 'Hub', 'Core'];
        customer.name = `${prefixes[i % 10]}${suffixes[Math.floor(i / 10) % 10]}`;
      }
      
      return customer;
    });
    
    // Modify data based on report type
    switch (params.reportId) {
      case 'high-usage-growth':
        return baseCustomers.map(customer => ({
          ...customer,
          usage_growth: Math.abs(customer.usage_growth) * 2,
          overage_revenue: customer.overage_revenue * 1.5
        }));
        
      case 'monthly-sales':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.2,
          projected_ltv: customer.projected_ltv * 1.1
        }));
        
      case 'new-subscribers':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 0.9,
          projected_ltv: customer.projected_ltv * 1.2
        }));
        
      case 'weekly-churned':
        return baseCustomers.map(customer => ({
          ...customer,
          usage_growth: customer.usage_growth < 0 ? customer.usage_growth * 1.5 : -customer.usage_growth,
          overage_revenue: customer.overage_revenue * 0.5
        }));
        
      case 'top-selling':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.3, // Higher MRR for top sellers
          projected_ltv: customer.projected_ltv * 1.4
        })).sort((a, b) => b.current_mrr - a.current_mrr);
        
      case 'high-value':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.id % 3 === 0 ? customer.current_mrr * 2 : customer.current_mrr,
          projected_ltv: customer.projected_ltv * 1.5
        }));
        
      case 'new-products':
        return baseCustomers.map(customer => ({
          ...customer,
          product: customer.product === 'Pro' ? 'Pro+' : customer.product === 'Enterprise' ? 'Enterprise+' : customer.product,
          current_mrr: customer.current_mrr * 1.1
        }));
        
      case 'mrr-growth':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: customer.current_mrr * 1.25,
          usage_growth: Math.abs(customer.usage_growth) * 0.5
        }));
        
      case 'upsell-opportunities':
        return baseCustomers.map(customer => ({
          ...customer,
          projected_ltv: customer.projected_ltv * 1.8
        }));
        
      case 'new-free-trials':
        return baseCustomers.map(customer => ({
          ...customer,
          current_mrr: 0,
          overage_revenue: 0,
          usage_growth: 100,
          included_units: 500000
        }));
        
      case 'revenue-composition':
        return baseCustomers.map(customer => ({
          ...customer,
          subscription_revenue: customer.current_mrr * 0.7,
          usage_revenue: customer.current_mrr * 0.2,
          add_on_revenue: customer.current_mrr * 0.1
        }));
        
      default: // churn-risk or any other
        return baseCustomers;
    }
  }, [params.reportId]);
  
  // Sort and paginate the data
  const sortedData = useMemo(() => {
    return [...customerData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [customerData, sortField, sortDirection]);
  
  // Get current page of data
  const currentData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedData, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setReportingControls(prev => ({ ...prev, period }));
  };
  
  // Handle interval change
  const handleIntervalChange = (interval) => {
    setReportingControls(prev => ({ ...prev, interval }));
  };
  
  // Handle comparison change
  const handleComparisonChange = (comparison) => {
    setReportingControls(prev => ({ ...prev, comparison }));
  };

  // Format table cell data based on column type
  const formatCellValue = (value, column) => {
    if (value === undefined || value === null) return '-';
    
    if (column.isCurrency) {
      return formatCurrency(value);
    }
    
    if (column.isTrend) {
      const isNegative = value < 0;
      const displayClass = column.isPositive ? !isNegative : isNegative;
      return (
        <UsageValue negative={displayClass}>
          {value > 0 ? '+' : ''}{value}%
        </UsageValue>
      );
    }
    
    if (column.isNumber) {
      return value.toLocaleString();
    }
    
    return value;
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ReportDetailContainer>
        <BreadcrumbNav>
          <Breadcrumbs>
            <BreadcrumbLink to="/reports">Reports</BreadcrumbLink>
          </Breadcrumbs>
        </BreadcrumbNav>
        
        <ReportDetailHeader>
          <ReportDetailTitle>{getReportData.title}</ReportDetailTitle>
          <HeaderActions>
            <Button>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </Button>
            <Button primary>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit report
            </Button>
            <MoreButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </MoreButton>
          </HeaderActions>
        </ReportDetailHeader>
        
        <ReportDetailValue>
          {getReportData.count}
        </ReportDetailValue>
        
        <MetricTrend className={getReportData.isNegative ? 'negative' : 'positive'}>
          {getReportData.trend > 0 ? '+' : ''}{getReportData.trend}% compared to previous period
        </MetricTrend>
        
        <ControlsContainer>
          <ReportingControls 
            initialPeriod={reportingControls.period}
            initialInterval={reportingControls.interval}
            initialComparison={reportingControls.comparison}
            onPeriodChange={handlePeriodChange}
            onIntervalChange={handleIntervalChange}
            onComparisonChange={handleComparisonChange}
          />
        </ControlsContainer>
        
        <ResultsSection>
          <ResultsHeader>
            <SectionTitle>{sortedData.length} results</SectionTitle>
            <ExportButton>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </ExportButton>
          </ResultsHeader>
          
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  {getReportData.columns.map((column) => (
                    <th key={column.id} onClick={() => handleSort(column.id)}>
                      {column.label} {getSortIndicator(column.id)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((customer) => (
                  <tr 
                    key={customer.id}
                    onClick={() => navigate(`/users/${customer.id}/${params.reportId}`, { 
                      state: { customerData: customer, reportTitle: getReportData.title } 
                    })}
                    style={{ cursor: 'pointer' }}
                  >
                    {getReportData.columns.map((column) => (
                      <td key={column.id}>
                        {formatCellValue(customer[column.id], column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
          
          <Pagination>
            <PageInfo>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
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
        </ResultsSection>
      </ReportDetailContainer>
    </Container>
  );
};

export default ReportDetail; 