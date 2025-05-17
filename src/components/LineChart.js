import React, { useEffect, useRef, memo } from 'react';
import Chart from 'chart.js/auto';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

const LineChart = memo(({ data, height = 400, showLegend = true, showAxes = true, unitType = 'number', horizontalLabels = false, reducedLabels = false, type }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Handle unit from type or unitType prop for backward compatibility
  const unit = type === 'area' ? 'currency' : unitType;

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get the context of the canvas element
    const ctx = chartRef.current.getContext('2d');
    
    // Set chart type and fill based on type prop
    let chartType = 'line';
    let fill = false;
    
    if (type === 'area') {
      chartType = 'line';
      fill = true;
    } else if (type === 'donut') {
      chartType = 'doughnut';
    }

    // Format ticks based on unit type
    const formatNumber = (value) => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toFixed(0);
    };

    const formatCurrency = (value) => {
      if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
      }
      return '$' + value.toFixed(0);
    };

    const formatPercentage = (value) => {
      return value.toFixed(1) + '%';
    };
    
    // Basic configuration options with reduced animation duration
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300, // Reduced animation time to prevent flickering
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 6,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: false, // Disable default tooltips since we implement custom ones
        },
      },
      scales: {
        x: {
          display: showAxes,
          grid: {
            display: showAxes,
            color: '#eee',
          },
          ticks: {
            font: {
              size: 11,
            },
            color: '#999',
            rotation: horizontalLabels ? 0 : -45,
            callback: reducedLabels ? function(value, index, ticks) {
              if (ticks.length <= 2) return data.labels[index];
              
              if (ticks.length > 10) {
                if (index === 0 || index === ticks.length - 1 || index % Math.floor(ticks.length / 3) === 0) {
                  return data.labels[index];
                }
                return '';
              }
              
              if (index === 0 || index === ticks.length - 1 || index % 2 === 0) {
                return data.labels[index];
              }
              return '';
            } : undefined
          }
        },
        y: {
          display: showAxes,
          grid: {
            display: showAxes,
            color: '#eee',
          },
          ticks: {
            font: {
              size: 11,
            },
            color: '#999',
            callback: function(value) {
              if (unit === 'currency') {
                return formatCurrency(value);
              } else if (unit === 'percentage') {
                return formatPercentage(value * 100);
              } else if (unit === 'days') {
                return value + (value === 1 ? ' day' : ' days');
              } else {
                return formatNumber(value);
              }
            }
          }
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
          beginAtZero: unit !== 'percentage',
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      };
      
      // For area charts, modify the dataset
      if (fill) {
        data.datasets.forEach(dataset => {
          dataset.fill = true;
          dataset.backgroundColor = dataset.borderColor ? `${dataset.borderColor}15` : 'rgba(75, 192, 192, 0.2)';
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
          beginAtZero: unit !== 'percentage',
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            callback: function(value) {
              return formatCurrency(value);
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
    
    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, showLegend, unit, type, showAxes, horizontalLabels, reducedLabels]);

  return (
    <ChartContainer style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </ChartContainer>
  );
}, (prevProps, nextProps) => {
  // Implement custom comparison for memoization
  // Only re-render if essential props changed
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.unitType === nextProps.unitType &&
    prevProps.type === nextProps.type &&
    prevProps.showAxes === nextProps.showAxes
  );
});

export default LineChart; 