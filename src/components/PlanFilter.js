import React from 'react';
import styled from 'styled-components';
import { useMetrics } from './MetricsContext';

const STRIPE_PURPLE = '#635bff';

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active ? STRIPE_PURPLE : 'var(--border-color)'};
  background-color: ${props => props.active ? STRIPE_PURPLE : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  
  &:hover {
    background-color: ${props => props.active ? STRIPE_PURPLE : '#f7f9fc'};
  }
`;

const PlanFilter = () => {
  const { currentPlan, setPlan } = useMetrics();
  
  const plans = [
    { value: 'all', label: 'All plans' },
    { value: 'developer', label: 'Developer' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' }
  ];
  
  return (
    <FilterContainer>
      <FilterLabel>Plan:</FilterLabel>
      {plans.map(plan => (
        <FilterChip
          key={plan.value}
          active={currentPlan === plan.value}
          onClick={() => setPlan(plan.value)}
        >
          {plan.label}
        </FilterChip>
      ))}
    </FilterContainer>
  );
};

export default PlanFilter; 