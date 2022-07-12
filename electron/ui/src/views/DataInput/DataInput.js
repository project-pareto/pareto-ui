import './DataInput.css';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';


export default function DataInput(props) {
  const scenario = props.scenario
   useEffect(()=>{
       console.log('curr scenario',scenario)
   }, [scenario]);
  
  return ( 
    <Box>
      data input
    </Box>
  );

}


