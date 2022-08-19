import './DataInput.css';
import {useEffect, useState} from 'react'; 
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import Grid from '@mui/material/Grid';  
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


export default function DataInput(props) {
  const scenario = props.scenario
   useEffect(()=>{
      //  console.log('curr scenario',scenario)
   }, [scenario]);
  
   const renderRow = (ind) => {
    var cells = []

    Object.entries(props.scenario.data_input.df_parameters[props.category]).forEach(function([key, value]) {
      cells.push(value[ind])
    });

    return (cells.map( (value, index) => {
      return <TableCell style={index === 0 ? {backgroundColor: "#f4f4f4", border:"1px solid #ddd"} : {border:"1px solid #ddd"}}>{value}</TableCell>
    }))
  }

   const renderRows = () => {
    console.log('inside render rows')
    const rows = []
    let len = props.scenario.data_input.df_parameters[props.category][Object.keys(props.scenario.data_input.df_parameters[props.category])[0]].length
    console.log("length is",len)
    for (let i = 0; i < len; i++) {
      rows.push(renderRow(i))
    }

    return (rows.map( (value, index) => {
      return <TableRow>{value}</TableRow>
    }))
  }

  return ( 
    /* 
      this works for sets - which are all lists 
    */
    // <Box style={{backgroundColor:'white'}} sx={{overflow: "hidden",textOverflow: "ellipsis", m:3, padding:2, boxShadow:3}}>
    //   <h3>{props.category}</h3>
    //   {JSON.stringify(scenario.data_input.df_sets[props.category])}
    // </Box>

    // this works for parameters - which are tables
    <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflowX:'auto'}}>
      <Grid container>
        <Grid item xs={6}>
          <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
            <h3>{props.category}</h3>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', marginRight:'10px'}}>
            <IconButton aria-label="filter">
              <FilterListIcon></FilterListIcon>
            </IconButton>
            <p>Filter</p>
          </Box>
        </Grid>
      </Grid>
      
      <Table style={{border:"1px solid #ddd"}} size='small'>
        <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
        <TableRow>
        {Object.entries(props.scenario.data_input.df_parameters[props.category]).map( ([key, value]) => {
          return <TableCell style={{color:"white"}}>{key}</TableCell>
        })}
        </TableRow>
        </TableHead>
        <TableBody>
        {renderRows()}
        </TableBody>
      </Table>
    </Box>
  );

}


