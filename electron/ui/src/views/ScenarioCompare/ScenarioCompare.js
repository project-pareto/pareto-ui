import './ScenarioCompare.css';
import React, {useEffect, useState, Fragment} from 'react';
import Box from '@mui/material/Box'; 
import {  } from "react-router-dom";
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Sidebar from '../../components/Sidebar/ScenarioCompareSidebar'
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WaterIcon from '@mui/icons-material/Water';
import Plot from 'react-plotly.js';





export default function ScenarioCompare(props) {
  const {scenarios} = props
  const [ primaryScenarioIndex, setPrimaryScenarioIndex ] = useState(4)
  const [ referenceScenarioIndex, setReferenceScenarioIndex ] = useState(6)
//   const [ kpiData, setKpiData ] = useState(null)
  const [ kpiDataPrimary, setKpiDataPrimary ] = useState(null)
  const [ kpiDataReference, setKpiDataReference ] = useState(null)

  useEffect(()=>{
    let tempData = {}
    // organize results dict data
    for (var index in scenarios[primaryScenarioIndex].results.data['v_F_Overview_dict']) {
        let item = scenarios[primaryScenarioIndex].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData[key] = {"description": description, "unit": unit, "value": value}
    }
    console.log(tempData)
    setKpiDataPrimary(tempData)
    tempData = {}
    for (var index in scenarios[referenceScenarioIndex].results.data['v_F_Overview_dict']) {
        let item = scenarios[referenceScenarioIndex].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData[key] = {"description": description, "unit": unit, "value": value}
    }
    console.log(tempData)
    setKpiDataReference(tempData)

}, [scenarios]);

   const styles = {
    titleDivider: {
      m:2, 
      marginTop:2
    },
    kpiBox: {
        paddingTop:2, 
        boxShadow:3,
        height: "140px"
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
        padding: "0"
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
   }

   const getStyle = (key) => {
    let tempStyle = {...styles.kpiTitle}
    let diff = kpiDataPrimary[key].value - kpiDataReference[key].value
    if (diff > 0) tempStyle.color = "green"
    else if(diff < 0) tempStyle.color = "red"
    else tempStyle.color = "grey"
    // tempStyle.fontSize="20px"
    return tempStyle
   }

   const getValue = (key) => {
    let diff = kpiDataPrimary[key].value - kpiDataReference[key].value
    let returnGuy
    if (key === "reuse_CompletionsDemandKPI") returnGuy = Math.round(diff)
    else returnGuy = diff.toLocaleString('en-US', {maximumFractionDigits:0})
    returnGuy = ""+returnGuy
    if (diff > 0) returnGuy = "+" + returnGuy
    return returnGuy
   }

  return (
    <Fragment>
    {/* <Sidebar
        open
    >
    </Sidebar> */}
      
    <Box sx={{m:3, padding:2 }}>
        {kpiDataPrimary && 
        <Grid container spacing={2} sx={{marginTop:2}}>

            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'left'}}>
                    <h2>Key KPIs</h2>
                </Box>
            </Grid>

            <Grid item xs={4}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                    <p style={styles.kpiTitle}><IconButton disabled><ChangeCircleIcon sx={{ color: "#947eaa" }}/></IconButton>Recycling Rate &nbsp;&nbsp;</p>
                    <p style={getStyle("reuse_CompletionsDemandKPI")}>{getValue("reuse_CompletionsDemandKPI")}%</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiValue}>{Math.round(kpiDataPrimary.reuse_CompletionsDemandKPI.value)}%</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiReferenceValue}>vs {Math.round(kpiDataReference.reuse_CompletionsDemandKPI.value)}%</p>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={4}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <p style={styles.kpiTitle}><IconButton disabled><RemoveCircleOutlineIcon sx={{ color: "#fc2414" }}/></IconButton>Disposal</p>
                        <p style={getStyle("v_F_TotalDisposed")}>{getValue("v_F_TotalDisposed")}&nbsp;{kpiDataPrimary.v_F_TotalDisposed.unit}</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiValue}>{kpiDataPrimary.v_F_TotalDisposed.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalDisposed.unit}</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiReferenceValue}>vs {kpiDataReference.v_F_TotalDisposed.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalDisposed.unit}</p>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={4}>
            <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
                <Grid container>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
                        <p style={styles.kpiTitle}><IconButton disabled><WaterIcon sx={{ color:"#59b8d6" }}/></IconButton>Sourced</p>
                        <p style={getStyle("v_F_TotalSourced")}>{getValue("v_F_TotalSourced")}&nbsp;{kpiDataPrimary.v_F_TotalSourced.unit}</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiValue}>{kpiDataPrimary.v_F_TotalSourced.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalSourced.unit}</p>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <p style={styles.kpiReferenceValue}>vs {kpiDataReference.v_F_TotalSourced.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiDataPrimary.v_F_TotalSourced.unit}</p>
                    </Box>
                </Grid>
                </Grid>
            </Box>
            </Grid>

            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'left'}}>
                    <h2>CAPEX and OPEX</h2>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 0, paddingBottom:0}}>
                    <p style={{marginBottom: 0, paddingBottom:0, fontWeight:"bold"}}>{scenarios[primaryScenarioIndex].name}</p>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 0, paddingBottom:0}}>
                    <p style={{marginBottom: 0, paddingBottom:0, fontWeight:"bold"}}>{scenarios[referenceScenarioIndex].name}</p>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box style={{backgroundColor:'white'}} sx={styles.pieChartBox}>
                    <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <p style={styles.chartTitle}>CAPEX</p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={[
                            {
                                type: "pie",
                                values: [
                                    kpiDataPrimary.v_C_StorageCapEx.value, 
                                    kpiDataPrimary.v_C_TreatmentCapEx.value, 
                                    kpiDataPrimary.v_C_DisposalCapEx.value, 
                                    kpiDataPrimary.v_C_PipelineCapEx.value],
                                labels: [
                                    "Storage", 
                                    "Treatment", 
                                    "Disposal", 
                                    "Pipeline"],
                                marker: {
                                        colors: [
                                            'rgb(255, 127, 19)',
                                            'rgb(148, 103, 189)',
                                            'rgb(64, 159, 44)',
                                            'rgb(214, 39, 40)',
                                            // 'rgb(30, 119, 180)',
                                        ]
                                    },
                                textinfo: "percent",
                                // insidetextorientation: "radial"
                                }
                            ]}

                            layout={{
                                width: 450,
                                height: 450,
                                showlegend: true
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
                        <p style={styles.chartTitle}>CAPEX</p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={[
                            {
                                type: "pie",
                                values: [
                                    kpiDataReference.v_C_StorageCapEx.value, 
                                    kpiDataReference.v_C_TreatmentCapEx.value, 
                                    kpiDataReference.v_C_DisposalCapEx.value, 
                                    kpiDataReference.v_C_PipelineCapEx.value],
                                labels: [
                                    "Storage", 
                                    "Treatment", 
                                    "Disposal", 
                                    "Pipeline"],
                                marker: {
                                        colors: [
                                            'rgb(255, 127, 19)',
                                            'rgb(148, 103, 189)',
                                            'rgb(64, 159, 44)',
                                            'rgb(214, 39, 40)',
                                            // 'rgb(30, 119, 180)',
                                        ]
                                    },
                                textinfo: "percent",
                                // insidetextorientation: "radial"
                                }
                            ]}

                            layout={{
                                width: 450,
                                height: 450,
                                showlegend: true
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
                        <p style={styles.chartTitle}>OPEX</p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={[
                            {
                                type: "pie",
                                values: [
                                    kpiDataPrimary.v_C_TotalSourced.value >= 0 ? kpiDataPrimary.v_C_TotalSourced.value : 0, 
                                    kpiDataPrimary.v_C_TotalTreatment.value >= 0 ? kpiDataPrimary.v_C_TotalTreatment.value : 0, 
                                    kpiDataPrimary.v_C_TotalDisposal.value >= 0 ? kpiDataPrimary.v_C_TotalDisposal.value : 0, 
                                    kpiDataPrimary.v_C_TotalPiping.value >= 0 ? kpiDataPrimary.v_C_TotalPiping.value : 0,
                                    kpiDataPrimary.v_C_TotalTrucking.value >= 0 ? kpiDataPrimary.v_C_TotalTrucking.value : 0],
                                labels: [
                                    "Source", 
                                    "Treatment", 
                                    "Disposal", 
                                    "Piping",
                                    "Trucking"],
                                marker: {
                                    colors: [
                                        'rgb(255, 127, 19)',
                                        'rgb(148, 103, 189)',
                                        'rgb(64, 159, 44)',
                                        'rgb(214, 39, 40)',
                                        'rgb(30, 119, 180)',
                                    ]
                                    },
                                textinfo: "percent",
                                // insidetextorientation: "radial"
                                }
                            ]}

                            layout={{
                                width: 450,
                                height: 450,
                                showlegend: true
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
                        <p style={styles.chartTitle}>OPEX</p>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <Plot
                            data={[
                            {
                                type: "pie",
                                values: [
                                    kpiDataReference.v_C_TotalSourced.value >= 0 ? kpiDataReference.v_C_TotalSourced.value : 0, 
                                    kpiDataReference.v_C_TotalTreatment.value >= 0 ? kpiDataReference.v_C_TotalTreatment.value : 0, 
                                    kpiDataReference.v_C_TotalDisposal.value >= 0 ? kpiDataReference.v_C_TotalDisposal.value : 0, 
                                    kpiDataReference.v_C_TotalPiping.value >= 0 ? kpiDataReference.v_C_TotalPiping.value : 0,
                                    kpiDataReference.v_C_TotalTrucking.value >= 0 ? kpiDataReference.v_C_TotalTrucking.value : 0],
                                labels: [
                                    "Source", 
                                    "Treatment", 
                                    "Disposal", 
                                    "Piping",
                                    "Trucking"],
                                marker: {
                                    colors: [
                                        'rgb(255, 127, 19)',
                                        'rgb(148, 103, 189)',
                                        'rgb(64, 159, 44)',
                                        'rgb(214, 39, 40)',
                                        'rgb(30, 119, 180)',
                                    ]
                                    },
                                textinfo: "percent",
                                // insidetextorientation: "radial"
                                }
                            ]}

                            layout={{
                                width: 450,
                                height: 450,
                                showlegend: true
                            }}
                        />
                        </Box>
                    </Grid>
                    </Grid>
                </Box>
            </Grid>

        </Grid>
        }
    </Box>
    </Fragment>
  );

}


