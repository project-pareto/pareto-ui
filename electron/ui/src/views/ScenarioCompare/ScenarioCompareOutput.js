import './ScenarioCompare.css';
import React, {useEffect, useState, Fragment} from 'react';
import {  } from "react-router-dom";
import { Box, Grid, IconButton, Typography, FormControlLabel, Switch, FormGroup } from '@mui/material'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer,  } from '@mui/material';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WaterIcon from '@mui/icons-material/Water';
import ComparisonTable from '../../components/ComparisonTable/ComparisonTable';
import Plot from 'react-plotly.js';





export default function ScenarioCompareOutput(props) {
  const {
        scenarios, 
        primaryScenarioIndex, 
        referenceScenarioIndex, 
        kpiDataPrimary, 
        kpiDataReference, 
        capexBarChartData, 
        opexBarChartData, 
        showSidebar, 
        compareCategory,
        totalCapex,
        totalOpex
    } = props

    const [ hoverRow, setHoverRow] = useState('')
    const [ hoverTable, setHoverTable ] = useState('')
    const [ hoverValue, setHoverValue ] = useState('')
    const [ showBuildoutOverlappingRows, setShowBuildoutOverlappingRows ] = useState(false)
    const [ buildoutOverlappingRows, setBuildoutOverlappingRows ] = useState([])

    useEffect(() => {
        let primaryScenario = scenarios[primaryScenarioIndex]
        let referenceScenario = scenarios[referenceScenarioIndex]
        if (primaryScenario && referenceScenario) {
            let primaryScenarioKeys = []
            for (let value of primaryScenario.results.data.vb_y_overview_dict.slice(1)){
                let key = `${value[0]}:${value[1]}:${value[2]}:${value[5]}:${value[3]}`
                primaryScenarioKeys.push(key)
            }
            let overlappingRows = []
            for (let value of referenceScenario.results.data.vb_y_overview_dict.slice(1)){
                let key = `${value[0]}:${value[1]}:${value[2]}:${value[5]}:${value[3]}`
                if (primaryScenarioKeys.includes(key)) overlappingRows.push(key)
            }
            // console.log('overlappingrows length')
            // console.log(overlappingRows.length)
            setBuildoutOverlappingRows(overlappingRows)
        }
        


    }, [primaryScenarioIndex,referenceScenarioIndex,compareCategory])

   const styles = {
    titleDivider: {
      m:2, 
      marginTop:2
    },
    kpiBox: {
        paddingTop:2, 
        boxShadow:3,
        minHeight: "140px",
    },
    pieChartBox: {
        paddingTop:2, 
        boxShadow:3,
    },
    areaChartBox: {
        paddingTop:2, 
        boxShadow:3,
        paddingBottom: "50px" 
    },
    kpiTitle: {
        color:"#989698",
        fontSize: '25px',
        margin: "0",
        padding: "0",
    },
    kpiValue: {
        color:"black",
        fontSize: '25px',
        fontWeight:'bold',
        margin: "0",
        padding: "0"
    },
    kpiReferenceValue: {
        color:"black",
        fontSize: '15px',
        fontWeight:'bold',
        margin: "0",
        padding: "0"
    },
    icon: {
        backgroundColor: "#5A3E73",
        color:"#CEC7D7"
    },
    comparisonTableBox: {
        paddingTop:2, 
        boxShadow:3,
        padding:3
    },
    boxView: showSidebar ? {
        m:3, 
        paddingLeft: '240px' 
      } : {
        m:3
      },
    chartTitle: {
        fontSize: "25px",
        color: "#989698"
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
    hover: {
        backgroundColor: "#F2F3F5"
    },
    hoverSameValue: {
        backgroundColor: "#D4EFFF"
    },
    hoverDifferentValue: {
        backgroundColor: "#F79E9E"
    }
   }

   const getStyle = (key) => {
    if (key === "totalCapex") {
        if (totalCapex[0] > totalCapex[1]) return {color:"green"}
        else if (totalCapex[0] < totalCapex[1]) return {color:"red"}
        else if (totalCapex[0] === totalCapex[1]) return {color:"#989698"}
    } else if (key === "totalOpex") {
        if (totalOpex[0] > totalOpex[1]) return {color:"green"}
        else if (totalOpex[0] < totalOpex[1]) return {color:"red"}
        else if (totalOpex[0] === totalOpex[1]) return {color:"#989698"}
    }
    else {
        let tempStyle = {...styles.kpiTitle}
        let diff = kpiDataPrimary[key].value - kpiDataReference[key].value
        if (diff > 0) tempStyle.color = "green"
        else if(diff < 0) tempStyle.color = "red"
        else tempStyle.color = "grey"
        return tempStyle
    }
    
   }

   const getValue = (key) => {
    if (key === "totalCapex") {
        let capexDiff = ""
        if (totalCapex[0] > totalCapex[1]) capexDiff+="+"
        capexDiff+=(((totalCapex[0] - totalCapex[1])/totalCapex[1])*100).toLocaleString('en-US', {maximumFractionDigits: 0})
        return capexDiff
    } else if (key === "totalOpex") {
        let opexDiff = ""
        if (totalOpex[0] > totalOpex[1]) opexDiff+="+"
        opexDiff+=(((totalOpex[0] - totalOpex[1])/totalOpex[1])*100).toLocaleString('en-US', {maximumFractionDigits: 0})
        return opexDiff
    }
    else {
        let diff = kpiDataPrimary[key].value - kpiDataReference[key].value
        let returnGuy
        if (key === "reuse_CompletionsDemandKPI") returnGuy = Math.round(diff)
        else returnGuy = diff.toLocaleString('en-US', {maximumFractionDigits:0})
        returnGuy = ""+returnGuy
        if (diff > 0) returnGuy = "+" + returnGuy
        return returnGuy
    }
   }
   const formatNumber = (value) => {
    if (value === undefined) return value
    else return value.toLocaleString('en-US', {maximumFractionDigits:2})
  }

  const handleHover = (target, table, value) => {
    setHoverRow(target)
    setHoverTable(table)
    setHoverValue(value)
  }

  const getHoverStyle = (target, table, value) => {
    if (target === hoverRow) {
        if (table === hoverTable) return styles.hover
        else {
            if (value === hoverValue) return styles.hoverSameValue
            else return styles.hoverDifferentValue
            
        }
    } 
    return null
  }

   const renderInfrastructureTable = () => {
    let primaryScenario = scenarios[primaryScenarioIndex]
    let referenceScenario = scenarios[referenceScenarioIndex]
    return (
        <TableContainer>
            <Grid container>
                <Grid item xs={3}>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={showBuildoutOverlappingRows} onChange={() => setShowBuildoutOverlappingRows(!showBuildoutOverlappingRows)}/>} label="Show All Rows" />
                    </FormGroup>
                </Grid>
                <Grid item xs={6}>
                    <h3 style={{marginTop: 0, paddingTop:0}}>
                        Compare Buildout
                    </h3>
                </Grid>
                <Grid item xs={3}>

                </Grid>
            </Grid>

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
                    {Object.keys(primaryScenario.results.data.vb_y_overview_dict).length > 0 ? 
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(primaryScenario.results.data.vb_y_overview_dict).length} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{primaryScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(primaryScenario.results.data.vb_y_overview_dict).slice(1).map(([key,value]) => (
                                (showBuildoutOverlappingRows || !buildoutOverlappingRows.includes(`${value[0]}:${value[1]}:${value[2]}:${value[5]}:${value[3]}`))
                            
                                &&
                                
                                <TableRow    
                                    key={`${value[0]}:${value[1]}:${value[2]}:${value[5]}`}
                                    style={getHoverStyle(`${value[0]}:${value[1]}:${value[2]}:${value[5]}`, 'primary', value[3])}
                                    onMouseEnter={() => handleHover(`${value[0]}:${value[1]}:${value[2]}:${value[5]}`, 'primary', value[3])}
                                >
                                    {[0,1,2,5,3,4].map((cellIdx, i) => (
                                        <TableCell key={`${cellIdx}_${i}`} style={styles.other} align={cellIdx === 3 ? 'right' : 'left'}>
                                            {cellIdx === 3 ? formatNumber(value[cellIdx]) : value[cellIdx]}
                                        </TableCell>
                                    )
                                    )}
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
                    {Object.keys(referenceScenario.results.data.vb_y_overview_dict).length > 0 ?
                        <TableBody>
                            <TableRow>
                            <TableCell rowSpan={Object.keys(referenceScenario.results.data.vb_y_overview_dict).length} style={styles.firstCol} sx={{fontSize:"15px"}}>
                                <b>{referenceScenario.name}</b>
                            </TableCell>
                            </TableRow>
                            {Object.entries(referenceScenario.results.data.vb_y_overview_dict).slice(1).map(([key,value]) => (
                                (showBuildoutOverlappingRows || !buildoutOverlappingRows.includes(`${value[0]}:${value[1]}:${value[2]}:${value[5]}:${value[3]}`))
                            
                                &&
                                <TableRow 
                                    key={`${value[0]}:${value[1]}:${value[2]}:${value[5]}`}
                                    style={getHoverStyle(`${value[0]}:${value[1]}:${value[2]}:${value[5]}`, 'reference', value[3])}
                                    onMouseEnter={() => handleHover(`${value[0]}:${value[1]}:${value[2]}:${value[5]}`, 'reference', value[3])}
                                >
                                    {[0,1,2,5,3,4].map((cellIdx, i) => (
                                        <TableCell key={`${cellIdx}_${i}`} style={styles.other} align={cellIdx === 3 ? 'right' : 'left'}>
                                            {cellIdx === 3 ? formatNumber(value[cellIdx]) : value[cellIdx]}
                                        </TableCell>
                                    )
                                    )}
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

  return (
      
    <Box sx={styles.boxView}>
        {compareCategory === "output::dashboard" && kpiDataPrimary ? 
        <Grid container spacing={2}>

            <Grid item xs={3}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <Typography noWrap style={styles.kpiTitle}>Key KPIs</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiValue}>{scenarios[primaryScenarioIndex].name}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiReferenceValue}>vs {scenarios[referenceScenarioIndex].name}</Typography>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={3}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <Typography noWrap style={styles.kpiTitle}><IconButton disabled><ChangeCircleIcon sx={{ color: "#947eaa" }}/></IconButton>Recycling Rate &nbsp;&nbsp;</Typography>
                        <Typography noWrap style={getStyle("reuse_CompletionsDemandKPI")}>{getValue("reuse_CompletionsDemandKPI")}%</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiValue}>{Math.round(kpiDataPrimary.reuse_CompletionsDemandKPI.value)}%</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiReferenceValue}>vs {Math.round(kpiDataReference.reuse_CompletionsDemandKPI.value)}%</Typography>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={3}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <Typography noWrap style={styles.kpiTitle}><IconButton disabled><RemoveCircleOutlineIcon sx={{ color: "#fc2414" }}/></IconButton>Disposal</Typography>
                        <Typography noWrap style={getStyle("v_F_TotalDisposed")}>{getValue("v_F_TotalDisposed")}&nbsp;{kpiDataPrimary.v_F_TotalDisposed.unit}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiValue}>{kpiDataPrimary.v_F_TotalDisposed.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalDisposed.unit}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiReferenceValue}>vs {kpiDataReference.v_F_TotalDisposed.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalDisposed.unit}</Typography>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={3}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <Typography noWrap style={styles.kpiTitle}><IconButton disabled><WaterIcon sx={{ color:"#59b8d6" }}/></IconButton>Sourced</Typography>
                        <Typography noWrap style={getStyle("v_F_TotalSourced")}>{getValue("v_F_TotalSourced")}&nbsp;{kpiDataPrimary.v_F_TotalSourced.unit}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiValue}>{kpiDataPrimary.v_F_TotalSourced.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalSourced.unit}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Typography noWrap style={styles.kpiReferenceValue}>vs {kpiDataReference.v_F_TotalSourced.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalSourced.unit}</Typography>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={6}>
                <Box style={{backgroundColor:'white'}} sx={styles.pieChartBox}>
                    <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <p style={styles.chartTitle}>
                            CAPEX <span style={getStyle("totalCapex")}>{getValue("totalCapex")}%</span>
                        </p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={capexBarChartData}

                            layout={{
                                width: 600,
                                height: 450,
                                showlegend: true,
                                barmode: 'stack'
                            }}
                        />
                        </Box>
                    </Grid>
                    </Grid>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box style={{backgroundColor:'white'}} sx={styles.pieChartBox}>
                    <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <p style={styles.chartTitle}>
                            OPEX <span style={getStyle("totalOpex")}>{getValue("totalOpex")}%</span>
                        </p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={opexBarChartData}

                            layout={{
                                width: 600,
                                height: 450,
                                showlegend: true,
                                barmode: 'stack'
                            }}
                        />
                        </Box>
                    </Grid>
                    </Grid>
                </Box>
            </Grid>


            <Grid item xs={12}>
                <Box style={{backgroundColor:'white'}} sx={styles.comparisonTableBox}>
                    <ComparisonTable
                        scenarios={scenarios}
                        scenarioIndex={primaryScenarioIndex}
                        secondaryScenarioIndex={referenceScenarioIndex}

                    />
                </Box>
            </Grid>
        </Grid>
        :
        compareCategory === "output::infrastructureBuildout" &&
            <Box style={{backgroundColor:'white'}} sx={styles.comparisonTableBox}>
                {renderInfrastructureTable()}
            </Box>
        }
    </Box>
  );

}


