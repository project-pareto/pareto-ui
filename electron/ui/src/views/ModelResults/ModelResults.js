import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
//import SankeyPlot from './SankeyPlot';


export default function ModelResults(props) {
  const scenario = props.scenario
   useEffect(()=>{
       console.log('curr scenario',scenario)
   }, [scenario]);
  
  return ( 
    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
      <h3>{props.category}</h3>
      {Object.keys(props.scenario.results).length !== 0 ? 
      <>
      <Table style={{border:"1px solid #ddd"}} size='small'>
        <TableHead>
        <TableRow>
        {props.scenario.results[props.category][0].map((value, index) => {
          return <TableCell>{value}</TableCell>
        })}
        </TableRow>
        </TableHead>
       <TableBody>
        {props.scenario.results[props.category].slice(1).map((value, index) => {
          return (<TableRow>
          {value.map((cellValue, i)=> {
            return <TableCell>{cellValue}</TableCell>
          })}
          </TableRow>)
        })}
        </TableBody>
      </Table>
      </>
      : 
      "model results loading"}
    </Box>
  );

}


