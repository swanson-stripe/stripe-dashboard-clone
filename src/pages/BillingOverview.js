import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Constants for consistent styling
const STRIPE_PURPLE = '#635bff';
const STRIPE_PURPLE_LIGHT = 'rgba(99, 91, 255, 0.1)';
const GRAY = '#9ca3af';

const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin: 0;
`;

const EditLayoutButton = styled.button`
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? STRIPE_PURPLE : 'var(--text-color)'};
  border-bottom: 2px solid ${props => props.active ? STRIPE_PURPLE : 'transparent'};
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${STRIPE_PURPLE};
  }
`;

const ControlsContainer = styled.div`
  margin-bottom: 32px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.active ? STRIPE_PURPLE : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? STRIPE_PURPLE : 'var(--border-color)'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? STRIPE_PURPLE : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const ControlLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonGroup = styled.div`
  display: flex;
  
  button {
    border-radius: 0;
    
    &:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }
    
    &:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
    
    &:not(:last-child) {
      border-right: none;
    }
  }
`;

const ComparisonSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: white;
  font-size: 14px;
`;

const BillingOverview = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [activePeriod, setActivePeriod] = useState('last30days');
  const [interval, setInterval] = useState('daily');
  const [comparison, setComparison] = useState('previous-period');

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle date range changes
  const handleDateChange = (period) => {
    setActivePeriod(period);
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HeaderContainer>
        <Title>Billing Overview</Title>
        <EditLayoutButton>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit layout
        </EditLayoutButton>
      </HeaderContainer>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'summary'} 
          onClick={() => handleTabChange('summary')}
        >
          Summary
        </Tab>
        <Tab 
          active={activeTab === 'revenue'} 
          onClick={() => handleTabChange('revenue')}
        >
          Revenue
        </Tab>
        <Tab 
          active={activeTab === 'subscribers'} 
          onClick={() => handleTabChange('subscribers')}
        >
          Subscribers
        </Tab>
        <Tab 
          active={activeTab === 'invoices'} 
          onClick={() => handleTabChange('invoices')}
        >
          Invoices
        </Tab>
        <Tab 
          active={activeTab === 'usage'} 
          onClick={() => handleTabChange('usage')}
        >
          Usage
        </Tab>
        <Tab 
          active={activeTab === 'churn'} 
          onClick={() => handleTabChange('churn')}
        >
          Churn
        </Tab>
        <Tab 
          active={activeTab === 'trials'} 
          onClick={() => handleTabChange('trials')}
        >
          Trials
        </Tab>
      </TabsContainer>
      
      <ControlsContainer>
        <ControlsRow>
          <ControlGroup>
            <ControlLabel>Date range</ControlLabel>
            <ButtonGroup>
              <ControlButton 
                active={activePeriod === 'last7days'} 
                onClick={() => handleDateChange('last7days')}
              >
                Last 7 days
              </ControlButton>
              <ControlButton 
                active={activePeriod === 'last30days'} 
                onClick={() => handleDateChange('last30days')}
              >
                Last 30 days
              </ControlButton>
              <ControlButton 
                active={activePeriod === 'last90days'} 
                onClick={() => handleDateChange('last90days')}
              >
                Last 90 days
              </ControlButton>
              <ControlButton 
                active={activePeriod === 'thisYear'} 
                onClick={() => handleDateChange('thisYear')}
              >
                This year
              </ControlButton>
            </ButtonGroup>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Interval</ControlLabel>
            <ButtonGroup>
              <ControlButton 
                active={interval === 'daily'} 
                onClick={() => setInterval('daily')}
              >
                Daily
              </ControlButton>
              <ControlButton 
                active={interval === 'weekly'} 
                onClick={() => setInterval('weekly')}
              >
                Weekly
              </ControlButton>
              <ControlButton 
                active={interval === 'monthly'} 
                onClick={() => setInterval('monthly')}
              >
                Monthly
              </ControlButton>
            </ButtonGroup>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Comparison</ControlLabel>
            <ComparisonSelect 
              value={comparison}
              onChange={(e) => setComparison(e.target.value)}
            >
              <option value="previous-period">vs. previous period</option>
              <option value="previous-year">vs. previous year</option>
              <option value="no-comparison">No comparison</option>
            </ComparisonSelect>
          </ControlGroup>
        </ControlsRow>
      </ControlsContainer>
      
      {/* Content for each tab will go here */}
    </PageContainer>
  );
};

export default BillingOverview;
