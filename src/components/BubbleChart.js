import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import styled from 'styled-components';

const ChartContainer = styled.div`
  position: relative;
  height: ${props => props.height || '400px'};
  width: 100%;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
  font-size: 12px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 6px;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

const AxisLabel = styled.div`
  position: absolute;
  font-size: 12px;
  color: #6B7C93;
  ${props => props.position === 'left' && `
    left: -40px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
  `}
  ${props => props.position === 'bottom' && `
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
  `}
`;

const BubbleChart = ({
  data,
  height = 400,
  xLabel = "ARR",
  yLabel = "ARPU",
  bubbleLabel = "Merchants"
}) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    
    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    
    // Create and configure chart
    chartRef.current = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: data.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: false // We'll use our custom label
            },
            ticks: {
              callback: (value) => {
                if (value >= 1000000) {
                  return '$' + (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return '$' + (value / 1000).toFixed(0) + 'K';
                }
                return '$' + value;
              },
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: false // We'll use our custom label
            },
            ticks: {
              callback: (value) => {
                return '$' + value;
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const merchants = context.raw.r * 20; // Each dot represents ~20 merchants
                return [
                  label,
                  `${xLabel}: $${context.raw.x.toLocaleString()}`,
                  `${yLabel}: $${context.raw.y.toLocaleString()}`,
                  `${bubbleLabel}: ${merchants} (~${merchants} merchants)`
                ];
              }
            }
          },
          legend: {
            display: false, // We'll create a custom legend
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, xLabel, yLabel, bubbleLabel]);
  
  return (
    <>
      <ChartContainer height={`${height}px`}>
        <AxisLabel position="left">{yLabel}</AxisLabel>
        <AxisLabel position="bottom">{xLabel}</AxisLabel>
        <canvas ref={canvasRef} />
      </ChartContainer>
      
      {data && data.datasets && (
        <LegendContainer>
          {data.datasets.map((dataset, index) => (
            <LegendItem key={index}>
              <LegendColor color={dataset.backgroundColor} />
              <span>{dataset.label}</span>
            </LegendItem>
          ))}
          <LegendItem>
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6B7C93' }}>
              Each dot represents ~20 merchants
            </span>
          </LegendItem>
        </LegendContainer>
      )}
    </>
  );
};

export default BubbleChart; 