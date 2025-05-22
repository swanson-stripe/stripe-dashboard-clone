import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Modal, { ModalButton } from './Modal';

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 8px;
  
  .required {
    color: #e53e3e;
    margin-left: 2px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: #635bff;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 16px;
  background-color: ${props => props.active ? '#635bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#635bff' : '#f9fafb'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  &:focus {
    border-color: #635bff;
  }
`;

const FrequencyOption = styled.div`
  padding: 16px;
  border: 1px solid ${props => props.selected ? '#635bff' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #635bff;
    background-color: ${props => props.selected ? '#f5f5ff' : '#f9fafb'};
  }
  
  background-color: ${props => props.selected ? '#f5f5ff' : 'white'};
`;

const FrequencyTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const FrequencyDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const DisabledButton = styled(ModalButton)`
  background-color: ${props => props.disabled ? '#a5a0ff' : '#635bff'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  
  &:hover {
    background-color: ${props => props.disabled ? '#a5a0ff' : '#5147e5'};
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: #18181b;
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #18181b transparent transparent transparent;
  }
`;

const AlertModal = ({ isOpen, onClose, customerName, onSave }) => {
  const [alertName, setAlertName] = useState('');
  const [alertType, setAlertType] = useState('meter_usage');
  const [meter, setMeter] = useState('');
  const [triggerValue, setTriggerValue] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const createButtonRef = useRef(null);
  
  // Validate form on any input change
  useEffect(() => {
    const checkValidity = () => {
      if (!alertName) return false;
      
      if (alertType === 'meter_usage') {
        if (!meter || !triggerValue) return false;
      } else {
        if (!spendAmount) return false;
      }
      
      if (!frequency) return false;
      
      return true;
    };
    
    setIsFormValid(checkValidity());
  }, [alertName, alertType, meter, triggerValue, spendAmount, frequency]);

  const handleSave = () => {
    onSave({
      name: alertName,
      type: alertType,
      meter: alertType === 'meter_usage' ? meter : null,
      triggerValue: alertType === 'meter_usage' ? triggerValue : null,
      spendAmount: alertType === 'spend_amount' ? spendAmount : null,
      frequency
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Alert for ${customerName}`}
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <div ref={createButtonRef} style={{ position: 'relative' }}>
            <DisabledButton 
              primary 
              onClick={handleSave} 
              disabled={!isFormValid}
              onMouseEnter={() => !isFormValid && setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              Create alert
              {!isFormValid && 
                <Tooltip visible={tooltipVisible}>
                  Complete all steps to create an alert
                </Tooltip>
              }
            </DisabledButton>
          </div>
        </>
      }
    >
      <FormGroup>
        <Label>
          Alert name
          {!alertName && <span className="required">*</span>}
        </Label>
        <Description>Display name for the alert. Not displayed to customers</Description>
        <Input
          type="text"
          placeholder="Alert name"
          value={alertName}
          onChange={(e) => setAlertName(e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <Label>Alert type</Label>
        <ToggleContainer>
          <ToggleButton
            active={alertType === 'meter_usage'}
            onClick={() => setAlertType('meter_usage')}
          >
            Meter usage
          </ToggleButton>
          <ToggleButton
            active={alertType === 'spend_amount'}
            onClick={() => setAlertType('spend_amount')}
          >
            Spend amount
          </ToggleButton>
        </ToggleContainer>
      </FormGroup>

      {alertType === 'meter_usage' ? (
        <>
          <FormGroup>
            <Label>
              Meter
              {!meter && <span className="required">*</span>}
            </Label>
            <Select
              value={meter}
              onChange={(e) => setMeter(e.target.value)}
            >
              <option value="" disabled>Choose an option</option>
              <option value="classifier">Classifier</option>
              <option value="generator">Generator</option>
              <option value="scorer">Scorer</option>
              <option value="detector">Detector</option>
              <option value="modeling">Modeling</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>
              Trigger value
              {!triggerValue && <span className="required">*</span>}
            </Label>
            <Input
              type="number"
              placeholder="100"
              value={triggerValue}
              onChange={(e) => setTriggerValue(e.target.value)}
            />
          </FormGroup>
        </>
      ) : (
        <FormGroup>
          <Label>
            Amount (in USD)
            {!spendAmount && <span className="required">*</span>}
          </Label>
          <Input
            type="number"
            placeholder="100"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
          />
        </FormGroup>
      )}

      <FormGroup>
        <Label>
          Frequency
          {!frequency && <span className="required">*</span>}
        </Label>
        
        <FrequencyOption 
          selected={frequency === 'one_time_per_customer'} 
          onClick={() => setFrequency('one_time_per_customer')}
        >
          <FrequencyTitle>One-time per customer</FrequencyTitle>
          <FrequencyDescription>Trigger once when customer's usage reaches the unit threshold.</FrequencyDescription>
        </FrequencyOption>
        
        <FrequencyOption 
          selected={frequency === 'one_time_per_cycle'} 
          onClick={() => setFrequency('one_time_per_cycle')}
        >
          <FrequencyTitle>One-time per cycle</FrequencyTitle>
          <FrequencyDescription>Trigger once when a customer's usage reaches the unit threshold once per billing cycle.</FrequencyDescription>
        </FrequencyOption>
      </FormGroup>
    </Modal>
  );
};

export default AlertModal; 