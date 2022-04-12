import * as React from 'react';
import Box from '@mui/material/Box';
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

const validationSchema = yup.object().shape({
  startDate: yup
    .date(),
  retireDate: yup
    .date(),
  startingSIP: yup.number().min(0),
  incomeAtMaturity: yup.number().min(0),
  expectedAnnualInflation: yup.number().min(0),
  expectedGrowthRate: yup.number().min(yup.ref('expectedAnnualInflation'), "Growth Rate needs to be more than Inflation Rate"),
  sipGrowthRate: yup.number().min(0)
});

export default function Plan(props: any) {

  const {
    startDate,
    retireDate,
    incomeAtMaturity,
    currency,
    expectedAnnualInflation,
    expectedGrowthRate,
    startingSIP,
    sipGrowthRate,
    dispatch
  } = props;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      startDate: startDate,
      retireDate: retireDate,
      incomeAtMaturity: incomeAtMaturity,
      currency: currency,
      expectedAnnualInflation: expectedAnnualInflation,
      expectedGrowthRate: expectedGrowthRate,
      startingSIP: startingSIP,
      sipGrowthRate: sipGrowthRate
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // alert(JSON.stringify(values, null, 2));
      console.log("values", values);
      const {
        startDate,
        retireDate,
        startingSIP,
        incomeAtMaturity,
        currency,
        expectedAnnualInflation,
        expectedGrowthRate,
        sipGrowthRate } = values;
      dispatch(
        startDate,
        retireDate,
        parseFloat(startingSIP),
        parseFloat(incomeAtMaturity),
        currency,
        parseFloat(expectedAnnualInflation),
        parseFloat(expectedGrowthRate),
        parseFloat(sipGrowthRate))
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', paddingTop: "10px", margin: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ width: '100%', paddingTop: "10px", margin: "20px" }}>
            <DesktopDatePicker
              label="Start Date"
              inputFormat="MM/dd/yyyy"
              value={formik.values.startDate}
              onChange={date => formik.setFieldValue('startDate', new Date(date.toDateString()))}
              renderInput={(params) => <TextField
                {...params}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
              />}
            />
          </Box>
          <Box sx={{ width: '100%', paddingTop: "10px", margin: "20px" }}>
            <DesktopDatePicker
              disabled
              label="Retire Date"
              inputFormat="MM/dd/yyyy"
              value={formik.values.retireDate}
              onChange={date => formik.setFieldValue('retireDate', new Date(date.toDateString()))}
              renderInput={(params) => <TextField
                {...params}
                error={formik.touched.retireDate && Boolean(formik.errors.retireDate)}
                helperText={formik.touched.retireDate && formik.errors.retireDate}
              />}
            />
          </Box>
          <TextField
            sx={{ width: '100%', marginTop: "20px", marginBottom: "20px" }}
            fullWidth
            id="startingSIP"
            name="startingSIP"
            label="Starting SIP"
            value={formik.values.startingSIP}
            onChange={formik.handleChange}
            error={formik.touched.startingSIP && Boolean(formik.errors.startingSIP)}
            helperText={formik.touched.startingSIP && formik.errors.startingSIP}
          />
          <TextField
            sx={{ width: '100%', marginTop: "20px", marginBottom: "20px" }}
            fullWidth
            id="incomeAtMaturity"
            name="incomeAtMaturity"
            label="Income At Maturity"
            value={formik.values.incomeAtMaturity}
            onChange={formik.handleChange}
            error={formik.touched.incomeAtMaturity && Boolean(formik.errors.incomeAtMaturity)}
            helperText={formik.touched.incomeAtMaturity && formik.errors.incomeAtMaturity}
          />
          <TextField
            sx={{ width: '100%', marginTop: "20px", marginBottom: "20px" }}
            fullWidth
            id="expectedAnnualInflation"
            name="expectedAnnualInflation"
            label="Expected Annual Inflation"
            value={formik.values.expectedAnnualInflation}
            onChange={formik.handleChange}
            error={formik.touched.expectedAnnualInflation && Boolean(formik.errors.expectedAnnualInflation)}
            helperText={formik.touched.expectedAnnualInflation && formik.errors.expectedAnnualInflation}
          />
          <TextField
            sx={{ width: '100%', marginTop: "20px", marginBottom: "20px" }}
            fullWidth
            id="expectedGrowthRate"
            name="expectedGrowthRate"
            label="Expected Growth Rate"
            value={formik.values.expectedGrowthRate}
            onChange={formik.handleChange}
            error={formik.touched.expectedGrowthRate && Boolean(formik.errors.expectedGrowthRate)}
            helperText={formik.touched.expectedGrowthRate && formik.errors.expectedGrowthRate}
          />
          <TextField
            sx={{ width: '100%', marginTop: "20px", marginBottom: "20px" }}
            fullWidth
            id="sipGrowthRate"
            name="sipGrowthRate"
            label="SIP Annual Stepup Rate"
            value={formik.values.sipGrowthRate}
            onChange={formik.handleChange}
            error={formik.touched.sipGrowthRate && Boolean(formik.errors.sipGrowthRate)}
            helperText={formik.touched.sipGrowthRate && formik.errors.sipGrowthRate}
          />
          <Button color="primary" variant="contained" fullWidth type="submit">
            Submit
          </Button>
        </form>
      </Box>
    </LocalizationProvider>
  );
}
