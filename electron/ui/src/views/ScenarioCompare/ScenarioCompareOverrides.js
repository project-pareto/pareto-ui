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

  const renderWaterPadStorageTable = () => {
    return (
        <TableContainer>
            <h3>
                Water Level Pad Storage Overrides
            </h3>
            <TableContainer sx={{overflowX:'auto'}}>
                <Table style={{border:"1px solid #ddd"}} size='small'>
                    <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                        <TableRow>
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>Scenario</TableCell> 
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>Completion Pad</TableCell> 
                            <TableCell style={{color:"white", width:"25%"}}>Time</TableCell>
                            <TableCell style={{color:"white", width:"25%"}} align="right">Override Value</TableCell>
                        </TableRow>
                    </TableHead>
                    {Object.keys(primaryScenario.optimized_override_values.v_L_PadStorage_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.v_L_PadStorage_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{primaryScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(primaryScenario.optimized_override_values.v_L_PadStorage_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                    {Object.keys(referenceScenario.optimized_override_values.v_L_PadStorage_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.v_L_PadStorage_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{referenceScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(referenceScenario.optimized_override_values.v_L_PadStorage_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                </Table>
            </TableContainer>
        </TableContainer>
    )
}

  const renderWaterStorageTable = () => {
    return (
        <TableContainer>
            <h3>
                Water Level Storage Overrides
            </h3>
            <TableContainer sx={{overflowX:'auto'}}>
                <Table style={{border:"1px solid #ddd"}} size='small'>
                    <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                        <TableRow>
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>Scenario</TableCell> 
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"25%"}}>Storage Site</TableCell>
                            <TableCell style={{color:"white", width:"25%"}}>Time</TableCell>
                            <TableCell style={{color:"white", width:"25%"}} align="right">Override Value</TableCell>
                        </TableRow>
                    </TableHead>
                    {Object.keys(primaryScenario.optimized_override_values.v_L_Storage_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.v_L_Storage_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{primaryScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(primaryScenario.optimized_override_values.v_L_Storage_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                    {Object.keys(referenceScenario.optimized_override_values.v_L_Storage_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.v_L_Storage_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{referenceScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(referenceScenario.optimized_override_values.v_L_Storage_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                </Table>
            </TableContainer>
        </TableContainer>
    )
}

  const renderTruckedTable = () => {
    return (
        <TableContainer>
            <h3>
                Trucked Overrides
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
                    {Object.keys(primaryScenario.optimized_override_values.v_F_Trucked_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.v_F_Trucked_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{primaryScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(primaryScenario.optimized_override_values.v_F_Trucked_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                    {Object.keys(referenceScenario.optimized_override_values.v_F_Trucked_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.v_F_Trucked_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{referenceScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(referenceScenario.optimized_override_values.v_F_Trucked_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                </Table>
            </TableContainer>
        </TableContainer>
    )
}

  const renderSourcedTable = () => {
    return (
        <TableContainer>
            <h3>
                Sourced Overrides
            </h3>
            <TableContainer sx={{overflowX:'auto'}}>
                <Table style={{border:"1px solid #ddd"}} size='small'>
                    <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                        <TableRow>
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"20%"}}>Scenario</TableCell> 
                            <TableCell style={{color:"white", position: 'sticky', left: 0, backgroundColor:"#6094bc", width:"20%"}}>Fresh water source</TableCell> 
                            <TableCell style={{color:"white", width:"20%"}}>Completion Pad</TableCell>
                            <TableCell style={{color:"white", width:"20%"}}>Time</TableCell>
                            <TableCell style={{color:"white", width:"20%"}} align="right">Override Value</TableCell>
                        </TableRow>
                    </TableHead>
                    {Object.keys(primaryScenario.optimized_override_values.v_F_Sourced_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.v_F_Sourced_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{primaryScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(primaryScenario.optimized_override_values.v_F_Sourced_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                    {Object.keys(referenceScenario.optimized_override_values.v_F_Sourced_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.v_F_Sourced_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{referenceScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(referenceScenario.optimized_override_values.v_F_Sourced_dict).map(([key,value]) => (
                                <TableRow key = {`${key}_${value}`}>
                                    <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                    <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                    <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                    <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        :
                        <TableBody>
                            <TableRow>
                                <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                <TableCell style={styles.other}>--</TableCell> 
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                                <TableCell style={styles.other}>--</TableCell>
                            </TableRow>
                        </TableBody>
                    }
                </Table>
            </TableContainer>
        </TableContainer>
    )
}

  const renderPipedTable = () => {
        return (
            <TableContainer>
                <h3>
                    Piped Overrides
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
                        {Object.keys(primaryScenario.optimized_override_values.v_F_Piped_dict).length > 0 ? 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.v_F_Piped_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(primaryScenario.optimized_override_values.v_F_Piped_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            :
                            <TableBody>
                                <TableRow>
                                    <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                        <b>{primaryScenario.name}</b>
                                    </TableCell>
                                    <TableCell style={styles.other}>--</TableCell> 
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                </TableRow>
                            </TableBody>
                        }
                        {Object.keys(referenceScenario.optimized_override_values.v_F_Piped_dict).length > 0 ? 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.v_F_Piped_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(referenceScenario.optimized_override_values.v_F_Piped_dict).map(([key,value]) => (
                                    <TableRow key = {`${key}_${value}`}>
                                        <TableCell style={styles.other}>{key.split(":")[0]}</TableCell> 
                                        <TableCell style={styles.other}>{key.split(":")[1]}</TableCell>
                                        <TableCell style={styles.other}>{key.split(":")[2]}</TableCell>
                                        <TableCell style={styles.other} align="right">{formatNumber(value.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            :
                            <TableBody>
                                <TableRow>
                                    <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                        <b>{referenceScenario.name}</b>
                                    </TableCell>
                                    <TableCell style={styles.other}>--</TableCell> 
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                </TableRow>
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
                    Infrastructure Buildout Overrides
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
                        {Object.keys(primaryScenario.optimized_override_values.vb_y_overview_dict).length > 0 ? 
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(primaryScenario.optimized_override_values.vb_y_overview_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{primaryScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(primaryScenario.optimized_override_values.vb_y_overview_dict).map(([key,value]) => (
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
                            :
                            // show empty row if this scenario doesnt have any overrides
                            <TableBody>
                                <TableRow>
                                    <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                        <b>{primaryScenario.name}</b>
                                    </TableCell>
                                    <TableCell style={styles.other}>--</TableCell> 
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    </TableRow>
                            </TableBody>

                        }
                        {Object.keys(referenceScenario.optimized_override_values.vb_y_overview_dict).length > 0 ?
                            <TableBody>
                                <TableRow>
                                <TableCell rowSpan={Object.keys(referenceScenario.optimized_override_values.vb_y_overview_dict).length+1} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                    <b>{referenceScenario.name}</b>
                                </TableCell>
                                </TableRow>
                                {Object.entries(referenceScenario.optimized_override_values.vb_y_overview_dict).map(([key,value]) => (
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
                            :
                            // show empty row if this scenario doesnt have any overrides
                            <TableBody>
                                <TableRow>
                                    <TableCell style={styles.firstCol} sx={{fontSize:"15px"}}>
                                        <b>{referenceScenario.name}</b>
                                    </TableCell>
                                    <TableCell style={styles.other}>--</TableCell> 
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                    <TableCell style={styles.other}>--</TableCell>
                                </TableRow>
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
                {category.includes("v_F_Sourced_dict") && 
                    renderSourcedTable()
                }
                {category.includes("v_F_Trucked_dict") && 
                    renderTruckedTable()
                }
                {category.includes("v_L_Storage_dict") && 
                    renderWaterStorageTable()
                }
                {category.includes("v_L_PadStorage_dict") && 
                    renderWaterPadStorageTable()
                }
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


