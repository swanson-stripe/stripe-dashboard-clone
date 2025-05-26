import React, { useEffect, useRef, memo, forwardRef } from 'react';
import Chart from 'chart.js/auto';
import styled from 'styled-components';

// Add the Stripe color constants
const STRIPE_PURPLE = '#635bff';
const GRAY = '#aab7c4';

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

const LineChart = memo(forwardRef(({ 
  data, 
  height = 300, 
  showLegend = true, 
  showAxes = true, 
  type = 'line', 
  unit, 
  reducedLabels = false, 
  useMarkers = true, 
  sparkline = false,
  simplified = false,
  disableAnimation = false,
  customPlugins = []
}, ref) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Expose the chart instance to the parent component
  if (ref) {
    ref.current = {
      getChart: () => chartInstance.current
    };
  }
  
  // Handle unit from type or unitType prop for backward compatibility
  const unitType = unit || (type === 'area' ? 'currency' : 'number');
  
  useEffect(() => {
    // Only proceed if we have valid data and DOM element
    if (!chartRef.current || !data) return;
    
    // Additional safety checks for data structure
    if (!data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0 ||
        !data.labels || !Array.isArray(data.labels)) {
      console.warn('LineChart: Invalid data format', data);
      return;
    }
    
    // If chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Get the context
    const ctx = chartRef.current.getContext('2d');
    
    // Set default animation duration based on disableAnimation flag
    Chart.defaults.animation.duration = disableAnimation ? 0 : 800;
    
    // Parse the data - handle both formats (data.chartData and direct data) with additional safety
    const chartData = {
      labels: Array.isArray(data.labels) ? data.labels : [],
      datasets: Array.isArray(data.datasets) 
        ? data.datasets.map(dataset => ({
            ...dataset,
            data: Array.isArray(dataset.data) ? dataset.data : []
          }))
        : []
    };

    // Check if datasets have stack property, which indicates stacked bar chart
    const isStacked = chartData.datasets.some(ds => ds.stack !== undefined);

    // Make sure all datasets have consistent styling
    chartData.datasets.forEach((dataset, index) => {
      // Apply consistent styling
      dataset.borderWidth = 2; // Consistent 2px line width
      
      // Different styling for primary vs comparison lines
      if (dataset.borderColor === STRIPE_PURPLE || dataset.borderColor === '#635bff') {
        dataset.pointRadius = 0; // Hide points by default
        dataset.pointHoverRadius = simplified ? 0 : 6; // Show larger points on hover unless simplified
        dataset.pointBackgroundColor = dataset.borderColor; // Match border color
        dataset.pointBorderColor = 'white'; // White border around points
        dataset.pointBorderWidth = 1; // Thin white border
      } else {
        // For comparison lines (usually gray)
        dataset.pointRadius = 0; // Hide points by default
        dataset.pointHoverRadius = simplified ? 0 : 5; // Show points on hover unless simplified
        dataset.pointBackgroundColor = dataset.borderColor || '#aab7c4';
        dataset.pointBorderColor = 'white';
        dataset.pointBorderWidth = 1;
      }
      
      if (!dataset.data || dataset.data.length === 0) {
        console.warn(`Dataset ${index} has no data`);
      }
    });

    // Set chart type and fill based on type prop
    let chartType = 'line';
    let fill = false;
    
    if (type === 'area') {
      chartType = 'line';
      fill = true;
    } else if (type === 'donut') {
      chartType = 'doughnut';
    } else if (type === 'bar') {
      chartType = 'bar';
    }

    // Format ticks based on unit type
    const formatNumber = (value) => {
      if (value === null || value === undefined) return '';
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toFixed(0);
    };

    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '';
      if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
      }
      return '$' + value.toFixed(0);
    };

    const formatPercentage = (value) => {
      if (value === null || value === undefined) return '';
      return value.toFixed(2) + '%';
    };
    
    // Enhanced animation configuration with smooth transitions for data changes
    const animationConfig = {
      duration: 800, // Longer duration for smoother transitions
      easing: 'easeOutQuad', // Smoother easing function
      delay: (context) => {
        // Add a slight delay for each bar in a stacked bar chart for a cascade effect
        if (isStacked && chartType === 'bar') {
          return context.datasetIndex * 100; // 100ms delay between datasets
        }
        return 0;
      },
      // Separate animation settings for number updates
      numbers: {
        duration: 800,
        easing: 'easeOutQuart', // Different easing for numbers
        from: (ctx) => {
          // Start from current value for smoother transitions
          if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
            return ctx.dataset.data[ctx.dataIndex];
          }
          return 0;
        }
      },
      colors: {
        type: 'color',
        duration: 800,
        easing: 'easeOutQuad',
        from: (ctx) => {
          if (ctx.type === 'data' && ctx.dataIndex !== undefined) {
            return ctx.chart.data.datasets[ctx.datasetIndex].backgroundColor;
          }
          return 'rgba(0, 0, 0, 0)';
        }
      }
    };

    // This is the key fix - custom function for properly displaying x-axis labels
    const filterLabels = (value, index, values) => {
      // For metric cards (simplified or small height), only show first and last labels
      if (simplified || height <= 150) {
        // Only return the actual label for first and last indices, empty string for others
        return index === 0 || index === values.length - 1 ? chartData.labels[index] : '';
      }
      
      // For regular charts, use the actual label from chartData
      return chartData.labels[index];
    };
    
    // Basic configuration options with enhanced animations
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: animationConfig,
      transitions: {
        active: {
          animation: {
            duration: 400 // Faster transitions for interactions
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'x',
        enabled: !simplified // Disable interactions when simplified
      },
      plugins: {
        legend: {
          display: showLegend && !simplified,
          position: 'top',
          labels: {
            usePointStyle: !isStacked, // Don't use point style for stacked bars
            boxWidth: isStacked ? 12 : 6,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: false, // Always disable the default Chart.js tooltip
        },
      },
      scales: {
        x: {
          display: showAxes, // Show x-axis regardless of simplified flag
          grid: {
            display: showAxes, // Show gridlines regardless of simplified flag
            color: '#eee',
          },
          border: {
            display: showAxes // Show border regardless of simplified flag
          },
          ticks: {
            display: showAxes, // Show ticks regardless of simplified flag
            font: {
              size: 11,
            },
            padding: 8,
            maxRotation: 0, // Always horizontal labels
            minRotation: 0,
            autoSkip: simplified ? false : true, // Disable auto-skipping for simplified charts
            autoSkipPadding: 10, // Add padding between labels to prevent overlap
            callback: filterLabels // Use our custom function to return actual labels
          }
        },
        y: {
          display: showAxes, // Show y-axis regardless of simplified flag
          border: {
            display: showAxes, // Show border regardless of simplified flag
          },
          grid: {
            display: showAxes, // Show gridlines regardless of simplified flag
            color: '#eee',
          },
          beginAtZero: true,
          ticks: {
            display: showAxes, // Show ticks regardless of simplified flag
            font: {
              size: 11,
            },
            padding: 10,
            // Limit to exactly 3 ticks (including zero if beginAtZero is true)
            count: 4,
            maxTicksLimit: 4,
            callback: (value) => {
              if (unitType === 'currency') {
                return formatCurrency(value);
              } else if (unitType === 'percentage') {
                return formatPercentage(value);
              } else {
                return formatNumber(value);
              }
            }
          }
        }
      },
      layout: {
        padding: (sparkline || simplified) ? 0 : {
          top: 5,
          right: 10,
          bottom: 5,
          left: 10
        }
      },
      elements: {
        line: {
          tension: chartType === 'line' ? 0.4 : 0, // Add tension for smoother lines
          borderWidth: 2,
          borderJoinStyle: 'round',
          capBezierPoints: true
        },
        point: {
          hitRadius: simplified ? 0 : 8, // Larger hit area for better interaction
          hoverRadius: simplified ? 0 : 6,
          radius: 0 // Always set the default radius to 0 regardless of useMarkers
        }
      }
    };
    
    // Add specific options based on chart type
    if (chartType === 'line') {
      options.scales = {
        x: {
          display: showAxes, // Show x-axis regardless of simplified flag
          grid: {
            display: showAxes, // Show gridlines regardless of simplified flag
            color: 'rgba(0, 0, 0, 0.05)'
          },
          border: {
            display: showAxes // Show border regardless of simplified flag
          },
          ticks: {
            display: showAxes, // Show ticks regardless of simplified flag
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            maxRotation: 0, // Always horizontal labels
            minRotation: 0,
            autoSkip: simplified ? false : true, // Disable auto-skipping for simplified charts
            autoSkipPadding: 10, // Add padding between labels to prevent overlap
            callback: filterLabels // Use our custom function to return actual labels
          }
        },
        y: {
          display: showAxes, // Show y-axis regardless of simplified flag
          beginAtZero: unitType !== 'percentage',
          grid: {
            display: showAxes, // Show gridlines regardless of simplified flag
            color: 'rgba(0, 0, 0, 0.05)'
          },
          border: {
            display: showAxes // Show border regardless of simplified flag
          },
          ticks: {
            display: showAxes, // Show ticks regardless of simplified flag
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            // Limit to exactly 3 ticks (including zero if beginAtZero is true)
            count: 4,
            maxTicksLimit: 4,
            callback: function(value) {
              if (unitType === 'currency') {
                return formatCurrency(value);
              } else if (unitType === 'percentage') {
                return formatPercentage(value);
              } else {
                return formatNumber(value);
              }
            }
          }
        }
      };
      
      // For area charts, modify the dataset
      if (fill && !sparkline) {
        chartData.datasets.forEach(dataset => {
          dataset.fill = true;
          dataset.backgroundColor = dataset.borderColor ? `${dataset.borderColor}15` : 'rgba(75, 192, 192, 0.2)';
        });
      }
      
      // Ensure sparklines never have fill and use simpler rendering
      if (sparkline) {
        // For sparklines, ensure data is always rendered with no fill
        chartData.datasets.forEach(dataset => {
          dataset.fill = false;
          dataset.borderWidth = 2;
          dataset.pointRadius = 0;
          dataset.pointHoverRadius = 0;
          dataset.tension = 0.3;
          
          // Use Stripe purple for the primary dataset unless explicitly set to another color
          if (!dataset.borderColor || dataset.borderColor === '#000') {
            dataset.borderColor = STRIPE_PURPLE;
          }
        });
        
        // Simplify options for sparklines
        options.responsive = true;
        options.maintainAspectRatio = false;
        options.animation = disableAnimation ? false : { duration: 400 };
        options.plugins.tooltip.enabled = false;
        options.plugins.legend.display = false;
        options.scales.x.display = false;
        options.scales.x.grid.display = false;
        options.scales.y.display = false;
        options.scales.y.grid.display = false;
        options.layout = { padding: 0 };
        options.interaction = { mode: null };
      }
      
      // Set all point radii to 0 by default, but allow them to show on hover
      chartData.datasets.forEach(dataset => {
        dataset.pointRadius = 0;
        dataset.pointHoverRadius = simplified ? 0 : 6;
      });
      
      // For sparklines (no axes or explicitly set sparkline), add additional optimizations
      if (!showAxes || sparkline) {
        options.padding = 0;
        options.layout = {
          padding: 0
        };
        options.plugins.tooltip.enabled = false;
        
        // For sparklines, still use the consistent styling but disable hover effects
        options.hover = {
          mode: null
        };
        
        // Completely hide all axes and gridlines for sparklines
        if (options.scales) {
          if (options.scales.x) {
            options.scales.x.display = false;
            options.scales.x.grid.display = false;
            options.scales.x.ticks.display = false;
          }
          
          if (options.scales.y) {
            options.scales.y.display = false;
            options.scales.y.grid.display = false;
            options.scales.y.ticks.display = false;
          }
        }
        
        // Maintain the 2px border width even for sparklines
        chartData.datasets.forEach(dataset => {
          dataset.pointRadius = 0;
          dataset.pointHoverRadius = 0;
          dataset.borderWidth = 2; // Keep the 2px width for sparklines too
          
          // For trending sparklines, always use the Stripe purple
          if ((showAxes === false || sparkline) && dataset.borderColor !== '#aab7c4') {
            dataset.borderColor = '#635bff'; // Ensure all primary sparklines use the Stripe purple
          }
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
            },
            maxRotation: 0, // Always horizontal labels
            minRotation: 0,
            autoSkip: true, // Always enable auto-skipping for better readability
            autoSkipPadding: 10, // Add padding between labels to prevent overlap
            callback: filterLabels // Use our custom function to return actual labels
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
            // Limit to exactly 3 ticks (including zero if beginAtZero is true)
            count: 4,
            maxTicksLimit: 4,
            callback: function(value) {
              if (unitType === 'currency') {
                return formatCurrency(value);
              } else if (unitType === 'percentage') {
                return formatPercentage(value);
              } else {
                return formatNumber(value);
              }
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
    
    // Register custom plugins
    if (customPlugins && customPlugins.length > 0) {
      customPlugins.forEach(plugin => {
        if (plugin && plugin.id) {
          // Check if plugin is already registered - Chart.plugins.getAll() is no longer available
          // in newer Chart.js versions, so we'll simply register the plugin
          Chart.register(plugin);
        }
      });
    }

    // Create chart instance
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: options,
      plugins: customPlugins
    });
    
    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, showLegend, showAxes, type, unitType, reducedLabels, useMarkers, sparkline, simplified, disableAnimation, customPlugins]);

  return (
    <ChartContainer style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </ChartContainer>
  );
}, (prevProps, nextProps) => {
  // Implement custom comparison for memoization
  // Only re-render if essential props changed
  const dataChanged = JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data);
  const pluginsChanged = JSON.stringify(prevProps.customPlugins) !== JSON.stringify(nextProps.customPlugins);
  
  return (
    !dataChanged &&
    prevProps.height === nextProps.height &&
    prevProps.showLegend === nextProps.showLegend &&
    prevProps.showAxes === nextProps.showAxes &&
    prevProps.type === nextProps.type &&
    prevProps.unit === nextProps.unit &&
    prevProps.reducedLabels === nextProps.reducedLabels &&
    prevProps.useMarkers === nextProps.useMarkers &&
    prevProps.sparkline === nextProps.sparkline &&
    prevProps.simplified === nextProps.simplified &&
    prevProps.disableAnimation === nextProps.disableAnimation &&
    !pluginsChanged
  );
}));

export default LineChart; 