import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import Chart from 'chart.js/auto';

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const StackedBarChart = ({ data, height, categoryColors }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      return;
    }
    
    // Destroy any existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    
    // Create the new chart
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (value >= 1000000) {
                  return '$' + (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return '$' + (value / 1000).toFixed(1) + 'K';
                }
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#e1e1e1',
            borderWidth: 1,
            cornerRadius: 4,
            boxPadding: 3,
            padding: 10,
            titleFont: {
              weight: 'bold'
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.dataset.currency) {
                    label += new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(context.parsed.y);
                  } else {
                    label += context.parsed.y.toLocaleString();
                  }
                }
                return label;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <ChartContainer style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
};

export default StackedBarChart;
