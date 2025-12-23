import React from 'react';
import {useEffect, useState, type ChangeEvent} from 'react';   
import { Box, Grid, LinearProgress, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SankeyPlot from './SankeyPlot';
import KPIDashboard from './KPIDashboard';
import { TerminationConditions } from '../../assets/utils';
import NetworkDiagram from '../../components/NetworkDiagram/NetworkDiagram';
import DataTable from '../../components/DataTable/DataTable';
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';
import { generateReport } from '../../services/app.service';
import { useApp } from '../../AppContext';
import type { ModelResultsProps, Scenario } from '../../types';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WaterResiduals from '../../components/WaterResiduals/WaterResiduals';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const OVERRIDE_CATEGORIES = [
  "vb_y_overview_dict",
  "v_F_Piped_dict",
  "v_F_Sourced_dict",
  "v_F_Trucked_dict",
  "v_L_Storage_dict",
  "v_L_PadStorage_dict",
]

export default function ModelResults(props: ModelResultsProps) {
  const { port } = useApp()
  const [ scenario, setScenario] = useState<Scenario>({...props.scenario})
  const [ terminationCondition, setTerminationCondition ] = useState<'good' | 'unsure' | 'bad' | null>(null)
  const [ columnNodesMapping, setColumnNodesMapping ] = useState<string[]>([]) // the column mapping; set once and remains the same
  const [ columnNodes, setColumnNodes ] = useState<Record<string, boolean>>({}) // dictionary with true false values for each column
  const [ filteredColumnNodes, setFilteredColumnNodes ] = useState<string[]>([]) // list of active columns
  const [ columnFilterSet, setColumnFilterSet ] = useState<Record<string, {checked: boolean; amt: number}>>({}) // dictionary containing all unique columns and the amount of each column
  const [ rowNodesMapping, setRowNodesMapping ] = useState<string[]>([]) 
  const [ rowNodes, setRowNodes ] = useState<Record<string, boolean>>({})
  const [ filteredRowNodes, setFilteredRowNodes ] = useState<string[]>([])
  const [ rowFilterSet, setRowFilterSet ] = useState<Record<string, {checked: boolean; amt:number}>>({})
  const [ newInfrastructureOverrideRow, setNewInfrastructureOverrideRow ] = useState<boolean>(false)
  const isAllColumnsSelected = columnNodesMapping.length > 0 && filteredColumnNodes.length === columnNodesMapping.length;
  const isAllRowsSelected = rowNodesMapping.length > 0 && filteredRowNodes.length === rowNodesMapping.length;
  const styles ={
    resultsBox: {
      backgroundColor:'white', 
      m:3, 
      padding:2, 
      boxShadow:3, 
      overflow:"scroll"
    },
    kpiDashboardBox: {
      marginLeft: 10, 
      marginRight: 10
    },
    filledButton: {
      backgroundColor: '#01678f',
      '&:hover': {
          backgroundColor: '#01678f',
          opacity: 0.9
      },
      minWidth:"250px",
      // fontWeight: "bold", 
    },
    newOverrideButton: {
      minWidth:"350px", 
      color: "#0884b4", 
      backgroundColor: "white"
    }
  }

  useEffect(()=>{
    /*
      when category is changed, reset the nodes for filtering (columns and rows of current table)
    */
    try {
      if (props.category !== "Dashboard" && props.category !== "Network Diagram" && props.category !== "Sankey" && props.category !== "Water Residuals" && scenario.results.status==="Optimized") {
        let tempColumnNodes = {}
        let tempColumnNodesMapping = []
        let tempRowNodes = {}
        let tempRowNodesMapping = []

        let newRowFilterSet = {}
        let newColFilterSet = {}
        for (let ind in scenario.results.data[props.category][0]) {

          let columnNode = `${ind}::${scenario.results.data[props.category][0][ind]}`
          tempColumnNodesMapping.push(columnNode)
          tempColumnNodes[columnNode] = true

          let colKey = scenario.results.data[props.category][0][ind]
          if (Object.keys(newColFilterSet).includes(colKey)) {
            newColFilterSet[colKey].amt = newColFilterSet[colKey].amt + 1
          } else {
            newColFilterSet[colKey] = {checked: true, amt: 1}
          }
        }
        let i = 0
        for (let each of scenario.results.data[props.category].slice(1)) {
          let rowNode = `${i}::${each[0]}`
          tempRowNodesMapping.push(rowNode)
          tempRowNodes[rowNode] = true
          i+=1

          let rowKey = each[0]
          if (Object.keys(newRowFilterSet).includes(rowKey)) {
            newRowFilterSet[rowKey].amt = newRowFilterSet[rowKey].amt + 1
          } else {
            newRowFilterSet[rowKey] = {checked: true, amt: 1}
          }
        }
        setColumnNodes(tempColumnNodes)
        setRowNodes(tempRowNodes)
        setFilteredColumnNodes(tempColumnNodesMapping)
        setFilteredRowNodes(tempRowNodesMapping)
        setColumnNodesMapping(tempColumnNodesMapping)
        setRowNodesMapping(tempRowNodesMapping) 
        setRowFilterSet(newRowFilterSet)
        setColumnFilterSet(newColFilterSet)
      }
    } catch (e) {
      console.error('unable to set filtering data: ',e)
    }
    let tempScenario: Scenario = {} as Scenario;
    Object.assign(tempScenario, props.scenario);
    setScenario(tempScenario)
    if (typeof(tempScenario.results.terminationCondition) === 'undefined') {
      // console.log('term condition is undefined, rolling forward as good')
      setTerminationCondition('good')
    }else {
      if (["locallyOptimal", "globallyOptimal", "optimal"].includes(tempScenario.results.terminationCondition)) {
        setTerminationCondition('good')
      } else if (["maxTimeLimit", "maxIterations", "userInterrupt", "resourceInterrupt", "maxEvaluations"].includes(tempScenario.results.terminationCondition)) {
        setTerminationCondition('unsure')
      }else {
        setTerminationCondition('bad')
      }
    }
    // console.log("current scenario:")
    // console.log(props.scenario)
    
    
  }, [props.category, props.scenario, props.scenario.results.status, props.scenario.data_input.df_parameters, props.scenario.results.data]);

  const handleColumnFilter = (col) => {
    var tempCols
    let tempColumnNodes = {...columnNodes}
    let tempColumnFilterSet = {...columnFilterSet}
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

      // handle column filter set
      let allChecked = true
      for (let key of Object.keys(tempColumnFilterSet)) {
        if(!tempColumnFilterSet[key].checked) allChecked = false
      }
      if (allChecked) {
        for (let key of Object.keys(tempColumnFilterSet)) {
          tempColumnFilterSet[key].checked = false
        }
      } else {
        for (let key of Object.keys(tempColumnFilterSet)) {
          tempColumnFilterSet[key].checked = true
        }
      }
      setColumnFilterSet(tempColumnFilterSet)
    }
    else {
      tempCols = [...filteredColumnNodes]
      const index = tempCols.indexOf(col);
      if (index > -1) { 
        tempCols.splice(index, 1); 
      } else{
        tempCols.push(col)
      }

      // handle column filter set
      for (let key of Object.keys(tempColumnNodes)) {
        if(key.includes(col)) {
          tempColumnNodes[key] = !tempColumnNodes[key]
        }
      }

      tempColumnNodes[col] = !tempColumnNodes[col]
      tempColumnFilterSet[col].checked = !tempColumnFilterSet[col].checked
      setColumnFilterSet(tempColumnFilterSet)
      setColumnNodes(tempColumnNodes)
      setFilteredColumnNodes(tempCols)
    }
}

const handleRowFilter = (row) => {
  let tempRows
  let tempRowNodes = {...rowNodes}
  let tempRowFilterSet = {...rowFilterSet}
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

    let allChecked = true
    for (let key of Object.keys(tempRowFilterSet)) {
      if(!tempRowFilterSet[key].checked) allChecked = false
    }
    if (allChecked) {
      for (let key of Object.keys(tempRowFilterSet)) {
        tempRowFilterSet[key].checked = false
      }
    } else {
      for (let key of Object.keys(tempRowFilterSet)) {
        tempRowFilterSet[key].checked = true
      }
    }
    setRowFilterSet(tempRowFilterSet)
  }
  else {
    tempRows = [...filteredRowNodes]
      const index = tempRows.indexOf(row);
      if (index > -1) {
        tempRows.splice(index, 1);
      } else{
        tempRows.push(row)
      }
      for (let key of Object.keys(tempRowNodes)) {
        if(key.includes(row)) {
          tempRowNodes[key] = !tempRowNodes[key]
        }
      }
      tempRowNodes[row] = !tempRowNodes[row]
      tempRowFilterSet[row].checked = !tempRowFilterSet[row].checked
      setRowNodes(tempRowNodes)
      setRowFilterSet(tempRowFilterSet)
      setFilteredRowNodes(tempRows)
  }
}

