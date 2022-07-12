import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';


export default function ModelResults(props) {
  const scenario = props.scenario
   useEffect(()=>{
       console.log('curr scenario',scenario)
   }, [scenario]);
  
  return ( 
    <Box>
      model results      
    </Box>
  );

}


