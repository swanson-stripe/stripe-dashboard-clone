import React, { createContext, useState, useContext } from 'react';
import styled from 'styled-components';

// Constants for styling
const STRIPE_PURPLE = '#635bff';
const TREND_POSITIVE = '#217005';
const GRAY = '#9ca3af';

const TooltipContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  background-color: white;
  color: #333;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  transform: translate(-50%, -100%);
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: 1px solid #e3e8ee;
  font-weight: 500;
  
  &.visible {
    opacity: 1;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: white transparent transparent transparent;
  }
  
  strong {
    color: ${STRIPE_PURPLE};
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }
  
  .current-value {
    color: ${TREND_POSITIVE};
    font-weight: 500;
  }
  
  .previous-value {
    color: ${GRAY};
    margin-top: 2px;
  }
`;

// Create a context to manage the tooltip state globally
const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: '',
    metricId: ''
  });

  const showTooltip = (x, y, content, metricId = '') => {
    setTooltipState({
      visible: true,
      x,
      y,
      content,
      metricId
    });
  };

  const hideTooltip = () => {
    setTooltipState({
      visible: false,
      x: 0,
      y: 0,
      content: '',
      metricId: ''
    });
  };

  return (
    <TooltipContext.Provider value={{ tooltipState, showTooltip, hideTooltip }}>
      {children}
      {tooltipState.visible && (
        <TooltipContainer
          className={tooltipState.visible ? 'visible' : ''}
          style={{
            left: `${tooltipState.x}px`,
            top: `${tooltipState.y}px`,
          }}
          dangerouslySetInnerHTML={{ __html: tooltipState.content }}
        />
      )}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}; 