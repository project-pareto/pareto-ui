import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import SankeyPlot from './SankeyPlot';
import KPIDashboard from './KPIDashboard';
import demoOutputDiagram from "../../assets/demo_figure_output.png";


export default function ModelResults(props) {
  const scenario = props.scenario
   useEffect(()=>{
       console.log('curr scenario.results.data',scenario.results.data)
   }, [scenario]);

   const styles ={
    firstCol: {
      backgroundColor: "#f4f4f4", 
      border:"1px solid #ddd",
      position: 'sticky',
      left: 0,
    },
    other: {
      border:"1px solid #ddd"
    }
  }

  function toFixed(value, precision) {
    if(typeof(value) === "string") {
      try {
        value = parseInt(value)
      }catch (e) {
        console.log('unable to fix decimals for value: ',value)
        return value
      }
    }
    var precision = precision || 0,
        power = Math.pow(10, precision),
        absValue = Math.abs(Math.round(value * power)),
        result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

    if (precision > 0) {
        var fraction = String(absValue % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');
        result += '.' + padding + fraction;
    }
    return result;
}
  
  const renderOutputCategory = () => {
    try {
      /*
        if category is sankey, return sankey plot
      */
      if (props.category === "Sankey") {
        let sankeyData = {"v_F_Piped": props.scenario.results.data["v_F_Piped_dict"], "v_F_Trucked": props.scenario.results.data["v_F_Trucked_dict"], "v_F_Sourced": props.scenario.results.data["v_F_Sourced_dict"]}
        return (
            <SankeyPlot data={sankeyData} />
        )
      }
      /*
        if category is dashboard, return KPI dashboard
      */
      else if(props.category === "Dashboard"){
        return <KPIDashboard 
                  overviewData={props.scenario.results.data['v_F_Overview_dict']}
                  truckedData={props.scenario.results.data['v_F_Trucked_dict']}
                  pipedData={props.scenario.results.data['v_F_Piped_dict']}
                />
      }
      /*
        if category is network diagram, return demo image
      */
        else if(props.category === "Network Diagram"){
          return (
            <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflow: "scroll"}}>
              <img style={{height:"400px"}} src={demoOutputDiagram}></img>
            </Box>
          )
        }
      /*
        otherwise, return table for given category
      */
      else {
        return (
          <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
            <h3>{props.category}</h3>
            <TableContainer sx={{overflowX:'auto'}}>
            <Table style={{border:"1px solid #ddd"}} size='small'>
              <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
              <TableRow>
              {props.scenario.results.data[props.category][0].map((value, index) => {
                return <TableCell style={{backgroundColor:"#6094bc", color:"white"}}>{value}</TableCell>
              })}
              </TableRow>
              </TableHead>
              {props.category === "v_F_Overview_dict" ? 
              <TableBody>
              {props.scenario.results.data[props.category].slice(1).map((value, index) => {
                return (<TableRow>
                {value.map((cellValue, i)=> {
                  return <TableCell align={(i === (value.length - 1)) ? "right" : "left"} key={"" + index + i} style={i === 0 ? styles.firstCol : styles.other}>{(i === (value.length - 1)) ? toFixed(cellValue, 2) : cellValue}</TableCell>
                })}
                </TableRow>)
              })}
              </TableBody> 
              : 
              <TableBody>
              {props.scenario.results.data[props.category].slice(1).map((value, index) => {
                return (<TableRow>
                {value.map((cellValue, i)=> {
                  return <TableCell key={"" + index + i} style={i === 0 ? styles.firstCol : styles.other}>{cellValue}</TableCell>
                })}
                </TableRow>)
              })}
              </TableBody>
              }
            
            </Table>
            </TableContainer>
          </Box>
        )
      }
    } catch (e) {
      console.log('unable to render table for this category: ',e)
    }
  }


  return ( 
    <>
    {/*
      if a scenario has been optimized, show outputs
      otherwise, display the status of the optimization
    */}
    {props.scenario.results.status === "complete" ? 
      renderOutputCategory()
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


