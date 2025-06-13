import React from 'react';
import styled from 'styled-components';
import { DATASETS, datasetHasColumnsInUse, getDatasetColumnsInUse, getDatasetColumnsNotInUse, getOtherColumns } from '../data/reportSchemas';

// Dataset Panel Styles
const DatasetSection = styled.div`
  margin-bottom: 24px;
`;

const DatasetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DatasetTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DatasetItem = styled.div`
  margin-bottom: 16px;
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  overflow: hidden;
`;

const DatasetItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.isExpanded ? '#f8f9fa' : 'white'};
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const DatasetName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const DatasetCount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DatasetCountText = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const DatasetContent = styled.div`
  padding: 0 16px 16px 16px;
  border-top: 1px solid #e3e8ee;
  background: white;
  display: ${props => props.isExpanded ? 'block' : 'none'};
`;

const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  
  &:hover {
    color: #1f2937;
  }
`;

const ColumnCheckbox = styled.input`
  margin: 0;
  cursor: pointer;
`;

const AddAllButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-bottom: 12px;
  
  &:hover {
    color: #2563eb;
  }
`;

const ChevronIcon = styled.svg`
  width: 16px;
  height: 16px;
  color: #6b7280;
  transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const KeyEntitiesText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const EntityTag = styled.span`
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
`;

const DatasetPanel = ({ 
  columnsInUse,
  expandedDatasets,
  onDatasetToggle,
  onColumnToggle,
  onAddAllDatasetColumns
}) => {
  // Calculate datasets in use vs more datasets
  const datasetsInUse = [];
  const moreDatasetsAvailable = [];
  
  Object.values(DATASETS).forEach(dataset => {
    if (datasetHasColumnsInUse(dataset, columnsInUse)) {
      datasetsInUse.push(dataset);
    } else {
      moreDatasetsAvailable.push(dataset);
    }
  });
  
  // Get other columns not in any dataset
  const otherColumnsInUse = getOtherColumns(columnsInUse);
  
  return (
    <>
      {/* Datasets in Use Section */}
      <DatasetSection>
        <DatasetHeader>
          <DatasetTitle>Datasets in Use</DatasetTitle>
        </DatasetHeader>
        
        {datasetsInUse.map(dataset => {
          const columnsInDataset = getDatasetColumnsInUse(dataset, columnsInUse);
          const columnsNotInDataset = getDatasetColumnsNotInUse(dataset, columnsInUse);
          const isExpanded = expandedDatasets.has(dataset.name);
          
          return (
            <DatasetItem key={dataset.name}>
              <DatasetItemHeader 
                isExpanded={isExpanded}
                onClick={() => onDatasetToggle(dataset.name)}
              >
                <div>
                  <DatasetName>{dataset.name}</DatasetName>
                  <DatasetCountText>
                    {columnsInDataset.length} of {dataset.allColumns.length} columns
                  </DatasetCountText>
                </div>
                <DatasetCount>
                  <ChevronIcon isExpanded={isExpanded} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 101.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </ChevronIcon>
                </DatasetCount>
              </DatasetItemHeader>
              
              <DatasetContent isExpanded={isExpanded}>
                <KeyEntitiesText>
                  {dataset.keyEntities.slice(0, 3).map(entity => (
                    <EntityTag key={entity}>{entity}</EntityTag>
                  ))}
                  {dataset.keyEntities.length > 3 && <span>...</span>}
                </KeyEntitiesText>
                
                {columnsNotInDataset.length > 0 && (
                  <AddAllButton onClick={() => onAddAllDatasetColumns(dataset)}>
                    Add all
                  </AddAllButton>
                )}
                
                <ColumnList>
                  {dataset.allColumns.map(column => {
                    const isChecked = columnsInUse.find(col => col.id === column.id);
                    return (
                      <ColumnItem key={column.id}>
                        <ColumnCheckbox
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={() => onColumnToggle(column.id)}
                        />
                        <span>{column.label}</span>
                      </ColumnItem>
                    );
                  })}
                </ColumnList>
              </DatasetContent>
            </DatasetItem>
          );
        })}
        
        {/* Other Columns in Use */}
        {otherColumnsInUse.length > 0 && (
          <DatasetItem>
            <DatasetItemHeader 
              isExpanded={expandedDatasets.has('Other columns')}
              onClick={() => onDatasetToggle('Other columns')}
            >
              <div>
                <DatasetName>Other columns</DatasetName>
                <DatasetCountText>{otherColumnsInUse.length} columns</DatasetCountText>
              </div>
              <DatasetCount>
                <ChevronIcon isExpanded={expandedDatasets.has('Other columns')} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 101.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </ChevronIcon>
              </DatasetCount>
            </DatasetItemHeader>
            
            <DatasetContent isExpanded={expandedDatasets.has('Other columns')}>
              <ColumnList>
                {otherColumnsInUse.map(column => (
                  <ColumnItem key={column.id}>
                    <ColumnCheckbox
                      type="checkbox"
                      checked={true}
                      onChange={() => onColumnToggle(column.id)}
                    />
                    <span>{column.label}</span>
                  </ColumnItem>
                ))}
              </ColumnList>
            </DatasetContent>
          </DatasetItem>
        )}
      </DatasetSection>

      {/* More Datasets Section */}
      <DatasetSection>
        <DatasetHeader>
          <DatasetTitle>More Datasets</DatasetTitle>
        </DatasetHeader>
        
        {moreDatasetsAvailable.map(dataset => {
          const isExpanded = expandedDatasets.has(dataset.name);
          
          return (
            <DatasetItem key={dataset.name}>
              <DatasetItemHeader 
                isExpanded={isExpanded}
                onClick={() => onDatasetToggle(dataset.name)}
              >
                <div>
                  <DatasetName>{dataset.name}</DatasetName>
                  <DatasetCountText>{dataset.allColumns.length} columns</DatasetCountText>
                </div>
                <DatasetCount>
                  <ChevronIcon isExpanded={isExpanded} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 101.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </ChevronIcon>
                </DatasetCount>
              </DatasetItemHeader>
              
              <DatasetContent isExpanded={isExpanded}>
                <KeyEntitiesText>
                  {dataset.keyEntities.slice(0, 3).map(entity => (
                    <EntityTag key={entity}>{entity}</EntityTag>
                  ))}
                  {dataset.keyEntities.length > 3 && <span>...</span>}
                </KeyEntitiesText>
                
                <AddAllButton onClick={() => onAddAllDatasetColumns(dataset)}>
                  Add all
                </AddAllButton>
                
                <ColumnList>
                  {dataset.allColumns.map(column => (
                    <ColumnItem key={column.id}>
                      <ColumnCheckbox
                        type="checkbox"
                        checked={false}
                        onChange={() => onColumnToggle(column.id)}
                      />
                      <span>{column.label}</span>
                    </ColumnItem>
                  ))}
                </ColumnList>
              </DatasetContent>
            </DatasetItem>
          );
        })}
      </DatasetSection>
    </>
  );
};

export default DatasetPanel; 