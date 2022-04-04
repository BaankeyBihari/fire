import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SummarizeIcon from '@mui/icons-material/Summarize';

export default function ColorTabs() {
  const [value, setValue] = React.useState('one');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="organize and view records"
        centered
        variant="fullWidth"
      >
        <Tab value="plan" label="Make Plan" icon={<FormatListBulletedIcon />} iconPosition="start" />
        <Tab value="investment" label="Record Investment" icon={<AddShoppingCartIcon />} iconPosition="start" />
        <Tab value="trajectory" label="View Trajectory" icon={<SummarizeIcon />} iconPosition="start" />
      </Tabs>
    </Box>
  );
}
