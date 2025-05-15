import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: var(--sidebar-width);
  background-color: white;
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: fixed;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
`;

const LogoImg = styled.img`
  height: 32px;
`;

const NavigationSection = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h6`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 24px;
  margin-bottom: 8px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 10px 24px;
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: none;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &.active {
    color: var(--primary-color);
    background-color: #f7f9fc;
    font-weight: 500;
  }
  
  svg {
    margin-right: 12px;
    width: 20px;
    height: 20px;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo>
        <LogoImg src="/logo.svg" alt="Stripe" />
      </Logo>
      
      <NavigationSection>
        <SectionTitle>Main Menu</SectionTitle>
        <NavItem to="/" end>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </NavItem>
        <NavItem to="/balances">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Balances
        </NavItem>
        <NavItem to="/transactions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Transactions
        </NavItem>
        <NavItem to="/customers">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Customers
        </NavItem>
        <NavItem to="/products">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3H3C2.46957 3 1.96086 3.21071 1.58579 3.58579C1.21071 3.96086 1 4.46957 1 5V19C1 19.5304 1.21071 20.0391 1.58579 20.4142C1.96086 20.7893 2.46957 21 3 21H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3H19C18.4696 3 17.9609 3.21071 17.5858 3.58579C17.2107 3.96086 17 4.46957 17 5V19C17 19.5304 17.2107 20.0391 17.5858 20.4142C17.9609 20.7893 18.4696 21 19 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Products
        </NavItem>
      </NavigationSection>
      
      <NavigationSection>
        <SectionTitle>Shortcuts</SectionTitle>
        <NavItem to="/sigma">Sigma</NavItem>
        <NavItem to="/billing-overview">Billing Overview</NavItem>
        <NavItem to="/meters">Meters</NavItem>
        <NavItem to="/subscriptions">Subscriptions</NavItem>
        <NavItem to="/reports">Reports</NavItem>
      </NavigationSection>
      
      <NavigationSection>
        <SectionTitle>Products</SectionTitle>
        <NavItem to="/connect">Connect</NavItem>
        <NavItem to="/payments">Payments</NavItem>
        <NavItem to="/billing-product">Billing</NavItem>
        <NavItem to="/reporting">Reporting</NavItem>
        <NavItem to="/more">More Products</NavItem>
      </NavigationSection>
      
      <div style={{ flexGrow: 1 }}></div>
      
      <NavigationSection>
        <NavItem to="/developers">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9L3 14L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 9L21 14L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="5" x2="15" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Developers
        </NavItem>
      </NavigationSection>
    </SidebarContainer>
  );
};

export default Sidebar; 