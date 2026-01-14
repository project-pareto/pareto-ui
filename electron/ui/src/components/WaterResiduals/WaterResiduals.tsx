import React from 'react';
import {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Stack, TableFooter, Box, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function WaterResiduals(props) {  
    const { scenario } = props;
    const [ convertTime, setConvertTime ] = useState(true)
    const aquatrade_baseURL = "https://share.producedwater.org"
    //"water-trading/share-requests/?type=share_supply&well_name=Well+Pad+1&latitude=40.0521&longitude=-80.2437&rate_bpd=1000&transport_radius=300&water_quality=good"

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
        },
        stack: {
            margin: 1,
            width: '100%'
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

    const formatTimeValues = (val, divider='-', timeUnit='week') => {
        if (!convertTime) return val

        const number = parseInt(val.replace(/[^0-9]/g, ''));
    
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (number - 1) * 7);
    
        const endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 6);

        const formattedStartDate = `${padZero(startDate.getMonth() + 1)}${divider}${padZero(startDate.getDate())}${divider}${startDate.getFullYear()}`;
        const formattedEndDate = `${padZero(endDate.getMonth() + 1)}${divider}${padZero(endDate.getDate())}${divider}${endDate.getFullYear()}`;
    
        return `${formattedStartDate} - ${formattedEndDate}`
    }

    const calculateIndex = (tableIdx, idx) => {
        let index = idx + 1;
        for (let i = 0; i < tableIdx; i+=1) {
            index+=residualTables[i].rows.length
        }
        return index
    }

    const redirectData = (model, type, well_name, date, rate_bpd) => {
        //TODO (optional): create a popup form that allows the user to enter additional data: coordinates, bid amt ...
        let formattedDate = formatTimeValues(date, '/').split(' - ')
        const start_date = formattedDate[0]
        const end_date = formattedDate[1]
        if (type === "Shortage") type = 'share_demand'
        else if (type === "Surplus") type = 'share_supply'
        let fullURL = `${aquatrade_baseURL}/${model}/share-requests/?type=${type}&well_name=${well_name}&start_date=${start_date}&end_date=${end_date}&rate_bpd=${rate_bpd}`
        window.open(fullURL, '_blank').focus();
    }

    const hasResiduals = () => {
        let totalAmt = 0;
        for (let residual of residualTables) {
            if (!isNaN(residual?.rows?.length)) totalAmt += residual?.rows?.length
        }
        if (totalAmt === 0) return false
        else return true
    }

    return (
        <Box>
            <h3>
                Water Residuals
            </h3>
            {
                !hasResiduals() && (
                    <p>
                        This scenario did not produce any shortages or surpluses of water.
                    </p>
                )
            }
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
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                        <Stack direction='row' justifyContent='space-around' sx={styles.stack} component='span'>
                                            <Button
                                                variant='contained'
                                                endIcon={<OpenInNewIcon/>}
                                                onClick={() => redirectData('water-trading', residualTable.type, row[0], row[1], row[2])}
                                            >
                                                Send Details to Aquatrade
                                            </Button>
                                            <Button
                                                variant='contained'
                                                endIcon={<OpenInNewIcon/>}
                                                onClick={() => redirectData('watersharing', residualTable.type, row[0], row[1], row[2])}
                                            >
                                                Send Details to Aquashare
                                            </Button>
                                        </Stack>
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


