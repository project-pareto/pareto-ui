import React from 'react';
import {useEffect, useState} from 'react';   
import Box from '@mui/material/Box'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';


export default function InputSummary(props) {
    const [ tableType, setTableType ] = useState("Input Summary")
    const [ sumValues, setSumValues ] = useState([
        {statistic: 'Total Completions Demand', value: 0, units: 'volume/time'},
        {statistic: 'Total Produced Water', value: 0, units: 'volume'},
        {statistic: 'Total Starting Disposal Capacity', value: 0, units: 'volume/time'},
        {statistic: 'Total Starting Treatment Capacity', value: 0, units: 'volume/time'},
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
    }

    useEffect(()=>{
        /* 
            calculate total completions demand, total produced water, 
            total disposal capacity, and total treatment capacity; 
            
            calculate totals for each time segment as well
        */

        let totDisposalCapacity = 0
        for (let each in props.initialDisposalCapacity) {
            for (let value of props.initialDisposalCapacity[each]) {
                if (!isNaN(value)) {
                    totDisposalCapacity+=Number(value)
                }
            }
        }

        let totTreatmentCapacity = 0
        for (let each in props.initialTreatmentCapacity) {
            for (let value of props.initialTreatmentCapacity[each]) {
                if (!isNaN(value)) {
                    totTreatmentCapacity+=Number(value)
                }
            }
        }
        
        let totCompletionsDemand = 0
        let completionsDemandByTime = []
        let disposalCapacityByTime = []
        let treatmentCapacityByTime = []        
        for (let each in props.completionsDemand) {
            let nextTime = 0
            for (let value of props.completionsDemand[each]) {
                if (!isNaN(value)) {
                    totCompletionsDemand+=Number(value)
                    nextTime += Number(value)
                }
            }
            completionsDemandByTime.push(nextTime)
            disposalCapacityByTime.push(totDisposalCapacity)
            treatmentCapacityByTime.push(totTreatmentCapacity)
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
            {statistic: 'Total Completions Demand', value: totCompletionsDemand, units: 'volume/time'},
            {statistic: 'Total Produced Water', value: totProducedWater, units: 'volume'},
            {statistic: 'Total Starting Disposal Capacity', value: totDisposalCapacity, units: 'volume/time'},
            {statistic: 'Total Starting Treatment Capacity', value: totTreatmentCapacity, units: 'volume/time'},
        ]
        setSumValues(tempSumValues)

        let tempTimeSumValues = {
            'Completions Demand': completionsDemandByTime,
            'Produced Water': producedWaterByTime,
            'Initial Disposal Capacity': disposalCapacityByTime,
            'Initial Treatment Capacity': treatmentCapacityByTime,
        }
        setTimeSumValues(tempTimeSumValues)

        console.log('new sum values : ')
        console.log(tempSumValues)
        console.log('new timesum values : ')
        console.log(tempTimeSumValues)
      }, [props]);


    const handleTableTypeChange = (event) => {
        setTableType(event.target.value)
       }

    const renderInputSummaryTable = () => {
        console.log(sumValues)
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
                            <TableRow>
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
                    <TableRow>
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
  );

}


