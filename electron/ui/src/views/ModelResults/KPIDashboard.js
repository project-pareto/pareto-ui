import React from 'react';
import {useEffect, useState} from 'react';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WaterIcon from '@mui/icons-material/Water';
import InfoIcon from '@mui/icons-material/Info';
import Plot from 'react-plotly.js';
import CustomChart from '../../components/CustomChart/CustomChart'

export default function KPIDashboard(props) {
    const [ kpiData, setKpiData ] = useState(null)

    useEffect(()=>{
        let tempData = {}
        // organize results dict data
        for (var index in props.overviewData) {
            let item = props.overviewData[index]
            let key = item[0]
            let description = item[1]
            let unit = item[2]
            let value = item[3]
            tempData[key] = {"description": description, "unit": unit, "value": value}
        }

        setKpiData(tempData)
    }, [props]);

    const styles = {
          kpiBox: 
          {
            // m:2, 
            paddingTop:2, 
            boxShadow:3,
            height: "140px"
            // paddingBottom: "50px" 
          },
          pieChartBox: 
          {
            paddingTop:2, 
            boxShadow:3,
          },
          areaChartBox: 
          {
            // m:2, 
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
          icon: {
            backgroundColor: "#5A3E73",
            color:"#CEC7D7"
          },
          chartTitle: {
            color:"black",
            fontSize: '25px',
            margin: "0",
            padding: "0"
          }
      }

  return ( 
    <Box>
    {kpiData && 
    <Grid container spacing={2} sx={{marginTop:2}}>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><ChangeCircleIcon sx={{ color: "#947eaa" }}/></IconButton>
                <p style={styles.kpiTitle}>Recycling Rate</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{Math.round(kpiData.reuse_CompletionsDemandKPI.value)}%</p>
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><RemoveCircleOutlineIcon sx={{ color: "#fc2414" }}/></IconButton>
                <p style={styles.kpiTitle}>Annual Disposal</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{kpiData.v_F_TotalDisposed.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiData.v_F_TotalDisposed.unit}</p>
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.kpiBox}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><WaterIcon sx={{ color:"#59b8d6" }}/></IconButton>
                <p style={styles.kpiTitle}>Groundwater Sourced</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{kpiData.v_F_TotalSourced.value.toLocaleString('en-US', {maximumFractionDigits:0})+" "+kpiData.v_F_TotalSourced.unit}</p>
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
                            kpiData.v_C_StorageCapEx.value, 
                            kpiData.v_C_TreatmentCapEx.value, 
                            kpiData.v_C_DisposalCapEx.value, 
                            kpiData.v_C_PipelineCapEx.value],
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
                            kpiData.v_C_TotalSourced.value >= 0 ? kpiData.v_C_TotalSourced.value : 0, 
                            kpiData.v_C_TotalTreatment.value >= 0 ? kpiData.v_C_TotalTreatment.value : 0, 
                            kpiData.v_C_TotalDisposal.value >= 0 ? kpiData.v_C_TotalDisposal.value : 0, 
                            kpiData.v_C_TotalPiping.value >= 0 ? kpiData.v_C_TotalPiping.value : 0,
                            kpiData.v_C_TotalTrucking.value >= 0 ? kpiData.v_C_TotalTrucking.value : 0],
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
        
        <Grid item xs={12}>
        <Box style={{backgroundColor:'white'}} sx={styles.areaChartBox}>
            <Grid container>
            <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                <CustomChart
                    data={props.truckedData} 
                    title="Trucked Water Deliveries By Destination"
                    xaxis={{titletext: "Planning Horizon (weeks)"}}
                    yaxis={{titletext: "Amount of Water (bbl/week)"}}
                    labelIndex={1}
                    xindex={2}
                    yindex={3}
                    width={600}
                    height={500}
                    showlegend={true}
                    chartType={'area'}
                    stackgroup={"one"}
                />
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                <CustomChart
                    data={props.pipedData} 
                    title="Piped Water Deliveries By Destination"
                    xaxis={{titletext: "Planning Horizon (weeks)"}}
                    yaxis={{titletext: "Amount of Water (bbl/week)"}}
                    labelIndex={1}
                    xindex={2}
                    yindex={3}
                    width={600}
                    height={500}
                    showlegend={true}
                    chartType={'area'}
                    stackgroup={"one"}
                />
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={12}>
            {props.waterQualityData && props.waterQualityData.length>1 &&
                <Box style={{backgroundColor:'white', marginBottom:"20px"}} sx={styles.areaChartBox}>
                    <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <CustomChart
                            data={props.waterQualityData} 
                            title="Water Quality by Node"
                            xaxis={{titletext: "Planning Horizon (weeks)"}}
                            yaxis={{titletext: "Amount of Water (bbl/week)"}}
                            labelIndex={0}
                            xindex={2}
                            yindex={3}
                            width={1000}
                            height={500}
                            showlegend={true}
                            chartType={'line'}
                            stackgroup={false}
                        />
                        </Box>
                    </Grid>
                    </Grid>
                    {/* <Tooltip title={"Doubleclick any item in the legend to view only that node"} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip> */}
                </Box>
            }
        
            {props.hydraulicsData && props.hydraulicsData.length>1 &&
                <Box style={{backgroundColor:'white', marginBottom:"20px"}} sx={styles.areaChartBox}>
                    <Grid container>
                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                        <CustomChart
                            data={props.hydraulicsData} 
                            title="Hydraulics Pressure by Node"
                            xaxis={{titletext: "Planning Horizon (weeks)"}}
                            yaxis={{titletext: "Pressure (psi)"}}
                            labelIndex={0}
                            xindex={1}
                            yindex={2}
                            width={1000}
                            height={500}
                            showlegend={true}
                            chartType={'line'}
                            stackgroup={false}
                        />
                        </Box>
                    </Grid>
                    </Grid>
                    {/* <Tooltip title={"Doubleclick any item in the legend to view only that node"} placement="right-start"><IconButton><InfoIcon fontSize='small'/></IconButton></Tooltip> */}
                </Box>
            }
        </Grid>

    </Grid>
    }
    
    </Box>
  );

}


