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
import ComparisonTable from '../../components/ComparisonTable/ComparisonTable';
import Plot from 'react-plotly.js';





export default function ScenarioCompare(props) {
  const {scenarios, compareScenarioIndexes, setCompareScenarioIndexes} = props
  const [ primaryScenarioIndex, setPrimaryScenarioIndex ] = useState(null)
  const [ referenceScenarioIndex, setReferenceScenarioIndex ] = useState(null)
//   const [ kpiData, setKpiData ] = useState(null)
  const [ kpiDataPrimary, setKpiDataPrimary ] = useState(null)
  const [ kpiDataReference, setKpiDataReference ] = useState(null)
  const [ capexBarChartData, setCapexBarChartData ] = useState(null)
  const [ opexBarChartData, setOpexBarChartData ] = useState(null)
  const [ showSidebar, setShowSidebar ] = useState(true)
  const [ compareCategory, setCompareCategory ] = useState('output')

  useEffect(()=>{
    //check for indexes
    let tempIndexes = []
    if(compareScenarioIndexes.length === 0) {
        let scenarioIds = Object.keys(scenarios)
        tempIndexes[0] = scenarioIds[0]
        tempIndexes[1] = scenarioIds[1]
        setPrimaryScenarioIndex(scenarioIds[0])
        setReferenceScenarioIndex(scenarioIds[1])
        setCompareScenarioIndexes([scenarioIds[0],scenarioIds[1]])
    } else {
        tempIndexes[0] = compareScenarioIndexes[0]
        tempIndexes[1] = compareScenarioIndexes[1]
        setPrimaryScenarioIndex(compareScenarioIndexes[0])
        setReferenceScenarioIndex(compareScenarioIndexes[1])
    }

    // organize kpi data
    let tempData = {}
    for (var index in scenarios[tempIndexes[0]].results.data['v_F_Overview_dict']) {
        let item = scenarios[tempIndexes[0]].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData[key] = {"description": description, "unit": unit, "value": value, name: scenarios[tempIndexes[0]].name}
    }
    // console.log(tempData)
    setKpiDataPrimary(tempData)
    let tempData2 = {}
    for (var index in scenarios[tempIndexes[1]].results.data['v_F_Overview_dict']) {
        let item = scenarios[tempIndexes[1]].results.data['v_F_Overview_dict'][index]
        let key = item[0]
        let description = item[1]
        let unit = item[2]
        let value = item[3]
        tempData2[key] = {"description": description, "unit": unit, "value": value, name: scenarios[tempIndexes[1]].name}
    }
    // console.log(tempData2)
    setKpiDataReference(tempData2)
    unpackBarChartData(tempData,tempData2)
}, [compareScenarioIndexes]);

const unpackBarChartData = (scenarioData1, scenarioData2) => {
    // unpack bar chart data
    let tempCapexData = []
    let tempOpexData = []
    let capexKeys = [
        'v_C_StorageCapEx', 
        'v_C_TreatmentCapEx', 
        'v_C_DisposalCapEx', 
        'v_C_PipelineCapEx',
    ]
    let opexKeys = [
        'v_C_TotalSourced',
        'v_C_TotalTreatment',
        'v_C_TotalDisposal',
        'v_C_TotalPiping',
        'v_C_TotalTrucking',
    ]

    for(let each of capexKeys) {
        let tempX = [scenarioData1[each].name, scenarioData2[each].name]
        let tempY = [scenarioData1[each].value, scenarioData2[each].value]
        let tempName = each.replace('v_C_','').replace('CapEx','')
        tempCapexData.push({x:tempX, y:tempY, name: tempName, type: 'bar'})
    }

    for(let each of opexKeys) {
        let tempX = [scenarioData1[each].name, scenarioData2[each].name]
        let tempY = [scenarioData1[each].value, scenarioData2[each].value]
        let tempName = each.replace('v_C_','').replace('Total','')
        tempOpexData.push({x:tempX, y:tempY, name: tempName, type: 'bar'})
    }
      
    console.log('tempCapexData')
    console.log(tempCapexData)

    setCapexBarChartData(tempCapexData)
    setOpexBarChartData(tempOpexData)
    
    // let layout = {barmode: 'stack'};
}

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
    <Sidebar
        open={showSidebar}
        category={compareCategory}
        setCategory={setCompareCategory}
    >
    </Sidebar>
      
    <Box sx={styles.boxView}>
        {kpiDataPrimary && 
        <Grid container spacing={2}>

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

            {/* <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 0, paddingBottom:0}}>
                    <p style={{marginBottom: 0, paddingBottom:0, fontWeight:"bold"}}>{scenarios[primaryScenarioIndex].name}</p>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', marginBottom: 0, paddingBottom:0}}>
                    <p style={{marginBottom: 0, paddingBottom:0, fontWeight:"bold"}}>{scenarios[referenceScenarioIndex].name}</p>
                </Box>
            </Grid> */}

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
                        <p style={styles.chartTitle}>OPEX</p>
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
                <Box sx={{display: 'flex', justifyContent: 'left'}}>
                    <h2>Results Overview</h2>
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
        }
    </Box>
    </Fragment>
  );

}


