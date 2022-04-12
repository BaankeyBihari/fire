import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { compareInvestment, } from "@components/Reducer/reducer";
import * as React from 'react';

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Typography from '@mui/material/Typography';
import { Investment } from '@components/Reducer/initialState';
import Box from '@mui/material/Box';



export default function Record(props: any) {
  const { investments, investmentPlan, annualInflation } = props;
  const [plan, setPlan] = React.useState<Investment[] | []>([]);

  function onlyUnique(value: any, index: any, self: string | any[]) {
    return self.indexOf(value) === index;
  }

  React.useEffect(() => {
    let allThings = [...investments, ...investmentPlan]
    allThings.sort(compareInvestment);
    let tagContainer = allThings
      .map((e: { tag: any; }) => e.tag)
      .filter(onlyUnique)
      .filter(e => e !== 'Planned').map(e => {
        return {
          tag: e,
          investedAmount: 0,
          currentValue: 0
        }
      })
    let actuals: Investment[] = [];
    for (let i = 0; i < allThings.length; i++) {
      if (allThings[i].tag !== 'Planned') {
        let ik = tagContainer.findIndex(e => e.tag === allThings[i].tag);
        tagContainer[ik].investedAmount = allThings[i].investedAmount;
        tagContainer[ik].currentValue = allThings[i].currentValue;
      } else {
        const sumInvested = tagContainer.reduce((partialSum, a) => partialSum + a.investedAmount, 0);
        const sumCurrent = tagContainer.reduce((partialSum, a) => partialSum + a.currentValue, 0);
        actuals = [...actuals, {
          investedAmount: sumInvested,
          currentValue: sumCurrent,
          tag: "Actual",
          recordDate: allThings[i].recordDate
        }];
      }
    }
    allThings = [...allThings, ...actuals];
    allThings.sort(compareInvestment);
    setPlan(allThings);
  }, [investments, annualInflation, investmentPlan]);

  React.useEffect(() => {
    console.log("plan", plan);
  }, [plan]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: "100%", marginY: "5px" }}>
        {investmentPlan.length === 0 ?
          <Typography variant="h4" component="h3" gutterBottom>
            Please create a plan first!!!
          </Typography>
          :
          <>
            <TableContainer component={Paper}>
              <Table aria-label="investment table">
                <TableHead>
                  <TableRow>
                    <TableCell>Recorded On</TableCell>
                    <TableCell align="right">Tag</TableCell>
                    <TableCell align="right">Invested</TableCell>
                    <TableCell align="right">To Pay</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">To Earn</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.map((row: Investment, index: number, plan) => {
                    let fk = 0;
                    if (row.tag === 'Planned') {
                      fk = plan.findIndex(e => e.tag === 'Actual' && e.recordDate === row.recordDate);

                      return (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {row.recordDate.toDateString()}
                          </TableCell>
                          <TableCell align="right">{row.tag}</TableCell>
                          <TableCell align="right"
                            sx={{
                              color: row.investedAmount < plan[fk].investedAmount ? 'green' : 'red'
                            }}
                          >
                            {row.investedAmount}
                          </TableCell>
                          <TableCell align="right"
                            sx={{
                              color: row.investedAmount < plan[fk].investedAmount ? 'green' : 'red'
                            }}
                          >
                            {parseFloat((plan[fk].investedAmount - row.investedAmount).toFixed(2))}
                          </TableCell>
                          <TableCell align="right"
                            sx={{
                              color: row.currentValue < plan[fk].currentValue ? 'green' : 'red'
                            }}
                          >
                            {row.currentValue}
                          </TableCell>
                          <TableCell align="right"
                            sx={{
                              color: row.currentValue < plan[fk].currentValue ? 'green' : 'red'
                            }}
                          >
                            {parseFloat((plan[fk].currentValue - row.currentValue).toFixed(2))}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {row.recordDate.toDateString()}
                        </TableCell>
                        <TableCell align="right">{row.tag}</TableCell>
                        <TableCell align="right">{row.investedAmount}</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="right">{row.currentValue}</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        }
      </Box>
    </LocalizationProvider>
  );
}
