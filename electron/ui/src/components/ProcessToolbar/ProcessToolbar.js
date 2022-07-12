import {useEffect, useState} from 'react';   
import Grid from '@mui/material/Grid';
import {  } from "react-router-dom";
import InputIcon from '@mui/icons-material/Input';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';


export default function ScenarioPage(props) {

    const styles = {
    iconSelected: {
        backgroundColor:'#6094bc', 
        color: 'white'
    },
    textSelected: {
        fontWeight: 'bold'
    },
   }
  
  return ( 
      <>
      <Grid item xs={2}>
        <IconButton style={props.selected === 0 ? styles.iconSelected : null} onClick={() => props.handleSelection(0)}>
            <InputIcon fontSize="large"></InputIcon>
        </IconButton>
        <p style={props.selected === 0 ? styles.textSelected : null}>Data Input</p>
      </Grid>
      <Grid item xs={2}>
        <IconButton style={props.selected === 1 ? styles.iconSelected : null} onClick={() => props.handleSelection(1)}>
            <SettingsIcon fontSize="large"></SettingsIcon>
        </IconButton>
        <p style={props.selected === 1 ? styles.textSelected : null}>Optimization Setup</p>
      </Grid>
      <Grid item xs={2}>
        <IconButton style={props.selected === 2 ? styles.iconSelected : null} onClick={() => props.handleSelection(2)}>
            <PieChartIcon fontSize="large"></PieChartIcon>
        </IconButton>
        <p style={props.selected === 2 ? styles.textSelected : null}>Model Results</p>
      </Grid>
      <Grid item xs={6}>
        
      </Grid>
      </>
  );

}