const handleNewInfrastructureOverride = () => {
  window.scrollTo(0, document.body.scrollHeight);
  setNewInfrastructureOverrideRow(true);
 }
  
  const renderOutputCategory = () => {
    try {
      /*
        if category is sankey, return sankey plot
      */
      if (props.category === "Sankey") {
        let sankeyData = {"v_F_Piped": props.scenario.results.data["v_F_Piped_dict"], "v_F_Trucked": props.scenario.results.data["v_F_Trucked_dict"]}
        return (
            <SankeyPlot data={sankeyData} appState={props.appState} scenarioId={props.scenario.id}/>
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
                  waterQualityData={props.scenario.results.data["quality.v_Q_dict"]}
                  hydraulicsData={props.scenario.results.data["hydraulics.v_Pressure_dict"]}

                />
      }
      /*
        if category is network diagram, return network diagram
      */
        else if(props.category === "Network Diagram"){
          return (
              <NetworkDiagram scenario={props.scenario} type={"output"} syncScenarioData={props.syncScenarioData}></NetworkDiagram>
          )
        }
      /*
        if category is water residuals, return water residuals component
      */
        else if(props.category === "Water Residuals"){
          return (
              <WaterResiduals scenario={props.scenario} />
          )
        }
      /*
        otherwise, return table for given category
      */
      else {
        return (
          <Grid container>
            <Grid item xs={11.5}>
              <DataTable 
                section="output"
                scenario={props.scenario}
                setScenario={setScenario}
                columnNodesMapping={columnNodesMapping}
                columnNodes={columnNodes}
                rowNodesMapping={rowNodesMapping}
                rowNodes={rowNodes}
                category={props.category}
                handleEditInput={props.handleEditInput}
                data={props.scenario.results.data}
                updateScenario={props.updateScenario}
                OVERRIDE_CATEGORIES={OVERRIDE_CATEGORIES}
                newInfrastructureOverrideRow={newInfrastructureOverrideRow}
                setNewInfrastructureOverrideRow={setNewInfrastructureOverrideRow}
                rowFilterSet={rowFilterSet}
                columnFilterSet={columnFilterSet}
              />
              
            </Grid>
            <Grid item xs={0.5}>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', marginLeft:'10px'}}>
              {
                props.category === "vb_y_overview_dict" ? 
                
                <Button style={styles.newOverrideButton} variant="contained" onClick={handleNewInfrastructureOverride}>
                  + Add infrastructure override
                </Button> 
                
                :
                
                !["v_F_Overview_dict", "Water Residuals"].includes(props.category) && 

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
                  rowFilterSet={rowFilterSet}
                  columnFilterSet={columnFilterSet}
                />
              }
            
            </Box>
          </Grid>
          </Grid>
        )
      }
    } catch (e) {
      console.log('unable to render table for this category: ',e)
    }
  }

  const showDisclaimer = () => {
    let isUnsure = terminationCondition === "unsure"
    if(scenario.results.status==="Optimized") {
      if (scenario.optimized_override_values !== undefined)  {
        for(let key of Object.keys(scenario.optimized_override_values)) {
          if(Object.keys(scenario.optimized_override_values[key]).length > 0) { // 
            if (isUnsure) { // show both disclaimers
              let text = `*${TerminationConditions[props.scenario.results.terminationCondition]}, results may be invalid.`
              text+= " Scenario has been optimized with manual override."
              return <span style={{color:"red"}}>{text}</span>
            } else { // show ONLY disclaimer for override
              return <span style={{color:"red"}}>*Scenario has been optimized with manual override.</span>
            }
            
          } else if (isUnsure) { // show ONLY disclaimer for unsure termination
            return <span style={{color:"red"}}>*{TerminationConditions[props.scenario.results.terminationCondition]}, results may be invalid.</span>
          } else {
            return null
          }
        }
      return null
      }
      else return null
  }else return null
}

  const resetOverrides = () => {
    console.log('resetting overrides')
    let tempScenario = {...scenario}
    tempScenario.override_values = {
        "vb_y_overview_dict": {},
        "v_F_Piped_dict": {},
        "v_F_Sourced_dict": {},
        "v_F_Trucked_dict": {},
        "v_L_Storage_dict": {},
        "v_L_PadStorage_dict": {},
        "vb_y_Pipeline_dict": {},
        "vb_y_Disposal_dict": {},
        "vb_y_Storage_dict": {},
        "vb_y_Treatment_dict": {}
    }
    tempScenario.results.status="Draft"
    props.updateScenario(tempScenario)
    props.handleSetSection(0)
  }

  const showResetOverrides = () => {
    if (scenario.optimized_override_values !== undefined)  {
      for(let key of Object.keys(scenario.optimized_override_values)) {
          if(Object.keys(scenario.optimized_override_values[key]).length > 0) {
            return <>
              <p>Please try increasing optimization runtime or resetting manual overrides.</p>
              <Button onClick={resetOverrides} variant="contained" style={{backgroundColor: "#6094BC"}} ><RefreshIcon/> &nbsp; Reset Manual Overrides </Button>
            </>
          }
      }
    }
    return <p>Please try increasing optimization runtime</p>
  }

  const handleGenerateReport = () => {
    generateReport(port, props.scenario.id).then(response => {
      if (response.status === 200) {
              response.blob().then((data)=>{
              let excelURL = window.URL.createObjectURL(data);
              let tempLink = document.createElement('a');
              tempLink.href = excelURL;
              tempLink.setAttribute('download', props.scenario.name+'.xlsx');
              tempLink.click();
          }).catch((err)=>{
              console.error("error fetching excel template path: ",err)
          })
      }
      else {
          console.error("error fetching excel template path: ",response.statusText)
      }
      })
  }
  
  return ( 
    <>
    {/*
      if a scenario has been optimized, show outputs
      otherwise, display the status of the optimization
    */}
    {props.scenario.results.status.includes("Optimized") && (terminationCondition === "good" ||  terminationCondition === "unsure") ? 
    <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Button 
            sx={{marginLeft: 10}} 
            onClick={handleGenerateReport}
            endIcon={<FileDownloadIcon/>}
          >
              Generate Excel Report
          </Button>
          {props.scenario.optimization.deactivate_slacks === false && props.category === 'Dashboard' &&
            <Button 
            sx={{marginRight: 10}} 
              onClick={() => props.handleSetCategory('Water Residuals')}
              endIcon={<OpenInNewIcon/>}
            >
                Export Water Residuals
            </Button>
          }
          
        </Box>
        <Box display="flex" justifyContent="center" sx={{marginLeft: 4}}>
            {showDisclaimer()}
        </Box>

      
      <Box sx={props.category === "Dashboard" ? styles.kpiDashboardBox : styles.resultsBox}>
        {renderOutputCategory()}
      </Box>
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
        props.scenario.results.status.includes("Optimized") ?
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Unoptimal termination</h2>
          <p>Termination condition: <b>{props.scenario.results.terminationCondition}</b></p>
          {showResetOverrides()}
        </Box> 
        :
        props.scenario.results.status === "Infeasible" ?
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Optimization Infeasible</h2>
          {showResetOverrides()}
        </Box> 
        :
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Running Optimization</h2>
          <p>This process could take several minutes</p>
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <LinearProgress style={{width:"50%"}}/>
          </Box>
          
          <p>Status: <b>{props.scenario.results.status}</b></p>
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


