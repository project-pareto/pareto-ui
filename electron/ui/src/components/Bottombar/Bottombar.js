import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



export default function Bottombar(props) {
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
      <Paper sx={{ position: 'fixed', bottom: 0, left: '240px', right: 0, height: '60px' }} elevation={3}>
          {props.scenario ? 
            <Grid container sx={{marginTop: '10px'}}>
                <Grid xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
                        {props.section === 1 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}>back </Button>}
                        {props.section === 2 && <Button sx={styles.unfilled} onClick={() => props.handleSelection(0)} size="large" startIcon={<ArrowBackIcon />}> review inputs &amp; settings </Button>}
                    </Box>
                </Grid>
                <Grid xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
                        {props.section === 0 && <Button sx={styles.filled} onClick={() => props.handleSelection(1)} variant="contained" size="large" endIcon={<ArrowForwardIcon /> }> continue to optimization </Button>}
                        {props.section === 1 && <Button sx={styles.filled} variant="contained" size="large" endIcon={<ArrowForwardIcon /> }> run model </Button>}
                    </Box>
                </Grid>
            </Grid>
          : 
          null}
        
      </Paper>
    </Box>
  );

}


