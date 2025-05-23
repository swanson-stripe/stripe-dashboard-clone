import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

// Create the context
const MetricsContext = createContext();

export const MetricsProvider = ({ children }) => {
  const [metrics, setMetrics] = useState(standardizedMetrics);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(PERIODS.MONTHLY);
  const [currentInterval, setCurrentInterval] = useState('month');
  const [showComparison, setShowComparison] = useState(true);

  // Initialize metrics data
  useEffect(() => {
    // This simulates loading the metrics data
    setLoading(true);
    
    // Create a copy of standardizedMetrics with consistent values
    setTimeout(() => {
      setMetrics(standardizedMetrics);
      setLoading(false);
    }, 300);
  }, []);

  // Get metric by ID
  const getMetricById = useCallback((metricId) => {
    return metrics[metricId];
  }, [metrics]);

  // Get all metrics
  const getAllMetrics = useCallback(() => {
    return metrics;
  }, [metrics]);

  // Get metric data for charting
  const getMetricChartData = useCallback((metricId, period = currentPeriod, interval = currentInterval, includeComparison = showComparison) => {
    return getMetricData(metricId, period, interval, includeComparison);
  }, [currentPeriod, currentInterval, showComparison]);

  // Set time period for metrics
  const setPeriod = useCallback((period) => {
    setCurrentPeriod(period);
  }, []);

  // Set interval for metrics
  const setInterval = useCallback((interval) => {
    setCurrentInterval(interval);
  }, []);

  // Toggle comparison data
  const toggleComparison = useCallback((show) => {
    setShowComparison(show);
  }, []);

  // Return the context provider with our values
  return (
    <MetricsContext.Provider 
      value={{ 
        metrics,
        loading,
        currentPeriod,
        currentInterval,
        showComparison,
        getMetricById,
        getAllMetrics,
        getMetricChartData,
        setPeriod,
        setInterval,
        toggleComparison
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use the metrics context
export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}; 