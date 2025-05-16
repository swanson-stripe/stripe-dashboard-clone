import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 64px;
  background-color: white;
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 100;
`;

const Logo = styled.div`
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImg = styled.img`
  height: 32px;
  width: 32px;
  border-radius: 8px;
`;

const NavigationSection = styled.div`
  padding: 12px 0;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  margin: 2px 0;
  border-radius: 6px;
  position: relative;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    
    &::before {
      content: attr(data-tooltip);
      position: absolute;
      left: 54px;
      padding: 6px 10px;
      background-color: rgba(51, 51, 51, 0.9);
      color: white;
      font-size: 12px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    &::after {
      display: none;
    }
  }
  
  &.active {
    color: var(--primary-color);
    background-color: rgba(99, 91, 255, 0.08);
  }
`;

const NavItemWithSubmenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  margin: 2px 0;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    
    .submenu {
      display: block;
    }
  }
  
  &.active {
    color: var(--primary-color);
    background-color: rgba(99, 91, 255, 0.08);
  }
`;

const Submenu = styled.div`
  position: absolute;
  left: 54px;
  top: -16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  padding: 12px 0;
  z-index: 1500;
  display: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 24px;
    left: -6px;
    width: 12px;
    height: 12px;
    background-color: white;
    transform: rotate(45deg);
    box-shadow: -3px 3px 5px rgba(0, 0, 0, 0.05);
  }
`;

const SubmenuTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 8px 16px;
  margin-bottom: 4px;
`;

const SubmenuItem = styled(Link)`
  display: block;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  width: 2px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 0 2px 2px 0;
  transition: transform 0.2s ease;
`;

const Sidebar = () => {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  
  return (
    <SidebarContainer>
      <Logo>
        <LogoImg src="/cactus-icon.svg" alt="Stripe Dashboard" />
      </Logo>
      
      <NavigationSection>
        <NavItem to="/" end data-tooltip="Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V9.3C21 8.9 20.9 8.6 20.7 8.3L12.7 2.2C12.3 1.9 11.7 1.9 11.3 2.2L3.3 8.3C3.1 8.6 3 8.9 3 9.3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/balances" data-tooltip="Balances">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/transactions" data-tooltip="Transactions">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 3.99994L21 7.99994L17 11.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11.9999L21 11.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 19.9999L3 15.9999L7 11.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15.9999L3 15.9999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/customers" data-tooltip="Customers">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 21C20 17.134 16.866 14 12 14C7.13401 14 4 17.134 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/products" data-tooltip="Product catalog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16.0001V8.00006C20.9996 7.6493 20.9071 7.30357 20.7315 7.00126C20.556 6.69895 20.3037 6.45066 20 6.30006L12 2.00006C11.696 1.84568 11.3511 1.76636 11 1.76636C10.6489 1.76636 10.304 1.84568 10 2.00006L2 6.30006C1.69626 6.45066 1.44398 6.69895 1.26846 7.00126C1.09294 7.30357 1.00036 7.6493 1 8.00006V16.0001C1.00036 16.3508 1.09294 16.6965 1.26846 16.9989C1.44398 17.3012 1.69626 17.5495 2 17.7001L10 22.0001C10.304 22.1544 10.6489 22.2338 11 22.2338C11.3511 22.2338 11.696 22.1544 12 22.0001L20 17.7001C20.3037 17.5495 20.556 17.3012 20.7315 16.9989C20.9071 16.6965 20.9996 16.3508 21 16.0001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
      </NavigationSection>
      
      <NavigationSection>
        <NavItem to="/connect" data-tooltip="Connect">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13C10 13.7956 9.68393 14.5587 9.12132 15.1213C8.55871 15.6839 7.79565 16 7 16C6.20435 16 5.44129 15.6839 4.87868 15.1213C4.31607 14.5587 4 13.7956 4 13C4 12.2044 4.31607 11.4413 4.87868 10.8787C5.44129 10.3161 6.20435 10 7 10C7.79565 10 8.55871 10.3161 9.12132 10.8787C9.68393 11.4413 10 12.2044 10 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 7C20 7.79565 19.6839 8.55871 19.1213 9.12132C18.5587 9.68393 17.7956 10 17 10C16.2044 10 15.4413 9.68393 14.8787 9.12132C14.3161 8.55871 14 7.79565 14 7C14 6.20435 14.3161 5.44129 14.8787 4.87868C15.4413 4.31607 16.2044 4 17 4C17.7956 4 18.5587 4.31607 19.1213 4.87868C19.6839 5.44129 20 6.20435 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 19C20 19.7956 19.6839 20.5587 19.1213 21.1213C18.5587 21.6839 17.7956 22 17 22C16.2044 22 15.4413 21.6839 14.8787 21.1213C14.3161 20.5587 14 19.7956 14 19C14 18.2044 14.3161 17.4413 14.8787 16.8787C15.4413 16.3161 16.2044 16 17 16C17.7956 16 18.5587 16.3161 19.1213 16.8787C19.6839 17.4413 20 18.2044 20 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.69995 11.45L14.3 8.55005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.69995 14.55L14.3 17.45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/payments" data-tooltip="Payments">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItemWithSubmenu 
          className={location.pathname.includes('/billing') ? 'active' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20V16H4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Submenu className="submenu">
            <SubmenuTitle>Billing</SubmenuTitle>
            <SubmenuItem to="/billing/overview">Overview</SubmenuItem>
            <SubmenuItem to="/billing/subscriptions">Subscriptions</SubmenuItem>
            <SubmenuItem to="/billing/invoices">Invoices</SubmenuItem>
            <SubmenuItem to="/billing/usage-based">Usage-based</SubmenuItem>
            <SubmenuItem to="/billing/revenue-recovery">Revenue recovery</SubmenuItem>
          </Submenu>
        </NavItemWithSubmenu>
        
        <NavItem 
          to="/reporting" 
          data-tooltip="Reporting" 
          className={location.pathname.includes('/metrics') ? 'active' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
        
        <NavItem to="/more" data-tooltip="More">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </NavItem>
      </NavigationSection>
      
      <div style={{ flexGrow: 1 }}></div>
      
      <NavigationSection>
        <NavItem to="/developers" data-tooltip="Developers">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9L3 14L8 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 9L21 14L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="9" y1="5" x2="15" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NavItem>
      </NavigationSection>
    </SidebarContainer>
  );
};

export default Sidebar; 