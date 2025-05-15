import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, height, showLegend = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1a1f36',
        bodyColor: '#1a1f36',
        borderColor: '#e3e8ee',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        boxPadding: 6,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            
            if (label) {
                label += ': ';
            }
            if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#697386',
          font: {
            size: 12,
          },
        }
      },
      y: {
        grid: {
          color: '#f0f2f5',
        },
        ticks: {
          color: '#697386',
          font: {
            size: 12,
          },
          padding: 10,
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        hitRadius: 30,
        backgroundColor: 'white',
        borderWidth: 2,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return <Line data={data} options={options} height={height} />;
};

export default LineChart; 