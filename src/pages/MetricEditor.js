import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LineChart from '../components/LineChart';

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100vh;
  width: 100vw;
`;

const EditorPanel = styled.div`
  background-color: white;
  border-right: 1px solid var(--border-color);
  padding: 24px;
  height: 100vh;
  overflow-y: auto;
`;

const EditorPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
`;

const EditorTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  
  &:hover {
    color: var(--text-color);
  }
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeading = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color);
  text-transform: none;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-color);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 8px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: #574ae2;
    }
  }
  
  &.secondary {
    background-color: white;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: #f7f9fc;
    }
  }
  
  &.danger {
    background-color: white;
    color: var(--danger-color);
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: #fff5f5;
    }
  }
`;

const PreviewContainer = styled.div`
  background-color: #f9fafc;
  padding: 32px;
  overflow-y: auto;
  height: 100vh;
`;

const PreviewHeader = styled.div`
  margin-bottom: 24px;
`;

const PreviewTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-secondary);
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const MetricTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  
  &.positive {
    color: var(--success-color);
  }
  
  &.negative {
    color: var(--danger-color);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const ChartContainer = styled.div`
  background: white;
  margin-bottom: 32px;
  height: 280px;
`;

const MetricSummary = styled.div`
  margin-top: 24px;
`;

const MetricEditor = () => {
  const navigate = useNavigate();
  const { metricId } = useParams();
  
  const [formData, setFormData] = useState({
    title: 'Revenue',
    description: 'Total revenue from all sources',
    unit: 'currency',
    aggregation: 'sum',
    color: '#635bff',
    format: 'currency',
    showTrend: true,
    showAverage: true,
    showTotal: true,
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here would be API call to save the metric
    navigate(`/metrics/${metricId}`);
  };
  
  const handleCancel = () => {
    navigate(`/metrics/${metricId}`);
  };
  
  // Sample chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [1250, 1730, 1400, 1800, 1600, 2100, 2400, 2200, 2500, 2300, 2600, 2800, 2900, 3000],
        borderColor: formData.color || '#635bff',
        backgroundColor: `${formData.color}19` || 'rgba(99, 91, 255, 0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };
  
  const trendValue = 12.5;
  
  return (
    <EditorContainer>
      <EditorPanel>
        <EditorPanelHeader>
          <EditorTitle>Edit Metric</EditorTitle>
          <CloseButton onClick={handleCancel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Close
          </CloseButton>
        </EditorPanelHeader>
        
        <EditorForm onSubmit={handleSubmit}>
          <SectionHeading>General Information</SectionHeading>
          <FormGroup>
            <Label htmlFor="title">Metric Title</Label>
            <Input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </FormGroup>
          
          <Divider />
          
          <SectionHeading>Data Configuration</SectionHeading>
          <FormGroup>
            <Label htmlFor="unit">Unit</Label>
            <Select 
              id="unit" 
              name="unit" 
              value={formData.unit} 
              onChange={handleChange}
            >
              <option value="currency">Currency</option>
              <option value="number">Number</option>
              <option value="percentage">Percentage</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="aggregation">Aggregation</Label>
            <Select 
              id="aggregation" 
              name="aggregation" 
              value={formData.aggregation} 
              onChange={handleChange}
            >
              <option value="sum">Sum</option>
              <option value="average">Average</option>
              <option value="count">Count</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="color">Chart Color</Label>
            <Input 
              type="color" 
              id="color" 
              name="color" 
              value={formData.color} 
              onChange={handleChange} 
            />
          </FormGroup>
          
          <Divider />
          
          <SectionHeading>Metric Values</SectionHeading>
          <FormGroup>
            <Label htmlFor="format">Value Format</Label>
            <Select 
              id="format" 
              name="format" 
              value={formData.format} 
              onChange={handleChange}
            >
              <option value="currency">Currency ($)</option>
              <option value="number">Number</option>
              <option value="percentage">Percentage (%)</option>
              <option value="decimal">Decimal (0.00)</option>
            </Select>
          </FormGroup>
          
          <Divider />
          
          <SectionHeading>Display Options</SectionHeading>
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                id="showTrend" 
                name="showTrend" 
                checked={formData.showTrend} 
                onChange={handleChange} 
              />
              <Label htmlFor="showTrend">Show trend indicator</Label>
            </Checkbox>
          </FormGroup>
          
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                id="showAverage" 
                name="showAverage" 
                checked={formData.showAverage} 
                onChange={handleChange} 
              />
              <Label htmlFor="showAverage">Show average value</Label>
            </Checkbox>
          </FormGroup>
          
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                id="showTotal" 
                name="showTotal" 
                checked={formData.showTotal} 
                onChange={handleChange} 
              />
              <Label htmlFor="showTotal">Show total value</Label>
            </Checkbox>
          </FormGroup>
          
          <ButtonGroup>
            <Button type="button" className="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="primary">
              Save Changes
            </Button>
          </ButtonGroup>
        </EditorForm>
      </EditorPanel>
      
      <PreviewContainer>
        <PreviewHeader>
          <PreviewTitle>Preview</PreviewTitle>
        </PreviewHeader>
        
        <PreviewCard>
          <ReportHeader>
            <div>
              <MetricTitle>{formData.title}</MetricTitle>
              <MetricValue>$24,650.45</MetricValue>
              
              {formData.showTrend && (
                <TrendIndicator className="positive">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  +{trendValue}% compared to previous period
                </TrendIndicator>
              )}
            </div>
          </ReportHeader>
          
          <ChartContainer>
            <LineChart data={chartData} height={280} showLegend={false} />
          </ChartContainer>
          
          <MetricSummary>
            <h3>Summary</h3>
            <p>{formData.description}</p>
            
            {formData.showTotal && (
              <div className="mt-3">
                <h4>Total</h4>
                <p>$24,650.45</p>
              </div>
            )}
            
            {formData.showAverage && (
              <div className="mt-3">
                <h4>Average</h4>
                <p>$1,760.75 per day</p>
              </div>
            )}
          </MetricSummary>

          {/* Sample transactions table */}
          <div className="transactions-table">
            <h3 className="mb-2 mt-4">Related Transactions</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>14 Apr 2023</td>
                  <td>$123.45</td>
                  <td>John Smith</td>
                  <td><span style={{ color: 'var(--success-color)' }}>Succeeded</span></td>
                </tr>
                <tr>
                  <td>13 Apr 2023</td>
                  <td>$567.89</td>
                  <td>Jane Doe</td>
                  <td><span style={{ color: 'var(--success-color)' }}>Succeeded</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </PreviewCard>
      </PreviewContainer>
    </EditorContainer>
  );
};

export default MetricEditor; 