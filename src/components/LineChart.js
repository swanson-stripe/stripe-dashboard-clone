import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const LineChart = ({ data, height = 400, showLegend = true, type = 'line' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get the context of the canvas element
    const ctx = chartRef.current.getContext('2d');
    
    // Set chart type based on prop
    let chartType = type;
    let fill = false;
    
    // Handle special cases
    if (type === 'area') {
      chartType = 'line';
      fill = true;
    } else if (type === 'donut') {
      chartType = 'doughnut';
    }
    
    // Basic configuration options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 10,
          titleFont: {
            family: "'Inter', sans-serif",
            size: 13
          },
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 14
          },
          displayColors: false
        }
      }
    };
    
    // Add specific options based on chart type
    if (chartType === 'line') {
      options.scales = {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: function(value) {
              if (value >= 1000) {
                return '$' + value / 1000 + 'k';
              }
              return '$' + value;
            }
          }
        }
      };
      
      // For area charts, modify the dataset
      if (fill) {
        data.datasets.forEach(dataset => {
          dataset.fill = true;
        });
      }
    } else if (chartType === 'bar') {
      options.scales = {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: function(value) {
              if (value >= 1000) {
                return '$' + value / 1000 + 'k';
              }
              return '$' + value;
            }
          }
        }
      };
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      // Pie and doughnut charts don't need scales
      delete options.scales;
      
      // Add cutout percentage for doughnut
      if (chartType === 'doughnut') {
        options.cutout = '60%';
      }
    }

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: data,
      options: options
    });
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, showLegend, type]);

  return (
    <ChartWrapper>
      <canvas ref={chartRef} height={height} />
    </ChartWrapper>
  );
};

export default LineChart; 