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
    <>
    {props.scenario.results.status === "complete" ? 

    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
      <h3>{props.category}</h3>
      
      <>
      <Table style={{border:"1px solid #ddd"}} size='small'>
        <TableHead>
        <TableRow>
        {props.scenario.results.data[props.category][0].map((value, index) => {
          return <TableCell>{value}</TableCell>
        })}
        </TableRow>
        </TableHead>
       <TableBody>
        {props.scenario.results.data[props.category].slice(1).map((value, index) => {
          return (<TableRow>
          {value.map((cellValue, i)=> {
            return <TableCell>{cellValue}</TableCell>
          })}
          </TableRow>)
        })}
        </TableBody>
      </Table>
      </>
      
      
    </Box>
    : 
      <h3>Status: {props.scenario.results.status}</h3>
    }
    </>
  );

}


