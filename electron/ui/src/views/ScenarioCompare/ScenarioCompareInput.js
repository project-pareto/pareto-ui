import './DataInput.css';
import React from 'react';
import {useEffect, useState} from 'react';
import { Grid, Box, FormControl, MenuItem, Select, Button, Typography } from '@mui/material';
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';
import ErrorBar from '../../components/ErrorBar/ErrorBar'
import DataTable from '../../components/DataTable/DataTable';

export default function ScenarioCompareInput(props) {
    const {primaryScenario, referenceScenario, category } = props


  const renderInputCategory = () => {
    try {
      /*
        else, return table for input category dictionary
      */

        return (
          <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
        <Grid container>
          <Grid item xs={0.5}>
          </Grid>
          <Grid item xs={11}>
            <DataTable
                section="compare"
                category={category}
                primaryData={primaryScenario.data_input.df_parameters}
                referenceData={referenceScenario.data_input.df_parameters}
            />
          </Grid>
          <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
            
            </Box>
          </Grid>
        </Grid>
        </Box>
        )
      
    } catch (e) {
      console.error("unable to render input category: ",e)
    }
}
  return ( 
    renderInputCategory()
  );

}


