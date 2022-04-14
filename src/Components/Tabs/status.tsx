import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { compareInvestment, } from "./src/components/Reducer/reducer";
import * as React from 'react';

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Typography from '@mui/material/Typography';
import { Investment } from './src/components/Reducer/initialState';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { addDays, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  let red = o(r() * s);
  let green = o(r() * s);
  let blue = o(r() * s);
  return [
    'rgba(' + red + ',' + green + ',' + blue + ')',
    'rgba(' + red + ',' + green + ',' + blue + ', 0.95)',
    'rgba(' + red + ',' + green + ',' + blue + ' 0.5)',
    'rgba(' + red + ',' + green + ',' + blue + ', 0.55)'
  ];
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Growth Plot',
    },
  },
};



export default function Record(props: any) {
  const { investments, investmentPlan, annualInflation } = props;
  const [plan, setPlan] = React.useState<Investment[] | []>([]);

  const [selectedTagsGraph, setSelectedTagsGraph] = React.useState<string[]>([]);
  const [selectedTagsTable, setSelectedTagsTable] = React.useState<string[]>([]);
  const [allTagsGraph, setAllTagsGraph] = React.useState(false);
  const [allTagsTable, setAllTagsTable] = React.useState(false);
  const [colorPalette, setColorPalette] = React.useState(new Map());

  const handleClickChildElementGraph = (value: string) => {
    setAllTagsGraph(false);
    if (selectedTagsGraph.length > 0 && selectedTagsGraph.includes(value)) {
      setSelectedTagsGraph([...selectedTagsGraph.filter(e => e !== value)]);
    } else {
      setSelectedTagsGraph([...selectedTagsGraph, value]);
    }
  }

  const handleClickChildElementTable = (value: string) => {
    setAllTagsTable(false);
    if (selectedTagsTable.length > 0 && selectedTagsTable.includes(value)) {
      setSelectedTagsTable([...selectedTagsTable.filter(e => e !== value)]);
    } else {
      setSelectedTagsTable([...selectedTagsTable, value]);
    }
  }

  function onlyUnique(value: any, index: any, self: string | any[]) {
    return self.indexOf(value) === index;
  }

  const [labels, setLabels] = React.useState<Date[] | []>([]);

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
      }
      const sumInvested = tagContainer.reduce((partialSum, a) => partialSum + a.investedAmount, 0);
      const sumCurrent = tagContainer.reduce((partialSum, a) => partialSum + a.currentValue, 0);
      actuals = actuals.filter(e => e.recordDate.toDateString() !== allThings[i].recordDate.toDateString());
      actuals = [...actuals, {
        investedAmount: sumInvested,
        currentValue: sumCurrent,
        tag: "Actual",
        recordDate: allThings[i].recordDate
      }];
    }
    allThings = [...allThings, ...actuals];
    allThings.sort(compareInvestment);
    setPlan(allThings);
    let dateLabels = allThings.map(e => e.recordDate.toDateString()).filter(onlyUnique).map(e => new Date(e));
    setLabels(dateLabels);
  }, [investments, annualInflation, investmentPlan]);

  React.useEffect(() => {
    console.log("labels", labels);
  }, [labels]);

  React.useEffect(() => {
    console.log("plan", plan);
    setAllTagsGraph(true);
    setAllTagsTable(true);
    setSelectedTagsTable([
      ...plan
        .map((e: { tag: any; }) => e.tag)
        .filter(onlyUnique)
    ]);
    setSelectedTagsGraph([
      ...plan
        .map((e: { tag: any; }) => e.tag)
        .filter(onlyUnique)
    ]);
    plan
      .map((e: { tag: any; }) => e.tag)
      .filter(onlyUnique)
      .forEach(e => {
        setColorPalette(map => new Map(map.set(e, random_rgba())))
      })
  }, [plan]);

  React.useEffect(() => {
    console.log("selectedTagsGraph", selectedTagsGraph);
  }, [selectedTagsGraph]);

  React.useEffect(() => {
    console.log("selectedTagsTable", selectedTagsTable);
  }, [selectedTagsTable]);

  React.useEffect(() => {
    console.log("colorPalette", colorPalette);
  }, [colorPalette]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: "100%", marginY: "5px" }}>
        {
          investmentPlan.length === 0 ?
            <Typography variant="h4" component="h3" gutterBottom>
              Please create a plan first!!!
            </Typography>
            :
            <>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ width: "100%", marginY: "5px" }}>
                  <Stack
                    direction="column"
                    spacing={1}
                    alignItems="center">
                    <Chip
                      // sx={{ width: "20px" }}
                      label="Select All"
                      variant={allTagsGraph ? 'filled' : 'outlined'}
                      onClick={() => {
                        if (!allTagsGraph) {
                          setSelectedTagsGraph([
                            ...plan
                              .map((e: { tag: any; }) => e.tag)
                              .filter(onlyUnique)
                          ]);
                        } else {
                          setSelectedTagsGraph([]);
                        }
                        setAllTagsGraph(!allTagsGraph);
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      {
                        plan
                          .map((e: { tag: any; }) => e.tag)
                          .filter(onlyUnique)
                          .map(e =>
                            <Chip
                              key={e}
                              label={e}
                              variant={selectedTagsGraph.includes(e) ? 'filled' : 'outlined'}
                              onClick={() => handleClickChildElementGraph(e)}
                            />
                          )
                      }
                    </Stack>
                  </Stack>
                </Box>
                <Box sx={{ width: "100%", marginY: "5px" }}>
                  <Line options={options}
                    data={
                      {
                        labels: labels.filter(e => e < addDays(new Date(), 180) && e > subDays(new Date(), 180)),
                        datasets: [
                          ...plan.map((e: { tag: any; }) => e.tag)
                            .filter(onlyUnique)
                            .filter(e => selectedTagsGraph.includes(e))
                            .reduce((p, e) => {
                              let values = plan.filter(el => el.tag === e);
                              let [borderColor, backgroundColor, c_borderColor, c_backgroundColor] = colorPalette.get(e);
                              return [
                                ...p,
                                {
                                  label: e + ':Invested',
                                  data: labels
                                    .filter(e => e < addDays(new Date(), 180) && e > subDays(new Date(), 180))
                                    .map(el => {
                                      let ik = values.findIndex(e => e.recordDate.toDateString() === el.toDateString());
                                      return ik >= 0 ? values[ik].investedAmount : null;
                                    }),
                                  borderColor,
                                  backgroundColor,
                                },
                                {
                                  label: e + ':Current',
                                  data: labels
                                    .filter(e => e < addDays(new Date(), 180) && e > subDays(new Date(), 180))
                                    .map(el => {
                                      let ik = values.findIndex(e => e.recordDate.toDateString() === el.toDateString());
                                      return ik >= 0 ? values[ik].currentValue : null;
                                    }),
                                  borderColor: c_borderColor,
                                  backgroundColor: c_backgroundColor,
                                }
                              ]
                            }, [])
                        ]
                      }
                    }
                  />
                </Box>
              </Box>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ width: "100%", marginY: "5px" }}>

                  <Box sx={{ width: "100%", marginY: "5px" }}>
                    <Stack
                      direction="column"
                      spacing={1}
                      alignItems="center">
                      <Chip
                        // sx={{ width: "20px" }}
                        label="Select All"
                        variant={allTagsTable ? 'filled' : 'outlined'}
                        onClick={() => {
                          if (!allTagsTable) {
                            setSelectedTagsTable([
                              ...plan
                                .map((e: { tag: any; }) => e.tag)
                                .filter(onlyUnique)
                            ]);
                          } else {
                            setSelectedTagsTable([]);
                          }
                          setAllTagsTable(!allTagsTable);
                        }}
                      />
                      <Stack direction="row" spacing={1}>
                        {
                          plan
                            .map((e: { tag: any; }) => e.tag)
                            .filter(onlyUnique)
                            .map(e =>
                              <Chip
                                key={e}
                                label={e}
                                variant={selectedTagsTable.includes(e) ? 'filled' : 'outlined'}
                                onClick={() => handleClickChildElementTable(e)}
                              />
                            )
                        }
                      </Stack>
                    </Stack>
                  </Box><Box sx={{ width: "100%", marginY: "5px" }}>
                    <TableContainer component={Paper}>
                      <Table aria-label="investment table" >
                        <TableHead>
                          <TableRow>
                            <TableCell>Recorded On</TableCell>
                            <TableCell align="right">Tag</TableCell>
                            <TableCell align="right">Invested</TableCell>
                            <TableCell align="right">To Pay</TableCell>
                            <TableCell align="right">Current Value</TableCell>
                            <TableCell align="right">To Earn</TableCell>
                            <TableCell align="right">V/P</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            plan
                              .filter(e => selectedTagsTable.includes(e.tag))
                              .filter(e => { return e.tag === 'Planned' || e.recordDate < new Date() })
                              .map((row: Investment, index: number) => {
                                let fk = 0;
                                if (row.tag === 'Planned') {
                                  fk = plan.findIndex(e => e.tag === 'Actual' && e.recordDate.toDateString() === row.recordDate.toDateString());
                                  return (
                                    <TableRow key={index} sx={{ backgroundColor: row.recordDate > new Date() ? '#b2ebf2' : '#b2dfdb' }}>
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
                                      <TableCell align="right">{row.investedAmount > 0 ? parseFloat((row.currentValue / row.investedAmount).toFixed(2)) : 0}</TableCell>
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
                                    <TableCell align="right">{row.investedAmount > 0 ? parseFloat((row.currentValue / row.investedAmount).toFixed(2)) : 0}</TableCell>
                                  </TableRow>
                                );
                              })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Box>
            </>
        }
      </Box>
    </LocalizationProvider>
  );
}
