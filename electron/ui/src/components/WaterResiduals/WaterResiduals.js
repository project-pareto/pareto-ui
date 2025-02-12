import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip, Box } from '@mui/material';
import PopupModal from '../../components/PopupModal/PopupModal'

export default function WaterResiduals(props) {  
    const { scenario } = props;
    const [ convertTime, setConvertTime ] = useState(true)

    const residualTables = [
        {
            key: "v_S_Production",
            rows: [...scenario?.results?.data?.v_S_Production_dict].splice(1),
            type: "Surplus"
        },
        {
            key: "v_S_Flowback",
            rows: [...scenario?.results?.data?.v_S_Flowback_dict].splice(1),
            type: "Surplus"
        },
        {
            key: "v_S_FracDemand",
            rows: [...scenario?.results?.data?.v_S_FracDemand_dict].splice(1),
            type: "Shortage"
        }
    ]
    const styles = {
        table: {
            border:"1px solid #ddd"
        },
        tableHead: {
            backgroundColor:"#6094bc", color:"white"
        },
        headerCell: {
            color: 'white',
            fontSize: 16
        },
        bodyCell: {
            left: {
                backgroundColor: '#F2F2F2',
                width: '66%'
            }, 
            right: {
                widt: '34%'
            },
            splitLeft: {
                borderRight: '1px solid #ddd',
                width:  '17%'
            },
            splitRight: {
                width:  '17%'
            }
        },
        tableContainer: {
            padding: 2
        }
    }

    const formatNumberValue = (val) => {
        if (isNaN(val)) return val
        else return val.toLocaleString('en-US', {maximumFractionDigits:2})
    }

    const calculateTotalVolume = (val, num_units=1, timeUnit='week') => {
        if (timeUnit == 'week') return formatNumberValue(val * num_units * 7)
        
    }

    const padZero = (number) => {
        return (number < 10 ? '0' : '') + number;
    }

    const formatTimeValues = (val, timeUnit='week') => {
        if (!convertTime) return val

        const number = parseInt(val.replace(/[^0-9]/g, ''));
    
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (number - 1) * 7);
    
        const endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 6);

        const formattedStartDate = `${padZero(startDate.getMonth() + 1)}-${padZero(startDate.getDate())}-${startDate.getFullYear()}`;
        const formattedEndDate = `${padZero(endDate.getMonth() + 1)}-${padZero(endDate.getDate())}-${endDate.getFullYear()}`;
    
        return `${formattedStartDate} - ${formattedEndDate}`
    }

    const calculateIndex = (tableIdx, idx) => {
        console.log('tableidx: ' + tableIdx)
        console.log('idx: ' + idx)
        let index = idx + 1;
        for (let i = 0; i < tableIdx; i+=1) {
            index+=residualTables[i].rows.length
        }
        return index
    }

    return (
        <Box>
            <h3>
                Water Residuals
            </h3>
            {
                residualTables.map((residualTable, tableIdx) => (
                    residualTable.rows.map((row, idx) => (
                        <TableContainer sx={styles.tableContainer} key={tableIdx+idx}>
                            <Table style={styles.table} size='small' >
                                <TableHead style={styles.tableHead}>
                                    <TableRow>
                                        <TableCell sx={styles.headerCell} colSpan={3}>{calculateIndex(tableIdx, idx)}. Water {residualTable.type}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Location</TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.right}
                                            colSpan={2}
                                        >
                                            {row[0]}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Date Range</TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.right}
                                            onClick={() => setConvertTime(!convertTime)}
                                            colSpan={2}
                                        >
                                            {formatTimeValues(row[1])}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Total Volume</TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.splitLeft}
                                        >
                                            bbl
                                        </TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.splitRight}
                                            align='right'
                                        >
                                            {calculateTotalVolume(row[2])}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Approximate Daily Volume</TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.splitLeft}
                                        >
                                            bpd
                                        </TableCell>
                                        <TableCell 
                                            sx={styles.bodyCell.splitRight}
                                            align='right'
                                        >
                                            {formatNumberValue(row[2])}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ))
                ))
            }
            
            
        </Box>
    );

}


