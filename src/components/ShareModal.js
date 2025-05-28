import React, { useState } from 'react';
import styled from 'styled-components';

const ShareOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ShareModalContainer = styled.div`
  background-color: white;
  width: 90%;
  max-width: 500px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: var(--text-color);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  background-color: white;
`;

const Section = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: var(--text-secondary);
`;

const InviteSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: white;
  color: var(--text-color);
  font-size: 14px;
  font-family: inherit;
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 114, 229, 0.1);
  }
`;

const InviteButton = styled.button`
  padding: 12px 20px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  
  &:hover {
    background-color: #f7f9fc;
    border-color: #d7dfe8;
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 114, 229, 0.1);
  }
`;

const AccessRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const AccessLabel = styled.div`
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
`;

const AccessValue = styled.div`
  font-size: 16px;
  color: var(--text-secondary);
`;

const PermissionDropdown = styled.select`
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 114, 229, 0.1);
  }
  
  &:hover {
    border-color: #d7dfe8;
  }
  
  option {
    background-color: white;
    color: var(--text-color);
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background-color: white;
`;

const CopyLinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  
  &:hover {
    background-color: #f7f9fc;
    border-color: #d7dfe8;
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 114, 229, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CreateShareButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  
  &:hover {
    background-color: #5a51e5;
    border-color: #5a51e5;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 114, 229, 0.1);
  }
`;

const ShareModal = ({ isOpen, onClose, title = "Report" }) => {
  const [emailInput, setEmailInput] = useState('');
  const [everyonePermission, setEveryonePermission] = useState('view');

  const handleInvite = () => {
    if (emailInput.trim()) {
      // Handle invite logic here
      console.log('Inviting:', emailInput);
      setEmailInput('');
    }
  };

  const handleCopyLink = () => {
    // Handle copy link logic here
    navigator.clipboard.writeText(window.location.href);
    console.log('Link copied');
  };

  const handleCreateAndShare = () => {
    // Handle create and share logic here
    console.log('Creating and sharing');
    onClose();
  };

  return (
    <ShareOverlay isOpen={isOpen} onClick={onClose}>
      <ShareModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Choose sharing settings</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <Section>
            <SectionTitle>Invite to edit</SectionTitle>
            <InviteSection>
              <EmailInput
                type="email"
                placeholder="Add emails separated by commas"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
              />
              <InviteButton onClick={handleInvite}>
                Invite
              </InviteButton>
            </InviteSection>
          </Section>
          
          <Section>
            <SectionTitle>Who has access</SectionTitle>
            <AccessRow>
              <AccessLabel>You</AccessLabel>
              <AccessValue>Owner</AccessValue>
            </AccessRow>
            <AccessRow>
              <AccessLabel>Everyone else</AccessLabel>
              <PermissionDropdown 
                value={everyonePermission} 
                onChange={(e) => setEveryonePermission(e.target.value)}
              >
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
                <option value="none">No access</option>
              </PermissionDropdown>
            </AccessRow>
          </Section>
        </ModalContent>
        
        <ModalFooter>
          <CopyLinkButton onClick={handleCopyLink}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copy link
          </CopyLinkButton>
          <CreateShareButton onClick={handleCreateAndShare}>
            Create and share
          </CreateShareButton>
        </ModalFooter>
      </ShareModalContainer>
    </ShareOverlay>
  );
};

export default ShareModal; 