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
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import demoInputDiagram from "../../assets/demo_figure_input.png";
import AreaChart from '../../components/AreaChart/AreaChart'
import { Button } from '@mui/material';

export default function DataInput(props) {
  const [ scenario, setScenario] = useState({...props.scenario})
  const [ editDict, setEditDict ] = useState({})
  const [ plotCategory, setPlotCategory ] = useState("CompletionsDemand")
  const plotCategoryDictionary  = {
                                "CompletionsDemand": "CompletionsPads",
                                "PadRates": "ProductionPads",
                                "FlowbackRates": "CompletionsPads"
                                  }
  var keyIndexMapping = {}

  const styles ={
    firstCol: {
      backgroundColor: "#f4f4f4", 
      border:"1px solid #ddd",
      position: 'sticky',
      left: 0,

    },
    other: {
      minWidth: 100,
      border:"1px solid #ddd"
    }
  }

  useEffect(()=>{
    console.log('datainput use effect has been triggered')
    // scenario.data_input.df_parameters[props.category]
    try {
      if (props.category != "Plots" && props.category != "Network Diagram") {
        let tempEditDict = {}
        {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], ind) => {
          scenario.data_input.df_parameters[props.category][key].map( (value, index) => {
            tempEditDict[""+ind+":"+index] = false
          })
        })}
        setEditDict(tempEditDict)
      }
    } catch (e) {
      console.error('unable to set edit dictionary: ',e)
    }
    let tempScenario = {}
    Object.assign(tempScenario, props.scenario);
    setScenario(tempScenario)
    
  }, [props.category]);
  
   const handlePlotCategoryChange = (event) => {
    setPlotCategory(event.target.value)
   }

  const handleSaveChanges = () => {
    //api call to save changes on backend
    // setEdited(false)
    props.handleEditInput(false)
    props.handleUpdateExcel(scenario.id, props.category, scenario.data_input.df_parameters[props.category])
    
    let tempEditDict = {}
    {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], ind) => {
      scenario.data_input.df_parameters[props.category][key].map( (value, index) => {
        tempEditDict[""+ind+":"+index] = false
      })
    })}
    setEditDict(tempEditDict)
    
   }

   const handleDoubleClick = (ind, index) => {
    if(editDict[""+ind+":"+index]) {
      let tempEditDict = {...editDict}
      tempEditDict[""+ind+":"+index] = false
      setEditDict(tempEditDict)
    } else {
      let tempEditDict = {...editDict}
      tempEditDict[""+ind+":"+index] = true
      setEditDict(tempEditDict)
      props.handleEditInput(true)
      // setEdited(true)
    }
    
   }

   const handleChangeValue = (event) => {
    let inds = event.target.getAttribute('name').split(":")
    //ind[0] is the index inside the array
    //ind[1] corresponds with the key. need to get that key name somehow
    let ind = parseInt(inds[0])
    let colName = keyIndexMapping[parseInt(inds[1])]
    let tempScenario = {...scenario}
    tempScenario.data_input.df_parameters[props.category][colName][ind] = event.target.value
    setScenario(tempScenario)
   }
  
  const renderRow = (ind) => {
      var cells = []

      Object.entries(scenario.data_input.df_parameters[props.category]).forEach(function([key, value]) {
        cells.push(value[ind])
      });

      return (cells.map( (value, index) => {
        return (
          <Tooltip title={editDict[""+ind+":"+index] ? "Doubleclick to save value" : "Doubleclick to edit value"} arrow>
          <TableCell onDoubleClick={() => handleDoubleClick(ind, index)} key={index} style={index === 0 ? styles.firstCol : styles.other}>
          {editDict[""+ind+":"+index] ? 
            index === 0 ? value : <TextField name={""+ind+":"+index} size="small" label={""} defaultValue={value} onChange={handleChangeValue}/>
            :
            value
          }
          </TableCell>
          </Tooltip>
        )
        
      }))
  }

  const renderRows = () => {
      const rows = []
      let len = scenario.data_input.df_parameters[props.category][Object.keys(scenario.data_input.df_parameters[props.category])[0]].length
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
          return (
            <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
              <Box display="flex" justifyContent="center" sx={{marginBottom:"20px"}}>
                <FormControl sx={{ width: "30ch" }} size="small">
                    <Select
                    value={plotCategory}
                    onChange={handlePlotCategoryChange}
                    sx={{color:'#0b89b9', fontWeight: "bold"}}
                    >
                    <MenuItem key={0} value={"CompletionsDemand"}>Completion Pad Demand</MenuItem>
                    <MenuItem key={1} value={"PadRates"}>Production Forecast</MenuItem>
                    <MenuItem key={2} value={"FlowbackRates"}>Flowback Forecast</MenuItem>
                    </Select>
                </FormControl>
            </Box>
                <AreaChart
                  input
                  category={plotCategoryDictionary[plotCategory]}
                  data={scenario.data_input.df_parameters[plotCategory]} 
                  title={plotCategory}
                  xaxis={{titletext: "Planning Horizon (weeks)"}}
                  yaxis={{titletext: "Amount of Water (bbl/week)"}}
                  width={750}
                  height={500}
                  showlegend={true}
                />
            </Box>
            )
        
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
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
            {/* <h3><Button style={{color:"#0884b4"}} onClick={handleClickEdit}>{editable ? "Save Values" : "Edit Values"}</Button></h3> */}
            {props.edited && <h3><Button style={{color:"#0884b4"}} onClick={handleSaveChanges}>Save Changes</Button></h3> }
            </Box>
          </Grid>
        </Grid>
        <TableContainer sx={{overflowX:'auto'}}>
        <Table style={{border:"1px solid #ddd"}} size='small'>
          <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
          <TableRow>
          {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], index) => {
            keyIndexMapping[index] = key
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


