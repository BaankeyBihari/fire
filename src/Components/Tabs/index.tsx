import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import Reducer from '@components/Reducer/reducer';
import InitialState, { Inflation, Investment } from '@components/Reducer/initialState';

import Plan from "@components/Tabs/plan";
import Record from '@components/Tabs/record';
import Status from '@components/Tabs/status';
import ActionName from "@components/Reducer/actions";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function ColorTabs() {
  const [tabValue, setTabValue] = React.useState('plan');
  const [state, dispatch] = React.useReducer(Reducer, InitialState);

  React.useEffect(() => {
    console.log("Current State", state)
  }, [state])

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const updatePlan = (
    startDate: Date,
    retireDate: Date,
    startingSIP: number,
    incomeAtMaturity: number,
    currency: string,
    expectedAnnualInflation: number,
    expectedGrowthRate: number,
    sipGrowthRate: number
  ) => {
    dispatch({
      actionType: ActionName.UPDATE_PLAN,
      payload: {
        startDate,
        retireDate,
        startingSIP,
        incomeAtMaturity,
        currency,
        expectedAnnualInflation,
        expectedGrowthRate,
        sipGrowthRate
      }
    })
  }

  const updateInvestments = (
    investments: Investment[]
  ) => {
    dispatch({
      actionType: ActionName.UPDATE_INVESTMENTS,
      payload: {
        investments
      }
    })
  }

  const updateAnualInflation = (
    annualInflation: Inflation[]
  ) => {
    dispatch({
      actionType: ActionName.UPDATE_INFLATION,
      payload: {
        annualInflation
      }
    })
  }

  const handleSaveToPC = (jsonData: any, filename: string) => {
    const fileData = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.json`;
    link.href = url;
    link.click();
  }

  const fileField = React.useRef<HTMLInputElement>(null)

  const upload = (e: any) => {
    e.preventDefault()
    if (fileField.current !== null) {
      fileField.current.click();
    }
  }

  const openFile = (evt: any) => {
    let status = [] // Status output
    const fileObj = evt.target.files[0]
    const reader = new FileReader()

    let fileloaded = (e: any) => {
      // e.target.result is the file's content as text
      const fileContents = e.target.result
      status.push(
        `File name: "${fileObj.name}". Length: ${fileContents.length} bytes.`
      )
      // Show first 80 characters of the file
      let jsonData = JSON.parse(fileContents)
      jsonData.startDate = new Date(jsonData.startDate)
      jsonData.retireDate = new Date(jsonData.retireDate)
      jsonData.investmentPlan = jsonData.investmentPlan.map((e: any) => {
        e.recordDate = new Date(e.recordDate)
        return e
      })
      jsonData.investments = jsonData.investments.map((e: any) => {
        e.recordDate = new Date(e.recordDate)
        return e
      })
      jsonData.annualInflation = jsonData.annualInflation.map((e: any) => {
        e.recordDate = new Date(e.recordDate)
        return e
      })
      dispatch({
        actionType: ActionName.LOAD,
        payload: jsonData
      })
    }

    // Mainline of the method
    fileloaded = fileloaded.bind(evt)
    reader.onload = fileloaded
    reader.readAsText(fileObj)
  }

  function getDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day =`${date.getDate()}`.padStart(2, '0');
    return `${year}${month}${day}`
  }

  return (
    <>
      <Stack spacing={2} direction="row">
        <Button variant="outlined" onClick={upload}>Import</Button>
        <input
          type="file"
          style={{ display: "none" }}
          multiple={false}
          accept=".json,application/json"
          onChange={(evt) => openFile(evt)}
          ref={fileField}
        />
        <Button variant="outlined" onClick={() => {
          handleSaveToPC(state, `fire_${getDateString()}`);
        }}>Export</Button>
      </Stack>
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="plan, organize and status"
          centered
          variant="fullWidth"
        >
          <Tab value="plan" label="Make Plan" icon={<FormatListBulletedIcon />} iconPosition="start" />
          <Tab value="record" label="Record Events" icon={<AddShoppingCartIcon />} iconPosition="start" />
          <Tab value="status" label="Status" icon={<SummarizeIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      {tabValue == 'plan' ?
        <Plan
          startDate={state.startDate}
          retireDate={state.retireDate}
          startingSIP={state.startingSIP}
          incomeAtMaturity={state.incomeAtMaturity}
          currency={state.currency}
          expectedAnnualInflation={state.expectedAnnualInflation}
          expectedGrowthRate={state.expectedGrowthRate}
          sipGrowthRate={state.sipGrowthRate}
          dispatch={updatePlan}
        /> : null
      }
      {tabValue == 'record' ?
        <Record
          investments={state.investments}
          dispatchInvestment={updateInvestments}
          annualInflation={state.annualInflation}
          dispatchAnnualInflation={updateAnualInflation}
        /> : null
      }
      {tabValue == 'status' ?
        <Status
          investments={state.investments}
          annualInflation={state.annualInflation}
          investmentPlan={state.investmentPlan}
        /> : null
      }
    </>
  );
}
