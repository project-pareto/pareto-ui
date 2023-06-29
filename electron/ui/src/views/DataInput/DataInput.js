import './DataInput.css';
import React from 'react';
import {useEffect, useState} from 'react';
import { Grid, Box, FormControl, MenuItem, Select, Button, Typography } from '@mui/material';
import AreaChart from '../../components/AreaChart/AreaChart'
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';
import ErrorBar from '../../components/ErrorBar/ErrorBar'
import InputSummary from '../../components/InputSummary/InputSummary'
import NetworkDiagram from '../../components/NetworkDiagram/NetworkDiagram';
import DataTable from '../../components/DataTable/DataTable';

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
  const [ showError, setShowError ] = useState(false)
  const isAllColumnsSelected = columnNodesMapping.length > 0 && filteredColumnNodes.length === columnNodesMapping.length;
  const isAllRowsSelected = rowNodesMapping.length > 0 && filteredRowNodes.length === rowNodesMapping.length;
  const plotCategoryDictionary  = {
                                "CompletionsDemand": "CompletionsPads",
                                "PadRates": "ProductionPads",
                                "FlowbackRates": "CompletionsPads"
                                  }
  var keyIndexMapping = {}

  useEffect(()=>{
    /*
      when category is changed, reset the nodes for filtering (columns and rows of current table)
    */
    try {
      if (props.category !== "Plots" && props.category !== "Network Diagram" && props.category !== "Input Summary") {
        let tempEditDict = {}
        let tempColumnNodes = {}
        let tempColumnNodesMapping = []
        let tempRowNodes = {}
        let tempRowNodesMapping = []
        Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], ind) => {
          if (ind === 0) {
            // tempRowNodesMapping = value
            value.map ((v,i) => {
              tempRowNodesMapping.push(i+"::"+v)
              tempRowNodes[i+"::"+v] = true
              return 1
            })
          } else {
            tempColumnNodesMapping.push(ind+"::"+key)
            tempColumnNodes[ind+"::"+key] = true
          }
          scenario.data_input.df_parameters[props.category][key].map( (value, index) => {
            tempEditDict[""+ind+":"+index] = false
            return 1
          })
          return 1
        })
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
    
  }, [props.category, props.scenario, scenario.data_input.df_parameters]);

  useEffect(()=>{
    // console.log('keyindex mapping: ')
    // console.log(keyIndexMapping)
    
  }, [keyIndexMapping]);
  
   const handlePlotCategoryChange = (event) => {
    setPlotCategory(event.target.value)
   }

  const handleSaveChanges = () => {
    //api call to save changes on backend
    props.handleEditInput(false)
    props.handleUpdateExcel(scenario.id, props.category, scenario.data_input.df_parameters[props.category])
    let tempEditDict = {}
    Object.entries(scenario.data_input.df_parameters[props.category]).map( ([key, value], ind) => {
      scenario.data_input.df_parameters[props.category][key].map( (value, index) => {
        tempEditDict[""+ind+":"+index] = false
        return 1
      })
      return 1
    })
    setEditDict(tempEditDict)
   }

   const handleColumnFilter = (col) => {
    var tempCols
    let tempColumnNodes = {...columnNodes}
    if (col === 'all') {
      tempCols = filteredColumnNodes.length === columnNodesMapping.length ? [] : columnNodesMapping
      if (filteredColumnNodes.length === columnNodesMapping.length) {
        for (const key of Object.keys(tempColumnNodes)) {
          tempColumnNodes[key] = false
        }
      } else {
        for (const key of Object.keys(tempColumnNodes)) {
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
        for (const key of Object.keys(tempRowNodes)) {
          tempRowNodes[key] = false
        }
      } else {
        for (const key of Object.keys(tempRowNodes)) {
          tempRowNodes[key] = true
        }
      }
      setRowNodes(tempRowNodes)
      setFilteredRowNodes(tempRows);
    }
    else {
      tempRows = [...filteredRowNodes]
        const index = tempRows.indexOf(row);
        if (index > -1) {
          tempRows.splice(index, 1);
        } else{
          tempRows.push(row)
        }
        tempRowNodes[row] = !tempRowNodes[row]
        setRowNodes(tempRowNodes)
        setFilteredRowNodes(tempRows)
    }
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
              <NetworkDiagram scenario={props.scenario} type={"input"} syncScenarioData={props.syncScenarioData}></NetworkDiagram>
            </Box>
          )
        }
      /*
        if category is input summary, return input summary tables
      */
        else if(props.category === "Input Summary"){
          return (
            <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3, overflow: "scroll"}}>
              <InputSummary 
                completionsDemand={scenario.data_input.df_parameters['CompletionsDemand']}
                padRates={scenario.data_input.df_parameters['PadRates']}
                flowbackRates={scenario.data_input.df_parameters['FlowbackRates']}
                initialDisposalCapacity={scenario.data_input.df_parameters['InitialDisposalCapacity']}
                initialTreatmentCapacity={scenario.data_input.df_parameters['InitialTreatmentCapacity']}
              />
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
              {props.edited && <h3><Button style={{color:"#0884b4"}} onClick={handleSaveChanges}><Typography noWrap>Save Changes</Typography></Button></h3> }
            </Box>
          </Grid>
          <Grid item xs={11}>
            <DataTable
              section="input"
              editDict={editDict}
              setEditDict={setEditDict}
              scenario={scenario}
              setScenario={setScenario}
              columnNodesMapping={columnNodesMapping}
              columnNodes={columnNodes}
              filteredColumnNodes={filteredColumnNodes}
              rowNodesMapping={rowNodesMapping}
              rowNodes={rowNodes}
              filteredRowNodes={filteredRowNodes}
              setShowError={setShowError}
              category={props.category}
              handleEditInput={props.handleEditInput}
              data={props.scenario.data_input.df_parameters}
            />
          </Grid>
          <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
            <FilterDropdown
                width="300px"
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
        {
            showError && <ErrorBar duration={2000} margin setOpen={setShowError} severity="error" errorMessage="Unable to edit values while optimization is running" />
        }
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


