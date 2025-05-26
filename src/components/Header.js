import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 100;
  transition: all 0.2s ease;
  box-sizing: border-box;
`;

const SearchBar = styled.div`
  position: relative;
  width: 360px;
  max-width: 40%;
  margin-left: 40px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: none;
  border-radius: 6px;
  background-color: rgba(246, 248, 250, 0.8);
  font-size: 14px;
  
  &:focus {
    outline: none;
    background-color: rgba(246, 248, 250, 1);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
`;

const AccountSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 40px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #697386; /* Medium gray */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  position: relative;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    color: #1a1f36; /* Darker text on hover */
    
    &::before {
      content: attr(data-tooltip);
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
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
`;

const NotificationIcon = styled(IconButton)`
  position: relative;
`;

const NotificationIndicator = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background-color: #635bff;
  border-radius: 50%;
`;

const CreateButton = styled(IconButton)`
  background-color: #635bff;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  
  &:hover {
    background-color: #5a51e5;
    color: white;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <SearchBar>
        <SearchIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.7 16.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SearchIcon>
        <SearchInput type="text" placeholder="Search" />
      </SearchBar>
      
      <AccountSection>
        <IconButton data-tooltip="Help">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M6.886 4.923c-.232.25-.386.63-.386 1.122a.75.75 0 1 1-1.5 0c0-.803.254-1.57.788-2.144C6.33 3.32 7.1 3 8 3c.9 0 1.67.32 2.212.901.534.574.788 1.341.788 2.144 0 1.234-.869 1.922-1.436 2.332-.094.068-.178.127-.255.181-.19.134-.33.233-.449.343a.64.64 0 0 0-.11.121V9.5a.75.75 0 0 1-1.5 0V9c0-.563.326-.956.593-1.202.198-.183.457-.364.672-.516l.17-.121c.559-.404.815-.693.815-1.116 0-.492-.154-.872-.386-1.122C8.888 4.68 8.533 4.5 8 4.5c-.533 0-.888.18-1.114.423Z"></path>
            <path fill="currentColor" d="M9 12a1.001 1.001 0 0 1-2 0 1.001 1.001 0 0 1 2 0Z"></path>
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8 14.5A6.5 6.5 0 1 0 1.5 8c0 1.022.179 1.608.603 2.399.316.59.407 1.313.178 2.003l-.66 1.976 1.977-.659a2.541 2.541 0 0 1 2.004.178c.79.424 1.376.603 2.398.603ZM8 16a8 8 0 1 0-8-8c0 1.29.25 2.117.78 3.107.136.252.168.549.078.82l-.807 2.42a1 1 0 0 0-.051.315V15a1 1 0 0 0 1 1h.338a1 1 0 0 0 .316-.051l2.419-.807c.271-.09.568-.057.82.078.99.53 1.817.78 3.107.78Z"></path>
          </svg>
        </IconButton>
        
        <NotificationIcon data-tooltip="Notifications">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5.005 13H2.79a1.792 1.792 0 0 1-1.628-2.532l.477-1.051a11.583 11.583 0 0 0 1.01-4.018l.027-.41A5.34 5.34 0 0 1 8 0a5.34 5.34 0 0 1 5.324 4.989l.027.41a11.6 11.6 0 0 0 1.01 4.018l.477 1.05A1.787 1.787 0 0 1 13.21 13h-2.215c0 1.657-1.34 3-2.995 3a2.997 2.997 0 0 1-2.995-3Zm-2.48-1.912.478-1.05a13.086 13.086 0 0 0 1.14-4.539l.027-.41A3.84 3.84 0 0 1 8 1.5a3.84 3.84 0 0 1 3.83 3.589l.027.41c.104 1.57.49 3.107 1.14 4.538l.477 1.051a.291.291 0 0 1-.264.412H2.79a.291.291 0 0 1-.264-.412ZM6.504 13a1.499 1.499 0 1 0 2.995 0H6.503Z"></path>
          </svg>
          <NotificationIndicator />
        </NotificationIcon>
        
        <IconButton data-tooltip="Settings">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 1.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.41 14.5h1.18l.053-.832a1.753 1.753 0 0 1 1.08-1.509 1.752 1.752 0 0 1 1.83.303l.625.552.836-.835-.552-.626a1.752 1.752 0 0 1-.303-1.83 1.753 1.753 0 0 1 1.509-1.08l.832-.052V7.409l-.832-.052a1.753 1.753 0 0 1-1.509-1.08 1.752 1.752 0 0 1 .303-1.83l.552-.625-.836-.836-.625.552a1.752 1.752 0 0 1-1.83.303 1.753 1.753 0 0 1-1.08-1.509L8.59 1.5H7.409l-.052.832a1.753 1.753 0 0 1-1.08 1.509 1.752 1.752 0 0 1-1.83-.303l-.625-.552-.836.836.552.625a1.753 1.753 0 0 1-1.205 2.91L1.5 7.41v1.182l.832.052a1.753 1.753 0 0 1 1.509 1.08 1.752 1.752 0 0 1-.303 1.83l-.552.625.836.836.625-.552a1.752 1.752 0 0 1 1.83-.303 1.753 1.753 0 0 1 1.08 1.509l.052.832Zm-2.896-.122c.064-.04.125-.085.183-.136l.742-.655a.252.252 0 0 1 .264-.042.25.25 0 0 1 .157.216l.062.989a1.34 1.34 0 0 0 .07.35c.18.526.679.9 1.26.9h1.495a1.334 1.334 0 0 0 1.331-1.25l.062-.989a.253.253 0 0 1 .157-.216.252.252 0 0 1 .263.042l.743.655a1.338 1.338 0 0 0 .297.199c.5.244 1.117.156 1.528-.256l1.057-1.057a1.334 1.334 0 0 0 .057-1.825l-.655-.742a.252.252 0 0 1-.042-.264.253.253 0 0 1 .216-.157l.989-.062a1.341 1.341 0 0 0 .35-.07c.526-.18.9-.679.9-1.26V7.252a1.334 1.334 0 0 0-1.25-1.331l-.989-.062a.253.253 0 0 1-.216-.157.252.252 0 0 1 .042-.264l.655-.742a1.34 1.34 0 0 0 .199-.297c.244-.5.156-1.117-.256-1.528l-1.057-1.057a1.334 1.334 0 0 0-1.825-.057l-.742.655a.252.252 0 0 1-.264.042.253.253 0 0 1-.157-.216l-.062-.989a1.34 1.34 0 0 0-.07-.35A1.33 1.33 0 0 0 8.749 0H7.252a1.334 1.334 0 0 0-1.331 1.25l-.062.989a.253.253 0 0 1-.157.216.252.252 0 0 1-.264-.042l-.742-.655a1.34 1.34 0 0 0-.297-.199 1.334 1.334 0 0 0-1.528.256L1.815 2.872a1.334 1.334 0 0 0-.057 1.825l.655.743c.064.072.08.174.042.263a.253.253 0 0 1-.216.157l-.989.062a1.34 1.34 0 0 0-.35.07c-.526.18-.9.679-.9 1.26v1.495a1.334 1.334 0 0 0 1.25 1.331l.989.062c.096.006.18.068.216.157a.252.252 0 0 1-.042.264l-.655.742a1.344 1.344 0 0 0-.199.297c-.244.5-.156 1.117.256 1.528l1.057 1.057a1.334 1.334 0 0 0 1.642.193Z"></path>
          </svg>
        </IconButton>
        
        <CreateButton data-tooltip="Create">
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M6.85 1a.85.85 0 1 0-1.7 0v4.15H1a.85.85 0 0 0 0 1.7h4.15V11a.85.85 0 1 0 1.7 0V6.85H11a.85.85 0 1 0 0-1.7H6.85V1Z"></path>
          </svg>
        </CreateButton>
      </AccountSection>
    </HeaderContainer>
  );
};

export default Header; 