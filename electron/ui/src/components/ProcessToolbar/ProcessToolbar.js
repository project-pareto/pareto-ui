import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputIcon from '@mui/icons-material/Input';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';
import Divider from '@mui/material/Divider';


export default function ProcessToolbar(props) {

    const styles = {
    iconSelected: {
        backgroundColor:'#6094bc', 
        color: 'white'
    },
    textSelected: {
        fontWeight: 'bold',
        margin:'0'
    },
    textUnselected: {
      margin:'0'
  },
    shiftTextRight: {
      paddingLeft: '240px'
    },
   }
  return ( 
    <Box sx={{position: 'sticky', top:'71px', backgroundColor:"white", zIndex:'1'}}>
      <Grid container>
      <Grid item xs={1.8} >
        <IconButton aria-label="data_input" sx={{marginTop:'5px'}} style={props.selected === 0 ? styles.iconSelected : null} onClick={() => props.handleSelection(0)}>
            <InputIcon fontSize="large"></InputIcon>
        </IconButton>
        <p style={props.selected === 0 ? styles.textSelected : styles.textUnselected}>Data Input</p>
      </Grid>
      <Grid item xs={1.8}>
        <IconButton aria-label="optimization" sx={{marginTop:'5px'}} disabled={props.scenario ? false : true} style={props.selected === 1 ? styles.iconSelected : null} onClick={() => props.handleSelection(1)}>
            <SettingsIcon fontSize="large"></SettingsIcon>
        </IconButton>
        <p style={props.selected === 1 ? styles.textSelected : styles.textUnselected}>Optimization Setup</p>
      </Grid>
      <Grid item xs={1.8}>
        <IconButton aria-label="results" sx={{marginTop:'5px'}} disabled={props.scenario ? props.scenario.results.status !== "uninitiated" ? false : true : true} style={props.selected === 2 ? styles.iconSelected : null} onClick={() => props.handleSelection(2)}>
            <PieChartIcon fontSize="large"></PieChartIcon>
        </IconButton>
        <p style={props.selected === 2 ? styles.textSelected : styles.textUnselected}>Model Results</p>
      </Grid>
      <Grid item xs={6.6}>
        
      </Grid>
      <Divider aria-label="bottom_divider"></Divider>
      </Grid>
    </Box>
  );

}


