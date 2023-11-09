import React from 'react';
import {useEffect, useState} from 'react';   
import { Box, FormControl, MenuItem, Select, Typography, Grid, Button } from '@mui/material'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material'
import NetworkMap from '../NetworkMap/NetworkMap';

export default function InputSummary(props) {
    const [ tableType, setTableType ] = useState("Input Summary")
    const [ sumValues, setSumValues ] = useState([
        {statistic: 'Total Completions Demand', value: 0, units: 'bbl'},
        {statistic: 'Total Produced Water', value: 0, units: 'bbl'},
        {statistic: 'Total Starting Disposal Capacity', value: 0, units: 'bbl'},
        {statistic: 'Total Starting Treatment Capacity', value: 0, units: 'bbl'},
    ]) 
    const [ timeSumValues, setTimeSumValues ] = useState({
        'Completions Demand': [],
        'Produced Water': [],
        'Initial Disposal Capacity': [],
        'Initial Treatment Capacity': [],
    }) 
    const styles = {
        headerCell: {color: 'white'},
        firstCol: {
            backgroundColor: "#f4f4f4", 
            border:"1px solid #ddd",
            position: 'sticky',
            left: 0,
      
          },
        inputFileTextBox: {
            display: 'flex', 
            justifyContent: 'flex-start', 
            textAlign: 'left'
        },
        downloadInput: {
            color: "#0083b5",
            cursor: "pointer",
            fontWeight: "bold",
            paddingBottom: 20
        },
        uploadInput: {
            color: "#0083b5",
            borderColor: "#0083b5",
            '&:hover': {
                borderColor: "#0083b5",
            },
        }
    }

    useEffect(()=>{
        /* 
            calculate total completions demand, total produced water, 
            total disposal capacity, and total treatment capacity; 
            
            calculate totals for each time segment as well
        */

        let disposalCapacity = 0
        for (let each in props.initialDisposalCapacity) {
            for (let value of props.initialDisposalCapacity[each]) {
                if (!isNaN(value)) {
                    disposalCapacity+=Number(value)
                }
            }
        }

        let treatmentCapacity = 0
        for (let each in props.initialTreatmentCapacity) {
            for (let value of props.initialTreatmentCapacity[each]) {
                if (!isNaN(value)) {
                    treatmentCapacity+=Number(value)
                }
            }
        }
        
        let totCompletionsDemand = 0
        let completionsDemandByTime = []
        let disposalCapacityByTime = []
        let treatmentCapacityByTime = []      
        /*
            start weeks at -1 because the first record is the index, so after incrementing the index we are at 0
        */  
        let totWeeks = -1
        for (let each in props.completionsDemand) {
            let nextTime = 0
            for (let value of props.completionsDemand[each]) {
                if (!isNaN(value)) {
                    totCompletionsDemand+=Number(value)
                    nextTime += Number(value)
                }
            }
            completionsDemandByTime.push(nextTime)
            disposalCapacityByTime.push(disposalCapacity)
            treatmentCapacityByTime.push(treatmentCapacity)
            totWeeks += 1
        }

        let totProducedWater = 0
        let padRatesByTime = []
        for (let each in props.padRates) {
            let nextTime = 0
            for (let value of props.padRates[each]) {
                if (!isNaN(value)) {
                    totProducedWater+=Number(value)
                    nextTime += Number(value)
                }
            }
            padRatesByTime.push(nextTime)
        }

        let flowbackRatesByTime = []
        for (let each in props.flowbackRates) {
            let nextTime = 0
            for (let value of props.flowbackRates[each]) {
                if (!isNaN(value)) {
                    totProducedWater+=Number(value)
                    nextTime += Number(value)
                }
            }
            flowbackRatesByTime.push(nextTime)
        }

        let producedWaterByTime = []
        for (let i = 0; i < padRatesByTime.length; i++) {
            producedWaterByTime.push(padRatesByTime[i] + flowbackRatesByTime[i])
        }

        let tempSumValues = [
            {statistic: 'Total Completions Demand', value: totCompletionsDemand, units: 'bbl'},
            {statistic: 'Total Produced Water', value: totProducedWater, units: 'bbl'},
            {statistic: 'Total Starting Disposal Capacity', value: (disposalCapacity * totWeeks), units: 'bbl'},
            {statistic: 'Total Starting Treatment Capacity', value: (treatmentCapacity * totWeeks), units: 'bbl'},
        ]
        setSumValues(tempSumValues)

        let tempTimeSumValues = {
            'Completions Demand': completionsDemandByTime,
            'Produced Water': producedWaterByTime,
            'Initial Disposal Capacity': disposalCapacityByTime,
            'Initial Treatment Capacity': treatmentCapacityByTime,
        }
        setTimeSumValues(tempTimeSumValues)
      }, [props]);


    const handleTableTypeChange = (event) => {
        setTableType(event.target.value)
       }

    const renderInputSummaryTable = () => {
        return (
            <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key="headRow1">
                    <TableCell width="25%" style={styles.headerCell}>Statistic</TableCell>
                    <TableCell align="right" style={styles.headerCell}>Value</TableCell>
                    <TableCell align="right" style={styles.headerCell}>Units</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {sumValues.map((v,i) => {
                        return (
                            <TableRow key={""+v+i}>
                                <TableCell style={styles.firstCol}><Typography noWrap={true}>{v.statistic}</Typography></TableCell>
                                <TableCell align="right">{v.value.toLocaleString('en-US', {maximumFractionDigits:0})}</TableCell>
                                <TableCell align="right">{v.units}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )
    }

    const renderSummaryTimeTable = () => {
        return (
            <Table style={{border:"1px solid #ddd"}} size='small'>
                <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
                <TableRow key="headRow2">
                    {Object.entries(props.completionsDemand).map(([key,value], index) => {
                        return <TableCell align="right" style={index > 0 ? styles.headerCell : styles.headerCell}>{index > 0 ? key : ""}</TableCell>
                    })}
                </TableRow>
                </TableHead>
                <TableBody>
                {Object.entries(timeSumValues).map(([key,statistic]) => {
                    return (
                    <TableRow key={""+key+statistic}>
                        {statistic.map((value, index) => {
                            return (
                            index > 0 ? 
                            <TableCell align="right">{value.toLocaleString('en-US', {maximumFractionDigits:0})}</TableCell>
                            :
                            <TableCell style={styles.firstCol}><Typography noWrap={true}>{key}</Typography></TableCell>
                            )
                        })}
                    </TableRow>
                    )
                })}
                
                </TableBody>
            </Table>
        )
    }
    
  return ( 
    <>
    {props.scenario.results.status === 'Incomplete' ? 
        <Grid container sx={{m: 5}}>
            <Grid item xs={5}>
                <Box sx={styles.inputFileTextBox}>
                    <h2>PARETO Input File</h2>
                </Box>
                <Box sx={styles.inputFileTextBox}>
                    <p>
                        A PARETO input file has been generated based on the schematic file uploaded. 
                        Fill out this input file and upload it here to begin your optimization
                    </p>
                </Box>
                <Box sx={styles.inputFileTextBox}>
                    <p style={styles.downloadInput}>
                        Download PARETO input file
                    </p>
                </Box>
                <Box sx={styles.inputFileTextBox}>
                    <Button variant="outlined" sx={styles.uploadInput}>Upload PARETO input file</Button>
                </Box>
                
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={6}>
                <Box>
                <NetworkMap 
                    points={props.scenario.data_input.map_data.all_nodes} 
                    lines={props.scenario.data_input.map_data.arcs}
                    showMapTypeToggle={false}
                    interactive={false}
                    width={100}  //%
                    height={50} //vh
                />
                </Box>
            </Grid>

        </Grid>
        : 
        <TableContainer>
            <Box display="flex" justifyContent="center" sx={{marginBottom:"20px"}}>
                <FormControl sx={{ width: "30ch" }} size="small">
                    <Select
                    value={tableType}
                    onChange={(handleTableTypeChange)}
                    sx={{color:'#0b89b9', fontWeight: "bold"}}
                    >
                    <MenuItem key={0} value={"Input Summary"}>Input Summary</MenuItem>
                    <MenuItem key={1} value={"Summary By Time"}>Summary By Time</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <TableContainer sx={{overflowX:'auto'}}>
                {tableType === "Input Summary" ? 
                renderInputSummaryTable()
                : 
                renderSummaryTimeTable()
                }
            </TableContainer>
        </TableContainer>
    }
    </>
    
  );

}


