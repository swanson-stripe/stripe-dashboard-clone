import React from 'react';
import styled from 'styled-components';

const MeterContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
`;

const BarContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '8px'};
  margin-bottom: ${props => props.compactMode ? '8px' : '20px'};
  display: flex;
  border-radius: 4px;
  overflow: hidden;
`;

const Bar = styled.div`
  height: 100%;
  background-color: ${props => props.color};
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.compactMode ? '4px' : '10px'};
  margin-top: auto;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${props => props.compactMode ? '10px' : '12px'};
`;

const LegendLabel = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
`;

const LegendColor = styled.div`
  width: ${props => props.compactMode ? '8px' : '12px'};
  height: ${props => props.compactMode ? '8px' : '12px'};
  border-radius: 3px;
  margin-right: 8px;
  background-color: ${props => props.color};
`;

const LegendValue = styled.div`
  font-weight: 500;
  color: #111827;
`;

const MeterChart = ({ data, height = 160, compact = false }) => {
  // Calculate the total of all values for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages for each item
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  // Format a value (currency or number)
  const formatValue = (value, type) => {
    if (type === 'currency') {
      return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    return value.toLocaleString();
  };

  // For compact mode in the metric selection modal,
  // only show the meter bar without labels
  if (compact) {
    return (
      <BarContainer height="6px">
        {dataWithPercentages.map((item, index) => (
          <Bar 
            key={index} 
            color={item.color} 
            width={item.percentage}
          />
        ))}
      </BarContainer>
    );
  }

  // Determine if we should use compact mode based on height
  const compactMode = height < 100;
  
  // Adjust display based on available height
  const showFullLegend = height >= 60;

  return (
    <MeterContainer>
      <BarContainer height={compactMode ? '6px' : '8px'} compactMode={compactMode}>
        {dataWithPercentages.map((item, index) => (
          <Bar 
            key={index} 
            color={item.color} 
            width={item.percentage}
          />
        ))}
      </BarContainer>
      
      {showFullLegend && (
        <LegendContainer compactMode={compactMode}>
          {dataWithPercentages.map((item, index) => (
            <LegendItem key={index} compactMode={compactMode}>
              <LegendLabel>
                <LegendColor color={item.color} compactMode={compactMode} />
                {item.label}
              </LegendLabel>
              <LegendValue>
                {formatValue(item.value, item.type || 'number')}
              </LegendValue>
            </LegendItem>
          ))}
        </LegendContainer>
      )}
    </MeterContainer>
  );
};

export default MeterChart; 