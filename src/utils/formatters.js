// Enhanced formatting utilities for data visualization

/**
 * Format numbers with abbreviations (k, m, b) for large values
 * and preserve small values without rounding to 0
 */
export const formatNumberWithAbbreviation = (num, options = {}) => {
  if (num === null || num === undefined || isNaN(num)) return '-';
  
  const {
    isCurrency = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    preserveSmallValues = true
  } = options;
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  const currencySymbol = isCurrency ? '$' : '';
  
  // For very small values (less than 0.01), preserve the full precision
  if (preserveSmallValues && absNum > 0 && absNum < 0.01) {
    if (isCurrency) {
      // For currency, show up to 4 decimal places for small amounts
      return `${sign}${currencySymbol}${absNum.toFixed(4)}`;
    } else {
      // For non-currency, show up to 6 decimal places
      return `${sign}${absNum.toFixed(6)}`;
    }
  }
  
  // For values >= 1000, use abbreviations
  if (absNum >= 1000000000) {
    const value = (absNum / 1000000000).toFixed(2);
    return `${sign}${currencySymbol}${value}b`;
  } else if (absNum >= 1000000) {
    const value = (absNum / 1000000).toFixed(2);
    return `${sign}${currencySymbol}${value}m`;
  } else if (absNum >= 1000) {
    const value = (absNum / 1000).toFixed(1);
    return `${sign}${currencySymbol}${value}k`;
  }
  
  // For values < 1000, use standard formatting
  return `${sign}${currencySymbol}${absNum.toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  })}`;
};

/**
 * Format currency values with proper abbreviations and small value handling
 */
export const formatCurrency = (value, options = {}) => {
  return formatNumberWithAbbreviation(value, {
    ...options,
    isCurrency: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format median values with abbreviations for display in summaries
 */
export const formatMedianValue = (value, column) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  if (column.isCurrency) {
    return `median ${formatCurrency(value)}`;
  } else if (column.isTrend) {
    return `median ${value.toFixed(1)}%`;
  } else if (column.isNumber || column.dataType === 'number') {
    return `median ${formatNumberWithAbbreviation(value)}`;
  }
  
  return `median ${value}`;
};

/**
 * Enhanced formatValue function that handles unit type matching and abbreviations
 */
export const formatValue = (value, column) => {
  if (value === null || value === undefined) return value;
  
  if (column.isCurrency) {
    return formatCurrency(value);
  }
  
  if (column.dataType === 'number' && typeof value === 'number') {
    return formatNumberWithAbbreviation(value);
  }
  
  return value;
};

/**
 * Enhanced formatChartValue function for tooltips and chart displays
 */
export const formatChartValue = (value, column) => {
  if (value === null || value === undefined) return String(value);
  
  if (column.isCurrency) {
    return formatCurrency(value);
  }
  
  if (column.isTrend) {
    return typeof value === 'number' ? `${value.toFixed(1)}%` : String(value);
  }
  
  if (column.isNumber || column.dataType === 'number') {
    return formatNumberWithAbbreviation(value);
  }
  
  return String(value);
};

/**
 * Enhanced formatCellValue function for table cells
 */
export const formatCellValue = (value, column) => {
  if (value === undefined || value === null) return '-';
  
  if (column.isCurrency) {
    return formatCurrency(value);
  }
  
  if (column.isTrend) {
    const isNegative = value < 0;
    const displayClass = column.isPositive ? !isNegative : isNegative;
    // Return object for React component rendering
    return {
      type: 'trend',
      value: `${value > 0 ? '+' : ''}${value}%`,
      negative: displayClass
    };
  }
  
  if (column.isNumber || column.dataType === 'number') {
    return formatNumberWithAbbreviation(value);
  }
  
  return value;
};

/**
 * Check if values have matching unit types for tooltip display
 */
export const hasMatchingUnitTypes = (values, columns) => {
  if (!values || !columns || values.length !== columns.length) return false;
  
  // Get the unit types of all values
  const unitTypes = columns.map(column => {
    if (column.isCurrency) return 'currency';
    if (column.isTrend) return 'percentage';
    if (column.isNumber || column.dataType === 'number') return 'number';
    return 'other';
  });
  
  // Check if all unit types are the same
  const firstType = unitTypes[0];
  return unitTypes.every(type => type === firstType);
};
