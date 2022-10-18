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
import TableContainer from '@mui/material/TableContainer';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getPlots } from '../../services/homepage.service'
import demoInputDiagram from "../../assets/demo_figure_input.png";

export default function DataInput(props) {
  const scenario = props.scenario
  const [ plotHtml, setPlotHtml ] = useState({})
  const [ plotCategory, setPlotCategory ] = useState("Completion Pad Demand")
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
  
   useEffect(()=>{
    getPlots(scenario.id)
    .then(response => {
    if (response.status === 200) {
        response.json()
        .then((data)=>{
          console.log('got plot: ',data)
          setPlotHtml(data)
        }).catch((err)=>{
            console.error("error on plot fetch: ",err)
        })
    }
    /*
      in the case plot doesnt exist
    */
    else if (response.status === 500) {
      console.error("error on plot fetch: ",response.statusText)
    }
    })
   }, [scenario]);

   const handlePlotCategoryChange = (event) => {
    setPlotCategory(event.target.value)
   }
  
  const renderRow = (ind) => {
      var cells = []

      Object.entries(props.scenario.data_input.df_parameters[props.category]).forEach(function([key, value]) {
        cells.push(value[ind])
      });

      return (cells.map( (value, index) => {
        return <TableCell key={index} style={index === 0 ? styles.firstCol : styles.other}>{value}</TableCell>
      }))
  }

  const renderRows = () => {
      const rows = []
      let len = props.scenario.data_input.df_parameters[props.category][Object.keys(props.scenario.data_input.df_parameters[props.category])[0]].length
      for (let i = 0; i < len; i++) {
        rows.push(renderRow(i))
      }

      return (rows.map( (value, index) => {
        return <TableRow>{value}</TableRow>
      }))
  }

  const renderInputCategory = () => {
    try {
      /*
        if category is plots, return input plots
      */
      if(props.category === "Plots") {
        if (Object.keys(plotHtml).length) {
          return (
            <Box style={{backgroundColor:'white', height:"560px"}} sx={{m:3, padding:2, boxShadow:3}}>
              <Box display="flex" justifyContent="center" sx={{marginBottom:"20px"}}>
                <FormControl sx={{ width: "30ch" }} size="small">
                    <Select
                    value={plotCategory}
                    onChange={handlePlotCategoryChange}
                    sx={{color:'#0b89b9', fontWeight: "bold"}}
                    >
                    <MenuItem key={0} value={"Completion Pad Demand"}>Completion Pad Demand</MenuItem>
                    <MenuItem key={1} value={"Production Forecast"}>Production Forecast</MenuItem>
                    <MenuItem key={2} value={"Flowback Forecast"}>Flowback Forecast</MenuItem>
                    </Select>
                </FormControl>
            </Box>
              <iframe style={{width: '100%', height:"90%"}} srcdoc={plotHtml[plotCategory]}></iframe>
            </Box>
            )
        } else {
          return (
            <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
              <h1>No plot found!</h1>
            </Box>
            )
        }
        
      }
      /*
        if category is network diagram, return demo image
      */
        else if(props.category === "Network Diagram"){
          return (
            <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflow: "scroll"}}>
              <img style={{height:"500px"}} src={demoInputDiagram}></img>
            </Box>
          )
        }
      /*
        else, return table for input category dictionary
      */
      else {
        return (
          <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
        <Grid container>
          <Grid item xs={6}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
              <h3>{props.category}</h3>
            </Box>
          </Grid>
          <Grid item xs={6}>
  
          </Grid>
        </Grid>
        <TableContainer sx={{overflowX:'auto'}}>
        <Table style={{border:"1px solid #ddd"}} size='small'>
          <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
          <TableRow>
          {Object.entries(props.scenario.data_input.df_parameters[props.category]).map( ([key, value], index) => {
            return (
              index === 0 ? 
             <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc"}}>{key}</TableCell> 
            : 
             <TableCell style={{color:"white"}}>{key}</TableCell>
            )
          })}
          </TableRow>
          </TableHead>
          <TableBody>
          {renderRows()}
          </TableBody>
        </Table>
        </TableContainer>
        </Box>
        )
      }
      
    } catch (e) {
      console.error("unable to render input category: ",e)
    }
    
}

  return ( 
      renderInputCategory()
  );

}


