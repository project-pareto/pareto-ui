import './DataInput.css';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';


export default function DataInput(props) {
  const scenario = props.scenario
   useEffect(()=>{
      //  console.log('curr scenario',scenario)
   }, [scenario]);
  
  return ( 
    <Box style={{backgroundColor:'white'}} sx={{overflow: "hidden",textOverflow: "ellipsis", m:3, padding:2, boxShadow:3}}>
      <h3>{props.category}</h3>
      {JSON.stringify(scenario.data_input.df_sets[props.category])}
    </Box>
  );

}


