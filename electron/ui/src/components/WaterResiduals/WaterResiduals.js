import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TextField, Tooltip, Box } from '@mui/material';
import PopupModal from '../../components/PopupModal/PopupModal'

export default function WaterResiduals(props) {  
    const { scenario } = props;

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
                backgroundColor: '#F2F2F2'
            }, 
            right: {
                width: '33%'
            }
        },
        tableContainer: {
            padding: 2
        }
    }

    const formatValue = (val) => {
        if (isNaN(val)) return val
        else return val.toLocaleString('en-US', {maximumFractionDigits:2})
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
                                        <TableCell sx={styles.headerCell} colSpan={2}>Water {residualTable.type}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Location</TableCell>
                                        <TableCell sx={styles.bodyCell.right} align='right'>{row[0]}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Date Range</TableCell>
                                        <TableCell sx={styles.bodyCell.right} align='right'>{row[1]}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Total Volume</TableCell>
                                        <TableCell sx={styles.bodyCell.right} align='right'>{formatValue(row[2])}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={styles.bodyCell.left}>Approximate Daily Volume</TableCell>
                                        <TableCell sx={styles.bodyCell.right} align='right'></TableCell>
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


