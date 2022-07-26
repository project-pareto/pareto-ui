import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



export default function Bottombar(props) {

  return ( 
    <Box sx={{ width: 500 }}>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: '240px', right: 0, height: '60px' }} elevation={3}>
          {props.scenario ? 
            <Grid container sx={{marginTop: '10px'}}>
                <Grid xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
                        {props.section === 1 && <Button onClick={() => props.handleSelection(0)} size="large"><ArrowBackIcon />&nbsp; back </Button>}
                        {props.section === 2 && <Button onClick={() => props.handleSelection(0)} size="large"><ArrowBackIcon />&nbsp; review inputs &amp; settings </Button>}
                    </Box>
                </Grid>
                <Grid xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                        {props.section === 0 && <Button onClick={() => props.handleSelection(1)} variant="contained" size="large"> continue to optimization&nbsp; <ArrowForwardIcon /> </Button>}
                        {props.section === 1 && <Button variant="contained" size="large"> run model &nbsp; <ArrowForwardIcon /> </Button>}
                    </Box>
                </Grid>
            </Grid>
          : 
          null}
        
      </Paper>
    </Box>
  );

}


