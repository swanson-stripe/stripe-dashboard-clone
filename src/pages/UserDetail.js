import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { faker } from '@faker-js/faker';
import AlertModal from '../components/AlertModal';

// Styled components
const Container = styled(motion.div)`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const UserDetailContainer = styled.div`
  width: 100%;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  /* Add separators between items */
  & > *:not(:last-child)::after {
    content: '/';
    margin-left: 8px;
    color: var(--text-secondary);
  }
`;

const BreadcrumbLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  
  &:hover {
    color: #111827;
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 8px;
  color: #d1d5db;
`;

const UserDetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const UserDetailTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.primary ? '#635bff' : 'white'};
  color: ${props => props.primary ? 'white' : '#111827'};
  border: 1px solid ${props => props.primary ? '#635bff' : '#e5e7eb'};
  
  &:hover {
    background-color: ${props => props.primary ? '#5147e5' : '#f9fafb'};
  }

  svg {
    stroke-width: 2px;
  }
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ContentLayout = styled.div`
  display: flex;
  gap: 24px;
`;

const MainColumn = styled.div`
  flex: 2;
`;

const SideColumn = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const Section = styled.div`
  margin-bottom: 24px;
  background-color: white;
  border-radius: 8px;
  padding: 24px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
  }
  
  th {
    color: #6b7280;
    font-weight: 500;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:not(thead tr) {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f9fafb;
    }
  }
  
  td {
    color: #111827;
  }
`;

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  
  &.active {
    background-color: #ecfdf5;
    color: #059669;
  }
  
  &.past_due {
    background-color: #fef3c7;
    color: #d97706;
  }
  
  &.canceled {
    background-color: #f3f4f6;
    color: #6b7280;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  svg {
    color: #6b7280;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const InsightCard = styled.div`
  margin-bottom: 16px;
`;

const InsightLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const InsightValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
`;

const DetailItem = styled.div`
  margin-bottom: 12px;
`;

const DetailLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  display: flex;
  align-items: center;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
`;

const EmptyData = styled.div`
  padding: 16px 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`;

const IconWrapper = styled.div`
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #635bff;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Formats a monetary value
const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

// User detail page component
const UserDetail = () => {
  const { userId, reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlert, setHasAlert] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  
  // Get customer data from navigation state if available
  const passedCustomerData = location.state?.customerData;
  const reportTitle = location.state?.reportTitle || 'Churn risk';
  
  // Generate mock user data
  useEffect(() => {
    // We would normally fetch this from an API
    const generateUserData = () => {
      // Use the ID passed in the URL to get a consistent name
      const customerId = parseInt(userId);
      
      // Define some company names for consistency
      const companies = [
        'Acme Corp', 'TechNova', 'DigitalLogic', 'ByteForge', 'CloudNest',
        'DataStream', 'QuickServe', 'InnovateX', 'PixelPerfect', 'CoreSystems',
        'FutureFlow', 'BrightPath', 'SkywardTech', 'ElementAI', 'VisionaryLabs'
      ];
      
      // If we have data passed from the report detail view, use that for consistency
      if (passedCustomerData) {
        return {
          id: userId,
          name: passedCustomerData.name,
          mrr: passedCustomerData.current_mrr || 270.00,
          totalSpend: (passedCustomerData.current_mrr || 270.00) * 3,
          projectedLtv: passedCustomerData.projected_ltv || 7560.00,
          product: passedCustomerData.product || 'Pro',
          customerSince: faker.date.past({ years: 2 }),
          customerId: `cus_AbCd123456789xYz`,
          productId: `prod_AbCd123456789xYz`,
          subscriptions: [
            {
              id: faker.string.uuid(),
              product: passedCustomerData.product || 'Pro',
              status: 'active',
              frequency: 'monthly',
              nextInvoice: faker.date.soon(),
              amount: passedCustomerData.current_mrr || 270.00
            }
          ],
          payments: [
            {
              id: faker.string.uuid(),
              amount: 1500.00,
              currency: 'USD',
              status: 'incomplete',
              description: 'Payment for Invoice',
              date: new Date('2023-01-23T14:02:00')
            },
            {
              id: faker.string.uuid(),
              amount: 95.00,
              currency: 'USD',
              status: 'incomplete',
              description: 'Payment for Invoice',
              date: new Date('2024-04-29T09:14:00')
            }
          ],
          usage: [
            {
              id: faker.string.uuid(),
              amount: 1057,
              meter: 'Classifier',
              units: 'Tokens',
              date: new Date('2025-05-08')
            },
            {
              id: faker.string.uuid(),
              amount: 22506,
              meter: 'Classifier',
              units: 'Tokens',
              date: new Date('2025-05-07')
            },
            {
              id: faker.string.uuid(),
              amount: 6988,
              meter: 'Classifier',
              units: 'Tokens',
              date: new Date('2025-05-06')
            }
          ],
          invoices: [
            {
              id: faker.string.uuid(),
              total: 0.01,
              currency: 'USD',
              status: 'draft',
              frequency: 'Monthly',
              number: 'DF95AD00-DRAFT',
              dueDate: new Date('2025-04-21'),
              createdDate: new Date('2025-04-20')
            },
            {
              id: faker.string.uuid(),
              total: 0.01,
              currency: 'USD',
              status: 'draft',
              frequency: 'Monthly',
              number: 'DF95AD00-DRAFT',
              dueDate: new Date('2025-03-21'),
              createdDate: new Date('2025-03-20')
            },
            {
              id: faker.string.uuid(),
              total: 0.01,
              currency: 'USD',
              status: 'draft',
              frequency: 'Monthly',
              number: 'DF95AD00-DRAFT',
              dueDate: new Date('2025-02-21'),
              createdDate: new Date('2025-02-20')
            },
            {
              id: faker.string.uuid(),
              total: 2000.00,
              currency: 'USD',
              status: 'draft',
              frequency: '',
              number: 'DF95AD00-DRAFT',
              dueDate: null,
              createdDate: new Date('2025-01-20')
            }
          ]
        };
      }
      
      // Fall back to the original method if no data was passed
      const name = companies[customerId % companies.length] || `Customer ${customerId}`;
      
      return {
        id: userId,
        name: name,
        mrr: 270.00,
        totalSpend: 810.00,
        projectedLtv: 7560.00,
        customerSince: faker.date.past({ years: 2 }),
        customerId: `cus_AbCd123456789xYz`,
        productId: `prod_AbCd123456789xYz`,
        subscriptions: [
          {
            id: faker.string.uuid(),
            product: 'Pro',
            status: 'active',
            frequency: 'monthly',
            nextInvoice: faker.date.soon(),
            amount: 270.00
          }
        ],
        payments: [
          {
            id: faker.string.uuid(),
            amount: 1500.00,
            currency: 'USD',
            status: 'incomplete',
            description: 'Payment for Invoice',
            date: new Date('2023-01-23T14:02:00')
          },
          {
            id: faker.string.uuid(),
            amount: 95.00,
            currency: 'USD',
            status: 'incomplete',
            description: 'Payment for Invoice',
            date: new Date('2024-04-29T09:14:00')
          }
        ],
        usage: [
          {
            id: faker.string.uuid(),
            amount: 1057,
            meter: 'Classifier',
            units: 'Tokens',
            date: new Date('2025-05-08')
          },
          {
            id: faker.string.uuid(),
            amount: 22506,
            meter: 'Classifier',
            units: 'Tokens',
            date: new Date('2025-05-07')
          },
          {
            id: faker.string.uuid(),
            amount: 6988,
            meter: 'Classifier',
            units: 'Tokens',
            date: new Date('2025-05-06')
          }
        ],
        invoices: [
          {
            id: faker.string.uuid(),
            total: 0.01,
            currency: 'USD',
            status: 'draft',
            frequency: 'Monthly',
            number: 'DF95AD00-DRAFT',
            dueDate: new Date('2025-04-21'),
            createdDate: new Date('2025-04-20')
          },
          {
            id: faker.string.uuid(),
            total: 0.01,
            currency: 'USD',
            status: 'draft',
            frequency: 'Monthly',
            number: 'DF95AD00-DRAFT',
            dueDate: new Date('2025-03-21'),
            createdDate: new Date('2025-03-20')
          },
          {
            id: faker.string.uuid(),
            total: 0.01,
            currency: 'USD',
            status: 'draft',
            frequency: 'Monthly',
            number: 'DF95AD00-DRAFT',
            dueDate: new Date('2025-02-21'),
            createdDate: new Date('2025-02-20')
          },
          {
            id: faker.string.uuid(),
            total: 2000.00,
            currency: 'USD',
            status: 'draft',
            frequency: '',
            number: 'DF95AD00-DRAFT',
            dueDate: null,
            createdDate: new Date('2025-01-20')
          }
        ]
      };
    };
    
    // Simulate API call
    setTimeout(() => {
      setUserData(generateUserData());
      setLoading(false);
    }, 500);
  }, [userId, passedCustomerData]);
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format datetime
  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // New method to handle alert save
  const handleSaveAlert = (alertData) => {
    console.log('Alert saved:', alertData);
    setHasAlert(true);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <UserDetailContainer>
        <BreadcrumbNav>
          <Breadcrumbs>
            <BreadcrumbLink to="/reports">Reports</BreadcrumbLink>
            <BreadcrumbLink to={`/reports/${reportId}`}>{reportTitle}</BreadcrumbLink>
          </Breadcrumbs>
        </BreadcrumbNav>
        
        <UserDetailHeader>
          <UserDetailTitle>{userData.name}</UserDetailTitle>
          <HeaderActions>
            <Button>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Create invoice
            </Button>
            <MoreButton>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </MoreButton>
          </HeaderActions>
        </UserDetailHeader>
        
        <ContentLayout>
          <MainColumn>
            <Section>
              <SectionHeader>
                <SectionTitle>Subscriptions</SectionTitle>
                <AddButton>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </AddButton>
              </SectionHeader>
              
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Frequency</th>
                      <th>Next invoice</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.subscriptions.map(sub => (
                      <tr key={sub.id} onClick={() => navigate(`/users/${userData.id}`)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 24, height: 24, backgroundColor: '#EEF2FF', borderRadius: '50%', marginRight: 12 }}></div>
                            {sub.product}
                          </div>
                        </td>
                        <td>
                          <Status className={sub.status}>Active</Status> Billing {sub.frequency}
                        </td>
                        <td>Jun 1 for {formatCurrency(sub.amount)}</td>
                        <td>⋯</td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Payments</SectionTitle>
                <AddButton>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </AddButton>
              </SectionHeader>
              
              <div>
                <p>This customer doesn't have any chargeable payment sources on file. Add a source or payment method to create a new payment.</p>
                
                <TableContainer>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.payments.map(payment => (
                        <tr key={payment.id} onClick={() => navigate(`/users/${userData.id}`)}>
                          <td>
                            <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                          </td>
                          <td>
                            {formatCurrency(payment.amount)} {payment.currency}
                            <div style={{ marginTop: 4 }}>
                              <Status style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>Incomplete</Status>
                            </div>
                          </td>
                          <td>{payment.description}</td>
                          <td>{formatDateTime(payment.date)}</td>
                          <td>⋯</td>
                        </tr>
                      ))}
                    </tbody>
                  </StyledTable>
                </TableContainer>
                <ResultCount>2 results</ResultCount>
              </div>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Usage</SectionTitle>
                <Button onClick={() => setIsAlertModalOpen(true)}>
                  {hasAlert ? 'Edit alert' : 'Set up alert'}
                </Button>
              </SectionHeader>
              
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Amount</th>
                      <th>Usage date</th>
                      <th>Meter</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.usage.map(usage => (
                      <tr key={usage.id} onClick={() => navigate(`/users/${userData.id}`)}>
                        <td>
                          <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td>{usage.amount.toLocaleString()} {usage.units}</td>
                        <td>{formatDate(usage.date)}</td>
                        <td>{usage.meter}</td>
                        <td>⋯</td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
              <ResultCount>3 results</ResultCount>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Invoices</SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button>View revenue recognition</Button>
                  <MoreButton>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                    </svg>
                  </MoreButton>
                </div>
              </SectionHeader>
              
              <TableContainer>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Total</th>
                      <th>Frequency</th>
                      <th>Invoice number</th>
                      <th>Due</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.invoices.map(invoice => (
                      <tr key={invoice.id} onClick={() => navigate(`/users/${userData.id}`)}>
                        <td>
                          {formatCurrency(invoice.total)} {invoice.currency}
                          <div style={{ marginTop: 4 }}>
                            <Status style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>Draft</Status>
                          </div>
                        </td>
                        <td>{invoice.frequency || '—'}</td>
                        <td>{invoice.number}</td>
                        <td>{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}</td>
                        <td>{formatDate(invoice.createdDate)}</td>
                        <td>⋯</td>
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              </TableContainer>
            </Section>
          </MainColumn>
          
          <SideColumn>
            <Section>
              <SectionTitle>Insights</SectionTitle>
              
              <InsightCard>
                <InsightLabel>Total spend</InsightLabel>
                <InsightValue>{formatCurrency(userData.totalSpend)}</InsightValue>
              </InsightCard>
              
              <InsightCard>
                <InsightLabel>Current MRR</InsightLabel>
                <InsightValue>{formatCurrency(userData.mrr)}</InsightValue>
              </InsightCard>
              
              <InsightCard>
                <InsightLabel>Projected LTV</InsightLabel>
                <InsightValue>{formatCurrency(userData.projectedLtv)}</InsightValue>
              </InsightCard>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Details</SectionTitle>
                <Button>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 4 }}>
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit
                </Button>
              </SectionHeader>
              
              <DetailItem>
                <DetailLabel>Customer ID</DetailLabel>
                <DetailValue>
                  <IconWrapper>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconWrapper>
                  {userData.customerId}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel>Customer created</DetailLabel>
                <DetailValue>
                  <IconWrapper>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconWrapper>
                  {formatDate(userData.customerSince)}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel>Product ID</DetailLabel>
                <DetailValue>
                  <IconWrapper>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7H7.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </IconWrapper>
                  {userData.productId}
                </DetailValue>
              </DetailItem>
            </Section>
            
            <Section>
              <SectionHeader>
                <SectionTitle>Metadata</SectionTitle>
                <AddButton>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </AddButton>
              </SectionHeader>
              
              <EmptyData>No metadata added</EmptyData>
            </Section>
          </SideColumn>
        </ContentLayout>
      </UserDetailContainer>
      
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        customerName={userData.name}
        onSave={handleSaveAlert}
      />
    </Container>
  );
};

export default UserDetail; 