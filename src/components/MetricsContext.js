import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { standardizedMetrics, getMetricData, PERIODS } from '../data/companyData';

// Create the context
const MetricsContext = createContext();

// Define the Overage revenue values for different plans
const OVERAGE_REVENUE_VALUES = {
  all: 152593.95,
  developer: 48125.34,
  standard: 152593.95,
  premium: 152593.95
};

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
      // Apply the default plan values (all) to the metrics
      const updatedMetrics = updateMetricsWithPlanValues(standardizedMetrics, 'all');
      setMetrics(updatedMetrics);
      setLoading(false);
    }, 300);
  }, []);

  // Helper function to update metrics with plan-specific values
  const updateMetricsWithPlanValues = useCallback((metricsData, plan) => {
    const overageValue = OVERAGE_REVENUE_VALUES[plan] || OVERAGE_REVENUE_VALUES.all;

    // Create a new object to avoid mutating the original
    const updatedMetrics = { ...metricsData };

    // Update all overage revenue related metrics
    const overageMetricIds = ['overage-revenue', 'usage-overage-revenue'];
    
    overageMetricIds.forEach(id => {
      if (updatedMetrics[id]) {
        updatedMetrics[id] = {
          ...updatedMetrics[id],
          baseCurrencyValue: overageValue,
        };
      }
    });

    return updatedMetrics;
  }, []);

  // Update metrics when plan filter changes
  useEffect(() => {
    // Get updated metrics with the new plan values
    const updatedMetrics = updateMetricsWithPlanValues(standardizedMetrics, currentPlan);
    setMetrics(updatedMetrics);
    
    // Update global standardizedMetrics to ensure consistency across components
    Object.keys(updatedMetrics).forEach(key => {
      standardizedMetrics[key] = updatedMetrics[key];
    });
  }, [currentPlan, updateMetricsWithPlanValues]);

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