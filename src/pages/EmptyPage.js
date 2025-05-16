import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  font-family: -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 28px;
  font-synthesis-weight: none;
  font-weight: 700;
  height: 36px;
  line-height: 36px;
  margin-bottom: 16px;
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 24px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 48px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  color: var(--text-secondary);
  opacity: 0.5;
`;

const EmptyPage = ({ title, subtitle }) => {
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>{title}</Title>
      <Message>{subtitle || "This page is still under development."}</Message>
      
      <EmptyState>
        <EmptyIcon>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </EmptyIcon>
        <h3>Coming Soon</h3>
        <p>The {title.toLowerCase()} feature will be available in a future update.</p>
      </EmptyState>
    </Container>
  );
};

export default EmptyPage; 