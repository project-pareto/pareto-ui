import React from 'react';
import {useEffect, useState} from 'react';   
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';


export default function InputSummary(props) {
    const [ sumValues, setSumValues ] = useState([
                                            {statistic: 'Total Completions Demand', value: 0, units: 'volume/time'},
                                            {statistic: 'Total Produced Water', value: 0, units: 'volume'},
                                            {statistic: 'Total Starting Disposal Capacity', value: 0, units: 'volume/time'},
                                            {statistic: 'Total Starting Treatment Capacity', value: 0, units: 'volume/time'},
                                        ]) 
    useEffect(()=>{
        /* 
            calculate total completions demand, total produced water, 
            total disposal capacity, and total treatment capacity
        */
        let totCompletionsDemand = 0
        for (let each in props.completionsDemand) {
            for (let value of props.completionsDemand[each]) {
                if (!isNaN(value)) {
                    totCompletionsDemand+=Number(value)
                }
            }
        }

        let totProducedWater = 0
        for (let each in props.padRates) {
            for (let value of props.padRates[each]) {
                if (!isNaN(value)) {
                    totProducedWater+=Number(value)
                }
            }
        }
        for (let each in props.flowbackRates) {
            for (let value of props.flowbackRates[each]) {
                if (!isNaN(value)) {
                    totProducedWater+=Number(value)
                }
            }
        }

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

        // let tempSumValues = {
        //     'Total Completions Demand': totCompletionsDemand,
        //     'Total Produced Water': totProducedWater,
        //     'Total Starting Disposal Capacity': totDisposalCapacity,
        //     'Total Starting Treatment Capacity': totTreatmentCapacity,
        // }
        let tempSumValues = [
            {statistic: 'Total Completions Demand', value: totCompletionsDemand, units: 'volume/time'},
            {statistic: 'Total Produced Water', value: totProducedWater, units: 'volume'},
            {statistic: 'Total Starting Disposal Capacity', value: totDisposalCapacity, units: 'volume/time'},
            {statistic: 'Total Starting Treatment Capacity', value: totTreatmentCapacity, units: 'volume/time'},
        ]
        setSumValues(tempSumValues)

      }, [props]);

    const styles = {

   }
  return ( 
    <TableContainer>
        <h3>Input Summary Table</h3>
    <TableContainer sx={{overflowX:'auto'}}>
        <Table style={{border:"1px solid #ddd"}} size='small'>
            <TableHead style={{backgroundColor:"#6094bc", color:"white"}}>
            <TableRow key="headRow">
                <TableCell width="25%">Input Summary Statistic</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Units</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
                {sumValues.map((v,i) => {
                    return (
                        <TableRow key="headRow">
                            <TableCell>{v.statistic}</TableCell>
                            <TableCell align="right">{v.value.toLocaleString('en-US', {maximumFractionDigits:0})}</TableCell>
                            <TableCell align="right">{v.units}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
        </TableContainer>
    </TableContainer>
  );

}


