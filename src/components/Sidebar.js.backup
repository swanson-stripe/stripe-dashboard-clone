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
  color: #697386; /* Medium gray */
  margin: 2px 0;
  border-radius: 6px;
  position: relative;
  
  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
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
    color: #635bff; /* Purple */
    background-color: rgba(99, 91, 255, 0.08);
  }
`;

const NavItemWithSubmenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #697386; /* Medium gray */
  margin: 2px 0;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  
  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    
    .submenu {
      display: block;
    }
  }
  
  &.active {
    color: #635bff; /* Purple */
    background-color: rgba(99, 91, 255, 0.08);
  }
`;

const SubmenuHoverArea = styled.div`
  position: absolute;
  left: 40px;
  top: -16px;
  height: 72px;
  width: 24px;
  z-index: 1499;
`;

const Submenu = styled.div`
  position: absolute;
  left: 54px;
  top: -16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-width: 180px;
  padding: 12px 0;
  z-index: 1500;
  display: none;
  border: 1px solid #e6e8eb;
  
  &:hover {
    display: block;
  }
  
  &::before {
    display: none;
  }
`;

const SubmenuTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #697386; /* Medium gray */
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
    text-decoration: none;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  width: 2px;
  height: 24px;
  background-color: #635bff; /* Purple */
  border-radius: 0 2px 2px 0;
  transition: transform 0.2s ease;
