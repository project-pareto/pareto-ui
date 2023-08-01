import React from 'react';
import {useEffect, useState} from 'react';
import { Grid, Box, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip } from '@mui/material';
import { INFRASTRUCTURE_CAPEX_MAPPING }  from '../../assets/InfrastructureCapexMapping'
import DataTable from '../../components/DataTable/DataTable';

const INFRASTRUCTURE_VARIABLES = ["vb_y_Pipeline_dict", "vb_y_Treatment_dict", "vb_y_Storage_dict", "vb_y_Disposal_dict"]

export default function ScenarioCompareOverrides(props) {
    const {primaryScenario, referenceScenario, category, showSidebar, overrides} = props
    const [ overridesList, setOverridesList ] = useState([[],[]])
    const styles = {
        boxView: showSidebar ? 
        {
            m:3, 
            padding:2,
            boxShadow:3,
        } : 
        {
            m:3, 
            padding:2, 
            boxShadow:3,
        },
        firstCol: {
            backgroundColor: "#f4f4f4", 
            border:"1px solid #ddd",
            position: 'sticky',
            left: 0,
    
        },
        other: {
            minWidth: 100,
            border:"1px solid #ddd"
        },
        inputDifference: {
            backgroundColor: "rgb(255,215,0, 0.5)",
            minWidth: 100,
            border:"1px solid #ddd"
        },
    }


  useEffect(() => {
    let tempPrimaryOverridesSet = new Set()
    let tempReferenceOverridesSet = new Set()
    for (let key of Object.keys(overrides[0])) {
        let variable = overrides[0][key].variable
        tempPrimaryOverridesSet.add(variable)
    }
    for (let key of Object.keys(overrides[1])) {
        let variable = overrides[1][key].variable
        tempReferenceOverridesSet.add(variable)
    }
    console.log('overrides list: ')
    console.log([Array.from(tempPrimaryOverridesSet), Array.from(tempReferenceOverridesSet)])
    setOverridesList([Array.from(tempPrimaryOverridesSet), Array.from(tempReferenceOverridesSet)])
    
  },[primaryScenario, referenceScenario, overrides])

  const formatNumber = (value) => {
    if (value === undefined) return value
    else return value.toLocaleString('en-US', {maximumFractionDigits:2})
  }

  const renderPipedTable = (idx) => {
    if (overridesList[idx].includes("v_F_Piped_dict")) {
        return (
            <TableContainer>
                <h3>
                    {idx === 0 ? primaryScenario.name : referenceScenario.name}: Piped
                </h3>
                <TableContainer sx={{overflowX:'auto'}}>
                    <Table style={{border:"1px solid #ddd"}} size='small'>
                        <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                            <TableRow>
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>Origin</TableCell> 
                                <TableCell style={{color:"white", width:"25%"}}>Destination</TableCell>
                                <TableCell style={{color:"white", width:"25%"}}>Time</TableCell>
                                <TableCell style={{color:"white", width:"25%"}}>Override Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries( idx === 0 ? primaryScenario.override_values.v_F_Piped_dict : referenceScenario.override_values.v_F_Piped_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.firstCol}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TableContainer>
        )
    }
    
  }

  const renderInfrastructureTable = (idx) => {
    if (overridesList[idx].includes(INFRASTRUCTURE_VARIABLES[0]) || overridesList[idx].includes(INFRASTRUCTURE_VARIABLES[1]) || overridesList[idx].includes(INFRASTRUCTURE_VARIABLES[2]) || overridesList[idx].includes(INFRASTRUCTURE_VARIABLES[3])) {
        return (
            <TableContainer>
                <h3>
                    {idx === 0 ? primaryScenario.name : referenceScenario.name}: Infrastructure Buildout
                </h3>
                <TableContainer sx={{overflowX:'auto'}}>
                    <Table style={{border:"1px solid #ddd"}} size='small'>
                        <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                            <TableRow>
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>CAPEX Type</TableCell> 
                                <TableCell style={{color:"white", width:"15%"}}>Location</TableCell>
                                <TableCell style={{color:"white", width:"15%"}}>Destination</TableCell>
                                <TableCell style={{color:"white", width:"15%"}}>Technology</TableCell>
                                <TableCell style={{color:"white", width:"15%"}}>Capacity</TableCell>
                                <TableCell style={{color:"white", width:"15%"}}>Unit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries( idx === 0 ? primaryScenario.override_values.vb_y_overview_dict : referenceScenario.override_values.vb_y_overview_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.firstCol}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[3]}</TableCell>
                                    {/* <TableCell style={styles.other}>{value.indexes[value.indexes.length-1]}</TableCell> */}
                                    <TableCell style={styles.other} align="right">{formatNumber(value.number_value)}</TableCell>
                                    <TableCell style={styles.other}>{INFRASTRUCTURE_CAPEX_MAPPING[key.split(":")[0]].unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TableContainer>
        )
    }
    
  }

  const renderOverridesTables = () => {
    try {
        return (
            <Box style={{backgroundColor:'white'}} sx={styles.boxView}>
            <Grid container>
                {renderInfrastructureTable(0)}
                {renderInfrastructureTable(1)}
                {renderPipedTable(0)}
                {renderPipedTable(1)}
            </Grid>
            </Box>
        )
      
    } catch (e) {
      console.error("unable to render overrides ",e)
    }
}
  return ( 
    <Box sx={ showSidebar ? {paddingLeft: '240px'} : {paddingLeft:"0px"}}>
     {renderOverridesTables()}
    </Box>
    
  );

}

