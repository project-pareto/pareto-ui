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
import { getCompletionsDemandPlot } from '../../services/homepage.service'


export default function DataInput(props) {
  const [ plotHtml, setPlotHtml ] = useState(null)
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

  const scenario = props.scenario
   useEffect(()=>{
    getCompletionsDemandPlot(scenario.id)
    .then(response => {
    if (response.status === 200) {
        response.json()
        .then((data)=>{
          console.log('got plot: ',data)
          
          // setPlotHtml({__html: data.plot})
          setPlotHtml(data.plot)
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
      if(props.category === "Completion Demand Plot") {
        if (plotHtml) {
          return (
            <Box style={{backgroundColor:'white', height:"505px"}} sx={{m:3, padding:2, boxShadow:3}}>
              {/* <span dangerouslySetInnerHTML={plotHtml}></span> */}
              <iframe style={{width: '100%', height:"100%"}} srcdoc={plotHtml}></iframe>
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


