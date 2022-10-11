import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
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
    <Grid container alignItems="center" justifyContent="center">
      <Grid item xs={3}>

      </Grid>
      <Grid item xs={6} style={{alignContent:"center", alignItems:"center", justifyContent:"center"}}>
        {props.scenario.results.status === "failure" ? 
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Optimization Failed</h2>
          <p>Error: <b>{props.scenario.results.error}</b></p>
        </Box> 
        : 
        
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Running Optimization</h2>
          <p>This process could take several minutes</p>
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <LinearProgress style={{width:"50%"}}/>
          </Box>
          
          <p>Status: <b>{props.scenario.results.status}</b></p>
          <Button onClick={() => props.handleSetSection(2)}>Refresh Status</Button>
        </Box>
        }
      </Grid>
      <Grid item xs={3}>

      </Grid>
    </Grid>
    
      
    }
    </>
  );

}


