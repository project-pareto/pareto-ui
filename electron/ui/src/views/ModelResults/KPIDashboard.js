import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WaterIcon from '@mui/icons-material/Water';
import Plot from 'react-plotly.js';


export default function KPIDashboard(props) {
    const [ kpiData, setKpiData ] = useState(null)

    useEffect(()=>{
        let tempData = {}
        for (var index in props.data) {
            let item = props.data[index]
            let key = item[0]
            let description = item[1]
            let unit = item[2]
            let value = item[3]
            tempData[key] = {"description": description, "unit": unit, "value": value}
        }
        console.log("setting kpi data: ")
        console.log(tempData)
        setKpiData(tempData)
    }, [props]);

    const styles = {
          box: 
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
    <Box sx={{ marginLeft: 10, marginRight: 10 }} >
    {kpiData && 
    <Grid container spacing={2} sx={{marginTop:2}}>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><ChangeCircleIcon /></IconButton>
                <p style={styles.kpiTitle}>Recycling Rate</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{Math.round(kpiData.reuse_WaterKPI.value)}%</p>
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><RemoveCircleOutlineIcon /></IconButton>
                <p style={styles.kpiTitle}>Disposal</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{kpiData.v_F_TotalDisposed.value.toLocaleString()} bbls</p>
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={4}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <IconButton disabled><WaterIcon /></IconButton>
                <p style={styles.kpiTitle}>Sourced</p>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <p style={styles.kpiValue}>{kpiData.v_F_TotalSourced.value.toLocaleString()} bbls</p>
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={6}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
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
                        textinfo: "label+percent",
                        insidetextorientation: "radial"
                        }
                    ]}

                    layout={{
                        width: 350,
                        height: 350,
                        showlegend: false
                    }}
                />
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={6}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
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
                            kpiData.v_C_TotalSourced.value, 
                            kpiData.v_C_TotalTreatment.value, 
                            kpiData.v_C_TotalDisposal.value, 
                            kpiData.v_C_TotalPiping.value,
                            kpiData.v_C_TotalTrucking.value >= 0 ? kpiData.v_C_TotalTrucking.value : 0],
                        labels: [
                            "Source", 
                            "Treatment", 
                            "Disposal", 
                            "Piping",
                            "Trucking"],
                        textinfo: "label+percent",
                        insidetextorientation: "radial"
                        }
                    ]}

                    layout={{
                        width: 350,
                        height: 350,
                        showlegend: false
                    }}
                />
                </Box>
            </Grid>
            </Grid>
        </Box>
        </Grid>

        <Grid item xs={12}>
        <Box style={{backgroundColor:'white'}} sx={styles.box}>
            <Grid container>
            <Grid item xs={12}>
                <Box sx={{display: 'flex', justifyContent: 'center', overflow: "scroll"}}>
                <Plot
                    data={[
                        {x: [1,2,3], y: [2,1,4], stackgroup: 'one'},
                        {x: [1,2,3], y: [1,1,2], stackgroup: 'one'},
                        {x: [1,2,3], y: [3,0,2], stackgroup: 'one'}
                    ]}

                    layout={{
                        width: 750,
                        height: 500, 
                        showlegend: false, 
                        title: 'Water Deliveries By Destination',
                        xaxis: {
                        range: [1,3]
                        },
                        yaxis: {
                        range: [0,8]
                        }
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
  );

}


