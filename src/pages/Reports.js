import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin-bottom: 0;
`;

const NewButton = styled.button`
  background-color: #635bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
  }
  
  &:hover {
    background-color: #5a51e5;
  }
`;

const SectionTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const CarouselControls = styled.div`
  display: flex;
  gap: 8px;
`;

const CarouselButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const HighlightedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
`;

const HighlightCard = styled.div`
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  padding: 16px 20px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
  color: #697386;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const TrendIndicator = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.trend > 0 
    ? (props.isNegative ? '#B13600' : '#217005') 
    : '#B13600'};
  margin-left: 8px;
`;

const FiltersRow = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  gap: 12px;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: ${props => props.outlined ? 'transparent' : 'white'};
  border: 1px ${props => props.outlined ? 'dashed' : 'solid'} #e3e8ee;
  border-radius: 20px;
  font-size: 14px;
  color: ${props => props.active ? '#635bff' : '#697386'};
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #d7dfe8;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-left: 6px;
  color: ${props => props.active ? '#635bff' : '#697386'};
`;

const PlusIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 6px;
  color: #697386;
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 8px 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
  border: 1px solid #e3e8ee;
`;

const PopoverItem = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  &.active {
    background-color: #f7f9fc;
    color: #6772e5;
    font-weight: 500;
  }
