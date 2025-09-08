import React from 'react';
import { Box, TextField, Button, Stack } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

// Import new UI components
import { FormSection } from '../ui';

// Import types
import { PlanParameters } from '../../types';

const validationSchema = yup.object().shape({
  startDate: yup.date().required('Start date is required'),
  retireDate: yup.date().required('Retire date is required'),
  startingSIP: yup
    .number()
    .min(0, 'Starting SIP must be positive')
    .required('Starting SIP is required'),
  incomeAtMaturity: yup
    .number()
    .min(0, 'Income at maturity must be positive')
    .required('Income at maturity is required'),
  expectedAnnualInflation: yup
    .number()
    .min(0, 'Inflation rate must be positive')
    .max(100, 'Inflation rate cannot exceed 100%')
    .required('Expected annual inflation is required'),
  expectedGrowthRate: yup
    .number()
    .min(
      yup.ref('expectedAnnualInflation'),
      'Growth rate should be higher than inflation rate'
    )
    .max(100, 'Growth rate cannot exceed 100%')
    .required('Expected growth rate is required'),
  sipGrowthRate: yup
    .number()
    .min(0, 'SIP growth rate must be positive')
    .max(100, 'SIP growth rate cannot exceed 100%')
    .required('SIP growth rate is required'),
  currency: yup.string().required('Currency is required'),
});

interface PlanTabProps {
  planParameters: PlanParameters;
  onUpdatePlan: (params: PlanParameters) => void;
}

const PlanTab: React.FC<PlanTabProps> = ({ planParameters, onUpdatePlan }) => {
  const formik = useFormik<PlanParameters>({
    enableReinitialize: true,
    initialValues: {
      startDate: planParameters.startDate,
      retireDate: planParameters.retireDate,
      incomeAtMaturity: planParameters.incomeAtMaturity,
      currency: planParameters.currency,
      expectedAnnualInflation: planParameters.expectedAnnualInflation,
      expectedGrowthRate: planParameters.expectedGrowthRate,
      startingSIP: planParameters.startingSIP,
      sipGrowthRate: planParameters.sipGrowthRate,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Plan values submitted:', values);
      onUpdatePlan(values);
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  const getErrorText = (field: keyof PlanParameters) => {
    const error = errors[field];
    return touched[field] && error ? String(error) : undefined;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <FormSection title="Investment Timeline" variant="card" spacing={3}>
            <Stack spacing={3}>
              <DesktopDatePicker
                label="Start Date"
                format="MM/dd/yyyy"
                value={values.startDate}
                onChange={(date) => setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.startDate && Boolean(errors.startDate),
                    helperText: getErrorText('startDate'),
                  },
                }}
              />
              <DesktopDatePicker
                label="Retirement Date"
                format="MM/dd/yyyy"
                value={values.retireDate}
                onChange={(date) => setFieldValue('retireDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.retireDate && Boolean(errors.retireDate),
                    helperText: getErrorText('retireDate'),
                  },
                }}
              />
            </Stack>
          </FormSection>

          <FormSection title="Investment Parameters" variant="card" spacing={3}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="startingSIP"
                name="startingSIP"
                label="Starting SIP Amount"
                type="number"
                value={values.startingSIP}
                onChange={handleChange}
                error={touched.startingSIP && Boolean(errors.startingSIP)}
                helperText={getErrorText('startingSIP')}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>{values.currency}</span>,
                }}
              />
              <TextField
                fullWidth
                id="incomeAtMaturity"
                name="incomeAtMaturity"
                label="Target Income at Retirement"
                type="number"
                value={values.incomeAtMaturity}
                onChange={handleChange}
                error={touched.incomeAtMaturity && Boolean(errors.incomeAtMaturity)}
                helperText={getErrorText('incomeAtMaturity')}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>{values.currency}</span>,
                }}
              />
              <TextField
                fullWidth
                id="currency"
                name="currency"
                label="Currency"
                value={values.currency}
                onChange={handleChange}
                error={touched.currency && Boolean(errors.currency)}
                helperText={getErrorText('currency')}
              />
              <TextField
                fullWidth
                id="sipGrowthRate"
                name="sipGrowthRate"
                label="SIP Annual Step-up Rate (%)"
                type="number"
                value={values.sipGrowthRate}
                onChange={handleChange}
                error={touched.sipGrowthRate && Boolean(errors.sipGrowthRate)}
                helperText={getErrorText('sipGrowthRate')}
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
            </Stack>
          </FormSection>

          <FormSection title="Market Assumptions" variant="card" spacing={3}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="expectedAnnualInflation"
                name="expectedAnnualInflation"
                label="Expected Annual Inflation (%)"
                type="number"
                value={values.expectedAnnualInflation}
                onChange={handleChange}
                error={touched.expectedAnnualInflation && Boolean(errors.expectedAnnualInflation)}
                helperText={getErrorText('expectedAnnualInflation')}
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
              <TextField
                fullWidth
                id="expectedGrowthRate"
                name="expectedGrowthRate"
                label="Expected Growth Rate (%)"
                type="number"
                value={values.expectedGrowthRate}
                onChange={handleChange}
                error={touched.expectedGrowthRate && Boolean(errors.expectedGrowthRate)}
                helperText={getErrorText('expectedGrowthRate')}
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
            </Stack>
          </FormSection>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ minWidth: 200, py: 1.5 }}
            >
              Update Plan
            </Button>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default PlanTab;