`;

const Sidebar = () => {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  
  // Check if a specific section is active based on the current path
  const isReportingActive = location.pathname.includes('/reporting') || 
                           location.pathname.includes('/metrics') || 
                           location.pathname.includes('/reports') || 
                           location.pathname.includes('/explorer');
  
  const isBillingActive = location.pathname.includes('/billing');
  
  // Add checks for Connect and Payments paths
  const isConnectActive = location.pathname.includes('/connect');
  const isPaymentsActive = location.pathname.includes('/payments');
  
  return (
    <SidebarContainer>
      <Logo>
        <LogoImg src={`${process.env.PUBLIC_URL}/cactus-icon.svg`} alt="Stripe Dashboard" />
      </Logo>
      
      <NavigationSection>
        <NavItem to="/" end data-tooltip="Home">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3 16a2.5 2.5 0 0 1-2.5-2.5V5.548a2 2 0 0 1 .862-1.644L6.486.356A2 2 0 0 1 7.625 0h.75a2 2 0 0 1 1.139.356l5.124 3.548a2 2 0 0 1 .862 1.644V13.5A2.5 2.5 0 0 1 13 16H3Zm2-1.5H3a1 1 0 0 1-1-1V5.548a.5.5 0 0 1 .215-.411L7.34 1.589a.5.5 0 0 1 .285-.089h.75a.5.5 0 0 1 .285.089l5.125 3.548a.5.5 0 0 1 .215.41V13.5a1 1 0 0 1-1 1h-2V8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6.5Zm1.5 0h3v-6h-3v6Z"></path>
          </svg>
        </NavItem>
        
        <NavItem to="/balances" data-tooltip="Balances">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M1 2a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 1 2Zm0 8a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5A.75.75 0 0 1 1 10Zm2.25-4.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5ZM2.5 14a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4A.75.75 0 0 1 2.5 14Z"></path>
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
          </svg>
        </NavItem>
        
        <NavItem to="/transactions" data-tooltip="Transactions">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M9.714 6.693a.75.75 0 1 0 1.106 1.014l2.933-3.2a.75.75 0 0 0 0-1.013L10.82.294a.75.75 0 1 0-1.106 1.013l1.781 1.943H4.6A3.75 3.75 0 0 0 .85 7v.067a.75.75 0 1 0 1.5 0V7A2.25 2.25 0 0 1 4.6 4.75h6.895l-1.78 1.943ZM6.286 9.307A.75.75 0 0 0 5.18 8.293l-2.932 3.2a.75.75 0 0 0 0 1.014l2.932 3.2a.75.75 0 1 0 1.106-1.014l-1.78-1.942H11.4A3.75 3.75 0 0 0 15.15 9v-.067a.75.75 0 0 0-1.5 0V9a2.25 2.25 0 0 1-2.25 2.25H4.505l1.78-1.944Z"></path>
          </svg>
        </NavItem>
        
        <NavItem to="/customers" data-tooltip="Customers">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M2.5 14.4h11a.4.4 0 0 0 .4-.4 3.4 3.4 0 0 0-3.4-3.4h-5A3.4 3.4 0 0 0 2.1 14c0 .22.18.4.4.4Zm0 1.6h11a2 2 0 0 0 2-2 5 5 0 0 0-5-5h-5a5 5 0 0 0-5 5 2 2 0 0 0 2 2ZM8 6.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
          </svg>
        </NavItem>
        
        <NavItem to="/products" data-tooltip="Product catalog">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.973 0a2 2 0 0 0-.894.211L1.607 2.947A2 2 0 0 0 .5 4.737v6.568a2 2 0 0 0 1.052 1.761l4.782 2.575A3 3 0 0 0 7.757 16h.488a3 3 0 0 0 1.422-.359l4.781-2.575a2 2 0 0 0 1.052-1.76v-6.57a2 2 0 0 0-1.105-1.789L8.922.211A2 2 0 0 0 8.03 0h-.056ZM14 11.306V5.62L8.75 8.448v5.964c.07-.025.14-.056.206-.091l4.781-2.575a.5.5 0 0 0 .263-.44ZM8.252 1.553l5.257 2.629-2.06 1.109-5.38-2.898 1.68-.84a.5.5 0 0 1 .224-.053h.056a.5.5 0 0 1 .223.053ZM4.756 3.05 2.491 4.182 8 7.148l2.184-1.176L4.756 3.05ZM7.25 8.448 2 5.622v5.683a.5.5 0 0 0 .263.44l4.782 2.576c.066.035.134.066.204.09V8.449Z"></path>
          </svg>
        </NavItem>
      </NavigationSection>
      
      <NavigationSection>
        <NavItemWithSubmenu
          className={isConnectActive ? 'active' : ''}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M0 6c0-.31.163-.598.429-.757L7.07 1.257a1.805 1.805 0 0 1 1.858 0l6.642 3.986a.883.883 0 0 1 0 1.514l-6.64 3.986a1.805 1.805 0 0 1-1.858 0L.43 6.757A.883.883 0 0 1 0 6Zm7.894 3.37L2.277 6l5.617-3.37a.205.205 0 0 1 .212 0L13.723 6 8.107 9.37a.205.205 0 0 1-.212 0Z"></path>
            <path fill="currentColor" d="M1.434 9.828a.8.8 0 0 0-.868 1.344l6.128 3.96a2.3 2.3 0 0 0 1.248.368h.116a2.3 2.3 0 0 0 1.248-.368l6.128-3.96a.8.8 0 1 0-.868-1.344l-6.129 3.96a.7.7 0 0 1-.38.112h-.115a.7.7 0 0 1-.38-.112l-6.128-3.96Z"></path>
          </svg>
          <SubmenuHoverArea />
          <Submenu className="submenu">
            <SubmenuTitle>Connect</SubmenuTitle>
            <SubmenuItem to="/connect/overview">Overview</SubmenuItem>
            <SubmenuItem to="/connect/connected-accounts">Connected accounts</SubmenuItem>
            <SubmenuItem to="/connect/treasury">Treasury</SubmenuItem>
            <SubmenuItem to="/connect/capital">Capital</SubmenuItem>
            <SubmenuItem to="/connect/support-cases">Support cases</SubmenuItem>
            <SubmenuItem to="/connect/embedded-apps">Embedded apps</SubmenuItem>
          </Submenu>
        </NavItemWithSubmenu>
        
        <NavItemWithSubmenu
          className={isPaymentsActive ? 'active' : ''}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M0 3.884c0-.8.545-1.476 1.306-1.68l.018-.004L10.552.213c.15-.038.3-.055.448-.055.927.006 1.75.733 1.75 1.74V4.5h.75A2.5 2.5 0 0 1 16 7v6.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 13.5V3.884ZM10.913 1.67c.199-.052.337.09.337.23v2.6H2.5c-.356 0-.694.074-1 .208v-.824c0-.092.059-.189.181-.227l9.216-1.984.016-.004ZM1.5 7v6.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-11a1 1 0 0 0-1 1Z"></path>
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M10.897 1.673 1.681 3.657c-.122.038-.181.135-.181.227v.824a2.492 2.492 0 0 1 1-.208h8.75V1.898c0-.14-.138-.281-.337-.23m0 0-.016.005Zm-9.59.532 9.23-1.987c.15-.038.3-.055.448-.055.927.006 1.75.733 1.75 1.74V4.5h.75A2.5 2.5 0 0 1 16 7v6.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 13.5V3.884c0-.8.545-1.476 1.306-1.68l.018-.004ZM1.5 13.5V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1ZM13 10.25c0 .688-.563 1.25-1.25 1.25-.688 0-1.25-.55-1.25-1.25 0-.688.563-1.25 1.25-1.25.688 0 1.25.562 1.25 1.25Z"></path>
          </svg>
          <SubmenuHoverArea />
          <Submenu className="submenu">
            <SubmenuTitle>Payments</SubmenuTitle>
            <SubmenuItem to="/payments">Payments</SubmenuItem>
            <SubmenuItem to="/payments/analytics">Analytics</SubmenuItem>
            <SubmenuItem to="/payments/orchestration">Orchestration</SubmenuItem>
            <SubmenuItem to="/payments/disputes">Disputes</SubmenuItem>
            <SubmenuItem to="/payments/radar">Radar</SubmenuItem>
            <SubmenuItem to="/payments/payment-links">Payment Links</SubmenuItem>
            <SubmenuItem to="/payments/terminal">Terminal</SubmenuItem>
          </Submenu>
        </NavItemWithSubmenu>
        
        <NavItemWithSubmenu 
          className={isBillingActive ? 'active' : ''}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0 2.25A2.25 2.25 0 0 1 2.25 0h7.5A2.25 2.25 0 0 1 12 2.25v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0-.75.75v10.851a.192.192 0 0 0 .277.172l.888-.444a.75.75 0 1 1 .67 1.342l-.887.443A1.69 1.69 0 0 1 0 13.101V2.25Z"></path>
            <path fill="currentColor" d="M5 10.7a.7.7 0 0 1 .7-.7h4.6a.7.7 0 1 1 0 1.4H7.36l.136.237c.098.17.193.336.284.491.283.483.554.907.855 1.263.572.675 1.249 1.109 2.365 1.109 1.18 0 2.038-.423 2.604-1.039.576-.626.896-1.5.896-2.461 0-.99-.42-1.567-.807-1.998a.75.75 0 1 1 1.115-1.004C15.319 8.568 16 9.49 16 11c0 1.288-.43 2.54-1.292 3.476C13.838 15.423 12.57 16 11 16c-1.634 0-2.706-.691-3.51-1.64-.386-.457-.71-.971-1.004-1.472L6.4 12.74v2.56a.7.7 0 1 1-1.4 0v-4.6ZM2.95 4.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75ZM3.7 6.5a.75.75 0 0 0 0 1.5h4.6a.75.75 0 0 0 0-1.5H3.7Z"></path>
          </svg>
          <SubmenuHoverArea />
          <Submenu className="submenu">
            <SubmenuTitle>Billing</SubmenuTitle>
            <SubmenuItem to="/billing/overview">Overview</SubmenuItem>
            <SubmenuItem to="/billing/subscriptions">Subscriptions</SubmenuItem>
            <SubmenuItem to="/billing/invoices">Invoices</SubmenuItem>
            <SubmenuItem to="/billing/usage-based">Usage</SubmenuItem>
            <SubmenuItem to="/billing/revenue-recovery">Revenue recovery</SubmenuItem>
          </Submenu>
        </NavItemWithSubmenu>
        
        <NavItemWithSubmenu 
          className={isReportingActive ? 'active' : ''}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M14 1.875a.875.875 0 0 0-1.75 0v8.75a.875.875 0 0 0 1.75 0v-8.75Z"></path>
            <path fill="currentColor" d="M2.6 1.875a.8.8 0 1 0-1.6 0V13.2A1.8 1.8 0 0 0 2.8 15h11.827a.8.8 0 0 0 0-1.6H2.8a.2.2 0 0 1-.2-.2V1.875Z"></path>
            <path fill="currentColor" d="M9.125 3.5c.483 0 .875.392.875.875v6.25a.875.875 0 0 1-1.75 0v-6.25c0-.483.392-.875.875-.875ZM6 6.875a.875.875 0 1 0-1.75 0v3.75a.875.875 0 0 0 1.75 0v-3.75Z"></path>
          </svg>
          <SubmenuHoverArea />
          <Submenu className="submenu">
            <SubmenuTitle>Reporting</SubmenuTitle>
            <SubmenuItem to="/reports">Reports</SubmenuItem>
            <SubmenuItem to="/metrics">Metrics</SubmenuItem>
            <SubmenuItem to="/explorer">Explorer</SubmenuItem>
          </Submenu>
        </NavItemWithSubmenu>
        
        <NavItem to="/more" data-tooltip="More">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
          </svg>
        </NavItem>
      </NavigationSection>
      
      <div style={{ flexGrow: 1 }}></div>
      
      <NavigationSection>
        <NavItem to="/developers" data-tooltip="Developers">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M13 2.5H3A1.5 1.5 0 0 0 1.5 4v8A1.5 1.5 0 0 0 3 13.5h10a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 13 2.5ZM3 1a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H3Z"></path>
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3.43 4.512a.75.75 0 0 1 1.058-.081l3.5 3a.75.75 0 0 1 0 1.138l-3.5 3a.75.75 0 1 1-.976-1.138L6.348 8 3.512 5.57a.75.75 0 0 1-.081-1.058ZM8 10.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"></path>
          </svg>
        </NavItem>
      </NavigationSection>
    </SidebarContainer>
  );
};

export default Sidebar; 