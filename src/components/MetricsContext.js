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
  const [currentPlan, setCurrentPlan] = useState('all');

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

  // Update metrics when plan filter changes
  useEffect(() => {
    if (currentPlan === 'all') {
      // For "All plans", use the default metrics with higher value
      const updatedMetrics = {
        ...standardizedMetrics,
        'overage-revenue': {
          ...standardizedMetrics['overage-revenue'],
          baseCurrencyValue: 152593.95,
        },
        'usage-overage-revenue': {
          ...standardizedMetrics['usage-overage-revenue'],
          baseCurrencyValue: 152593.95,
        }
      };
      setMetrics(updatedMetrics);
    } else if (currentPlan === 'developer') {
      // For "Developer" plan, use lower value
      const updatedMetrics = {
        ...standardizedMetrics,
        'overage-revenue': {
          ...standardizedMetrics['overage-revenue'],
          baseCurrencyValue: 48125.34,
        },
        'usage-overage-revenue': {
          ...standardizedMetrics['usage-overage-revenue'],
          baseCurrencyValue: 48125.34,
        }
      };
      setMetrics(updatedMetrics);
    }
  }, [currentPlan]);

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

  // Set plan filter
  const setPlan = useCallback((plan) => {
    setCurrentPlan(plan);
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
        currentPlan,
        getMetricById,
        getAllMetrics,
        getMetricChartData,
        setPeriod,
        setInterval,
        toggleComparison,
        setPlan
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