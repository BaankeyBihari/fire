import * as React from 'react';
import type {NextPage} from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Copyright from '@components/Copyright';
import Tabs from '@components/Tabs';

const Home: NextPage = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          FIRE
        </Typography>
        <Typography variant="h2" component="h2" gutterBottom>
          Financial Independence, Retire Early
        </Typography>
        <Tabs />
        <Copyright />
      </Box>
    </Container>
  );
};

export default Home;
