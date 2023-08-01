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
    setOverridesList([Array.from(tempPrimaryOverridesSet), Array.from(tempReferenceOverridesSet)])
    
  },[primaryScenario, referenceScenario, overrides])

  const formatNumber = (value) => {
    if (value === undefined) return value
    else return value.toLocaleString('en-US', {maximumFractionDigits:2})
  }

  const renderPipedTable = (idx) => {
        return (
            <TableContainer>
                <h3>
                    Piped
                </h3>
                <TableContainer sx={{overflowX:'auto'}}>
                    <Table style={{border:"1px solid #ddd"}} size='small'>
                        <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                            <TableRow>
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"20%"}}>Scenario</TableCell> 
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"20%"}}>Origin</TableCell> 
                                <TableCell style={{color:"white", width:"20%"}}>Destination</TableCell>
                                <TableCell style={{color:"white", width:"20%"}}>Time</TableCell>
                                <TableCell style={{color:"white", width:"20%"}} align="right">Override Value</TableCell>
                            </TableRow>
                        </TableHead>
                        {Object.keys(primaryScenario.override_values.v_F_Piped_dict).length > 0 && 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(primaryScenario.override_values.v_F_Piped_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(primaryScenario.override_values.v_F_Piped_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        }
                        {Object.keys(referenceScenario.override_values.v_F_Piped_dict).length > 0 && 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(referenceScenario.override_values.v_F_Piped_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(referenceScenario.override_values.v_F_Piped_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        }
                    </Table>
                </TableContainer>
            </TableContainer>
        )
  }

  const renderInfrastructureTable = () => {
        return (
            <TableContainer>
                <h3>
                    Infrastructure Buildout
                </h3>
                <TableContainer sx={{overflowX:'auto'}}>
                    <Table style={{border:"1px solid #ddd"}} size='small'>
                        <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                            <TableRow>
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"20%"}}>Scenario</TableCell> 
                                <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"15%"}}>CAPEX Type</TableCell> 
                                <TableCell style={{color:"white", width:"13%"}}>Location</TableCell>
                                <TableCell style={{color:"white", width:"13%"}}>Destination</TableCell>
                                <TableCell style={{color:"white", width:"13%"}}>Technology</TableCell>
                                <TableCell style={{color:"white", width:"13%"}} align="right">Capacity</TableCell>
                                <TableCell style={{color:"white", width:"13%"}}>Unit</TableCell>
                            </TableRow>
                        </TableHead>
                        {Object.keys(primaryScenario.override_values.vb_y_overview_dict).length > 0 && 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(primaryScenario.override_values.vb_y_overview_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(primaryScenario.override_values.vb_y_overview_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        {/* <TableCell></TableCell> */}
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[3]}</TableCell>
                                        {/* <TableCell style={styles.other}>{value.indexes[value.indexes.length-1]}</TableCell> */}
                                        <TableCell style={styles.other} align="right">{formatNumber(value.number_value)}</TableCell>
                                        <TableCell style={styles.other}>{INFRASTRUCTURE_CAPEX_MAPPING[key.split(":")[0]].unit}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        }
                        {Object.keys(referenceScenario.override_values.vb_y_overview_dict).length > 0 && 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(referenceScenario.override_values.vb_y_overview_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(referenceScenario.override_values.vb_y_overview_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        {/* <TableCell></TableCell> */}
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[3]}</TableCell>
                                        {/* <TableCell style={styles.other}>{value.indexes[value.indexes.length-1]}</TableCell> */}
                                        <TableCell style={styles.other} align="right">{formatNumber(value.number_value)}</TableCell>
                                        <TableCell style={styles.other}>{INFRASTRUCTURE_CAPEX_MAPPING[key.split(":")[0]].unit}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        }
                    </Table>
                </TableContainer>
            </TableContainer>
        )
  }

  const renderOverridesTables = () => {
    try {
        return (
            <Box style={{backgroundColor:'white'}} sx={styles.boxView}>
            <Grid container>
                {category.includes("vb_y_overview_dict") && 
                    renderInfrastructureTable()
                }
                {category.includes("v_F_Piped_dict") && 
                    renderPipedTable()
                }
                {/* {renderInfrastructureTable(0)}
                {renderInfrastructureTable(1)}
                {renderPipedTable(0)}
                {renderPipedTable(1)} */}
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


