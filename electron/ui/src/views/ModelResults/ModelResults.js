import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, Grid, LinearProgress } from '@mui/material';
import SankeyPlot from './SankeyPlot';
import KPIDashboard from './KPIDashboard';
import TerminationConditions from '../../assets/TerminationConditions.json'
import NetworkDiagram from '../../components/NetworkDiagram/NetworkDiagram';
import DataTable from '../../components/DataTable/DataTable';
import FilterDropdown from '../../components/FilterDropdown/FilterDropdown';


export default function ModelResults(props) {
  const [ scenario, setScenario] = useState({...props.scenario})
  const [ terminationCondition, setTerminationCondition ] = useState(null)
  const [ columnNodesMapping, setColumnNodesMapping ] = useState([]) 
  const [ columnNodes, setColumnNodes ] = useState([])
  const [ filteredColumnNodes, setFilteredColumnNodes ] = useState([])
  const [ rowNodesMapping, setRowNodesMapping ] = useState([]) 
  const [ rowNodes, setRowNodes ] = useState([])
  const [ filteredRowNodes, setFilteredRowNodes ] = useState([])
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
    }
  }

  useEffect(()=>{
    /*
      when category is changed, reset the nodes for filtering (columns and rows of current table)
    */
    try {
      if (props.category !== "Dashboard" && props.category !== "Network Diagram" && props.category !== "Sankey" && scenario.results.status==="Optimized") {
        let tempColumnNodes = {}
        let tempColumnNodesMapping = []
        let tempRowNodes = {}
        let tempRowNodesMapping = []
        for (let ind in scenario.results.data[props.category][0]) {
          let columnNode = `${ind}::${scenario.results.data[props.category][0][ind]}`
          tempColumnNodesMapping.push(columnNode)
          tempColumnNodes[columnNode] = true
        }
        let i = 0
        for (let each of scenario.results.data[props.category].slice(1)) {
          let rowNode = `${i}::${each[0]}`
          tempRowNodesMapping.push(rowNode)
          tempRowNodes[rowNode] = true
          i+=1
        }
        setColumnNodes(tempColumnNodes)
        setRowNodes(tempRowNodes)
        setFilteredColumnNodes(tempColumnNodesMapping)
        setFilteredRowNodes(tempRowNodesMapping)
        setColumnNodesMapping(tempColumnNodesMapping)
        setRowNodesMapping(tempRowNodesMapping) 
      }
    } catch (e) {
      console.error('unable to set filtering data: ',e)
    }
    let tempScenario = {}
    Object.assign(tempScenario, props.scenario);
    setScenario(tempScenario)
    console.log(`termination condition is ${tempScenario.results.terminationCondition}`)
    if (typeof(tempScenario.results.terminationCondition) === 'undefined') {
      console.log('term condition is undefined, rolling forward as good')
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
    
    
    
  }, [props.category, props.scenario, props.scenario.results.status, props.scenario.data_input.df_parameters, props.scenario.results.data]);

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
                />
      }
      /*
        if category is network diagram, return demo image
      */
        else if(props.category === "Network Diagram"){
          return (
              <NetworkDiagram scenario={props.scenario} type={"output"} syncScenarioData={props.syncScenarioData}></NetworkDiagram>
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
                filteredColumnNodes={filteredColumnNodes}
                rowNodesMapping={rowNodesMapping}
                rowNodes={rowNodes}
                filteredRowNodes={filteredRowNodes}
                category={props.category}
                handleEditInput={props.handleEditInput}
                data={props.scenario.results.data}
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
        )
      }
    } catch (e) {
      console.log('unable to render table for this category: ',e)
    }
  }

  const showDisclaimer = () => {
    return (<h3 style={{color: 'red'}}>*{TerminationConditions[props.scenario.results.terminationCondition]}, results may be invalid.</h3>)
  }


  return ( 
    <>
    {/*
      if a scenario has been optimized, show outputs
      otherwise, display the status of the optimization
    */}
    {props.scenario.results.status.includes("Optimized") && (terminationCondition === "good" ||  terminationCondition === "unsure") ? 
    <Box>
      {terminationCondition === "unsure" && showDisclaimer()}
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
          <p>Please try increasing optimization runtime</p>
        </Box> 
        :
        props.scenario.results.status === "Infeasible" ?
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Optimization Infeasible</h2>
          <p>Please try increasing optimization runtime</p>
        </Box> 
        :
        <Box style={{backgroundColor:'white'}} sx={{m:3, padding:2, boxShadow:3}}>
          <h2>Running Optimization</h2>
          <p>This process could take several minutes</p>
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <LinearProgress style={{width:"50%"}}/>
          </Box>
          
          <p>Status: <b>{props.scenario.results.status}</b></p>
          {/* <Button onClick={() => props.handleSetSection(2)}>Refresh Status</Button> */}
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


