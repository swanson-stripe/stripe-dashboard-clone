import React, { useEffect, useRef } from 'react';
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

const LineChart = ({ data, height = 400, showLegend = true, showAxes = true, unitType = 'number', horizontalLabels = false, reducedLabels = false }) => {
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
    let chartType = 'line';
    let fill = false;
    
    // Handle special cases
    if (unitType === 'area') {
      chartType = 'line';
      fill = true;
    } else if (unitType === 'donut') {
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
    
    // Basic configuration options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
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
          enabled: true,
          backgroundColor: 'white',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let value = context.raw;
              if (unitType === 'currency') {
                return ' ' + formatCurrency(value);
              } else if (unitType === 'percentage') {
                return ' ' + formatPercentage(value * 100);
              } else {
                return ' ' + formatNumber(value);
              }
            }
          }
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
              if (unitType === 'currency') {
                return formatCurrency(value);
              } else if (unitType === 'percentage') {
                return formatPercentage(value * 100);
              } else if (unitType === 'days') {
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
          beginAtZero: unitType !== 'percentage',
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
          beginAtZero: unitType !== 'percentage',
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
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, showLegend, showAxes, unitType, horizontalLabels, reducedLabels]);

  return (
    <ChartContainer>
      <canvas ref={chartRef} />
    </ChartContainer>
  );
};

export default LineChart; 