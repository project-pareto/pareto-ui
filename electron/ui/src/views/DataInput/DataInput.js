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
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';

export default function DataInput(props) {
  const [ scenario, setScenario] = useState({...props.scenario})
  const [ editDict, setEditDict ] = useState({})
  const [ columnNodesMapping, setColumnNodesMapping ] = useState([]) 
  const [ columnNodes, setColumnNodes ] = useState([])
  const [ filteredColumnNodes, setFilteredColumnNodes ] = useState([])
  const [ rowNodesMapping, setRowNodesMapping ] = useState([]) 
  const [ rowNodes, setRowNodes ] = useState([])
  const [ filteredRowNodes, setFilteredRowNodes ] = useState([])
  const [ plotCategory, setPlotCategory ] = useState("CompletionsDemand")
  const isAllColumnsSelected = columnNodesMapping.length > 0 && filteredColumnNodes.length === columnNodesMapping.length;
  const isAllRowsSelected = rowNodesMapping.length > 0 && filteredRowNodes.length === rowNodesMapping.length;
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
        let tempColumnNodes = {}
        let tempColumnNodesMapping = []
        let tempRowNodes = {}
        let tempRowNodesMapping
        {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], ind) => {
          if (ind === 0) {
            tempRowNodesMapping = value
            value.map ((v,i) => {
              tempRowNodes[v] = true
            })
          } else {
            tempColumnNodesMapping.push(key)
            tempColumnNodes[key] = true
          }
          scenario.data_input.df_parameters[props.category][key].map( (value, index) => {
            tempEditDict[""+ind+":"+index] = false
          })
        })}
        setEditDict(tempEditDict)
        setColumnNodes(tempColumnNodes)
        setRowNodes(tempRowNodes)
        setFilteredColumnNodes(tempColumnNodesMapping)
        setFilteredRowNodes(tempRowNodesMapping)
        setColumnNodesMapping(tempColumnNodesMapping)
        setRowNodesMapping(tempRowNodesMapping)
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

   const handleColumnFilter = (col) => {
    console.log('selected col',col)
    var tempCols
    let tempColumnNodes = {...columnNodes}
    if (col === 'all') {
      tempCols = filteredColumnNodes.length === columnNodesMapping.length ? [] : columnNodesMapping
      if (filteredColumnNodes.length === columnNodesMapping.length) {
        for (const [key, value] of Object.entries(tempColumnNodes)) {
          tempColumnNodes[key] = false
        }
      } else {
        for (const [key, value] of Object.entries(tempColumnNodes)) {
          tempColumnNodes[key] = true
        }
      }
      setColumnNodes(tempColumnNodes)
      setFilteredColumnNodes(tempCols);
    }
    else {
      tempCols = [...filteredColumnNodes]
      const index = tempCols.indexOf(col);
      if (index > -1) { // only splice array when item is found
        tempCols.splice(index, 1); // 2nd parameter means remove one item only
      } else{
        tempCols.push(col)
      }
      tempColumnNodes[col] = !tempColumnNodes[col]
      setColumnNodes(tempColumnNodes)
      setFilteredColumnNodes(tempCols)
    }
    
    
}

const handleRowFilter = (row) => {
    var tempRows
    let tempRowNodes = {...rowNodes}
    if (row === 'all') {
      tempRows = filteredRowNodes.length === rowNodesMapping.length ? [] : rowNodesMapping
      if (filteredRowNodes.length === rowNodesMapping.length) {
        for (const [key, value] of Object.entries(tempRowNodes)) {
          tempRowNodes[key] = false
        }
      } else {
        for (const [key, value] of Object.entries(tempRowNodes)) {
          tempRowNodes[key] = true
        }
      }
      setRowNodes(tempRowNodes)
      setFilteredRowNodes(tempRows);
    }
    else {
      tempRows = [...filteredRowNodes]
        const index = tempRows.indexOf(row);
        if (index > -1) { // only splice array when item is found
          tempRows.splice(index, 1); // 2nd parameter means remove one item only
        } else{
          tempRows.push(row)
        }
        tempRowNodes[row] = !tempRowNodes[row]
        setRowNodes(tempRowNodes)
        setFilteredRowNodes(tempRows)
    }
}
  
  const renderRow = (ind) => {
      var cells = []

      Object.entries(scenario.data_input.df_parameters[props.category]).forEach(function([key, value]) {
        cells.push(value[ind])
      });

      return (cells.map( (value, index) => {
        /*
          columnNodes[columnNodesMapping[index]] must be true
          UNLESS it's the first column (index is 0)
        */
       if (index ===0 || columnNodes[columnNodesMapping[index - 1]]) {
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
       }
        
        
      }))
  }

  const renderRows = () => {
      const rows = []
      let len = scenario.data_input.df_parameters[props.category][Object.keys(scenario.data_input.df_parameters[props.category])[0]].length
      for (let i = 0; i < len; i++) {
        rows.push(renderRow(i))
      }

      return (rows.map( (value, index) => {
         /*
          rowNodes[rowNodesMapping[index]] must equal true
        */
       if (rowNodes[rowNodesMapping[index]]) {
        return <TableRow>{value}</TableRow>
       }
        
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
          <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', marginLeft:'10px'}}>
              <h3>{props.category}</h3>
            </Box>
          </Grid>
          <Grid item xs={11}>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <TableContainer sx={{overflowX:'auto', marginTop:10}}>
            <Table style={{border:"1px solid #ddd"}} size='small'>
              <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
              <TableRow>
              {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], index) => {
                keyIndexMapping[index] = key
                if (index === 0 || columnNodes[key]) {
                  return (
                    index === 0 ? 
                  <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc"}}>{key}</TableCell> 
                  : 
                  <TableCell style={{color:"white"}}>{key}</TableCell>
                  )
                }
                
              })}
              </TableRow>
              </TableHead>
              <TableBody>
              {renderRows()}
              </TableBody>
            </Table>
            </TableContainer>
            </Box>
          </Grid>
          <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
            {props.edited && <h3><Button style={{color:"#0884b4"}} onClick={handleSaveChanges}>Save Changes</Button></h3> }
            <FilterDropdown
                width="200px"
                maxHeight="300px"
                option1="Column"
                filtered1={filteredColumnNodes}
                total1={columnNodesMapping}
                isAllSelected1={isAllColumnsSelected}
                handleFilter1={handleColumnFilter}
                option2="Row"
                filtered2={filteredRowNodes}
                total2={rowNodesMapping}
                isAllSelected2={isAllRowsSelected}
                handleFilter2={handleRowFilter}
            />
            </Box>
          </Grid>
        </Grid>
        {/* <TableContainer sx={{overflowX:'auto'}}>
        <Table style={{border:"1px solid #ddd"}} size='small'>
          <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
          <TableRow>
          {Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], index) => {
            keyIndexMapping[index] = key
            if (index === 0 || columnNodes[key]) {
              return (
                index === 0 ? 
               <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc"}}>{key}</TableCell> 
              : 
               <TableCell style={{color:"white"}}>{key}</TableCell>
              )
            }
            
          })}
          </TableRow>
          </TableHead>
          <TableBody>
          {renderRows()}
          </TableBody>
        </Table>
        </TableContainer> */}
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


