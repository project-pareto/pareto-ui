import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';


export default function Optimization(props) {
  const scenario = props.scenario
   useEffect(()=>{
      //  console.log('curr scenario',scenario)
   }, [scenario]);
  
  return ( 
    <Box>
      <Button onClick={props.handleRunModel}>
        run model
      </Button>      
    </Box>
  );

}