`;

const ReportsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e3e8ee;
  
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const TableHead = styled.thead`
  background-color: #f9fafc;
  border-bottom: 1px solid #e3e8ee;
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7c93;
  position: relative;
  cursor: pointer;
  
  svg {
    margin-left: 4px;
    vertical-align: middle;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1a1f36;
  border-bottom: 1px solid #e3e8ee;
`;

const ActionColumn = styled.td`
  padding: 16px;
  text-align: right;
  border-bottom: 1px solid #e3e8ee;
`;

const OptionsDots = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f7f9fc;
  }
`;

const DateColumn = styled(TableCell)`
  color: #697386;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  color: #697386;
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #e3e8ee;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background-color: #f7f9fc;
  }
`;

// Sample data
const highlightedReports = [
  { id: 'churn-risk', title: 'Churn risk', value: '413', trend: 3.5, isNegative: true },
  { id: 'upsell-opportunities', title: 'Upsell opportunities', value: '875', trend: 6.7, isNegative: false },
  { id: 'revenue-composition', title: 'Revenue composition', value: '$56.4K', trend: 0.4, isNegative: false },
  { id: 'new-free-trials', title: 'New free trials', value: '1.5K', trend: 2.3, isNegative: false }
];

const reportsList = [
  { id: 'high-usage-growth', title: 'High usage growth', creator: 'You', dateCreated: 'Apr 17, 2025', lastUpdated: 'Today' },
  { id: 'monthly-sales', title: 'Monthly sales', creator: 'kate@example.com', dateCreated: 'Mar 7, 2025', lastUpdated: 'Yesterday' },
  { id: 'new-subscribers', title: 'New subscribers past 7 days', creator: 'You', dateCreated: 'Mar 6, 2025', lastUpdated: 'Today' },
  { id: 'revenue-composition', title: 'Revenue composition', creator: 'Stripe', dateCreated: 'Jan 19, 2025', lastUpdated: 'Today' },
  { id: 'weekly-churned', title: 'Weekly churned subscribers', creator: 'You', dateCreated: 'Nov 22, 2024', lastUpdated: 'May 5, 2025' },
  { id: 'top-selling', title: 'Top selling products of the week', creator: 'kate@example.com', dateCreated: 'Nov 22, 2024', lastUpdated: 'May 1, 2025' },
  { id: 'high-value', title: 'High value customers', creator: 'You', dateCreated: 'Oct 19, 2024', lastUpdated: 'Today' },
  { id: 'new-products', title: 'New products adoption', creator: 'You', dateCreated: 'Jun 3, 2024', lastUpdated: 'May 1, 2025' },
  { id: 'churn-risk', title: 'Churn risk', creator: 'Stripe', dateCreated: 'Apr 14, 2024', lastUpdated: 'May 1, 2025' },
  { id: 'mrr-growth', title: 'MRR growth drivers', creator: 'Stripe', dateCreated: 'Apr 14, 2024', lastUpdated: 'May 1, 2025' },
];

// Filter options
const creatorOptions = [
  { value: 'anyone', label: 'Created by anyone' },
  { value: 'me', label: 'Created by me' },
  { value: 'stripe', label: 'Created by Stripe' }
];

const Reports = () => {
  const [sortField, setSortField] = useState('dateCreated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [creatorFilter, setCreatorFilter] = useState('anyone');
  const [creatorPopoverOpen, setCreatorPopoverOpen] = useState(false);
  
  const creatorRef = useRef(null);
  const navigate = useNavigate();
  
  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creatorRef.current && !creatorRef.current.contains(event.target)) {
        setCreatorPopoverOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  const handleCreatorChange = (value) => {
    setCreatorFilter(value);
    setCreatorPopoverOpen(false);
  };
  
  const getCreatorLabel = () => {
    const option = creatorOptions.find(opt => opt.value === creatorFilter);
    return option ? option.label : creatorOptions[0].label;
  };
  
  const sortedReports = [...reportsList].sort((a, b) => {
    let compareA = a[sortField];
    let compareB = b[sortField];
    
    if (sortField === 'dateCreated') {
      // Parse dates for proper comparison
      compareA = new Date(compareA);
      compareB = new Date(compareB);
    }
    
    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HeaderRow>
        <PageTitle>Reports</PageTitle>
        <NewButton>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New
        </NewButton>
      </HeaderRow>
      
      <SectionTitleRow>
        <SectionTitle>Highlighted</SectionTitle>
        <CarouselControls>
          <CarouselButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CarouselButton>
          <CarouselButton>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CarouselButton>
        </CarouselControls>
      </SectionTitleRow>
      
      <HighlightedGrid>
        {highlightedReports.map(report => (
          <HighlightCard key={report.id} as={Link} to={`/reports/${report.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <CardTitle>{report.title}</CardTitle>
            <MetricValue>
              {report.value}
              <TrendIndicator trend={report.trend} isNegative={report.isNegative}>
                {report.trend > 0 ? '+' : ''}{report.trend}%
              </TrendIndicator>
            </MetricValue>
          </HighlightCard>
        ))}
      </HighlightedGrid>
      
      <SectionTitle>All reports</SectionTitle>
      
      <FiltersRow>
        <FilterChip 
          ref={creatorRef} 
          active={true} 
          onClick={() => setCreatorPopoverOpen(!creatorPopoverOpen)}
        >
          {getCreatorLabel()}
          <IconWrapper active={true}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconWrapper>
          <Popover isOpen={creatorPopoverOpen}>
            {creatorOptions.map((option) => (
              <PopoverItem
                key={option.value}
                className={creatorFilter === option.value ? 'active' : ''}
                onClick={() => handleCreatorChange(option.value)}
              >
                {option.label}
              </PopoverItem>
            ))}
          </Popover>
        </FilterChip>
        
        <FilterChip outlined={true}>
          <PlusIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </PlusIcon>
          Created date
        </FilterChip>
        
        <FilterChip outlined={true}>
          <PlusIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </PlusIcon>
          Filter
        </FilterChip>
      </FiltersRow>
      
      <ReportsTable>
        <TableHead>
          <tr>
            <TableHeaderCell onClick={() => handleSort('title')}>
              Title {getSortIcon('title')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('creator')}>
              Created by {getSortIcon('creator')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('dateCreated')}>
              Date created {getSortIcon('dateCreated')}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('lastUpdated')}>
              Last updated date {getSortIcon('lastUpdated')}
            </TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {sortedReports.map(report => (
            <tr 
              key={report.id} 
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <TableCell>
                {report.title}
              </TableCell>
              <TableCell>{report.creator}</TableCell>
              <DateColumn>{report.dateCreated}</DateColumn>
              <DateColumn>{report.lastUpdated}</DateColumn>
              <ActionColumn onClick={(e) => e.stopPropagation()}>
                <OptionsDots>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                  </svg>
                </OptionsDots>
              </ActionColumn>
            </tr>
          ))}
        </tbody>
      </ReportsTable>
      
      <Pagination>
        <div>10 of 52 results</div>
        <PaginationControls>
          <PaginationButton disabled>Previous</PaginationButton>
          <PaginationButton>Next</PaginationButton>
        </PaginationControls>
      </Pagination>
    </PageContainer>
  );
};

export default Reports; 