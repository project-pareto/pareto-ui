import React from 'react';
import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



export default function Bottombar(props) {
    const [ disableOptimize, setDisableOptimize ] = useState(false) 
    useEffect(() => {
        /*
            if the current scenario is already being optimized OR if there are multiple optimizations
            currently running, then we disable the ability to optimize the current scenario
        */
       try{
        let tasks = props.backgroundTasks
        if ((tasks.length > 1) || (!["none", "failure", "complete"].includes(props.scenario.results.status))) {
            console.log('optimized is disabled')
            setDisableOptimize(true)
        } else {
            console.log('optimized is enabled')
            setDisableOptimize(false)
        }
       } catch(e){
        console.error("unable to check for background tasks from bottom bar : ",e)
       }
        
    },[props])
    const styles = {
        filled: {
            backgroundColor: '#01678f',
            '&:hover': {
                backgroundColor: '#01678f',
                opacity: 0.9
            },
        },
        unfilled: {
            color: '#595959'
        }
    }

  return ( 
    <Box sx={{ width: 500 }}>
      <CssBaseline />
      <Paper sx={{ position: 'fixed', bottom: 0, left: '0px', right: 0, height: '60px', zIndex: 1500 }} elevation={3}>
          {props.scenario ? 
            <Grid container sx={{marginTop: '10px'}}>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
                        {props.section === 1 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}>back </Button>}
                        {props.section === 2 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}> review inputs &amp; settings </Button>}
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                        {props.section === 0 && <Button sx={styles.filled} onClick={() => props.handleSelection(1)} variant="contained" size="large" endIcon={<ArrowForwardIcon /> }> continue to optimization </Button>}
                        {props.section === 1 && <Button onClick={props.handleRunModel} sx={styles.filled} variant="contained" size="large" disabled={disableOptimize ? true : false} endIcon={<ArrowForwardIcon /> }> Optimize </Button>}
                    </Box>
                </Grid>
            </Grid>
          : 
          null}
        
      </Paper>
    </Box>
  );

}


