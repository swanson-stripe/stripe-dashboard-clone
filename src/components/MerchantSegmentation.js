import React, { useMemo } from 'react';
import styled from 'styled-components';
import BubbleChart from './BubbleChart';

// Constants for consistent styling
const STRIPE_PURPLE = '#635bff';
const ORANGE = '#F5A623';
const GREEN = '#13B57D';
const BLUE = '#3D9BE9';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  color: #1A1F36;
`;

const Description = styled.p`
  font-size: 14px;
  color: #6B7C93;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const InsightContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: rgba(99, 91, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid ${STRIPE_PURPLE};
`;

const InsightTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1A1F36;
  margin-top: 0;
  margin-bottom: 8px;
`;

const InsightText = styled.p`
  font-size: 14px;
  color: #6B7C93;
  margin: 0;
  line-height: 1.5;
`;

const MerchantSegmentation = () => {
  // Generate sample merchant segment data
  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Cactus Practice',
          data: [{
            x: 340000, // $340K ARR
            y: 19,     // $19 ARPU
            r: 9       // ~180 merchants (9 * 20)
          }],
          backgroundColor: ORANGE,
          borderColor: 'rgba(245, 166, 35, 0.8)',
          borderWidth: 1
        },
        {
          label: 'Enterprise Clients',
          data: [{
            x: 490000, // $490K ARR
            y: 42,     // $42 ARPU
            r: 6       // ~120 merchants (6 * 20)
          }],
          backgroundColor: BLUE,
          borderColor: 'rgba(61, 155, 233, 0.8)',
          borderWidth: 1
        },
        {
          label: 'Growth Segment',
          data: [{
            x: 280000, // $280K ARR
            y: 29,     // $29 ARPU
            r: 5       // ~100 merchants (5 * 20)
          }],
          backgroundColor: GREEN,
          borderColor: 'rgba(19, 181, 125, 0.8)',
          borderWidth: 1
        },
        {
          label: 'Small Business',
          data: [{
            x: 220000, // $220K ARR
            y: 22,     // $22 ARPU
            r: 8       // ~160 merchants (8 * 20)
          }],
          backgroundColor: STRIPE_PURPLE,
          borderColor: 'rgba(99, 91, 255, 0.8)',
          borderWidth: 1
        }
      ]
    };
  }, []);

  return (
    <Container>
      <Title>Merchant Segmentation Analysis</Title>
      <Description>
        This chart shows your merchant segments by Annual Recurring Revenue (ARR) and Average Revenue Per User (ARPU).
        Bubble size represents the number of merchants in each segment.
      </Description>
      
      <BubbleChart 
        data={chartData}
        height={380}
        xLabel="ARR"
        yLabel="ARPU"
        bubbleLabel="Merchants"
      />
      
      <InsightContainer>
        <InsightTitle>Segment Insights</InsightTitle>
        <InsightText>
          Cactus Practice represents a significant portion of merchants (180) but with a lower ARPU ($19).
          Consider developing targeted upsell strategies for this segment to increase ARPU without affecting
          retention. The Enterprise Clients segment shows strong performance with highest ARPU ($42) and
          substantial ARR ($490K).
        </InsightText>
      </InsightContainer>
    </Container>
  );
};

export default MerchantSegmentation; 