import React from 'react';
import { IconButton, ButtonGroup, Tooltip } from '@mui/material';
import { GridView, ViewList } from '@mui/icons-material';
import { ViewMode } from '../types/preferences.types';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  return (
    <ButtonGroup>
      <Tooltip title="Vue grille">
        <IconButton
          color={currentView === 'grid' ? 'primary' : 'default'}
          onClick={() => onViewChange('grid')}
        >
          <GridView />
        </IconButton>
      </Tooltip>
      <Tooltip title="Vue liste">
        <IconButton
          color={currentView === 'list' ? 'primary' : 'default'}
          onClick={() => onViewChange('list')}
        >
          <ViewList />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
}; 