import React, { useReducer, useRef, useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Stack, 
  Button, 
  Typography,
  Divider 
} from '@mui/material';
import {
  FormatListBulleted as FormatListBulletedIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Summarize as SummarizeIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

// Import reducers and state
import Reducer from '../Reducer/reducer';
import InitialState from '../Reducer/initialState';
import ActionName from '../Reducer/actions';

// Import refactored components
import PlanTab from './plan';
import RecordTab from './record';
import StatusTab from './status';

// Import hooks
import { useFileOperations } from '../../hooks';

// Import types
import { Investment, Inflation, PlanParameters } from '../../types';

const TabsContainer: React.FC = () => {
  const [tabValue, setTabValue] = useState<'plan' | 'record' | 'status'>('plan');
  const [state, dispatch] = useReducer(Reducer, InitialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use file operations hook
  const { importData, exportData, loading, error } = useFileOperations();

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'plan' | 'record' | 'status') => {
    setTabValue(newValue);
  };

  // Update plan parameters
  const handleUpdatePlan = (params: PlanParameters) => {
    dispatch({
      actionType: ActionName.UPDATE_PLAN,
      payload: params,
    });
  };

  // Update investments
  const handleUpdateInvestments = (investments: Investment[]) => {
    dispatch({
      actionType: ActionName.UPDATE_INVESTMENTS,
      payload: { investments },
    });
  };

  // Update inflation data
  const handleUpdateInflation = (annualInflation: Inflation[]) => {
    dispatch({
      actionType: ActionName.UPDATE_INFLATION,
      payload: { annualInflation },
    });
  };

  // Handle file import
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const jsonData = await importData(file);
      
      // Parse dates from JSON
      const parsedData = {
        ...jsonData,
        startDate: new Date(jsonData.startDate),
        retireDate: new Date(jsonData.retireDate),
        investmentPlan: jsonData.investmentPlan?.map((item: any) => ({
          ...item,
          recordDate: new Date(item.recordDate),
        })) || [],
        investments: jsonData.investments?.map((item: any) => ({
          ...item,
          recordDate: new Date(item.recordDate),
        })) || [],
        annualInflation: jsonData.annualInflation?.map((item: any) => ({
          ...item,
          recordDate: new Date(item.recordDate),
        })) || [],
      };

      dispatch({
        actionType: ActionName.LOAD,
        payload: parsedData,
      });
    } catch (err) {
      console.error('Failed to import file:', err);
    }

    // Reset file input
    event.target.value = '';
  };

  // Handle file export
  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `fire_data_${timestamp}`;
    exportData(state, filename, 'json');
  };

  // Create plan parameters object
  const planParameters: PlanParameters = {
    startDate: state.startDate,
    retireDate: state.retireDate,
    startingSIP: state.startingSIP,
    incomeAtMaturity: state.incomeAtMaturity,
    currency: state.currency,
    expectedAnnualInflation: state.expectedAnnualInflation,
    expectedGrowthRate: state.expectedGrowthRate,
    sipGrowthRate: state.sipGrowthRate,
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: 3 }}>
        {/* Header with import/export */}
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" component="h1" color="primary">
            FIRE Planning Dashboard
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleImport}
              disabled={loading}
            >
              Import Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
            >
              Export Data
            </Button>
          </Stack>
        </Stack>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Error display */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.contrastText">
              {error}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              value="plan"
              label="Make Plan"
              icon={<FormatListBulletedIcon />}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              value="record"
              label="Record Events"
              icon={<AddShoppingCartIcon />}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              value="status"
              label="Status & Analytics"
              icon={<SummarizeIcon />}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box>
          {tabValue === 'plan' && (
            <PlanTab
              planParameters={planParameters}
              onUpdatePlan={handleUpdatePlan}
            />
          )}
          
          {tabValue === 'record' && (
            <RecordTab
              investments={state.investments}
              annualInflation={state.annualInflation}
              onUpdateInvestments={handleUpdateInvestments}
              onUpdateInflation={handleUpdateInflation}
            />
          )}
          
          {tabValue === 'status' && (
            <StatusTab
              investments={state.investments}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TabsContainer;
